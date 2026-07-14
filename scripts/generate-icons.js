import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

// Minimal valid PNG: 1x1 pixel, solid #0f0f0f
// PNG structure: signature + IHDR + IDAT + IEND
function makeMinimalPng() {
  const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  function crc32(buf) {
    let crc = 0xffffffff
    const table = new Uint32Array(256)
    for (let i = 0; i < 256; i++) {
      let c = i
      for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      table[i] = c
    }
    for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8)
    return (crc ^ 0xffffffff) >>> 0
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length)
    const typeAndData = Buffer.concat([Buffer.from(type), data])
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(typeAndData))
    return Buffer.concat([len, typeAndData, crc])
  }

  // IHDR: 1x1, 8-bit RGB
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(1, 0)  // width
  ihdr.writeUInt32BE(1, 4)  // height
  ihdr[8] = 8               // bit depth
  ihdr[9] = 2               // color type: RGB
  // compression, filter, interlace = 0

  // IDAT: filter byte (0) + R G B for #0f0f0f
  // Deflate the raw data (non-compressed deflate block)
  const raw = Buffer.from([0, 0x0f, 0x0f, 0x0f])  // filter=None, R, G, B
  // Minimal zlib: CMF=0x78, FLG=0x01, deflate non-compressed block, adler32
  const cmf = 0x78
  const flg = 0x01
  // Non-compressed deflate block: BFINAL=1, BTYPE=00, LEN, NLEN, data
  const bLen = raw.length
  const deflateBlock = Buffer.alloc(5 + bLen)
  deflateBlock[0] = 0x01            // BFINAL=1, BTYPE=00 (no compression)
  deflateBlock.writeUInt16LE(bLen, 1)
  deflateBlock.writeUInt16LE(bLen ^ 0xffff, 3)
  raw.copy(deflateBlock, 5)

  // Adler-32 of raw
  let s1 = 1, s2 = 0
  for (const b of raw) { s1 = (s1 + b) % 65521; s2 = (s2 + s1) % 65521 }
  const adler = Buffer.alloc(4)
  adler.writeUInt32BE((s2 << 16) | s1)

  const idat = Buffer.concat([Buffer.from([cmf, flg]), deflateBlock, adler])

  return Buffer.concat([
    PNG_SIG,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const png = makeMinimalPng()
writeFileSync(join(publicDir, 'icon-192.png'), png)
writeFileSync(join(publicDir, 'icon-512.png'), png)
console.log('Created public/icon-192.png and public/icon-512.png')
