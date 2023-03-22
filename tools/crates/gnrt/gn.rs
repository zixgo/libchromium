// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

//! GN build file generation.

use crate::crates::*;
use crate::deps;
use crate::manifest::CargoPackage;
use crate::paths;
use crate::platforms;

use std::collections::HashMap;
use std::convert::From;
use std::fmt;
use std::path::Path;

/// Describes a BUILD.gn file for a single crate epoch. Each file may have
/// multiple rules, including:
/// * A :lib target for normal dependents
/// * A :test_support target for first-party testonly dependents
/// * A :cargo_tests_support target for building third-party tests
/// * A :buildrs_support target for third-party build script dependents
/// * Binary targets for crate executables
pub struct BuildFile {
    pub rules: Vec<(String, Rule)>,
}

impl BuildFile {
    /// Return a `fmt::Display` instance for the build file. Formatting this
    /// will write an entire valid BUILD.gn file.
    pub fn display(&self) -> impl '_ + fmt::Display {
        BuildFileFormatter { build_file: self }
    }
}

#[derive(Debug)]
pub struct RuleCommon {
    pub testonly: bool,
    /// Controls the visibility constraint on the GN target. If this is true, no
    /// visibility constraint is generated. If false, it's defined so that only
    /// other third party Rust crates can depend on this target.
    pub public_visibility: bool,
}

#[derive(Clone, Debug)]
pub struct RuleConcrete {
    pub crate_name: Option<String>,
    pub epoch: Option<Epoch>,
    pub crate_type: String,
    pub crate_root: String,
    pub edition: String,
    pub cargo_pkg_version: String,
    pub cargo_pkg_authors: Option<String>,
    pub cargo_pkg_name: String,
    pub cargo_pkg_description: Option<String>,
    pub deps: Vec<RuleDep>,
    pub dev_deps: Vec<RuleDep>,
    pub build_deps: Vec<RuleDep>,
    pub features: Vec<String>,
    pub build_root: Option<String>,
    pub build_script_outputs: Vec<String>,
    pub gn_variables_lib: String,
}

/// Describes a single GN build rule for a crate configuration. Each field
/// corresponds directly to a argument to the `cargo_crate()` template defined
/// in build/rust/cargo_crate.gni.
///
/// For undocumented fields, refer to the docs in the above file.
#[derive(Debug)]
pub enum Rule {
    Concrete {
        common: RuleCommon,
        details: RuleConcrete,
    },
    /// The rule is an alias to a different concrete rule.
    Group {
        common: RuleCommon,
        concrete_target: String,
    },
}

/// A (possibly conditional) dependency on another GN rule.
///
/// Has an `Ord` instance based on an arbitrary ordering of `Condition`s so that
/// `RuleDep`s can be easily grouped by condition. Unconditional dependencies
/// are always ordered first
#[derive(Clone, Debug, Eq, Ord, PartialEq, PartialOrd)]
pub struct RuleDep {
    cond: Condition,
    rule: String,
}

impl RuleDep {
    pub fn construct_for_testing(cond: Condition, rule: String) -> RuleDep {
        RuleDep { cond, rule }
    }
}

/// Generate `BuildFile` descriptions for each third party crate in the
/// dependency graph.
///
/// * `deps` is the result of dependency resolution from the `deps` module.
/// * `metadata` contains the package metadata for each third party crate.
/// * `build_script_outputs` is the list of files generated by the build.rs
///   script for each package.
/// * `deps_visibility` is the visibility for each package, defining if it can
///   be used outside of third-party code and outside of tests.
pub fn build_files_from_deps<'a, 'b, Iter: IntoIterator<Item = &'a deps::Package>>(
    deps: Iter,
    paths: &'b paths::ChromiumPaths,
    metadata: &HashMap<ChromiumVendoredCrate, CargoPackage>,
    build_script_outputs: &HashMap<ChromiumVendoredCrate, Vec<String>>,
    deps_visibility: &HashMap<ChromiumVendoredCrate, Visibility>,
    gn_variables_libs: &HashMap<ChromiumVendoredCrate, String>,
) -> HashMap<ChromiumVendoredCrate, BuildFile> {
    deps.into_iter()
        .filter_map(|dep| {
            make_build_file_for_dep(
                dep,
                paths,
                metadata,
                build_script_outputs,
                deps_visibility,
                gn_variables_libs,
            )
        })
        .collect()
}

