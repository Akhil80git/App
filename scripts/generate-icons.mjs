import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// Minimal PNG generator using uncompressed/deflated raw RGBA buffers
function createPNG(width, height, pixelFn) {
  const rowSize = width * 4;
  const rawData = Buffer.alloc(height * (rowSize + 1));

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: 6 (RGBA)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// Pixel generator for AppLocker Pro
function getPixel(x, y, w, h, isMaskable = false) {
  const nx = (x / w) * 2 - 1;
  const ny = (y / h) * 2 - 1;
  const dist = Math.sqrt(nx * nx + ny * ny);

  // Background deep slate-indigo
  let r = 15;
  let g = 23;
  let b = 42;
  let a = 255;

  // Outer gradient / glow
  if (ny > 0) {
    b += Math.floor(ny * 25);
  }

  // Draw shield / lock icon in center (safe zone within r <= 0.65)
  const scale = isMaskable ? 0.55 : 0.7;
  const sx = nx / scale;
  const sy = ny / scale;

  // Circular glow ring
  const ringDist = Math.abs(dist - (isMaskable ? 0.6 : 0.75));
  if (ringDist < 0.05) {
    const intensity = 1 - (ringDist / 0.05);
    r = Math.min(255, Math.floor(r + 16 * intensity));
    g = Math.min(255, Math.floor(g + 185 * intensity));
    b = Math.min(255, Math.floor(b + 129 * intensity));
  }

  // Shield boundary: sx in [-0.6, 0.6], sy in [-0.7, 0.7]
  const inShield = (Math.abs(sx) < 0.65) && (sy >= -0.7) && 
    (sy < 0 ? true : Math.abs(sx) < (0.65 * (1 - (sy / 0.85))));

  if (inShield) {
    // Shield fill: slate-800 to slate-900 with cyan/emerald border
    const borderDist = Math.min(
      0.65 - Math.abs(sx),
      Math.abs(sy - (-0.7)),
      0.85 - sy
    );
    if (borderDist < 0.08) {
      r = 16;
      g = 185;
      b = 129; // Emerald green
    } else {
      r = 30;
      g = 41;
      b = 59; // Dark slate

      // Lock shackle and body
      const inShackle = (Math.abs(sx) < 0.22) && (sy >= -0.35 && sy <= -0.05) &&
                        (Math.abs(sx) > 0.12 || sy >= -0.12);
      if (inShackle && sy <= -0.15) {
        r = 241; g = 245; b = 249; // Silver white
      }

      const inBody = (Math.abs(sx) <= 0.28) && (sy >= -0.12 && sy <= 0.35);
      if (inBody) {
        // Cyan-to-emerald gradient body
        r = 6;
        g = 182;
        b = 212; // Cyan
        // Keyhole
        if (Math.hypot(sx, sy - 0.08) < 0.06 || (Math.abs(sx) < 0.03 && sy >= 0.08 && sy <= 0.22)) {
          r = 15; g = 23; b = 42;
        }
      }

      // Android robot head top
      if (sy < -0.4 && sy >= -0.58 && Math.abs(sx) < 0.35) {
        r = 16; g = 185; b = 129; // Android Green
        // Eyes
        if (Math.hypot(Math.abs(sx) - 0.16, sy - (-0.48)) < 0.035) {
          r = 15; g = 23; b = 42;
        }
      }
    }
  }

  // For non-maskable icons, clip rounded squircle with alpha if outside
  if (!isMaskable && dist > 0.98) {
    a = 0;
  }

  return [r, g, b, a];
}

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Generate 192x192
console.log('Generating pwa-192x192.png...');
fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), createPNG(192, 192, (x, y, w, h) => getPixel(x, y, w, h, false)));

// Generate 512x512
console.log('Generating pwa-512x512.png...');
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), createPNG(512, 512, (x, y, w, h) => getPixel(x, y, w, h, false)));

// Generate Maskable 512x512 (with safe-zone padding)
console.log('Generating pwa-maskable-512x512.png...');
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, (x, y, w, h) => getPixel(x, y, w, h, true)));

// Generate Apple Touch Icon 180x180
console.log('Generating apple-touch-icon.png...');
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), createPNG(180, 180, (x, y, w, h) => getPixel(x, y, w, h, false)));

// Copy or create favicon
fs.copyFileSync(path.join(outDir, 'pwa-192x192.png'), path.join(outDir, 'favicon.ico'));

console.log('All icons generated successfully!');
