/**
 * Pure TypeScript ID3v2.3/ID3v2.4 parser and ID3v2.3 generator.
 * Designed for standard web browser use without Node.js dependencies.
 */

export interface ID3Tags {
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
  genre?: string;
  track?: string;
  comment?: string;
  lyrics?: string;
  cover?: {
    mimeType: string;
    data: Uint8Array;
    objectUrl: string;
  };
}

/**
 * Decodes string bytes based on the ID3v2 text encoding byte.
 */
function decodeString(bytes: Uint8Array, encoding: number): string {
  if (bytes.length === 0) return '';

  let decoder: TextDecoder;
  switch (encoding) {
    case 0: // ISO-8859-1 (Latin1)
      decoder = new TextDecoder('windows-1252'); // Covers standard Western accents
      break;
    case 1: // UTF-16 with BOM (Byte Order Mark)
      decoder = new TextDecoder('utf-16');
      break;
    case 2: // UTF-16BE without BOM
      decoder = new TextDecoder('utf-16be');
      break;
    case 3: // UTF-8
      decoder = new TextDecoder('utf-8');
      break;
    default:
      decoder = new TextDecoder('utf-8');
  }

  // Remove any trailing null characters
  return decoder.decode(bytes).replace(/\0+$/, '').trim();
}

/**
 * Parses ID3v2 tags from an MP3 file's Uint8Array.
 */