/// Generate the `BuildFile` for `dep`, or return `None` if no rules would be
/// present.
fn make_build_file_for_dep(
    dep: &deps::Package,
    paths: &paths::ChromiumPaths,
    metadata: &HashMap<ChromiumVendoredCrate, CargoPackage>,
    build_script_outputs: &HashMap<ChromiumVendoredCrate, Vec<String>>,
    deps_visibility: &HashMap<ChromiumVendoredCrate, Visibility>,
    gn_variables_libs: &HashMap<ChromiumVendoredCrate, String>,
) -> Option<(ChromiumVendoredCrate, BuildFile)> {
    let third_party_path_str = paths.third_party.to_str().unwrap();
    let crate_id = dep.third_party_crate_id();
    let crate_abs_path = paths.root.join(paths.third_party.join(crate_id.build_path()));

    let to_gn_path = |abs_path: &Path| {
        abs_path.strip_prefix(&crate_abs_path).unwrap().to_string_lossy().into_owned()
    };

    let package_metadata = metadata.get(&crate_id).unwrap();
    let cargo_pkg_description = package_metadata.description.clone();
    let cargo_pkg_authors = if package_metadata.authors.is_empty() {
        None
    } else {
        Some(package_metadata.authors.join(", "))
    };

    // Template for all the rules in a build file. Several fields are
    // the same for all a package's rules.
    let mut rule_template = RuleConcrete {
        crate_name: None,
        epoch: None,
        crate_type: String::new(),
        crate_root: String::new(),
        edition: package_metadata.edition.0.clone(),
        cargo_pkg_version: package_metadata.version.to_string(),
        cargo_pkg_authors: cargo_pkg_authors,
        cargo_pkg_name: package_metadata.name.clone(),
        cargo_pkg_description,
        deps: Vec::new(),
        dev_deps: Vec::new(),
        build_deps: Vec::new(),
        features: Vec::new(),
        build_root: dep.build_script.as_ref().map(|p| to_gn_path(p.as_path())),
        build_script_outputs: build_script_outputs.get(&crate_id).cloned().unwrap_or_default(),
        gn_variables_lib: String::new(),
    };

    // Enumerate the dependencies of each kind for the package.
    //
    // TODO(crbug.com/1304772): If this target itself was a ":cargo_tests_support"
    // then it should only depend on other ":cargo_tests_support" targets. We
    // should also define a group("cargo_tests_support") that points to ":lib"
    // if there is no Development library rule definition.
    for (target_name, gn_deps, cargo_deps) in [
        ("lib", &mut rule_template.deps, &dep.dependencies),
        ("cargo_tests_support", &mut rule_template.dev_deps, &dep.dev_dependencies),
        ("buildrs_support", &mut rule_template.build_deps, &dep.build_dependencies),
    ] {
        for dep_of_dep in cargo_deps {
            let cond = match &dep_of_dep.platform {
                None => Condition::Always,
                Some(p) => Condition::If(platform_to_condition(p)),
            };

            let crate_id = dep_of_dep.third_party_crate_id();
            let normalized_name = crate_id.normalized_name();
            let epoch = crate_id.epoch;
            let rule = format!("//{third_party_path_str}/{normalized_name}/{epoch}:{target_name}");

            gn_deps.push(RuleDep { cond, rule });
        }
    }

    let mut rules: Vec<(String, Rule)> = Vec::new();

    // Generate rules for each binary the package provides.
    for bin_target in &dep.bin_targets {
        let mut bin_rule = rule_template.clone();
        bin_rule.crate_type = "bin".to_string();
        bin_rule.crate_root = to_gn_path(bin_target.root.as_path());
        bin_rule.features = match dep.dependency_kinds.get(&deps::DependencyKind::Normal) {
            Some(per_kind_info) => per_kind_info.features.clone(),
            // As a hack, fill in empty feature set. This happens
            // because binary-only workspace members aren't the target
            // of any edge in the dependency graph: so, they have no
            // requested features.
            //
            // TODO(crbug.com/1291994): find a way to specify features
            // for these deps in third_party.toml.
            None => Vec::new(),
        };

        if dep.lib_target.is_some() {
            bin_rule.deps.push(RuleDep { cond: Condition::Always, rule: ":lib".to_string() });
        }

        rules.push((
            NormalizedName::from_crate_name(&bin_target.name).to_string(),
            Rule::Concrete {
                common: RuleCommon { testonly: false, public_visibility: true },
                details: bin_rule,
            },
        ));
    }

    // Generate the rule for the main library target, if it exists.
    //
    // TODO(crbug.com/1304772): We should also define a group("cargo_tests_support")
    // that points to ":lib" if there is no Development library rule definition
    // so that other ":cargo_tests_support" rules are simpler and can always
    // depend on that target name.
    if let Some(lib_target) = &dep.lib_target {
        use deps::DependencyKind::*;
        // Generate the rules for each dependency kind. We use a stable
        // order instead of the hashmap iteration order.
        for dep_kind in [Normal, Build, Development] {
            let per_kind_info = match dep.dependency_kinds.get(&dep_kind) {
                Some(x) => x,
                None => continue,
            };

            let lib_rule_name = match dep_kind {
                deps::DependencyKind::Normal => "lib",
                deps::DependencyKind::Development => "cargo_tests_support",
                deps::DependencyKind::Build => "buildrs_support",
                _ => unreachable!(),
            }
            .to_string();

            let mut lib_details = rule_template.clone();
            lib_details.crate_name = Some(crate_id.normalized_name().to_string());
            lib_details.epoch = Some(crate_id.epoch);
            lib_details.crate_type = lib_target.lib_type.to_string();
            lib_details.crate_root = to_gn_path(lib_target.root.as_path());
            lib_details.features = per_kind_info.features.clone();
            lib_details.gn_variables_lib =
                gn_variables_libs.get(&crate_id).cloned().unwrap_or_default();

            let testonly = dep_kind == deps::DependencyKind::Development;
            let visibility =
                deps_visibility.get(&crate_id).map(Clone::clone).unwrap_or(Visibility::ThirdParty);

            let lib_rule = Rule::Concrete {
                common: RuleCommon {
                    testonly,
                    public_visibility: match visibility {
                        Visibility::Public => true,
                        Visibility::ThirdParty | Visibility::TestOnlyAndThirdParty => false,
                    },
                },
                details: lib_details,
            };

            rules.push((lib_rule_name.clone(), lib_rule));

            // If first-party tests should be able to use the dependency, but it's only
            // visible to third-party we need to provide a ":test_support"
            // target for the tests to use.
            if dep_kind == Normal && visibility == Visibility::TestOnlyAndThirdParty {
                let test_support_rule = Rule::Group {
                    common: RuleCommon { testonly: true, public_visibility: true },
                    concrete_target: lib_rule_name,
                };
                rules.push(("test_support".to_string(), test_support_rule));
            }
        }
    }

    if rules.is_empty() { None } else { Some((crate_id, BuildFile { rules })) }
}

