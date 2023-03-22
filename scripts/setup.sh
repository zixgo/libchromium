# !/bin/bash

set -o nounset
set -o errexit

SCRIPT_DIR=$(cd $(dirname $0) && pwd)

AddGitSubmodule() {
  local url="$1"
  local dir="$2"
  local revision="$3"
  rm -rf "$dir"
  git submodule add "$url" "$dir"
  pushd "$dir"
  git checkout "$revision"
  popd
}

AddGitSubmodule https://chromium.googlesource.com/external/github.com/llvm/llvm-project/libcxx.git ./buildtools/third_party/libc++/trunk 2948540a20cbb5b2192119f791b04dd62ca7af1c
AddGitSubmodule https://chromium.googlesource.com/external/github.com/llvm/llvm-project/libunwind.git ./buildtools/third_party/libunwind/trunk 5e22a7fe2335161ab267867c8e1be481bf6c8300
AddGitSubmodule https://chromium.googlesource.com/external/github.com/llvm/llvm-project/libcxxabi.git ./buildtools/third_party/libc++abi/trunk 123239cdb67b3d69c5af933e364a84019a33575c
AddGitSubmodule https://chromium.googlesource.com/external/github.com/llvm/llvm-project/clang/tools/clang-format.git ./buildtools/clang_format/script 8b525d2747f2584fc35d8c7e612e66f377858df7
AddGitSubmodule https://chromium.googlesource.com/chromium/deps/libjpeg_turbo.git ./third_party/libjpeg_turbo ed683925e4897a84b3bffc5c1414c85b97a129a3 
AddGitSubmodule https://chromium.googlesource.com/catapult.git ./third_party/catapult 53918cb7df6c5ca7025d5762e2140ef059b2ca6c
AddGitSubmodule https://chromium.googlesource.com/linux-syscall-support.git ./third_party/lss ce877209e11aa69dcfffbd53ef90ea1d07136521
AddGitSubmodule https://android.googlesource.com/platform/external/perfetto.git ./third_party/perfetto 39f3c505498164c3ad9ca31a4f5924de5d6aa8d0
AddGitSubmodule https://chromium.googlesource.com/chromium/deps/sqlite.git ./third_party/sqlite/src a527890e56f1304053e5d9607aba139baf5b9245
AddGitSubmodule https://github.com/harfbuzz/harfbuzz.git ./third_party/harfbuzz-ng/src 2822b589bc837fae6f66233e2cf2eef0f6ce8470
AddGitSubmodule https://chromium.googlesource.com/external/github.com/google/googletest.git ./third_party/googletest/src af29db7ec28d6df1c7f0f745186884091e602e07
AddGitSubmodule https://chromium.googlesource.com/external/github.com/open-source-parsers/jsoncpp.git ./third_party/jsoncpp/source 42e892d96e47b1f6e29844cc705e148ec4856448
AddGitSubmodule https://chromium.googlesource.com/chromium/deps/nasm.git ./third_party/nasm 0873b2bae6a5388a1c55deac8456e3c60a47ca08
AddGitSubmodule https://chromium.googlesource.com/chromium/deps/icu.git ./third_party/icu 7ff1e9befce5567754dc88392dfaa4704e261ab3
AddGitSubmodule https://boringssl.googlesource.com/boringssl.git ./third_party/boringssl/src 28f96c2686459add7acedcd97cb841030bdda019
AddGitSubmodule https://chromium.googlesource.com/chromium/src/third_party/freetype2.git ./third_party/freetype/src ace97a02a4461bbdae29da4019c105eead95e277
AddGitSubmodule https://chromium.googlesource.com/external/github.com/google/compact_enc_det.git ./third_party/ced/src ba412eaaacd3186085babcd901679a48863c7dd5
AddGitSubmodule https://chromium.googlesource.com/external/fontconfig.git ./third_party/fontconfig/src 452be8125f0e2a18a7dfef469e05d19374d36307
AddGitSubmodule https://chromium.googlesource.com/chromium/deps/acid3.git ./tools/page_cycler/acid3 6be0a66a1ebd7ebc5abc1b2f405a945f6d871521
