// theme registry: light + dark are always on, the rest are "extra" themes
// set VITE_ENABLE_EXTRA_THEMES=false in front/.env to turn the extras off
// (colors live in css/theme.css; index.html reads the same env var before paint)

export const BASE_THEMES = ['light', 'dark'] as const
export const EXTRA_THEMES = ['linen', 'fjord', 'matte', 'charcoal', 'paper'] as const

export type Theme = (typeof BASE_THEMES)[number] | (typeof EXTRA_THEMES)[number]

export const THEME_LABELS: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
  linen: 'Linen',
  fjord: 'Fjord',
  matte: 'Matte',
  charcoal: 'Charcoal',
  paper: 'Paper',
}

export const EXTRA_THEMES_ENABLED = import.meta.env.VITE_ENABLE_EXTRA_THEMES !== 'false'

export const THEMES: readonly Theme[] = EXTRA_THEMES_ENABLED
  ? [...BASE_THEMES, ...EXTRA_THEMES]
  : BASE_THEMES

export const isTheme = (value: unknown): value is Theme =>
  THEMES.includes(value as Theme)
