import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const directory = new URL('../public/icons/', import.meta.url);
await mkdir(directory, { recursive: true });
const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="#07110d"/><g fill="none" stroke="#7bffb2" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"><path d="M160 193h192m-47-47 47 47-47 47M352 319H160m47-47-47 47 47 47"/></g></svg>`);
for (const [name, size] of [['icon-192.png',192],['icon-512.png',512],['icon-maskable.png',512],['apple-touch-icon.png',180]]) {
  await sharp(svg).resize(size, size).png().toFile(fileURLToPath(new URL(name, directory)));
}
