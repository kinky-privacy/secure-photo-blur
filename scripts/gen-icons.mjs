// Generate minimal PNG icons using only Node.js built-ins
import { createWriteStream } from 'fs'
import { deflateSync } from 'zlib'

function writePNG(path, width, height, drawFn) {
  const channels = 4 // RGBA
  const raw = new Uint8Array(width * height * channels)

  // Fill with #1a1a1a (dark bg)
  for (let i = 0; i < raw.length; i += 4) {
    raw[i] = 0x1a; raw[i+1] = 0x1a; raw[i+2] = 0x1a; raw[i+3] = 0xff
  }

  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || y < 0 || x >= width || y >= height) return
    const i = (y * width + x) * 4
    raw[i] = r; raw[i+1] = g; raw[i+2] = b; raw[i+3] = a
  }

  function fillRect(x, y, w, h, r, g, b, a = 255) {
    for (let py = y; py < y + h; py++)
      for (let px = x; px < x + w; px++)
        setPixel(px, py, r, g, b, a)
  }

  function fillCircle(cx, cy, radius, r, g, b, a = 255) {
    for (let py = cy - radius; py <= cy + radius; py++)
      for (let px = cx - radius; px <= cx + radius; px++)
        if ((px - cx) ** 2 + (py - cy) ** 2 <= radius ** 2)
          setPixel(px, py, r, g, b, a)
  }

  function strokeEllipse(cx, cy, rx, ry, thickness, r, g, b, a = 255) {
    for (let angle = 0; angle < Math.PI * 2; angle += 0.005) {
      const ex = Math.round(cx + rx * Math.cos(angle))
      const ey = Math.round(cy + ry * Math.sin(angle))
      for (let ty = -thickness; ty <= thickness; ty++)
        for (let tx = -thickness; tx <= thickness; tx++)
          setPixel(ex + tx, ey + ty, r, g, b, a)
    }
  }

  drawFn({ setPixel, fillRect, fillCircle, strokeEllipse, width, height })

  // Build PNG filter bytes (filter type 0 = None, prepend 0x00 per row)
  const rowSize = width * channels
  const filtered = new Uint8Array((rowSize + 1) * height)
  for (let y = 0; y < height; y++) {
    filtered[y * (rowSize + 1)] = 0
    filtered.set(raw.subarray(y * rowSize, (y + 1) * rowSize), y * (rowSize + 1) + 1)
  }

  const compressed = deflateSync(filtered)

  function crc32(buf) {
    let crc = 0xffffffff
    const table = []
    for (let i = 0; i < 256; i++) {
      let c = i
      for (let j = 0; j < 8; j++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      table[i] = c
    }
    for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8)
    return (crc ^ 0xffffffff) >>> 0
  }

  function chunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii')
    const lenBuf = Buffer.alloc(4)
    lenBuf.writeUInt32BE(data.length)
    const crcBuf = Buffer.alloc(4)
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf])
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8   // bit depth
  ihdr[9] = 6   // color type: RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  const png = Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ])

  const ws = createWriteStream(path)
  ws.write(png)
  ws.end()
  console.log(`Written ${path} (${width}x${height})`)
}

function drawIcon({ fillRect, fillCircle, strokeEllipse, width, height }) {
  const cx = width / 2, cy = height / 2
  const scale = width / 192

  // Eye outline
  strokeEllipse(cx, cy, cx * 0.78, cy * 0.55, Math.round(3 * scale), 0xf0, 0xf0, 0xf0)

  // Accent circle (iris)
  fillCircle(cx, cy, Math.round(38 * scale), 0xb2, 0x22, 0x22)

  // Inner dark (pupil)
  fillCircle(cx, cy, Math.round(16 * scale), 0x1a, 0x1a, 0x1a)

  // Mosaic bars (horizontal)
  const barH = Math.round(6 * scale)
  const barY = [
    Math.round(cy - 28 * scale),
    Math.round(cy - 10 * scale),
    Math.round(cy + 8 * scale),
    Math.round(cy + 26 * scale),
  ]
  const barX = Math.round(cx - 68 * scale)
  const barW = Math.round(136 * scale)
  for (const y of barY) {
    fillRect(barX, y, barW, barH, 0x33, 0x33, 0x33)
  }
}

writePNG('public/icons/icon-192.png', 192, 192, drawIcon)
writePNG('public/icons/icon-512.png', 512, 512, drawIcon)
