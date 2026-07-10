import type { Tone } from '../domain/types'

// Путь кривой на холсте 100x40 (y=0 — самый высокий тон, y=40 — самый низкий).
const TONE_PATHS: Record<Tone, string> = {
  mid: 'M4,20 L96,20',
  low: 'M4,30 C 30,33 70,34 96,34',
  falling: 'M4,6 C 40,8 70,16 96,34',
  high: 'M4,20 C 30,10 60,4 96,4',
  rising: 'M4,26 C 25,34 40,34 96,6',
}

export const TONE_COLORS: Record<Tone, string> = {
  mid: '#94a3b8',
  low: '#3b82f6',
  falling: '#ef4444',
  high: '#f59e0b',
  rising: '#22c55e',
}

interface ToneCurveProps {
  tone: Tone
  size?: number
  color?: string
  strokeWidth?: number
  className?: string
}

export function ToneCurve({ tone, size = 40, color, strokeWidth = 5, className }: ToneCurveProps) {
  const stroke = color ?? TONE_COLORS[tone]
  return (
    <svg
      viewBox="0 0 100 40"
      width={size * 2.2}
      height={size}
      className={className}
      role="img"
      aria-label={`тон: ${tone}`}
    >
      {/* базовая линия для ориентира высоты */}
      <line x1="4" y1="20" x2="96" y2="20" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />
      <path
        d={TONE_PATHS[tone]}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  )
}

interface ToneCurveOverlayProps {
  tone: Tone
  userPath?: string
  size?: number
}

/** Эталонная кривая тона с наложенной кривой, записанной пользователем (для тренажёра). */
export function ToneCurveOverlay({ tone, userPath, size = 120 }: ToneCurveOverlayProps) {
  return (
    <svg viewBox="0 0 100 40" width={size * 2.2} height={size} role="img" aria-label="сравнение кривой тона">
      <line x1="4" y1="20" x2="96" y2="20" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />
      <path d={TONE_PATHS[tone]} fill="none" stroke={TONE_COLORS[tone]} strokeWidth={6} strokeLinecap="round" strokeOpacity={0.35} />
      {userPath && (
        <path d={userPath} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeDasharray="2 3" />
      )}
    </svg>
  )
}
