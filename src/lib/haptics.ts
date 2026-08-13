type HapticPattern = 'light' | 'medium' | 'success' | 'warning'

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 8,
  medium: 14,
  success: [10, 40, 18],
  warning: [18, 60, 18],
}

/**
 * Fires a device vibration where supported. Visual press feedback is handled
 * separately by the components themselves, so this is purely additive.
 */
export function haptic(pattern: HapticPattern = 'light') {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return
  try {
    navigator.vibrate(PATTERNS[pattern])
  } catch {
    /* Unsupported or blocked by the platform — ignore. */
  }
}
