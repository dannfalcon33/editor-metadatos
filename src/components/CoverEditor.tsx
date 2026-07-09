import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Trash2, Upload, AlertCircle, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CoverEditorProps {
  coverUrl: string | null;
  mimeType: string | null;
  onCoverChange: (file: File) => void;
  onCoverRemove: () => void;
}

export default function CoverEditor({ coverUrl, mimeType, onCoverChange, onCoverRemove }: CoverEditorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    setError(null);

    // Validate type
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setError('Solo se permiten imágenes JPEG o PNG.');
      return;
    }

    // Validate size (keep below 4MB for optimal performance and compatibility in ID3 tags)
    if (file.size > 4 * 1024 * 1024) {
      setError('La portada es demasiado grande. Máximo 4MB recomendado.');
      return;
    }

    onCoverChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.37)] flex flex-col gap-4 hover:border-blue-500/20 transition-all duration-300">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-blue-400" />
          Portada del Álbum
        </h3>
        {coverUrl && (
          <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
            {mimeType?.split('/')[1]?.toUpperCase() || 'JPEG'}
          </span>
        )}
      </div>

      {/* Main Cover View & Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={coverUrl ? undefined : triggerFileInput}
        className={`relative aspect-square rounded-xl flex flex-col items-center justify-center border-2 border-dashed overflow-hidden transition-all duration-200 ${
          coverUrl 
            ? 'border-transparent bg-slate-950' 
            : 'cursor-pointer hover:border-blue-400/50 hover:bg-blue-500/5 bg-slate-950'
        } ${
          isDragging 
            ? 'border-blue-500 bg-blue-500/10 scale-[0.99] shadow-[0_0_15px_rgba(59,130,246,0.25)]' 
            : 'border-white/10'
        }`}
      >
        <AnimatePresence mode="wait">
          {coverUrl ? (
            <motion.div
              key="cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full group"
            >
              <img
                src={coverUrl}
                alt="Portada del álbum"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2">
                <p className="text-xs font-semibold text-white flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  Imagen Actual
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerFileInput();
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-md shadow-blue-500/10"
                  >
                    Reemplazar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCoverRemove();
                    }}
                    className="bg-red-600 hover:bg-red-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-md shadow-red-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Quitar
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="uploader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                <Upload className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-sm font-semibold text-gray-200">Arrastra una imagen aquí</p>
              <p className="text-xs text-gray-400 mt-1">o haz clic para explorar</p>
              <p className="text-[10px] text-gray-500 mt-4 font-mono">JPG, JPEG o PNG (máx. 4MB)</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/jpg, image/png"
        className="hidden"
      />

      {/* Action Buttons underneath cover preview */}
      {coverUrl && (
        <div className="flex gap-2">
          <button
            onClick={triggerFileInput}
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:border-white/20 text-xs font-medium py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            Cambiar Imagen
          </button>
          <button
            onClick={onCoverRemove}
            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-medium py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            title="Quitar portada"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Eliminar
          </button>
        </div>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 flex items-start gap-2 text-xs"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
