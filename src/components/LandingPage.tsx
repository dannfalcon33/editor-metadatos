import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Music, 
  FileAudio, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Download, 
  Upload, 
  HelpCircle,
  ChevronDown,
  Lock,
  Zap,
  CheckCircle2,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "¿Es realmente gratis y sin límites?",
      a: "Sí, la herramienta es 100% gratuita y puedes editar tantos archivos MP3 como desees. No hay límites de tamaño, de descargas ni de cantidad de archivos."
    },
    {
      q: "¿Mis archivos de audio o portadas se suben a algún servidor?",
      a: "Absolutamente no. Toda la decodificación, edición de etiquetas ID3v2.3 y la codificación final se realiza de manera local en tu navegador utilizando TypeScript. Tus archivos nunca salen de tu ordenador."
    },
    {
      q: "¿De dónde se descargan los metadatos y portadas automáticas?",
      a: "Utilizamos la API de iTunes para realizar búsquedas instantáneas y seguras basadas en el nombre del archivo MP3 que cargues, permitiéndote descargar metadatos precisos e imágenes de portada en alta definición directamente en tu navegador."
    },
    {
      q: "¿Qué metadatos puedo editar?",
      a: "Puedes modificar el título, artista, álbum, año, género, número de pista, añadir comentarios, incrustar letras completas y actualizar o eliminar la carátula del álbum en formatos JPEG o PNG de alta calidad."
    },
    {
      q: "¿Qué es el sintetizador de vista previa?",
      a: "Si cargas nuestro demo vacío, utilizamos la Web Audio API para sintetizar una pista de audio chill instrumental directamente en tu navegador, permitiéndote probar los controles de reproducción y volumen en tiempo real."
    }
  ];

  const features = [
    {
      icon: <Lock className="w-6 h-6 text-blue-400" />,
      title: "Privacidad Garantizada",
      desc: "Procesamiento 100% local en tu navegador. Tus archivos de música y fotos nunca viajan por internet."
    },
    {
      icon: <Globe className="w-6 h-6 text-amber-400 animate-pulse" />,
      title: "Búsqueda Inteligente en Línea",
      desc: "Busca metadatos y portadas en alta definición de forma automática basándose en el nombre de tu archivo MP3."
    },
    {
      icon: <Music className="w-6 h-6 text-pink-400" />,
      title: "Edición ID3v2.3 Completa",
      desc: "Incrusta letras de canciones, carátulas HD, comentarios, pista, género y toda la información estándar."
    },
    {
      icon: <Cpu className="w-6 h-6 text-emerald-400" />,
      title: "Vista Previa de Audio",
      desc: "Incluye un reproductor integrado para escuchar tu música modificada o probar nuestro sintetizador lofi en tiempo real."
    }
  ];

  const steps = [
    {
      num: "01",
      title: "Carga tu archivo MP3",
      desc: "Arrastra y suelta tu archivo en el área de carga o usa nuestro demo interactivo integrado.",
      icon: <Upload className="w-5 h-5 text-blue-400" />
    },
    {
      num: "02",
      title: "Modifica los Metadatos",
      desc: "Edita textos, pega la letra de la canción y añade una nueva portada arrastrando cualquier imagen.",
      icon: <Layers className="w-5 h-5 text-indigo-400" />
    },
    {
      num: "03",
      title: "Descarga al Instante",
      desc: "Haz clic en guardar y descarga tu MP3 con los nuevos metadatos perfectamente estructurados.",
      icon: <Download className="w-5 h-5 text-emerald-400" />
    }
  ];

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans antialiased relative overflow-x-hidden">
      {/* Hero Pulsating Blue Orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[900px] pointer-events-none overflow-hidden z-0 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [0.85, 1.1, 0.85],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-[1400px] h-[1400px] bg-[radial-gradient(circle,rgba(37,99,235,0.5)_0%,rgba(99,102,241,0.1)_45%,transparent_70%)] rounded-full blur-[90px]"
        />
      </div>

      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-md bg-[#060a1f]/90 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FileAudio className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <h1 className="font-sans font-bold text-lg tracking-tight text-white leading-none">StudioID3</h1>
              <span className="text-[10px] text-blue-400 font-mono tracking-wider uppercase font-semibold">Tag & Cover Editor</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#caracteristicas" className="hover:text-white transition-colors">Características</a>
            <a href="#como-funciona" className="hover:text-white transition-colors">Cómo funciona</a>
            <a href="#faq" className="hover:text-white transition-colors">Preguntas Frecuentes</a>
          </nav>

          <div>
            <button
              onClick={() => navigate('/editor')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs md:text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2"
            >
              Comenzar a Editar
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 flex flex-col items-center text-center px-4 max-w-4xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-6 uppercase tracking-wider"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          Editor de Audio 100% Local y Gratuito
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-sans font-extrabold tracking-tight text-white mb-6 leading-tight"
        >
          Modifica los metadatos de tus <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-pink-400">MP3 al instante</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-gray-300 mb-10 max-w-2xl leading-relaxed"
        >
          Incrusta carátulas en alta resolución, edita títulos, artistas, álbumes y letras completas de canciones sin subir ningún dato a internet. Privacidad total y procesamiento local.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full"
        >
          <button
            onClick={() => navigate('/editor')}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-base font-semibold px-8 py-4 rounded-2xl transition-all shadow-[0_8px_25px_rgba(59,130,246,0.35)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.5)] hover:scale-[1.03] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5"
          >
            Abrir Editor de Metadatos
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <a
            href="#como-funciona"
            className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-base font-semibold px-8 py-4 rounded-2xl transition-all hover:text-white flex items-center justify-center gap-2"
          >
            Ver cómo funciona
          </a>
        </motion.div>

        {/* Floating Quick Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="grid grid-cols-3 gap-6 md:gap-12 mt-20 border-t border-white/5 pt-10 w-full text-left"
        >
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg md:text-2xl">
              <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
              100% Seguro
            </div>
            <p className="text-xs md:text-sm text-gray-400 mt-1">Sin cargas a servidores, todo en tu navegador.</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg md:text-2xl">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
              Sin Descargas
            </div>
            <p className="text-xs md:text-sm text-gray-400 mt-1">Herramienta web directa, sin instalar software.</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg md:text-2xl">
              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
              Sin Límites
            </div>
            <p className="text-xs md:text-sm text-gray-400 mt-1">Gratuito e ilimitado para todos tus archivos.</p>
          </div>
        </motion.div>
      </section>

      {/* Features / About Section */}
      <section id="caracteristicas" className="py-24 border-y border-white/5 bg-gradient-to-b from-black via-blue-950/25 to-black relative z-10 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Características Principales</h2>
            <p className="text-3xl md:text-4xl font-sans font-extrabold text-white">Todo lo que necesitas para organizar tu música</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-slate-900/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:border-blue-500/20 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5 border border-white/10 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="py-24 border-y border-white/5 bg-[#060a1f] relative z-10 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Proceso Simple</h2>
            <p className="text-3xl md:text-4xl font-sans font-extrabold text-white">Tres sencillos pasos para actualizar tus canciones</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Visual connector line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-12 right-12 h-0.5 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-emerald-500/10 -z-10 transform -translate-y-12" />

            {steps.map((step, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-slate-900 to-slate-800 border border-white/10 flex items-center justify-center text-xl font-bold text-white mb-6 relative shadow-lg">
                  <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white font-mono text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-white/20">
                    {step.num}
                  </span>
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed max-w-xs">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-16"
          >
            <button
              onClick={() => navigate('/editor')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Probar Demo o Subir MP3
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 border-t border-white/5 bg-transparent relative z-10 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Preguntas Frecuentes</h2>
            <p className="text-3xl md:text-4xl font-sans font-extrabold text-white">Resolvemos tus dudas al instante</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left text-white font-semibold hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-6 pt-1 text-sm text-gray-400 border-t border-white/5 leading-relaxed bg-slate-900/10">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call To Action Footer Banner */}
      <section className="py-28 border-t border-white/5 relative overflow-hidden z-10 text-center px-4 bg-black">
        {/* Pulsating Blue Orb background for CTA */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0 flex items-center justify-center">
          <motion.div
            animate={{
              scale: [0.85, 1.1, 0.85],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-[1400px] h-[1400px] bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.5)_0%,rgba(99,102,241,0.1)_45%,transparent_70%)] rounded-full blur-[90px]"
          />
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto relative z-10"
        >
          <h2 className="text-3xl md:text-5xl font-sans font-extrabold text-white mb-6 tracking-tight">¿Listo para editar tus etiquetas de audio?</h2>
          <p className="text-base md:text-lg text-gray-300 mb-8 max-w-xl mx-auto">Comienza ahora mismo de forma gratuita, sin necesidad de registros, cuentas ni descargas.</p>
          <button
            onClick={() => navigate('/editor')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-base font-semibold px-8 py-4 rounded-2xl transition-all shadow-[0_8px_25px_rgba(59,130,246,0.35)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2 mx-auto"
          >
            Empezar Ahora Gratis
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 text-center text-xs text-gray-500 bg-[#060a1f] relative z-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
              <FileAudio className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white font-sans">StudioID3</span>
          </div>
          <p className="text-center sm:text-left">Hecho con precisión y alto rendimiento en TypeScript • Sin bases de datos ni cargas a servidores externos</p>
          <p className="font-mono text-[10px] text-gray-600">ID3v2 Tag Engine v1.0.0</p>
        </div>
      </footer>
    </div>
  );
}
