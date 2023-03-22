// Copyright 2021 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// This file was generated by:
//   tools/json_schema_compiler/compiler.py.
// NOTE: The format of types has changed. 'FooType' is now
//   'chrome.management.FooType'.
// Please run the closure compiler before committing changes.
// See https://chromium.googlesource.com/chromium/src/+/main/docs/closure_compilation.md

/**
 * @fileoverview Externs generated from namespace: management
 * @externs
 */

/** @const */
chrome.management = {};

/**
 * Information about an icon belonging to an extension, app, or theme.
 * @typedef {{
 *   size: number,
 *   url: string
 * }}
 * @see https://developer.chrome.com/extensions/management#type-IconInfo
 */
chrome.management.IconInfo;

/**
 * @enum {string}
 * @see https://developer.chrome.com/extensions/management#type-LaunchType
 */
chrome.management.LaunchType = {
  OPEN_AS_REGULAR_TAB: 'OPEN_AS_REGULAR_TAB',
  OPEN_AS_PINNED_TAB: 'OPEN_AS_PINNED_TAB',
  OPEN_AS_WINDOW: 'OPEN_AS_WINDOW',
  OPEN_FULL_SCREEN: 'OPEN_FULL_SCREEN',
};

/**
 * @enum {string}
 * @see https://developer.chrome.com/extensions/management#type-ExtensionDisabledReason
 */
chrome.management.ExtensionDisabledReason = {
  UNKNOWN: 'unknown',
  PERMISSIONS_INCREASE: 'permissions_increase',
};

/**
 * @enum {string}
 * @see https://developer.chrome.com/extensions/management#type-ExtensionType
 */
chrome.management.ExtensionType = {
  EXTENSION: 'extension',
  HOSTED_APP: 'hosted_app',
  PACKAGED_APP: 'packaged_app',
  LEGACY_PACKAGED_APP: 'legacy_packaged_app',
  THEME: 'theme',
  LOGIN_SCREEN_EXTENSION: 'login_screen_extension',
};

/**
 * @enum {string}
 * @see https://developer.chrome.com/extensions/management#type-ExtensionInstallType
 */
chrome.management.ExtensionInstallType = {
  ADMIN: 'admin',
  DEVELOPMENT: 'development',
  NORMAL: 'normal',
  SIDELOAD: 'sideload',
  OTHER: 'other',
};

/**
 * Information about an installed extension, app, or theme.
 * @typedef {{
 *   id: string,
 *   name: string,
 *   shortName: string,
 *   description: string,
 *   version: string,
 *   versionName: (string|undefined),
 *   mayDisable: boolean,
 *   mayEnable: (boolean|undefined),
 *   enabled: boolean,
 *   disabledReason: (!chrome.management.ExtensionDisabledReason|undefined),
 *   isApp: boolean,
 *   type: !chrome.management.ExtensionType,
 *   appLaunchUrl: (string|undefined),
 *   homepageUrl: (string|undefined),
 *   updateUrl: (string|undefined),
 *   offlineEnabled: boolean,
 *   optionsUrl: string,
 *   icons: (!Array<!chrome.management.IconInfo>|undefined),
 *   permissions: !Array<string>,
 *   hostPermissions: !Array<string>,
 *   installType: !chrome.management.ExtensionInstallType,
 *   launchType: (!chrome.management.LaunchType|undefined),
 *   availableLaunchTypes: (!Array<!chrome.management.LaunchType>|undefined)
 * }}
 * @see https://developer.chrome.com/extensions/management#type-ExtensionInfo
 */
chrome.management.ExtensionInfo;

/**
 * Options for how to handle the extension's uninstallation.
 * @typedef {{
 *   showConfirmDialog: (boolean|undefined)
 * }}
 * @see https://developer.chrome.com/extensions/management#type-UninstallOptions
 */
chrome.management.UninstallOptions;

/**
 * Returns a list of information about installed extensions and apps.
 * @param {function(!Array<!chrome.management.ExtensionInfo>): void=} callback
 * @see https://developer.chrome.com/extensions/management#method-getAll
 */
chrome.management.getAll = function(callback) {};

/**
 * Returns information about the installed extension, app, or theme that has the
 * given ID.
 * @param {string} id The ID from an item of $(ref:management.ExtensionInfo).
 * @param {function(!chrome.management.ExtensionInfo): void=} callback
 * @see https://developer.chrome.com/extensions/management#method-get
 */
chrome.management.get = function(id, callback) {};

/**
 * Returns information about the calling extension, app, or theme. Note: This
 * function can be used without requesting the 'management' permission in the
 * manifest.
 * @param {function(!chrome.management.ExtensionInfo): void=} callback
 * @see https://developer.chrome.com/extensions/management#method-getSelf
 */
chrome.management.getSelf = function(callback) {};

/**
 * Returns a list of <a href='permission_warnings'>permission warnings</a> for
 * the given extension id.
 * @param {string} id The ID of an already installed extension.
 * @param {function(!Array<string>): void=} callback
 * @see https://developer.chrome.com/extensions/management#method-getPermissionWarningsById
 */
chrome.management.getPermissionWarningsById = function(id, callback) {};