/// `BuildFile` wrapper with a `Display` impl. Displays the `BuildFile` as a GN
/// file.
struct BuildFileFormatter<'a> {
    build_file: &'a BuildFile,
}

impl<'a> fmt::Display for BuildFileFormatter<'a> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write_build_file(f, self.build_file)
    }
}

fn write_build_file<W: fmt::Write>(mut writer: W, build_file: &BuildFile) -> fmt::Result {
    writeln!(writer, "{COPYRIGHT_HEADER}\n")?;
    writeln!(writer, r#"import("//build/rust/cargo_crate.gni")"#)?;
    writeln!(writer, "")?;
    for (name, rule) in &build_file.rules {
        // Don't use writeln!, each rule adds a trailing newline.
        write!(writer, "{}", RuleFormatter { name: &name, rule: &rule })?;
    }
    Ok(())
}

/// `Rule` wrapper with a `Display` impl. Displays the `Rule` as a GN rule.
struct RuleFormatter<'a> {
    name: &'a str,
    rule: &'a Rule,
}

impl<'a> fmt::Display for RuleFormatter<'a> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self.rule {
            Rule::Concrete { common, details } => write_concrete(f, self.name, common, details),
            Rule::Group { common, concrete_target } => {
                write_group(f, self.name, common, concrete_target)
            }
        }
    }
}

