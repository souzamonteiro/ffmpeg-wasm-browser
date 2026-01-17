#!/bin/sh

# Build script for ffmpeg-wasm using emscripten

source ~/emsdk/emsdk_env.sh

# Set up build directory
BUILD_DIR=$(pwd)/build
mkdir -p $BUILD_DIR
rm -rf $BUILD_DIR/*
SRC_DIR=$(pwd)/src
mkdir -p $SRC_DIR
rm -rf $SRC_DIR/FFmpeg-n5.1.4
cd $SRC_DIR
#wget https://github.com/FFmpeg/FFmpeg/archive/refs/tags/n5.1.4.tar.gz -O ffmpeg-5.1.4.tar.gz
tar -xvf ffmpeg-5.1.4.tar.gz
cd FFmpeg-n5.1.4

# Configure build options
emconfigure ./configure \
    --prefix=$BUILD_DIR \
    --target-os=none \
    --arch=wasm \
    --enable-cross-compile \
    --disable-x86asm \
    --disable-asm \
    --disable-inline-asm \
    --disable-programs \
    --disable-doc \
    --disable-debug \
    --disable-everything \
    --enable-ffmpeg \
    --enable-avcodec \
    --enable-avformat \
    --enable-avutil \
    --enable-swresample \
    --enable-swscale \
    --enable-avfilter \
    --enable-decoder=aac,mp3,pcm_s16le,opus,vorbis,flac \
    --enable-encoder=aac,libmp3lame,libopus,pcm_s16le \
    --enable-decoder=vp8,vp9,h264,mpeg4,mjpeg \
    --enable-encoder=libvpx,libvpx-vp9,mpeg4,mjpeg \
    --enable-demuxer=mp3,wav,aac,flac,ogg,opus,mov,mp4,flv,matroska,webm \
    --enable-muxer=mp3,wav,mp4,flv,matroska,webm,ogg \
    --enable-protocol=file \
    --enable-filter=scale,aresample,format \
    --enable-small \
    --enable-gpl \
    --enable-nonfree \
    --enable-version3 \
    --cc=emcc \
    --cxx=em++ \
    --ar=emar \
    --ranlib=emranlib \
    --extra-cflags="-O3 -flto" \
    --extra-ldflags="-O3 -flto"

# Build and install
emmake make -j$(nproc)

# Find built static libraries
find . -name "*.a" -type f

# Link static libraries into WebAssembly module
emcc \
    fftools/ffmpeg.o \
    fftools/cmdutils.o \
    fftools/opt_common.o \
    fftools/ffmpeg_opt.o \
    fftools/ffmpeg_filter.o \
    fftools/ffmpeg_mux.o \
    fftools/ffmpeg_hw.o \
    \
    libavformat/libavformat.a \
    libavcodec/libavcodec.a \
    libavutil/libavutil.a \
    libswresample/libswresample.a \
    libswscale/libswscale.a \
    libavfilter/libavfilter.a \
    libavdevice/libavdevice.a \
    libpostproc/libpostproc.a \
    \
    -o ffmpeg.js \
    -O3 \
    -s MODULARIZE=1 \
    -s EXPORT_NAME="createFFmpeg" \
    -s ENVIRONMENT=web \
    -s FORCE_FILESYSTEM=1 \
    -s STACK_SIZE=5MB \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s INITIAL_MEMORY=512MB \
    -s MAXIMUM_MEMORY=1GB \
    -s EXPORTED_FUNCTIONS='["_main"]' \
    -s EXPORTED_RUNTIME_METHODS='["FS","callMain"]'

    # Copy output files to build directory
    cp ffmpeg.js $BUILD_DIR/ffmpeg.js
    cp ffmpeg.wasm $BUILD_DIR/ffmpeg.wasm

    echo "FFmpeg WebAssembly build completed. Files are in $BUILD_DIR"