/**
 * Returns a list of <a href='permission_warnings'>permission warnings</a> for
 * the given extension manifest string. Note: This function can be used without
 * requesting the 'management' permission in the manifest.
 * @param {string} manifestStr Extension manifest JSON string.
 * @param {function(!Array<string>): void=} callback
 * @see https://developer.chrome.com/extensions/management#method-getPermissionWarningsByManifest
 */
chrome.management.getPermissionWarningsByManifest = function(manifestStr, callback) {};

/**
 * Enables or disables an app or extension. In most cases this function must be
 * called in the context of a user gesture (e.g. an onclick handler for a
 * button), and may present the user with a native confirmation UI as a way of
 * preventing abuse.
 * @param {string} id This should be the id from an item of
 *     $(ref:management.ExtensionInfo).
 * @param {boolean} enabled Whether this item should be enabled or disabled.
 * @param {function(): void=} callback
 * @see https://developer.chrome.com/extensions/management#method-setEnabled
 */
chrome.management.setEnabled = function(id, enabled, callback) {};

/**
 * Uninstalls a currently installed app or extension. Note: This function does
 * not work in managed environments when the user is not allowed to uninstall
 * the specified extension/app.
 * @param {string} id This should be the id from an item of
 *     $(ref:management.ExtensionInfo).
 * @param {!chrome.management.UninstallOptions=} options
 * @param {function(): void=} callback
 * @see https://developer.chrome.com/extensions/management#method-uninstall
 */
chrome.management.uninstall = function(id, options, callback) {};

/**
 * Uninstalls the calling extension. Note: This function can be used without
 * requesting the 'management' permission in the manifest. This function does
 * not work in managed environments when the user is not allowed to uninstall
 * the specified extension/app.
 * @param {!chrome.management.UninstallOptions=} options
 * @param {function(): void=} callback
 * @see https://developer.chrome.com/extensions/management#method-uninstallSelf
 */
chrome.management.uninstallSelf = function(options, callback) {};

/**
 * Launches an application.
 * @param {string} id The extension id of the application.
 * @param {function(): void=} callback
 * @see https://developer.chrome.com/extensions/management#method-launchApp
 */
chrome.management.launchApp = function(id, callback) {};

/**
 * Display options to create shortcuts for an app. On Mac, only packaged app
 * shortcuts can be created.
 * @param {string} id This should be the id from an app item of
 *     $(ref:management.ExtensionInfo).
 * @param {function(): void=} callback
 * @see https://developer.chrome.com/extensions/management#method-createAppShortcut
 */
chrome.management.createAppShortcut = function(id, callback) {};

/**
 * Set the launch type of an app.
 * @param {string} id This should be the id from an app item of
 *     $(ref:management.ExtensionInfo).
 * @param {!chrome.management.LaunchType} launchType The target launch type.
 *     Always check and make sure this launch type is in
 *     $(ref:ExtensionInfo.availableLaunchTypes), because the available launch
 *     types vary on different platforms and configurations.
 * @param {function(): void=} callback
 * @see https://developer.chrome.com/extensions/management#method-setLaunchType
 */
chrome.management.setLaunchType = function(id, launchType, callback) {};

/**
 * Generate an app for a URL. Returns the generated bookmark app.
 * @param {string} url The URL of a web page. The scheme of the URL can only be
 *     "http" or "https".
 * @param {string} title The title of the generated app.
 * @param {function(!chrome.management.ExtensionInfo): void=} callback
 * @see https://developer.chrome.com/extensions/management#method-generateAppForLink
 */
chrome.management.generateAppForLink = function(url, title, callback) {};

/**
 * Checks if the replacement android app can be installed. Errors generated by
 * this API are reported by setting $(ref:runtime.lastError) and executing the
 * function's regular callback.
 * @param {function(boolean): void} callback
 * @see https://developer.chrome.com/extensions/management#method-canInstallReplacementAndroidApp
 */
chrome.management.canInstallReplacementAndroidApp = function(callback) {};

/**
 * Prompts the user to install the replacement Android app from the manifest.
 * Errors generated by this API are reported by setting $(ref:runtime.lastError)
 * and executing the function's regular callback.
 * @param {function(): void=} callback
 * @see https://developer.chrome.com/extensions/management#method-installReplacementAndroidApp
 */
chrome.management.installReplacementAndroidApp = function(callback) {};

/**
 * Launches the replacement_web_app specified in the manifest. Prompts the user
 * to install if not already installed.
 * @param {function(): void=} callback
 * @see https://developer.chrome.com/extensions/management#method-installReplacementWebApp
 */
chrome.management.installReplacementWebApp = function(callback) {};

/**
 * Fired when an app or extension has been installed.
 * @type {!ChromeEvent}
 * @see https://developer.chrome.com/extensions/management#event-onInstalled
 */
chrome.management.onInstalled;

/**
 * Fired when an app or extension has been uninstalled.
 * @type {!ChromeEvent}
 * @see https://developer.chrome.com/extensions/management#event-onUninstalled
 */
chrome.management.onUninstalled;

/**
 * Fired when an app or extension has been enabled.
 * @type {!ChromeEvent}
 * @see https://developer.chrome.com/extensions/management#event-onEnabled
 */
chrome.management.onEnabled;

/**
 * Fired when an app or extension has been disabled.
 * @type {!ChromeEvent}
 * @see https://developer.chrome.com/extensions/management#event-onDisabled
 */
chrome.management.onDisabled;
