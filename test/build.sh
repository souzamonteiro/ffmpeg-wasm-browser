#!/bin/sh

# Build script for ffmpeg

# Set up build directory
BUILD_DIR=$(pwd)/build
mkdir -p $BUILD_DIR
rm -rf $BUILD_DIR/*
SRC_DIR=$(pwd)/src
mkdir -p $SRC_DIR
rm -rf $SRC_DIR/FFmpeg-n5.1.4
cd $SRC_DIR
#wget https://github.com/FFmpeg/FFmpeg/archive/refs/tags/n5.1.4.tar.gz -O ffmpeg-5.1.4.tar.gz
tar -xvf ../src/ffmpeg-5.1.4.tar.gz
cd FFmpeg-n5.1.4

# Configure build options
./configure \
    --prefix=$BUILD_DIR \
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
    --extra-cflags="-O3 -flto" \
    --extra-ldflags="-O3 -flto"

# Build and install
make
#make install