fn write_concrete<W: fmt::Write>(
    mut writer: W,
    name: &str,
    common: &RuleCommon,
    details: &RuleConcrete,
) -> fmt::Result {
    writeln!(writer, "cargo_crate(\"{name}\") {{")?;
    if let Some(name) = &details.crate_name {
        writeln!(writer, "crate_name = \"{name}\"")?;
    }
    if let Some(epoch) = details.epoch {
        writeln!(writer, "epoch = \"{}\"", epoch.to_version_string())?;
    }
    writeln!(writer, "crate_type = \"{}\"", details.crate_type)?;
    if common.testonly {
        writeln!(writer, "testonly = true")?;
    }

    if !common.public_visibility {
        writeln!(writer, "\n{VISIBILITY_CONSTRAINT}")?;
    }

    writeln!(writer, "crate_root = \"{}\"", details.crate_root)?;
    // TODO(crbug.com/1291994): actually support unit test generation.
    writeln!(writer, "\n# Unit tests skipped. Generate with --with-tests to include them.")?;
    writeln!(writer, "build_native_rust_unit_tests = false")?;
    writeln!(writer, "sources = [ \"{}\" ]", details.crate_root)?;
    writeln!(writer, "edition = \"{}\"", details.edition)?;
    writeln!(writer, "cargo_pkg_version = \"{}\"", details.cargo_pkg_version)?;
    if let Some(authors) = &details.cargo_pkg_authors {
        writeln!(writer, "cargo_pkg_authors = \"{authors}\"")?;
    }
    writeln!(writer, "cargo_pkg_name = \"{}\"", details.cargo_pkg_name)?;
    if let Some(description) = &details.cargo_pkg_description {
        write!(writer, "cargo_pkg_description = \"")?;
        write_str_escaped(&mut writer, description)?;
        writeln!(writer, "\"")?;
    }
    writeln!(writer, "library_configs -= [ \"//build/config/compiler:chromium_code\" ]")?;
    writeln!(writer, "library_configs += [ \"//build/config/compiler:no_chromium_code\" ]")?;
    writeln!(writer, "executable_configs -= [ \"//build/config/compiler:chromium_code\" ]")?;
    writeln!(writer, "executable_configs += [ \"//build/config/compiler:no_chromium_code\" ]")?;

    if !details.deps.is_empty() {
        write_deps(&mut writer, "deps", details.deps.clone())?;
    }

    if !details.build_deps.is_empty() {
        write_deps(&mut writer, "build_deps", details.build_deps.clone())?;
    }

    if !details.features.is_empty() {
        write!(writer, "features = ")?;
        write_list(&mut writer, &details.features)?;
    }

    if let Some(build_root) = &details.build_root {
        writeln!(writer, "build_root = \"{build_root}\"")?;
        writeln!(writer, "build_sources = [ \"{build_root}\" ]")?;
        if !details.build_script_outputs.is_empty() {
            write!(writer, "build_script_outputs = ")?;
            write_list(&mut writer, &details.build_script_outputs)?;
        }
    }

    if !details.gn_variables_lib.is_empty() {
        writeln!(writer, "{}", details.gn_variables_lib)?;
    }

    writeln!(writer, "}}")
}

fn write_group<W: fmt::Write>(
    mut writer: W,
    name: &str,
    common: &RuleCommon,
    concrete_target: &str,
) -> fmt::Result {
    writeln!(writer, "group(\"{name}\") {{")?;
    writeln!(writer, "public_deps = [ \":{concrete_target}\" ]")?;
    if common.testonly {
        writeln!(writer, "testonly = true")?;
    }

    if !common.public_visibility {
        writeln!(writer, "\n{VISIBILITY_CONSTRAINT}")?;
    }
    writeln!(writer, "}}")
}

