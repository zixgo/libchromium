#!/bin/bash

rm -rf gn
git clone https://gn.googlesource.com/gn
pushd gn
git checkout 5e19d2fb166fbd4f6f32147fbb2f497091a54ad8
python3 build/gen.py
ninja -C out
./out/gn_unittests
popd
cp -pv ./gn/out/gn ./buildtools/linux64
# sha1sum ./buildtools/linux64/gn > ./buildtools/linux64/gn.sha1
rm -rf gn

tar zxf ./toolsets/test_fonts.tar.gz -C ./third_party/test_fonts/

rm -rf ./build/linux/debian_bullseye_amd64-sysroot
mkdir -pv ./build/linux/debian_bullseye_amd64-sysroot
tar xf ./toolsets/debian_bullseye_amd64_sysroot.tar.xz -C ./build/linux/debian_bullseye_amd64-sysroot/

rm -rf third_party/llvm-build/Release+Asserts
mkdir -pv third_party/llvm-build/Release+Asserts
clang_version='llvmorg-16-init-12251-g87d0ff91-2'
tar xf ./toolsets/clang-${clang_version}.tar.xz -C third_party/llvm-build/Release+Asserts
echo -n "$clang_version" > third_party/llvm-build/Release+Asserts/cr_build_revision

./buildtools/linux64/gn gen out/Default --args="is_debug=true"
ninja -C out/Default
ninja -C out/Default -t compdb cxx cc > out/compile_commands.json
./out/Default/base_unittests
