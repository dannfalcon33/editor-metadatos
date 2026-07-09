export function cleanFilenameForSearch(name: string): string {
  // Remove file extension
  let clean = name.replace(/\.mp3$/i, '');
  
  // Remove track numbers at start e.g. "01 - ", "01. ", "01_ ", "1. "
  clean = clean.replace(/^\d+[\s.\-_]+/, '');
  
  // Replace underscores, hyphens, plus signs with space
  clean = clean.replace(/[\-_+]+/g, ' ');
  
  // Remove common video/audio/remix descriptors
  clean = clean.replace(/\b(official video|official audio|hq|hd|lyrics|letra|remix|feat|ft|original mix|lyrics video|mp3|320kbps|video oficial|audio oficial|original version)\b/gi, '');
  
  // Remove everything inside parentheses or brackets
  clean = clean.replace(/\([^)]*\)/g, '');
  clean = clean.replace(/\[[^\]]*\]/g, '');
  
  // Clean up extra spaces
  clean = clean.trim().replace(/\s+/g, ' ');
  
  return clean;
}

export interface iTunesTrack {
  trackId: number;
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  releaseDate?: string;
  primaryGenreName?: string;
  trackNumber?: number;
  trackCount?: number;
  artworkUrl100?: string;
}

export async function searchiTunesMetadata(query: string): Promise<iTunesTrack[]> {
  if (!query.trim()) return [];
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=6`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Error al conectar con la API de iTunes para buscar metadatos.');
  }
  const data = await response.json();
  return (data.results || []) as iTunesTrack[];
}

export async function downloadArtworkBytes(url: string): Promise<{ mimeType: string; data: Uint8Array } | null> {
  try {
    // Try to request a high resolution (600x600) instead of the default 100x100 thumbnail
    const highResUrl = url.replace('100x100bb.jpg', '600x600bb.jpg');
    
    let response = await fetch(highResUrl);
    if (!response.ok) {
      response = await fetch(url); // fallback to original size if 600x600 is not found
    }
    
    if (!response.ok) return null;
    
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    return {
      mimeType: blob.type || 'image/jpeg',
      data: new Uint8Array(buffer),
    };
  } catch (error) {
    console.error('Error downloading artwork image bytes:', error);
    return null;
  }
}
