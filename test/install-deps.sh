#!/bin/bash
# install-deps.sh
echo "📦 Installing dependencies for Node.js..."

npm install --save-dev node-fetch file-reader vm

echo "✅ Dependencies installed!"

echo "🎯 Now run: node ffmpeg-node-cli.js -version"