fn write_deps<W: fmt::Write>(mut writer: W, kind: &str, mut deps: Vec<RuleDep>) -> fmt::Result {
    // Group dependencies by platform condition via sorting.
    deps.sort();

    // Get the index of the first non-conditional dependency. This may be 0.
    let unconditional_end = deps.partition_point(|dep| dep.cond == Condition::Always);

    // Write the unconditional deps. Or, if there are none, but there are
    // conditional deps, write "deps = []".
    if !deps.is_empty() {
        write!(writer, "{kind} = ")?;
        write_list(&mut writer, deps[..unconditional_end].iter().map(|dep| &dep.rule))?;
    }

    // Loop through the groups of deps by condition, writing the lists wrapped
    // in "if (<cond>) { }" blocks.
    let mut tail = &deps[unconditional_end..];
    while !tail.is_empty() {
        let RuleDep { cond: group_cond, rule: _ } = &tail[0];
        let cond_end = tail.partition_point(|dep| dep.cond == *group_cond);
        let group = &tail[..cond_end];

        let if_expr = match group_cond {
            Condition::Always => unreachable!(),
            Condition::If(string) => string,
        };
        write!(writer, "if ({if_expr}) {{\n{kind} += ")?;
        write_list(&mut writer, group.iter().map(|dep| &dep.rule))?;
        writeln!(writer, "}}")?;

        tail = &tail[cond_end..];
    }

    Ok(())
}

fn write_list<W: fmt::Write, T: fmt::Display, I: IntoIterator<Item = T>>(
    mut writer: W,
    items: I,
) -> fmt::Result {
    writeln!(writer, "[")?;
    for item in items.into_iter() {
        writeln!(writer, "\"{item}\",")?;
    }
    writeln!(writer, "]")
}

fn write_str_escaped<W: fmt::Write>(mut writer: W, s: &str) -> fmt::Result {
    // This escaping isn't entirely correct; it misses some characters that
    // should be escaped and unnecessarily changes " to '. See
    // https://gn.googlesource.com/gn/+/main/docs/language.md#strings
    //
    // We keep the crates.py behavior for now to keep build file output as
    // similar as possible.
    //
    // TODO(https://crbug.com/1291994): do escaping as specified in GN docs.
    for c in s.chars() {
        let mut buf = [0u8; 4];
        let s = match c {
            // Skip newlines to match crates.py behavior.
            '\n' => continue,
            '"' => r#"'"#,
            c => c.encode_utf8(&mut buf),
        };

        writer.write_str(s)?;
    }

    Ok(())
}

pub fn write_str_escaped_for_testing<W: fmt::Write>(writer: W, s: &str) -> fmt::Result {
    write_str_escaped(writer, s)
}

/// Describes a condition for some GN declaration.
#[derive(Clone, Debug, Eq, Ord, PartialEq, PartialOrd)]
pub enum Condition {
    /// The associated GN declarations are unconditional: they will not be
    /// wrapped in an if condition.
    Always,
    /// The association GN declaration is wrapped in an if condition. The
    /// string is the conditional expression.
    If(String),
}

impl Condition {
    /// Get the conditional expression, or `None` if it's unconditional.
    pub fn get_if(&self) -> Option<&str> {
        match self {
            Condition::If(cond) => Some(cond),
            _ => None,
        }
    }
}

impl From<platforms::PlatformSet> for Condition {
    fn from(platform_set: platforms::PlatformSet) -> Self {
        let platforms = match platform_set {
            platforms::PlatformSet::All => return Condition::Always,
            platforms::PlatformSet::Platforms(platforms) => platforms,
        };

        Condition::If(
            platforms
                .iter()
                .map(|platform| format!("({})", platform_to_condition(platform)))
                .collect::<Vec<String>>()
                .join(" || "),
        )
    }
}

/// Map a cargo `Platform` constraint to a GN conditional expression.
pub fn platform_to_condition(platform: &platforms::Platform) -> String {
    match platform {
        platforms::Platform::Name(triple) => triple_to_condition(triple).to_string(),
        platforms::Platform::Cfg(cfg_expr) => cfg_expr_to_condition(cfg_expr),
    }
}

