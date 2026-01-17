#!/bin/bash

cd FFmpeg-n5.1.4 || exit 1

for lib in avformat avcodec avutil swscale swresample; do
    echo "--> lib${lib} functions:"
    objdump -t lib${lib}/lib${lib}.a | grep " F " | awk '{print $NF}'
    echo ""
done