export function parseID3(data: Uint8Array): ID3Tags {
  const tags: ID3Tags = {};

  // Verify ID3 header: "ID3" (0x49, 0x44, 0x33)
  if (data.length < 10 || data[0] !== 0x49 || data[1] !== 0x44 || data[2] !== 0x33) {
    return tags;
  }

  const majorVersion = data[3]; // e.g., 3 for ID3v2.3, 4 for ID3v2.4
  const flags = data[5];

  // Read total ID3 tag size (synchsafe 32-bit integer)
  const totalTagSize = ((data[6] & 0x7F) << 21) |
                       ((data[7] & 0x7F) << 14) |
                       ((data[8] & 0x7F) << 7) |
                       (data[9] & 0x7F);

  if (totalTagSize > data.length - 10) {
    return tags; // Out of bounds tag size protection
  }

  let offset = 10;

  // Skip extended header if present
  const hasExtendedHeader = (flags & 0x40) !== 0;
  if (hasExtendedHeader && offset < data.length - 4) {
    const extHeaderSize = (data[offset] << 24) |
                          (data[offset + 1] << 16) |
                          (data[offset + 2] << 8) |
                          data[offset + 3];
    offset += 4 + extHeaderSize;
  }

  // Read frames
  while (offset < 10 + totalTagSize - 10) {
    // Read frame ID (4 characters)
    const frameIdBytes = data.slice(offset, offset + 4);
    if (frameIdBytes.length < 4) break;
    
    const frameId = new TextDecoder('ascii').decode(frameIdBytes);

    // Stop parsing if frameId is null or non-alphanumeric (indicates padding or end of tags)
    if (!/^[A-Z0-9]{4}$/.test(frameId)) {
      break;
    }

    // Read frame size (4 bytes)
    let frameSize = 0;
    if (majorVersion === 4) {
      // ID3v2.4 frame sizes are synchsafe
      frameSize = ((data[offset + 4] & 0x7F) << 21) |
                  ((data[offset + 5] & 0x7F) << 14) |
                  ((data[offset + 6] & 0x7F) << 7) |
                  (data[offset + 7] & 0x7F);
    } else {
      // ID3v2.3 frame sizes are normal 32-bit integers
      frameSize = (data[offset + 4] << 24) |
                  (data[offset + 5] << 16) |
                  (data[offset + 6] << 8) |
                  data[offset + 7];
    }

    const frameHeaderSize = 10;
    if (offset + frameHeaderSize + frameSize > data.length) {
      break;
    }

    const frameBody = data.slice(offset + frameHeaderSize, offset + frameHeaderSize + frameSize);
    offset += frameHeaderSize + frameSize;

    if (frameSize === 0) continue;

    // Decode tags based on Frame ID
    if (frameId.startsWith('T') && frameId !== 'TXXX') {
      const encoding = frameBody[0];
      const text = decodeString(frameBody.slice(1), encoding);

      switch (frameId) {
        case 'TIT2': tags.title = text; break;
        case 'TPE1': tags.artist = text; break;
        case 'TALB': tags.album = text; break;
        case 'TYER':
        case 'TDRC':
          // TYER is v2.3, TDRC is v2.4 (recording time). Clean to 4-digit year.
          tags.year = text.slice(0, 4);
          break;
        case 'TCON': tags.genre = text; break;
        case 'TRCK': tags.track = text; break;
      }
    } else if (frameId === 'COMM') {
      const encoding = frameBody[0];
      // Skip language (3 bytes)
      let nullIndex = 4;
      const isDoubleByte = (encoding === 1 || encoding === 2);

      if (isDoubleByte) {
        while (nullIndex < frameBody.length - 1 && !(frameBody[nullIndex] === 0 && frameBody[nullIndex + 1] === 0)) {
          nullIndex += 2;
        }
        nullIndex += 2;
      } else {
        while (nullIndex < frameBody.length && frameBody[nullIndex] !== 0) {
          nullIndex++;
        }
        nullIndex++;
      }

      if (nullIndex < frameBody.length) {
        tags.comment = decodeString(frameBody.slice(nullIndex), encoding);
      }
    } else if (frameId === 'USLT') {
      const encoding = frameBody[0];
      // Skip language (3 bytes)
      let nullIndex = 4;
      const isDoubleByte = (encoding === 1 || encoding === 2);

      if (isDoubleByte) {
        while (nullIndex < frameBody.length - 1 && !(frameBody[nullIndex] === 0 && frameBody[nullIndex + 1] === 0)) {
          nullIndex += 2;
        }
        nullIndex += 2;
      } else {
        while (nullIndex < frameBody.length && frameBody[nullIndex] !== 0) {
          nullIndex++;
        }
        nullIndex++;
      }

      if (nullIndex < frameBody.length) {
        tags.lyrics = decodeString(frameBody.slice(nullIndex), encoding);
      }
    } else if (frameId === 'APIC') {
      const encoding = frameBody[0];

      // Read MIME type (null-terminated ASCII)
      let mimeEnd = 1;
      while (mimeEnd < frameBody.length && frameBody[mimeEnd] !== 0) {
        mimeEnd++;
      }
      const mimeType = new TextDecoder('ascii').decode(frameBody.slice(1, mimeEnd)) || 'image/jpeg';

      // Read picture type (1 byte)
      // const pictureType = frameBody[mimeEnd + 1];

      // Read description (null-terminated string)
      let descEnd = mimeEnd + 2;
      const isDoubleByte = (encoding === 1 || encoding === 2);

      if (isDoubleByte) {
        while (descEnd < frameBody.length - 1 && !(frameBody[descEnd] === 0 && frameBody[descEnd + 1] === 0)) {
          descEnd += 2;
        }
        descEnd += 2;
      } else {
        while (descEnd < frameBody.length && frameBody[descEnd] !== 0) {
          descEnd++;
        }
        descEnd++;
      }

      const pictureData = frameBody.slice(descEnd);
      if (pictureData.length > 0) {
        const blob = new Blob([pictureData], { type: mimeType });
        const objectUrl = URL.createObjectURL(blob);
        tags.cover = {
          mimeType,
          data: pictureData,
          objectUrl
        };
      }
    }
  }

  return tags;
}

/**
 * Helper to build standard text frame bytes (UTF-8 encoded) for ID3v2.3.
 */
