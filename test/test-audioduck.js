ffmpeg.callMain([
  "-i", "input.mp4",
  "-i", "music.wav",
  "-filter_complex",
  "[1:a]volume=1.0[bg];" +
  "[0:a][bg]sidechaincompress=" +
  "threshold=0.02:" +
  "ratio=8:" +
  "attack=20:" +
  "release=250[mixed]",
  "-map", "0:v",
  "-map", "[mixed]",
  "-c:v", "copy",
  "-c:a", "aac",
  "out.mp4"
]);
