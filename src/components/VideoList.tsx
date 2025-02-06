import React from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import type { VideoEntry } from '../types';

interface VideoListProps {
  videos: VideoEntry[];
  onRemove: (id: string) => void;
}

export const VideoList: React.FC<VideoListProps> = ({ videos, onRemove }) => {
  if (videos.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <h2 className="text-lg font-semibold mb-4">Added Videos</h2>
      <div className="space-y-4">
        {videos.map((video) => (
          <div
            key={video.id}
            className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm"
          >
            <GripVertical className="text-gray-400 cursor-move" size={20} />

            <div className="flex-shrink-0">
              <img
                src={video.thumbnail}
                alt={video.title || 'Video thumbnail'}
                className="w-24 h-16 object-cover rounded"
              />
            </div>

            <div className="flex-grow min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {video.title || video.url}
              </p>
              <p className="text-xs text-gray-500 truncate">{video.url}</p>
            </div>

            <button
              onClick={() => onRemove(video.id)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Remove video"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};