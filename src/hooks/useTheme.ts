import { useSyncExternalStore } from 'react'
import { THEMES, isTheme, type Theme } from '../lib/themes'

// one shared store so the menu toggle and the settings picker stay in sync
// initial value is set in index.html before paint (no flash)
const listeners = new Set<() => void>()

const getTheme = (): Theme => {
  const current = document.documentElement.dataset.theme
  return isTheme(current) ? current : 'light'
}

const setTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem('theme', theme)
  } catch {}
  listeners.forEach((l) => l())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme)

  // cycles through every enabled theme (light -> dark -> extras -> light)
  const nextTheme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]
  const toggleTheme = () => setTheme(nextTheme)

  return { theme, setTheme, nextTheme, toggleTheme, themes: THEMES }
}

// true for themes with a dark color-scheme (dark, charcoal): used for map tiles
export const isDarkTheme = (theme: Theme) => theme === 'dark' || theme === 'charcoal'
