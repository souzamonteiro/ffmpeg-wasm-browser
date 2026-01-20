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
    --enable-decoder=aac,flac,libmp3lame,libopus,mp3,mp4,opus,pcm_s16le,vorbis \
    --enable-encoder=aac,flac,libmp3lame,libopus,mp3,mp4,opus,pcm_s16le,vorbis \
    --enable-decoder=h264,libvpx,libvpx-vp9,mjpeg,mpeg4,vp8,vp9 \
    --enable-encoder=h264,libvpx,libvpx-vp9,mjpeg,mpeg4,vp8,vp9 \
     --enable-demuxer=aac,flac,flv,mov,mp3,mp4,ogg,opus,matroska,pcm_s16le,pcm_s24le,s16le,s24le,wav,webm \
    --enable-muxer=aac,flac,flv,mov,mp3,mp4,ogg,opus,matroska,pcm_s16le,pcm_s24le,s16le,s24le,wav,webm \
    --enable-protocol=file \
    --enable-filter=amerge,aresample,blend,colorkey,crop,dissolve,drawtext,fade,format,overlay,pan,scale,similarity,volume,yadif \
    --enable-small \
    --enable-gpl \
    --enable-nonfree \
    --enable-version3 \
    --extra-cflags="-O3 -flto" \
    --extra-ldflags="-O3 -flto"

# Build and install
make
#make install
