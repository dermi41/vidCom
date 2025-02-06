#!/bin/bash

# Installiere FFmpeg in einem temporären Verzeichnis
TEMP_DIR="/tmp/ffmpeg"
mkdir -p $TEMP_DIR
curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-i686-static.tar.xz | tar xJ -C $TEMP_DIR

# Füge den binären Ordner von FFmpeg zum PATH hinzu
echo 'export PATH=$TEMP_DIR/ffmpeg-*-static:$PATH' >> ~/.bashrc
source ~/.bashrc

# Installiere yt-dlp im temporären Verzeichnis
mkdir -p $TEMP_DIR/bin
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o $TEMP_DIR/bin/yt-dlp
chmod a+rx $TEMP_DIR/bin/yt-dlp

# Füge yt-dlp zum PATH hinzu
echo 'export PATH=$TEMP_DIR/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
