#!/bin/bash

# Install FFmpeg in a custom directory
curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-i686-static.tar.xz | tar xJ
mkdir -p $HOME/bin
mv ffmpeg-*-static/ffmpeg $HOME/bin/
mv ffmpeg-*-static/ffprobe $HOME/bin/

# Add the custom directory to the PATH
echo 'export PATH=$HOME/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Install yt-dlp
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o $HOME/bin/yt-dlp
chmod a+rx $HOME/bin/yt-dlp

# Ensure that the custom bin directory is in the PATH
echo 'export PATH=$HOME/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
