# FFmpeg.wasm Console Simulator

A web-based terminal interface that simulates the FFmpeg command-line tool using WebAssembly. This project allows you to run FFmpeg commands directly in your browser with a familiar terminal-like interface.

![FFmpeg.wasm Console](demo-screenshot.png)

## 🚀 Features

- **Terminal Interface**: Familiar command-line experience in the browser
- **File Management**: Upload, download, and manage files in a virtual filesystem
- **Memory Management**: Automatic reset functionality to handle WebAssembly memory issues
- **Stdin Support**: Interactive input handling for FFmpeg commands that require user input
- **Command History**: Navigate through previous commands with arrow keys
- **Real-time Progress**: Visual progress indicator for long-running operations
- **Cross-platform**: Works in any modern browser with WebAssembly support

## 📁 Project Structure

```
www/
├── index.html          # Main console interface
├── ffmpeg.js           # FFmpeg WebAssembly library
└── ffmpeg.wasm         # WebAssembly binary
```

## 🛠️ Installation

1. **Prerequisites**: Ensure you have the following files in the same directory:
   - `ffmpeg.js` (FFmpeg WebAssembly library)
   - `ffmpeg.wasm` (WebAssembly binary)

2. **Quick Start**:
   ```bash
   # Clone or download the project files
   # Open index.html in a web browser
   open ffmpeg-wasm-console.html
   ```

3. **Using a Web Server** (recommended):
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js with http-server
   npx http-server
   
   # PHP
   php -S localhost:8000
   ```

## 🎯 Usage

### Basic Commands

| Command | Description |
|---------|-------------|
| `help` | Show available commands |
| `clear` | Clear the console |
| `ls` or `dir` | List files in virtual filesystem |
| `upload [filename]` | Upload files from your computer |
| `download <filename>` | Download files to your computer |
| `rm` or `del <filename>` | Delete files |
| `reset` | Reset FFmpeg instance (fix memory issues) |
| `memory` | Show memory usage history |

### FFmpeg Commands

You can use FFmpeg commands directly:

```bash
# Show version information
ffmpeg-wasm $ -version

# List available codecs
ffmpeg-wasm $ -codecs

# Convert audio file
ffmpeg-wasm $ -i input.wav output.mp3

# Resample audio
ffmpeg-wasm $ -i audio.wav -acodec pcm_s16le -ar 22050 -ac 1 output.wav

# Apply audio filter
ffmpeg-wasm $ -i audio.wav -af "volume=0.5" output.wav
```

### Advanced Usage

```bash
# Upload a file and process it
ffmpeg-wasm $ upload input.m4a
ffmpeg-wasm $ -i input.m4a -c:a libmp3lame -b:a 192k output.mp3
ffmpeg-wasm $ download output.mp3

# Multiple operations with auto-reset
ffmpeg-wasm $ -i audio1.wav output1.mp3
ffmpeg-wasm $ -i audio2.wav output2.mp3
ffmpeg-wasm $ reset  # Clear memory between large operations
ffmpeg-wasm $ -i audio3.wav output3.mp3
```

## 🔧 Technical Details

### Architecture

- **WebAssembly FFmpeg**: Uses custom-compiled FFmpeg with selected codecs and features
- **Virtual Filesystem**: Implements a persistent file system that survives FFmpeg resets
- **Memory Management**: Monitors WebAssembly memory usage and auto-resets when needed
- **Command Queue**: Processes commands sequentially to prevent conflicts

### Supported Codecs & Formats

Based on the build configuration, this includes:

**Audio Codecs:**
- Decoders: AAC, MP3, PCM S16LE, Opus, Vorbis, FLAC
- Encoders: AAC, libmp3lame, libopus, PCM S16LE

**Video Codecs:**
- Decoders: VP8, VP9, H264, MPEG4, MJPEG
- Encoders: libvpx, libvpx-vp9, mpeg4, mjpeg

**Containers:**
- Demuxers: MP3, WAV, AAC, FLAC, OGG, Opus, MOV, MP4, FLV, Matroska, WebM
- Muxers: MP3, WAV, MP4, FLV, Matroska, WebM, OGG

**Filters:**
- scale, aresample, format

## 🐛 Troubleshooting

### Common Issues

**Memory Access Out of Bounds Error**
```bash
# If you see: "memory access out of bounds"
ffmpeg-wasm $ reset  # Reset the FFmpeg instance
```

**FFmpeg Not Initialized**
```bash
# The console will auto-reinitialize, or manually:
ffmpeg-wasm $ reset
```

**File Not Found**
```bash
# Ensure files are uploaded first
ffmpeg-wasm $ upload myfile.wav
ffmpeg-wasm $ -i myfile.wav output.mp3
```

**Browser Compatibility**
- Requires a modern browser with WebAssembly support
- Chrome, Firefox, Safari, Edge (latest versions)
- Enable JavaScript

### Performance Tips

1. **Large Files**: Use `reset` command between processing large files
2. **Memory Monitoring**: Use `memory` command to track usage
3. **Batch Processing**: Process files sequentially rather than parallel
4. **File Size**: Keep individual files under 100MB for best performance

## 🎨 Customization

### Styling

The interface uses CSS variables for easy customization:

```css
:root {
    --background: #1e1e1e;
    --text-color: #00ff00;
    --accent-color: #007acc;
    --error-color: #ff4444;
    --success-color: #00ff00;
}
```

### Configuration

Modify the FFmpeg initialization in the JavaScript:

```javascript
this.ffmpeg = await createFFmpeg({
    log: false,           // Set to true for verbose logging
    progress: (p) => this.updateProgress(p)
});
```

## 🔄 Development

### Building FFmpeg.wasm

If you need to rebuild FFmpeg with different options:

```bash
# Build script example
#!/bin/bash
source ~/emsdk/emsdk_env.sh

emconfigure ./configure \
    --target-os=none \
    --arch=wasm \
    --enable-cross-compile \
    # ... your configuration options

emmake make -j$(nproc)
emcc fftools/ffmpeg.o [...] -o ffmpeg.js
```

### Extending Functionality

To add new commands, modify the `executeCommand` method:

```javascript
case 'newcommand':
    await this.handleNewCommand(restArgs);
    break;
```

## 📊 Performance Metrics

- **Initial Load**: ~2-5 seconds (FFmpeg.wasm download)
- **Command Execution**: Varies by operation complexity
- **Memory Usage**: Typically 50-200MB during processing
- **File Size Limit**: Practical limit ~500MB per file

## 🤝 Contributing

Contributions are welcome! Areas for improvement:

- Additional FFmpeg features support
- Improved error handling
- Enhanced UI/UX
- Performance optimizations
- Browser compatibility fixes

## 📄 License

This project uses FFmpeg libraries licensed under LGPL/GPL. Please ensure compliance with FFmpeg's licensing requirements when distributing.

## 🙏 Acknowledgments

- FFmpeg team for the incredible multimedia framework
- Emscripten team for WebAssembly toolchain
- Contributors to ffmpeg.js projects

## 📞 Support

If you encounter issues:

1. Check the browser console for detailed error messages
2. Ensure all required files are in the same directory
3. Try the `reset` command for memory-related issues
4. Verify browser supports WebAssembly

## 🌟 Star History

If you find this project useful, please consider starring it on GitHub!
