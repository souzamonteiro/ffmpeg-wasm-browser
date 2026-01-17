#!/bin/bash
# install-deps.sh
echo "📦 Instalando dependências para Node.js..."

npm install --save-dev node-fetch file-reader vm

echo "✅ Dependências instaladas!"
echo "🎯 Agora execute: node ffmpeg-node-cli.js -version"
