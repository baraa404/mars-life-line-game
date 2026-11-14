import tokens from './tokens.json' with { type: 'json' }

export type PaletteToken = keyof typeof tokens.palette
export type AtmosphereToken = keyof typeof tokens.atmosphere
export type MaterialRole = keyof typeof tokens.materials

export const palette = Object.fromEntries(
  Object.entries(tokens.palette).map(([k, v]) => [k, v.hex]),
) as Record<PaletteToken, string>

export const atmosphere = Object.fromEntries(
  Object.entries(tokens.atmosphere).map(([k, v]) => [k, v.hex]),
) as Record<AtmosphereToken, string>

export const materials = tokens.materials
export const lighting = tokens.lighting
export const scale = tokens.scale
export const styleVersion = tokens.version
