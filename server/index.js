import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';
import { unlink, readdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Temp directory for video processing
const TEMP_DIR = '/tmp/ffmpeg';
const MAX_VIDEOS = 5; // Maximum number of videos to combine
const MAX_VIDEO_DURATION = 600; // Maximum duration per video in seconds (10 minutes)
const COOKIES_PATH = join(__dirname, '..', 'config', 'cookies.txt'); // Pfad zu den exportierten Cookies

// Helper function to get the correct path to yt-dlp and ffmpeg
function getBinaryPath(binaryName) {
  const binDir = join(__dirname, '..', 'bin'); // Pfad zu deinem bin-Ordner

  if (binaryName === 'yt-dlp') {
    return join(binDir, 'yt-dlp');
  } else if (binaryName === 'ffmpeg') {
    return join(binDir, 'ffmpeg');
  } else if (binaryName === 'ffprobe') {
    return join(binDir, 'ffprobe');
  } else {
    throw new Error('Unknown binary name');
  }
}

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '../dist')));

// Helper function to clean up temporary files
async function cleanupFiles(files) {
  for (const file of files) {
    try {
      await unlink(file);
    } catch (error) {
      console.error(`Error deleting file ${file}:`, error);
    }
  }
}

// Helper function to get video duration using ffprobe
async function getVideoDuration(filePath) {
  try {
    const ffprobePath = getBinaryPath('ffprobe'); // Use the new dynamic path function
    const { stdout } = await execAsync(
      `"${ffprobePath}" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
    );
    const duration = parseFloat(stdout);
    if (isNaN(duration)) {
      throw new Error('Invalid duration value received');
    }
    return duration;
  } catch (error) {
    console.error('Error getting video duration:', error);
    throw new Error(`Failed to get video duration: ${error.message}`);
  }
}

app.post('/api/combine', async (req, res) => {
  const { videos } = req.body;
  const tempFiles = [];
  const sessionId = randomUUID();

  try {
    if (!videos || !Array.isArray(videos) || videos.length < 2 || videos.length > MAX_VIDEOS) {
      return res.status(400).json({ error: `Please provide 2-${MAX_VIDEOS} videos to combine` });
    }

    // Create a text file for FFmpeg concat
    const concatListPath = join(TEMP_DIR, `${sessionId}_list.txt`);
    const outputPath = join(TEMP_DIR, `${sessionId}_output.mp4`);
    tempFiles.push(concatListPath, outputPath);

    let concatContent = '';

    // Download and process each video
    for (const [index, video] of videos.entries()) {
      const videoPath = join(TEMP_DIR, `${sessionId}_${index}.mp4`);
      tempFiles.push(videoPath);

      const ytDlpPath = getBinaryPath('yt-dlp'); // Use the new dynamic path function
      console.log(`Downloading video ${index + 1}/${videos.length}...`);
      await execAsync(
        `"${ytDlpPath}" -f "best[height<=720]" --cookies "${COOKIES_PATH}" -o "${videoPath}" "https://www.youtube.com/watch?v=${video.id}"`
      );

      // Check video duration
      const duration = await getVideoDuration(videoPath);
      if (duration > MAX_VIDEO_DURATION) {
        throw new Error(`Video ${index + 1} exceeds maximum duration of ${MAX_VIDEO_DURATION} seconds`);
      }

      // Add to concat list
      concatContent += `file '${videoPath}'\n`;
    }

    // Write concat list file
    await execAsync(`echo '${concatContent}' > "${concatListPath}"`);

    const ffmpegPath = getBinaryPath('ffmpeg'); // Use the new dynamic path function
    console.log('Combining videos...');
    await execAsync(
      `"${ffmpegPath}" -f concat -safe 0 -i "${concatListPath}" -vf "fps=30,format=yuv420p" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 192k -strict experimental "${outputPath}"`
    );

    // Set up headers for file download
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="combined_video.mp4"`);

    // Stream the file to the client
    res.sendFile(outputPath, async (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Clean up temporary files after sending
      await cleanupFiles(tempFiles);
    });

  } catch (error) {
    console.error('Error processing videos:', error);
    // Clean up temporary files on error
    await cleanupFiles(tempFiles);
    res.status(500).json({
      error: 'Failed to process videos',
      details: error.message
    });
  }
});

// Catch-all route to serve the frontend
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