function buildTextFrame(frameId: string, text: string): Uint8Array {
  const encodedText = new TextEncoder().encode(text);
  const frameBody = new Uint8Array(1 + encodedText.length);
  frameBody[0] = 3; // UTF-8 encoding flag
  frameBody.set(encodedText, 1);

  const frame = new Uint8Array(10 + frameBody.length);
  
  // Frame ID (4 bytes)
  for (let i = 0; i < 4; i++) {
    frame[i] = frameId.charCodeAt(i);
  }

  // Frame size (4 bytes, standard big-endian 32-bit integer)
  const len = frameBody.length;
  frame[4] = (len >> 24) & 0xFF;
  frame[5] = (len >> 16) & 0xFF;
  frame[6] = (len >> 8) & 0xFF;
  frame[7] = len & 0xFF;

  // Flags (2 bytes, 0x00, 0x00)
  frame[8] = 0;
  frame[9] = 0;

  // Frame Body
  frame.set(frameBody, 10);

  return frame;
}

/**
 * Helper to build comment frame (COMM) bytes for ID3v2.3.
 */
function buildCommentFrame(text: string): Uint8Array {
  const encodedText = new TextEncoder().encode(text);
  const lang = new TextEncoder().encode('eng'); // Default to english lang code

  // Structure: encoding (1 byte) + language (3 bytes) + description null (1 byte) + text
  const frameBody = new Uint8Array(1 + 3 + 1 + encodedText.length);
  frameBody[0] = 3; // UTF-8
  frameBody.set(lang, 1);
  frameBody[4] = 0; // Null byte short description terminator
  frameBody.set(encodedText, 5);

  const frame = new Uint8Array(10 + frameBody.length);
  const frameId = 'COMM';
  for (let i = 0; i < 4; i++) {
    frame[i] = frameId.charCodeAt(i);
  }

  const len = frameBody.length;
  frame[4] = (len >> 24) & 0xFF;
  frame[5] = (len >> 16) & 0xFF;
  frame[6] = (len >> 8) & 0xFF;
  frame[7] = len & 0xFF;
  frame[8] = 0;
  frame[9] = 0;

  frame.set(frameBody, 10);

  return frame;
}

/**
 * Helper to build lyrics frame (USLT) bytes for ID3v2.3.
 */
function buildLyricsFrame(text: string): Uint8Array {
  const encodedText = new TextEncoder().encode(text);
  const lang = new TextEncoder().encode('eng');

  // Structure: encoding (1 byte) + language (3 bytes) + content descriptor null (1 byte) + lyrics
  const frameBody = new Uint8Array(1 + 3 + 1 + encodedText.length);
  frameBody[0] = 3; // UTF-8
  frameBody.set(lang, 1);
  frameBody[4] = 0; // Null byte content descriptor terminator
  frameBody.set(encodedText, 5);

  const frame = new Uint8Array(10 + frameBody.length);
  const frameId = 'USLT';
  for (let i = 0; i < 4; i++) {
    frame[i] = frameId.charCodeAt(i);
  }

  const len = frameBody.length;
  frame[4] = (len >> 24) & 0xFF;
  frame[5] = (len >> 16) & 0xFF;
  frame[6] = (len >> 8) & 0xFF;
  frame[7] = len & 0xFF;
  frame[8] = 0;
  frame[9] = 0;

  frame.set(frameBody, 10);

  return frame;
}

/**
 * Helper to build picture frame (APIC) bytes for ID3v2.3.
 */
