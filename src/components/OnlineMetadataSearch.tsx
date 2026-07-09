import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Loader2, 
  Globe, 
  Check, 
  ChevronRight, 
  Sparkles, 
  AlertCircle, 
  Disc, 
  User, 
  Calendar 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  searchiTunesMetadata, 
  downloadArtworkBytes, 
  iTunesTrack 
} from '../utils/onlineLookup';

interface OnlineMetadataSearchProps {
  initialQuery: string;
  onApplyMetadata: (metadata: {
    title: string;
    artist: string;
    album: string;
    year: string;
    genre: string;
    track: string;
    comment: string;
    cover: { mimeType: string; data: Uint8Array; objectUrl: string } | null;
  }) => void;
}

export default function OnlineMetadataSearch({ initialQuery, onApplyMetadata }: OnlineMetadataSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [results, setResults] = useState<iTunesTrack[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [appliedId, setAppliedId] = useState<number | null>(null);

  // Sync with initialQuery when file changes
  useEffect(() => {
    setQuery(initialQuery);
    setResults([]);
    setError(null);
    setAppliedId(null);
    if (initialQuery) {
      setIsOpen(true);
    }
  }, [initialQuery]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setAppliedId(null);
    try {
      const tracks = await searchiTunesMetadata(query);
      setResults(tracks);
      if (tracks.length === 0) {
        setError('No se encontraron canciones que coincidan con la búsqueda.');
      }
    } catch (err) {
      console.error(err);
      setError('No se pudieron buscar los metadatos. Verifica tu conexión a internet.');
    } finally {
      setLoading(false);
    }
  };

  // Automatically trigger search on initial load of a new file
  useEffect(() => {
    if (initialQuery && initialQuery.trim() !== '' && initialQuery !== 'cancion_demo_vacia') {
      handleSearch();
    }
  }, [initialQuery]);

  const handleSelectTrack = async (track: iTunesTrack) => {
    setDownloadingId(track.trackId);
    setError(null);
    try {
      let coverObj: { mimeType: string; data: Uint8Array; objectUrl: string } | null = null;

      if (track.artworkUrl100) {
        const artwork = await downloadArtworkBytes(track.artworkUrl100);
        if (artwork) {
          // Create an object URL from the Blob of bytes
          const blob = new Blob([artwork.data], { type: artwork.mimeType });
          const objectUrl = URL.createObjectURL(blob);
          coverObj = {
            mimeType: artwork.mimeType,
            data: artwork.data,
            objectUrl
          };
        }
      }

      // Format year from releaseDate e.g. "2013-04-19T07:00:00Z"
      let yearVal = '';
      if (track.releaseDate) {
        yearVal = new Date(track.releaseDate).getFullYear().toString();
        if (isNaN(Number(yearVal))) {
          yearVal = track.releaseDate.substring(0, 4);
        }
      }

      // Format track index e.g. "1" or "1/12"
      let trackVal = '';
      if (track.trackNumber) {
        trackVal = track.trackNumber.toString();
        if (track.trackCount) {
          trackVal += `/${track.trackCount}`;
        }
      }

      onApplyMetadata({
        title: track.trackName || '',
        artist: track.artistName || '',
        album: track.collectionName || '',
        year: yearVal,
        genre: track.primaryGenreName || '',
        track: trackVal,
        comment: 'Auto-completado con StudioID3',
        cover: coverObj
      });

      setAppliedId(track.trackId);
    } catch (err) {
      console.error(err);
      setError('Error al descargar la carátula o procesar la información del tema.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.37)] hover:border-blue-500/20 transition-all duration-300">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <h3 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          Auto-completar desde Internet
        </h3>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium cursor-pointer"
        >
          {isOpen ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por artista, canción o nombre de archivo..."
                  className="w-full bg-slate-950/60 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-200 outline-none placeholder:text-gray-600 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-semibold px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                Buscar
              </button>
            </form>

            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 flex items-start gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {results.length > 0 && (
              <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold font-mono mb-1">
                  Resultados encontrados ({results.length}):
                </p>
                {results.map((track) => {
                  const isDownloading = downloadingId === track.trackId;
                  const isApplied = appliedId === track.trackId;

                  return (
                    <div
                      key={track.trackId}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                        isApplied
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-slate-950/40 border-white/5 hover:border-blue-500/20 hover:bg-slate-950/80'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      {track.artworkUrl100 ? (
                        <img
                          src={track.artworkUrl100}
                          alt={track.collectionName}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-white/10 shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center text-gray-500">
                          <Disc className="w-5 h-5" />
                        </div>
                      )}

                      {/* Song Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate leading-snug">
                          {track.trackName || 'Sin Título'}
                        </h4>
                        <p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-blue-400 flex-shrink-0" />
                          <span className="truncate">{track.artistName || 'Artista Desconocido'}</span>
                        </p>
                        <p className="text-[10px] text-gray-500 truncate flex items-center gap-1.5 mt-0.5">
                          <Disc className="w-2.5 h-2.5 text-indigo-400 flex-shrink-0" />
                          <span className="truncate">{track.collectionName || 'Álbum Desconocido'}</span>
                          {track.releaseDate && (
                            <>
                              <span className="text-gray-700">•</span>
                              <Calendar className="w-2.5 h-2.5 text-pink-400 flex-shrink-0" />
                              <span>{new Date(track.releaseDate).getFullYear()}</span>
                            </>
                          )}
                        </p>
                      </div>

                      {/* Select/Load Button */}
                      <button
                        type="button"
                        onClick={() => handleSelectTrack(track)}
                        disabled={downloadingId !== null}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 cursor-pointer flex-shrink-0 ${
                          isApplied
                            ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                            : isDownloading
                            ? 'bg-blue-600/20 text-blue-300'
                            : 'bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200'
                        }`}
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Aplicando...
                          </>
                        ) : isApplied ? (
                          <>
                            <Check className="w-3 h-3" />
                            Aplicado
                          </>
                        ) : (
                          <>
                            Aplicar
                            <ChevronRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
