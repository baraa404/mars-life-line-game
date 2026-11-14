#!/usr/bin/env node
// Category regions are normalized to the current Mars reference layouts, so image
// generation resolution can change without misaligning crops. Output is 2x source size.
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const refs = join(root, 'docs/style/references');
const out = join(refs, 'crops');
const HERO = '01-hero-scene.png';
const BOARD = '02-style-board.png';
const SHEET = '03-asset-style-sheet.png';

// [crop name, source, left, top, width, height], each dimension in [0, 1].
export const CROPS = [
  ['characters', SHEET, 0.005, 0.105, 0.281, 0.350],
  ['vehicles', SHEET, 0.292, 0.105, 0.219, 0.350],
  ['vehicles-hero', HERO, 0.790, 0.430, 0.210, 0.200],
  ['architecture', SHEET, 0.518, 0.105, 0.477, 0.350],
  ['architecture-examples', BOARD, 0.005, 0.315, 0.990, 0.340],
  ['architecture-hero-base', HERO, 0.350, 0.035, 0.540, 0.560],
  ['architecture-hero-dome', HERO, 0.000, 0.270, 0.300, 0.510],
  ['props', SHEET, 0.480, 0.470, 0.515, 0.275],
  ['environment', SHEET, 0.005, 0.470, 0.468, 0.275],
  ['environment-board', BOARD, 0.005, 0.672, 0.482, 0.315],
  ['environment-hero-ground', HERO, 0.000, 0.600, 1.000, 0.400],
  ['lighting-atmosphere', BOARD, 0.497, 0.672, 0.498, 0.315],
  ['lighting-hero-sky', HERO, 0.000, 0.000, 1.000, 0.270],
  ['palette-materials-geometry', BOARD, 0.005, 0.095, 0.990, 0.205],
];

mkdirSync(out, { recursive: true });
for (const [name, file, x, y, w, h] of CROPS) {
  const input = join(refs, file);
  const { width: sourceWidth, height: sourceHeight } = await sharp(input).metadata();
  if (!sourceWidth || !sourceHeight) throw new Error(`Missing dimensions for ${file}`);
  const left = Math.round(x * sourceWidth);
  const top = Math.round(y * sourceHeight);
  const width = Math.min(Math.round(w * sourceWidth), sourceWidth - left);
  const height = Math.min(Math.round(h * sourceHeight), sourceHeight - top);
  await sharp(input)
    .extract({ left, top, width, height })
    .resize(width * 2, height * 2, { kernel: 'lanczos3' })
    .png()
    .toFile(join(out, `${name}.png`));
  console.log(`crops/${name}.png <- ${file} [${left},${top} ${width}x${height}]`);
}
