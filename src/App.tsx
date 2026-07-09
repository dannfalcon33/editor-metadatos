import React, { useState, useEffect } from 'react';
import { 
  Music, 
  UploadCloud, 
  Download, 
  RefreshCw, 
  FileAudio, 
  CheckCircle, 
  Info, 
  AlertCircle,
  FolderOpen,
  Sparkles,
  Layers,
  HelpCircle,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { parseID3, writeID3, ID3Tags } from './utils/id3';
import { getSampleMp3 } from './utils/sample';
import AudioPlayer from './components/AudioPlayer';
import CoverEditor from './components/CoverEditor';
import MetadataForm from './components/MetadataForm';
import LandingPage from './components/LandingPage';

export function Editor() {
  // Main File States
  const [originalFileBytes, setOriginalFileBytes] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // ID3 States
  const [tags, setTags] = useState({
    title: '',
    artist: '',
    album: '',
    year: '',
    genre: '',
    track: '',
    comment: '',
    lyrics: '',
  });

  const [coverData, setCoverData] = useState<{
    mimeType: string;
    data: Uint8Array;
    objectUrl: string;
  } | null>(null);

  // App UI States
  const [isDraggingMain, setIsDraggingMain] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(true);

  // Reset success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Clean up Object URLs when component unmounts or sources change
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (coverData?.objectUrl) URL.revokeObjectURL(coverData.objectUrl);
    };
  }, [audioUrl, coverData]);

  // Format bytes to readable string (KB, MB)
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Extract ID3 tags and initialize states
  const loadMp3Bytes = (bytes: Uint8Array, name: string) => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      
      // Parse tags
      const parsedTags = parseID3(bytes);

      // Set tags
      setTags({
        title: parsedTags.title || '',
        artist: parsedTags.artist || '',
        album: parsedTags.album || '',
        year: parsedTags.year || '',
        genre: parsedTags.genre || '',
        track: parsedTags.track || '',
        comment: parsedTags.comment || '',
        lyrics: parsedTags.lyrics || '',
      });

      // Set cover
      if (parsedTags.cover) {
        setCoverData(parsedTags.cover);
      } else {
        setCoverData(null);
      }

      setOriginalFileBytes(bytes);
      setFileName(name);
      setFileSize(formatBytes(bytes.length));

      // Build safe Audio Playback URL
      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const newAudioUrl = URL.createObjectURL(blob);
      setAudioUrl(newAudioUrl);

    } catch (err) {
      console.error(err);
      setErrorMessage('Error al parsear el archivo MP3. Asegúrate de que es un archivo de audio válido.');
    }
  };

  // Handle local file uploads
  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith('.mp3')) {
      setErrorMessage('Formato de archivo no soportado. Por favor, selecciona un archivo de audio .mp3.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const ab = e.target?.result as ArrayBuffer;
      const bytes = new Uint8Array(ab);
      loadMp3Bytes(bytes, file.name);
    };
    reader.onerror = () => {
      setErrorMessage('Error al leer el archivo del disco local.');
    };
    reader.readAsArrayBuffer(file);
  };

  // Trigger loading the silent demo MP3
  const handleLoadDemo = () => {
    const bytes = getSampleMp3();
    loadMp3Bytes(bytes, 'cancion_demo_vacia.mp3');
    setSuccessMessage('¡Archivo de prueba cargado! Modifica las etiquetas y añade una portada para probar.');
  };

  // Drag and drop event handlers
  const handleDragOverMain = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingMain(true);
  };

  const handleDragLeaveMain = () => {
    setIsDraggingMain(false);
  };

  const handleDropMain = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingMain(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Update tag value in form state
  const handleTagChange = (field: string, value: string) => {
    setTags((prev) => ({ ...prev, [field]: value }));
  };

  // Add cover image from CoverEditor
  const handleCoverChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const ab = e.target?.result as ArrayBuffer;
      const imgBytes = new Uint8Array(ab);
      
      // Clean previous object URL
      if (coverData?.objectUrl) {
        URL.revokeObjectURL(coverData.objectUrl);
      }

      setCoverData({
        mimeType: file.type,
        data: imgBytes,
        objectUrl: URL.createObjectURL(file),
      });
    };
    reader.readAsArrayBuffer(file);
  };

  // Remove cover image
  const handleCoverRemove = () => {
    if (coverData?.objectUrl) {
      URL.revokeObjectURL(coverData.objectUrl);
    }
    setCoverData(null);
  };

  // Build the modified MP3 binary and download it
  const handleSaveAndDownload = () => {
    if (!originalFileBytes) return;

    setIsSaving(true);
    setErrorMessage(null);

    // Give UI a moment to show saving state
    setTimeout(() => {
      try {
        const id3TagsToSave: ID3Tags = {
          ...tags,
          cover: coverData || undefined,
        };

        const newFileBytes = writeID3(originalFileBytes, id3TagsToSave);
        const blob = new Blob([newFileBytes], { type: 'audio/mpeg' });
        
        // Formulate a beautiful download name
        let downloadName = fileName;
        if (tags.artist && tags.title) {
          downloadName = `${tags.artist.trim()} - ${tags.title.trim()}.mp3`.replace(/[\\/:*?"<>|]/g, '');
        } else if (fileName.endsWith('.mp3')) {
          downloadName = fileName.replace('.mp3', '_editado.mp3');
        } else {
          downloadName = 'musica_editada.mp3';
        }

        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = downloadName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Revoke temporary download link
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);

        setSuccessMessage(`¡Archivo guardado con éxito! Descargado como: ${downloadName}`);
      } catch (err) {
        console.error(err);
        setErrorMessage('Ocurrió un error inesperado al intentar empaquetar y guardar los metadatos.');
      } finally {
        setIsSaving(false);
      }
    }, 400);
  };

  // Reset full state to start fresh
  const handleReset = () => {
    setOriginalFileBytes(null);
    setFileName('');
    setFileSize('');
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    if (coverData?.objectUrl) URL.revokeObjectURL(coverData.objectUrl);
    setCoverData(null);
    setTags({
      title: '',
      artist: '',
      album: '',
      year: '',
      genre: '',
      track: '',
      comment: '',
      lyrics: '',
    });
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans antialiased selection:bg-blue-500/30 selection:text-blue-200 relative overflow-x-hidden">
      {/* Three floating random blue gradient orbs/bubbles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            x: [0, 120, -80, 0],
            y: [0, -150, 100, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-10 left-[10%] w-[450px] h-[450px] bg-[radial-gradient(circle,rgba(37,99,235,0.25)_0%,rgba(99,102,241,0.05)_50%,transparent_70%)] rounded-full blur-[60px]"
        />
        <motion.div
          animate={{
            x: [0, -100, 120, 0],
            y: [0, 180, -120, 0],
            scale: [1, 0.85, 1.15, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 right-[5%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(59,130,246,0.22)_0%,rgba(168,85,247,0.04)_50%,transparent_70%)] rounded-full blur-[70px]"
        />
        <motion.div
          animate={{
            x: [0, 80, -90, 0],
            y: [0, -100, -200, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[-50px] left-[20%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(29,78,216,0.25)_0%,rgba(37,99,235,0.03)_50%,transparent_70%)] rounded-full blur-[60px]"
        />
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10 flex flex-col min-h-screen">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FileAudio className="w-5.5 h-5.5 text-white animate-pulse" />
            </div>
            <div>
              <h1 id="app-title" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Editor de Metadatos MP3
              </h1>
              <p className="text-xs text-gray-400">Modifica etiquetas ID3 y portadas de tus canciones al instante y 100% en tu navegador</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Volver a Inicio</span>
              <span className="sm:hidden">Inicio</span>
            </Link>
            {originalFileBytes && (
              <button
                onClick={handleReset}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Cargar Otro Archivo
              </button>
            )}
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                showInfo 
                  ? 'bg-blue-600/15 border-blue-500/30 text-blue-400' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'
              }`}
              title="Mostrar u ocultar ayuda"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Global Error message banner */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-4 flex items-start gap-3 text-sm shadow-md"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-300">Hubo un problema</h4>
                <p className="mt-1 text-red-400/90 leading-relaxed">{errorMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Success message banner */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl p-4 flex items-start gap-3 text-sm shadow-md"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-emerald-300">¡Acción Completada!</h4>
                <p className="mt-1 text-emerald-400/90 leading-relaxed">{successMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Welcome Info Box */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex flex-col md:flex-row md:items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-500/10">
                  <Info className="w-5 h-5" />
                </div>
                <div className="flex-1 text-sm leading-relaxed text-gray-300">
                  <h3 className="font-bold text-white mb-1.5 flex items-center gap-1.5">
                    ¿Cómo funciona este Editor?
                    <span className="text-[10px] bg-blue-600/20 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded font-normal uppercase tracking-wider">
                      Privacidad Asegurada
                    </span>
                  </h3>
                  <p className="text-gray-400 mb-3 text-xs md:text-sm">
                    Toda la decodificación y reconstrucción del archivo MP3 ocurre de forma <strong>100% local en tu navegador</strong> usando nuestro motor binario ID3v2.3 en TypeScript. Ningún audio ni portada se sube a internet, ahorrando ancho de banda y garantizando absoluta seguridad para tus archivos personales.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1 border-t border-white/5 mt-2">
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Edita título, artista, álbum, año y género.
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Incrusta comentarios y letras de canciones.
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Agrega o quita portadas JPEG/PNG de alta calidad.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {/* Landing screen with file dropzone */}
            {!originalFileBytes ? (
              <motion.div
                key="dropzone-screen"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-2xl mx-auto flex flex-col gap-5 py-4"
              >
                {/* Main Drag-And-Drop Box */}
                <div
                  onDragOver={handleDragOverMain}
                  onDragLeave={handleDragLeaveMain}
                  onDrop={handleDropMain}
                  className={`border-2 border-dashed rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center text-center transition-all duration-300 relative overflow-hidden backdrop-blur-md bg-slate-900/20 ${
                    isDraggingMain
                      ? 'border-blue-500 bg-blue-500/10 scale-[0.99] shadow-[0_0_30px_rgba(59,130,246,0.15)]'
                      : 'border-white/10 hover:border-white/20 hover:bg-slate-900/40'
                  }`}
                >
                  {/* Visual elements */}
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                      <UploadCloud className="w-10 h-10" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0D1526] animate-pulse" />
                  </div>

                  <h2 className="text-xl font-bold text-white mb-2">Carga tu canción en MP3</h2>
                  <p className="text-sm text-gray-400 max-w-md mb-6 leading-relaxed">
                    Arrastra tu archivo de audio MP3 aquí o presiona el botón para examinar tus carpetas del equipo.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm justify-center">
                    {/* Native hidden Input trigger */}
                    <label className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all cursor-pointer shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:scale-[1.02] active:scale-[0.98] text-center flex items-center justify-center gap-2">
                      <FolderOpen className="w-4 h-4" />
                      Examinar Archivo
                      <input
                        type="file"
                        accept="audio/mp3"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    <button
                      onClick={handleLoadDemo}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-semibold px-6 py-3 rounded-xl transition-all cursor-pointer hover:text-white flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      Usar Demo Vacio
                    </button>
                  </div>

                  {/* Format warning footnote */}
                  <p className="text-[10px] text-gray-500 mt-8 font-mono tracking-wider uppercase">
                    Solo compatible con formato .mp3
                  </p>
                </div>

                {/* Direct quick guide cards below uploader */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl hover:border-blue-500/10 transition-all duration-300 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-500/10">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Etiquetas en Alta Definición</h4>
                      <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">Guarda información compatible con todos los reproductores de música (reproductores de autos, celulares, PC y sistemas de audio).</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl hover:border-blue-500/10 transition-all duration-300 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-500/10">
                      <Music className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Portadas de Álbum</h4>
                      <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">Añade espectaculares carátulas para que tus MP3s se vean profesionales con diseño e imágenes personalizadas.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Core Editor Two-Column Layout */
              <motion.div
                key="editor-screen"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-12"
              >
                
                {/* Left Column: Cover, Audio preview, File Details */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  
                  {/* Cover Editor box */}
                  <CoverEditor
                    coverUrl={coverData?.objectUrl || null}
                    mimeType={coverData?.mimeType || null}
                    onCoverChange={handleCoverChange}
                    onCoverRemove={handleCoverRemove}
                  />

                  {/* Audio Preview Player */}
                  <AudioPlayer
                    audioUrl={audioUrl}
                    title={tags.title}
                    artist={tags.artist}
                    coverUrl={coverData?.objectUrl || null}
                    isDemo={fileName === 'cancion_demo_vacia.mp3'}
                  />

                  {/* File Stats detail box */}
                  <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.37)] text-xs flex flex-col gap-3 hover:border-blue-500/10 transition-all duration-300">
                    <h4 className="font-semibold text-blue-400 border-b border-white/10 pb-2 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                      Información del Archivo cargado
                    </h4>
                    <div className="flex flex-col gap-2 font-mono">
                      <div className="flex justify-between items-center py-1 border-b border-white/5">
                        <span className="text-gray-500">Nombre de Archivo:</span>
                        <span className="text-gray-300 truncate max-w-[180px] md:max-w-xs text-right" title={fileName}>
                          {fileName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-white/5">
                        <span className="text-gray-500">Tamaño de Archivo:</span>
                        <span className="text-gray-300">{fileSize}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-gray-500">Tipo de Etiquetas:</span>
                        <span className="text-blue-400 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 text-[10px]">
                          ID3v2.3 (Compilado)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Metadata Form & Download / Reset action buttons */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  
                  {/* The form containing title, artist, album, comments, lyrics... */}
                  <MetadataForm
                    tags={tags}
                    onChange={handleTagChange}
                  />

                  {/* Action Block */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.37)] hover:border-blue-500/10 transition-all duration-300">
                    <div className="flex flex-col gap-1 items-start text-center sm:text-left">
                      <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        ¿Listo para descargar tu MP3?
                      </p>
                      <p className="text-xs text-gray-400">Se aplicarán los metadatos y la portada de forma permanente.</p>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                      <button
                        onClick={handleReset}
                        className="flex-1 sm:flex-initial bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-semibold px-5 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                        disabled={isSaving}
                      >
                        Cancelar
                      </button>

                      <button
                        onClick={handleSaveAndDownload}
                        className="flex-1 sm:flex-initial bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            Guardar y Descargar MP3
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Humble Footer */}
        <footer className="border-t border-white/5 py-6 mt-12 text-center text-xs text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>Hecho con precisión y alto rendimiento en TypeScript • Sin bases de datos ni cargas a servidores externos</p>
          <p className="font-mono text-[10px] text-gray-600">ID3v2 Tag Engine v1.0.0</p>
        </footer>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/editor" element={<Editor />} />
      </Routes>
    </HashRouter>
  );
}
