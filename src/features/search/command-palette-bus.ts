/**
 * Tiny event bus so any screen can open the global search without threading a
 * handler through the tree. The palette itself subscribes once, in the shell.
 */

type Listener = () => void

const listeners = new Set<Listener>()

export function openCommandPalette() {
  listeners.forEach((listener) => listener())
}

export function onOpenCommandPalette(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