pub fn cfg_expr_to_condition(cfg_expr: &cargo_platform::CfgExpr) -> String {
    match cfg_expr {
        cargo_platform::CfgExpr::Not(expr) => {
            format!("!({})", cfg_expr_to_condition(&expr))
        }
        cargo_platform::CfgExpr::All(exprs) => exprs
            .iter()
            .map(|expr| format!("({})", cfg_expr_to_condition(expr)))
            .collect::<Vec<String>>()
            .join(" && "),
        cargo_platform::CfgExpr::Any(exprs) => exprs
            .iter()
            .map(|expr| format!("({})", cfg_expr_to_condition(expr)))
            .collect::<Vec<String>>()
            .join(" || "),
        cargo_platform::CfgExpr::Value(cfg) => cfg_to_condition(cfg),
    }
}

pub fn cfg_to_condition(cfg: &cargo_platform::Cfg) -> String {
    match cfg {
        cargo_platform::Cfg::Name(name) => match name.as_str() {
            // Note that while Fuchsia is not a unix, rustc sets the unix cfg
            // anyway. We must be consistent with rustc. This may change with
            // https://github.com/rust-lang/rust/issues/58590
            "unix" => "!is_win",
            "windows" => "is_win",
            _ => unreachable!(),
        },
        cargo_platform::Cfg::KeyPair(key, value) => {
            assert_eq!(key, "target_os");
            target_os_to_condition(&value)
        }
    }
    .to_string()
}

fn triple_to_condition(triple: &str) -> &'static str {
    for (t, c) in TRIPLE_TO_GN_CONDITION {
        if *t == triple {
            return c;
        }
    }

    panic!("target triple {triple} not found")
}

fn target_os_to_condition(target_os: &str) -> &'static str {
    for (t, c) in TARGET_OS_TO_GN_CONDITION {
        if *t == target_os {
            return c;
        }
    }

    panic!("target os {target_os} not found")
}

static TRIPLE_TO_GN_CONDITION: &'static [(&'static str, &'static str)] = &[
    ("i686-linux-android", "is_android && target_cpu == \"x86\""),
    ("x86_64-linux-android", "is_android && target_cpu == \"x64\""),
    ("armv7-linux-android", "is_android && target_cpu == \"arm\""),
    ("aarch64-linux-android", "is_android && target_cpu == \"arm64\""),
    ("aarch64-fuchsia", "is_fuchsia && target_cpu == \"arm64\""),
    ("x86_64-fuchsia", "is_fuchsia && target_cpu == \"x64\""),
    ("aarch64-apple-ios", "is_ios && target_cpu == \"arm64\""),
    ("armv7-apple-ios", "is_ios && target_cpu == \"arm\""),
    ("x86_64-apple-ios", "is_ios && target_cpu == \"x64\""),
    ("i386-apple-ios", "is_ios && target_cpu == \"x86\""),
    ("i686-pc-windows-msvc", "is_win && target_cpu == \"x86\""),
    ("x86_64-pc-windows-msvc", "is_win && target_cpu == \"x64\""),
    ("i686-unknown-linux-gnu", "(is_linux || is_chromeos) && target_cpu == \"x86\""),
    ("x86_64-unknown-linux-gnu", "(is_linux || is_chromeos) && target_cpu == \"x64\""),
    ("x86_64-apple-darwin", "is_mac && target_cpu == \"x64\""),
    ("aarch64-apple-darwin", "is_mac && target_cpu == \"arm64\""),
];

static TARGET_OS_TO_GN_CONDITION: &'static [(&'static str, &'static str)] = &[
    ("android", "is_android"),
    ("darwin", "is_mac"),
    ("fuchsia", "is_fuchsia"),
    ("ios", "is_ios"),
    ("linux", "is_linux || is_chromeos"),
    ("windows", "is_win"),
];

static COPYRIGHT_HEADER: &'static str = "# Copyright 2022 The Chromium Authors
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.";

static VISIBILITY_CONSTRAINT: &'static str =
    "# Only for usage from third-party crates. Add the crate to
# third_party.toml to use it from first-party code.
visibility = [ \"//third_party/rust/*\" ]";
