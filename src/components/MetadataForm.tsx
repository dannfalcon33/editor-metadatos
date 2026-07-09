import React from 'react';
import { Tag, Calendar, Disc, User, HelpCircle, FileText, Music, Hash } from 'lucide-react';

interface MetadataFormProps {
  tags: {
    title: string;
    artist: string;
    album: string;
    year: string;
    genre: string;
    track: string;
    comment: string;
    lyrics: string;
  };
  onChange: (field: string, value: string) => void;
}

const COMMON_GENRES = [
  'Pop',
  'Rock',
  'Hip-Hop',
  'Reggaeton',
  'Trap',
  'Rap',
  'Electronic',
  'House',
  'Techno',
  'Jazz',
  'Classical',
  'Metal',
  'Reggae',
  'Blues',
  'Acoustic',
  'K-Pop',
  'Lo-Fi',
  'Soundtrack',
  'Latino',
  'Otro'
];

export default function MetadataForm({ tags, onChange }: MetadataFormProps) {
  const handleGenreSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val !== 'custom') {
      onChange('genre', val);
    }
  };

  const isCustomGenre = !COMMON_GENRES.includes(tags.genre) && tags.genre !== '';

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.37)] flex flex-col gap-5 hover:border-blue-500/10 transition-all duration-300">
      <h3 className="text-sm font-semibold text-gray-100 flex items-center gap-2 border-b border-white/10 pb-3">
        <Tag className="w-4 h-4 text-blue-400" />
        Etiquetas de Información ID3
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-blue-400" />
            Título de la Canción
          </label>
          <input
            type="text"
            value={tags.title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="Ej. De Música Ligera"
            className="w-full bg-slate-950/60 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 outline-none placeholder:text-gray-600 transition-all"
          />
        </div>

        {/* Artist input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-400" />
            Artista / Banda
          </label>
          <input
            type="text"
            value={tags.artist}
            onChange={(e) => onChange('artist', e.target.value)}
            placeholder="Ej. Soda Stereo"
            className="w-full bg-slate-950/60 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 outline-none placeholder:text-gray-600 transition-all"
          />
        </div>

        {/* Album input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
            <Disc className="w-3.5 h-3.5 text-blue-400" />
            Álbum
          </label>
          <input
            type="text"
            value={tags.album}
            onChange={(e) => onChange('album', e.target.value)}
            placeholder="Ej. Canción Animal"
            className="w-full bg-slate-950/60 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 outline-none placeholder:text-gray-600 transition-all"
          />
        </div>

        {/* Year input */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Año
            </label>
            <input
              type="text"
              maxLength={4}
              value={tags.year}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                onChange('year', val);
              }}
              placeholder="Ej. 1990"
              className="w-full bg-slate-950/60 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 outline-none placeholder:text-gray-600 transition-all text-center"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-blue-400" />
              Pista
            </label>
            <input
              type="text"
              value={tags.track}
              onChange={(e) => onChange('track', e.target.value)}
              placeholder="Ej. 1 o 1/12"
              className="w-full bg-slate-950/60 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 outline-none placeholder:text-gray-600 transition-all text-center"
            />
          </div>
        </div>

        {/* Genre selection & custom */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-blue-400" />
            Género Musical
          </label>
          <div className="flex gap-2">
            <select
              value={isCustomGenre ? 'custom' : tags.genre}
              onChange={handleGenreSelect}
              className="bg-slate-950/60 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 outline-none transition-all flex-1 cursor-pointer"
            >
              <option value="">-- Sin Género --</option>
              {COMMON_GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
              <option value="custom">Otro (Personalizado)</option>
            </select>

            {(isCustomGenre || tags.genre === 'custom') && (
              <input
                type="text"
                value={isCustomGenre ? tags.genre : ''}
                onChange={(e) => onChange('genre', e.target.value)}
                placeholder="Escribe el género..."
                className="bg-slate-950/60 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 outline-none placeholder:text-gray-600 transition-all w-1/2"
              />
            )}
          </div>
        </div>

        {/* Comments field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            Comentarios
          </label>
          <input
            type="text"
            value={tags.comment}
            onChange={(e) => onChange('comment', e.target.value)}
            placeholder="Ej. Editado con Editor de Metadatos MP3"
            className="w-full bg-slate-950/60 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 outline-none placeholder:text-gray-600 transition-all"
          />
        </div>
      </div>

      {/* Lyrics multiline textarea */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-blue-400" />
          Letras de la Canción (Sincronizadas o Simples)
        </label>
        <textarea
          rows={5}
          value={tags.lyrics}
          onChange={(e) => onChange('lyrics', e.target.value)}
          placeholder="Escribe o pega aquí la letra de la canción para guardarla en el archivo MP3..."
          className="w-full bg-slate-950/60 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 outline-none placeholder:text-gray-600 transition-all resize-none font-sans leading-relaxed"
        />
      </div>
    </div>
  );
}
