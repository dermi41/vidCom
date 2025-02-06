import { useState, useCallback } from 'react';
import { Download, Camera, Video } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { UrlInput } from './components/UrlInput';
import { VideoList } from './components/VideoList';
import { VideoEntry, ProcessingStatus } from './types';
import { extractYouTubeId, getThumbnailUrl } from './utils';

export default function App() {
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>({ status: 'idle' });

  const handleAddVideo = useCallback((url: string) => {
    const videoId = extractYouTubeId(url);
    if (!videoId) return;

    setVideos(prev => {
      if (prev.some(v => v.id === videoId)) {
        toast.error('This video has already been added');
        return prev;
      }

      if (prev.length >= 5) {
        toast.error('Maximum 5 videos allowed');
        return prev;
      }

      return [...prev, {
        url,
        id: videoId,
        thumbnail: getThumbnailUrl(videoId)
      }];
    });
  }, []);

  const handleRemoveVideo = useCallback((id: string) => {
    setVideos(prev => prev.filter(video => video.id !== id));
  }, []);

  const handleCombineVideos = useCallback(async () => {
    if (videos.length < 2) {
      toast.error('Please add at least 2 videos to combine');
      return;
    }

    if (videos.length > 5) {
      toast.error('Maximum 5 videos allowed');
      return;
    }

    setStatus({ status: 'processing' });
    const toastId = toast.loading('Processing videos... This may take a few minutes');

    try {
      const response = await fetch('/api/combine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videos }),
      });

      if (!response.ok) {
        throw new Error('Failed to combine videos');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'combined_video.mp4';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Videos combined successfully!', { id: toastId });
    } catch (error) {
      console.error('Error combining videos:', error);
      toast.error('Failed to combine videos', { id: toastId });
    } finally {
      setStatus({ status: 'idle' });
    }
  }, [videos]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 glass-panel p-8">
          <div className="flex justify-center mb-4">
            <Video size={48} className="text-blue-400 float-animation" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 inline-block text-transparent bg-clip-text">
            YouTube Video Combiner
          </h1>
          <p className="text-white/70">
            Combine multiple YouTube videos into a single video file
          </p>
          <div className="mt-4 text-sm text-white/50">
            <p>Maximum 5 videos, 10 minutes each</p>
          </div>
        </div>

        <UrlInput onAdd={handleAddVideo} />
        <VideoList videos={videos} onRemove={handleRemoveVideo} />

        {videos.length >= 2 && (
          <div className="mt-8 text-center">
            <button
              onClick={handleCombineVideos}
              disabled={status.status === 'processing'}
              className="btn btn-primary flex items-center gap-2 mx-auto"
            >
              <Download size={20} />
              {status.status === 'processing' ? 'Processing...' : 'Combine & Download'}
            </button>
          </div>
        )}

        {/* Hier wird das iFrame für Vidmix eingebunden */}
        <div className="flex-grow relative mt-4">
        <iframe
          src="https://vidmix.app"
          className="absolute inset-0 w-full h-full rounded-lg border border-gray-700 shadow-lg"
		  allow="clipboard-write; fullscreen; download"
        ></iframe>
		</div>

      </div>
      <Toaster position="bottom-center" />
    </div>
  );
}
