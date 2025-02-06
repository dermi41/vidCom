export const extractYouTubeId = (url: string): string | null => {
  // Support standard YouTube URLs, Shorts, and youtu.be links
  const patterns = [
    // Standard watch URLs and embeds
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/,
    // Shorts URLs
    /^.*youtube.com\/shorts\/([^#&?]*).*/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[2] ? match[2].length === 11 : match && match[1] && match[1].length === 11) {
      return match[2] || match[1];
    }
  }

  return null;
};

export const validateYouTubeUrl = (url: string): boolean => {
  return !!extractYouTubeId(url);
};

export const getThumbnailUrl = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};