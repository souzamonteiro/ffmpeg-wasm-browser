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
    --target-os=none \
    --arch=wasm32 \
    --enable-cross-compile \
    --disable-x86asm \
    --disable-asm \
    --disable-inline-asm \
    --enable-ffmpeg \
    --disable-ffplay \
    --disable-ffprobe \
    --disable-doc \
    --disable-debug \
    --disable-everything \
    --enable-avcodec \
    --enable-avformat \
    --enable-avutil \
    --enable-swresample \
    --enable-avfilter \
    --enable-demuxer=mov,mp4,matroska,webm,ogg,wav,mp3 \
    --enable-muxer=mp4,webm,ogg,wav \
    --enable-decoder=aac,mp3,opus,vorbis,pcm_s16le,pcm_f32le,h264,vp8,vp9 \
    --enable-encoder=aac,opus,vorbis,pcm_s16le,pcm_f32le \
    --enable-filter=aresample,volume,amix,sidechaincompress \
    --enable-protocol=file \
    --cc=emcc \
    --cxx=em++ \
    --ar=emar \
    --ranlib=emranlib \
    --extra-cflags="-O3" \
    --extra-ldflags="-O3"

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
    libavformat/libavformat.a \
    libavcodec/libavcodec.a \
    libavutil/libavutil.a \
    libswresample/libswresample.a \
    libavfilter/libavfilter.a \
    -O3 \
    -o ffmpeg.js \
    -s MODULARIZE=1 \
    -s EXPORT_NAME="createFFmpeg" \
    -s ENVIRONMENT=web \
    -s FORCE_FILESYSTEM=1 \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s INITIAL_MEMORY=256MB \
    -s EXPORTED_FUNCTIONS='["_main"]' \
    -s EXPORTED_RUNTIME_METHODS='["FS","callMain"]'

    # Copy output files to build directory
    cp ffmpeg.js $BUILD_DIR/ffmpeg.js
    cp ffmpeg.wasm $BUILD_DIR/ffmpeg.wasm

    echo "FFmpeg WebAssembly build completed. Files are in $BUILD_DIR"
