import { useEffect } from 'react'

// keys: 'ctrl+k', 'shift+n', 'escape', 'alt+arrowup' ...
// ctrl also matches cmd on mac
type Shortcuts = Record<string, (e: KeyboardEvent) => void>

const TYPING = ['INPUT', 'TEXTAREA', 'SELECT']

export function useShortcuts(shortcuts: Shortcuts) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const el = e.target as HTMLElement
      if (el.isContentEditable || TYPING.includes(el.tagName)) return

      const combo = [
        (e.ctrlKey || e.metaKey) && 'ctrl',
        e.altKey && 'alt',
        e.shiftKey && 'shift',
        e.key.toLowerCase(),
      ]
        .filter(Boolean)
        .join('+')

      const action = shortcuts[combo]
      if (action) {
        e.preventDefault()
        action(e)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shortcuts])
}
