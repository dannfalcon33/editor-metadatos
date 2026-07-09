# StudioID3 - Editor de Metadatos MP3 y Carátulas Local

Una aplicación web interactiva y de alto rendimiento construida con **React, Vite, TypeScript, Framer Motion y Tailwind CSS** diseñada para editar metadatos de archivos de audio MP3 (etiquetas ID3v2.3) de forma **100% local, rápida y segura** directamente en el navegador web del usuario.

## 🚀 ¿Cómo funciona el programa internamente?

Toda la lógica de procesamiento de archivos, lectura y escritura de metadatos se ejecuta en el lado del cliente (en la CPU del propio navegador), lo que garantiza que tus archivos nunca viajen por internet ni se almacenen en servidores externos.

### 1. Sistema de Parseo y Escritura ID3v2.3 (`/src/utils/id3.ts`)
* **Estructura del Archivo MP3:** Las etiquetas de metadatos de música se suelen almacenar al principio del archivo en formato **ID3v2**.
* **Lectura Binaria:** El programa lee el archivo cargado como un buffer binario (`ArrayBuffer`). Analiza la cabecera del tag ID3v2 (`ID3` al inicio del archivo), extrae el tamaño total de la cabecera y recorre secuencialmente los "frames" (marcos binarios).
* **Marcos Soportados (Frames):**
  * `TIT2`: Título de la pista.
  * `TPE1`: Artista o intérprete.
  * `TALB`: Álbum de música.
  * `TYER`: Año de lanzamiento.
  * `TRCK`: Número de pista.
  * `TCON`: Género musical.
  * `COMM`: Comentarios del usuario.
  * `USLT`: Letra de canción sin sincronizar (Lyrics).
  * `APIC`: Carátula o portada adjunta (Attached Picture). Lee el tipo MIME (generalmente `image/jpeg` o `image/png`) y los bytes crudos para renderizarlos en la interfaz como un Object URL de manera inmediata.
* **Escritura Determinista:** Cuando el usuario hace clic en "Guardar y Descargar", el editor calcula la nueva cabecera binaria ID3v2, reconstruye cada uno de los marcos con los nuevos textos codificados en UTF-8 o ISO-8859-1, incluye los bytes binarios de la imagen de portada y ensambla todo el bloque junto con los datos de audio originales (`MPEG audio frames`) para descargar un archivo `.mp3` válido al instante.

### 2. Sintetizador de Audio Offline de Prueba (`/src/utils/sample.ts`)
Si el usuario no tiene un archivo MP3 listo para probar, la plataforma incluye un botón de demostración interactiva que aprovecha la **Web Audio API** del navegador:
* **Generación en Tiempo Real:** En lugar de cargar un archivo de audio pesado a través de internet, el sistema sintetiza programáticamente una pista instrumental chill-out de 30 segundos en formato de forma de onda senoidal de bajo peso y alta fidelidad y la procesa localmente en un buffer de audio.
* **Integración con el Reproductor:** El reproductor interactivo lee este flujo y simula la visualización de frecuencias y osciloscopio en tiempo real.

### 3. Visualizador y Reproductor Integrado (`/src/components/AudioPlayer.tsx`)
* **Controles Interactivos:** Cuenta con controles de reproducción completos (reproducir, pausar, control de volumen con rango deslizante, barra de progreso interactiva con salto de tiempo).
* **Gestión de URLs Temporales:** Utiliza `URL.createObjectURL` para enlazar el archivo binario recién modificado temporalmente en memoria, permitiendo reproducir exactamente lo que se va a descargar de forma instantánea.

### 4. Edición de Portadas y Arrastre de Archivos (`/src/components/CoverEditor.tsx`)
* **Drag-and-Drop Avanzado:** Los usuarios pueden arrastrar y soltar archivos de audio o imágenes JPEG/PNG para actualizar la portada del álbum sobre la marcha.
* **Corte y Escalado:** El componente maneja previsualizaciones fluidas de imágenes grandes optimizando los buffers binarios para que el peso del archivo MP3 no sea excesivo.

---

## 🛠️ Tecnologías Utilizadas

* **React 18 & Vite:** Entorno de desarrollo ultrarrápido sin sobrecarga de empaquetado.
* **TypeScript:** Garantía de tipado fuerte, especialmente crítico para la manipulación y offsets de buffers binarios (`Uint8Array`, `DataView`).
* **Tailwind CSS:** Diseño moderno inspirado en interfaces de audio premium (temas oscuros oscilantes, espaciados generosos, bordes sutiles y tipografía con contraste optimizado).
* **Framer Motion:** Animaciones de entrada escalonadas (`staggered fade-ins`) y efectos pulsantes aleatorios en los orbes de fondo del landing page y el editor.
* **Lucide React:** Set de iconos limpios y consistentes.

---

## 🔒 Privacidad y Rendimiento

Este software se rige bajo la filosofía de **Cero Servidor, Cero Base de Datos**. La carga de archivos, manipulación de carátulas pesadas de hasta 10MB y la compilación ID3 se ejecutan localmente en el hilo del navegador. Esto significa:
1. **Seguridad Absoluta:** Tus canciones personales e imágenes privadas nunca se filtrarán en internet.
2. **Funcionamiento Offline:** Si descargas la aplicación, funcionará perfectamente sin conexión a internet.
3. **Cero Latencia:** El guardado se procesa en milisegundos en lugar de requerir lentas subidas y descargas de red.