function buildApicFrame(mimeType: string, imgData: Uint8Array): Uint8Array {
  const mimeBytes = new TextEncoder().encode(mimeType);

  // Structure:
  // - encoding: 1 byte (0 = ISO-8859-1 for mime/description)
  // - mimeType: ASCII string + null terminator (1 byte)
  // - pictureType: 1 byte (3 = Front Cover)
  // - description: null terminator (1 byte for empty description)
  // - pictureData: binary content
  const frameBody = new Uint8Array(1 + mimeBytes.length + 1 + 1 + 1 + imgData.length);
  frameBody[0] = 0; // ISO-8859-1
  frameBody.set(mimeBytes, 1);
  frameBody[1 + mimeBytes.length] = 0; // Null-terminator for mime
  frameBody[1 + mimeBytes.length + 1] = 3; // Cover front
  frameBody[1 + mimeBytes.length + 2] = 0; // Null-terminator for description
  frameBody.set(imgData, 1 + mimeBytes.length + 3);

  const frame = new Uint8Array(10 + frameBody.length);
  const frameId = 'APIC';
  for (let i = 0; i < 4; i++) {
    frame[i] = frameId.charCodeAt(i);
  }

  const len = frameBody.length;
  frame[4] = (len >> 24) & 0xFF;
  frame[5] = (len >> 16) & 0xFF;
  frame[6] = (len >> 8) & 0xFF;
  frame[7] = len & 0xFF;
  frame[8] = 0;
  frame[9] = 0;

  frame.set(frameBody, 10);

  return frame;
}

/**
 * Encodes tag size to standard 4-byte synchsafe format (7-bits per byte).
 */
function encodeSynchsafe(value: number): Uint8Array {
  const bytes = new Uint8Array(4);
  bytes[0] = (value >> 21) & 0x7F;
  bytes[1] = (value >> 14) & 0x7F;
  bytes[2] = (value >> 7) & 0x7F;
  bytes[3] = value & 0x7F;
  return bytes;
}

/**
 * Embeds ID3v2.3 tags into a raw MP3. Strips existing ID3v2 tags first.
 */
export function writeID3(originalData: Uint8Array, tags: ID3Tags): Uint8Array {
  // 1. Strip existing ID3v2 tag if present
  let rawAudio = originalData;
  if (originalData.length >= 10 && originalData[0] === 0x49 && originalData[1] === 0x44 && originalData[2] === 0x33) {
    const size = ((originalData[6] & 0x7F) << 21) |
                 ((originalData[7] & 0x7F) << 14) |
                 ((originalData[8] & 0x7F) << 7) |
                 (originalData[9] & 0x7F);
    const rawAudioStart = 10 + size;
    if (rawAudioStart < originalData.length) {
      rawAudio = originalData.slice(rawAudioStart);
    }
  }

  // 2. Assemble frames
  const frames: Uint8Array[] = [];

  if (tags.title) frames.push(buildTextFrame('TIT2', tags.title));
  if (tags.artist) frames.push(buildTextFrame('TPE1', tags.artist));
  if (tags.album) frames.push(buildTextFrame('TALB', tags.album));
  if (tags.year) frames.push(buildTextFrame('TYER', tags.year));
  if (tags.genre) frames.push(buildTextFrame('TCON', tags.genre));
  if (tags.track) frames.push(buildTextFrame('TRCK', tags.track));
  if (tags.comment) frames.push(buildCommentFrame(tags.comment));
  if (tags.lyrics) frames.push(buildLyricsFrame(tags.lyrics));
  
  if (tags.cover && tags.cover.data && tags.cover.data.length > 0) {
    frames.push(buildApicFrame(tags.cover.mimeType, tags.cover.data));
  }

  // 3. Compute total frames size
  let totalFramesSize = 0;
  for (const f of frames) {
    totalFramesSize += f.length;
  }

  // 4. Create ID3v2 header (10 bytes)
  const header = new Uint8Array(10);
  header[0] = 0x49; // 'I'
  header[1] = 0x44; // 'D'
  header[2] = 0x33; // '3'
  header[3] = 3;    // ID3v2.3
  header[4] = 0;    // Revision 0
  header[5] = 0;    // Flags

  const sizeBytes = encodeSynchsafe(totalFramesSize);
  header[6] = sizeBytes[0];
  header[7] = sizeBytes[1];
  header[8] = sizeBytes[2];
  header[9] = sizeBytes[3];

  // 5. Combine header, frames, and audio
  const result = new Uint8Array(10 + totalFramesSize + rawAudio.length);
  result.set(header, 0);

  let offset = 10;
  for (const f of frames) {
    result.set(f, offset);
    offset += f.length;
  }

  result.set(rawAudio, offset);

  return result;
}
