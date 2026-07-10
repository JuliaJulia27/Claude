// Определение основного тона (F0) методом автокорреляции по буферу времени.
// Классический алгоритм ACF2+ (используется, в частности, в примерах Chrome Music Lab).
export function autoCorrelate(buf: Float32Array, sampleRate: number): number | null {
  const SIZE = buf.length
  let rms = 0
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i]
  rms = Math.sqrt(rms / SIZE)
  if (rms < 0.01) return null // тишина / слишком тихо

  let r1 = 0
  let r2 = SIZE - 1
  const threshold = 0.2
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buf[i]) < threshold) { r1 = i; break }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buf[SIZE - i]) < threshold) { r2 = SIZE - i; break }
  }
  const trimmed = buf.slice(r1, r2)
  const n = trimmed.length
  if (n < 2) return null

  const c = new Array(n).fill(0)
  for (let lag = 0; lag < n; lag++) {
    for (let i = 0; i < n - lag; i++) {
      c[lag] += trimmed[i] * trimmed[i + lag]
    }
  }

  let d = 0
  while (d < n - 1 && c[d] > c[d + 1]) d++
  let maxVal = -1
  let maxPos = -1
  for (let i = d; i < n; i++) {
    if (c[i] > maxVal) {
      maxVal = c[i]
      maxPos = i
    }
  }
  if (maxPos <= 0) return null

  let T0 = maxPos
  const x1 = c[T0 - 1] ?? c[T0]
  const x2 = c[T0]
  const x3 = c[T0 + 1] ?? c[T0]
  const a = (x1 + x3 - 2 * x2) / 2
  const b = (x3 - x1) / 2
  if (a) T0 = T0 - b / (2 * a)

  const freq = sampleRate / T0
  if (freq < 60 || freq > 500) return null // за пределами разумного диапазона голоса
  return freq
}

export interface PitchSample {
  t: number // секунды от начала записи
  freqHz: number | null
}

export class PitchRecorder {
  private audioCtx: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private stream: MediaStream | null = null
  private rafId: number | null = null
  private startTime = 0
  samples: PitchSample[] = []
  onSample?: (s: PitchSample) => void

  async start() {
    this.samples = []
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    this.audioCtx = new AudioContext()
    const source = this.audioCtx.createMediaStreamSource(this.stream)
    this.analyser = this.audioCtx.createAnalyser()
    this.analyser.fftSize = 2048
    source.connect(this.analyser)
    this.startTime = this.audioCtx.currentTime
    const buf = new Float32Array(this.analyser.fftSize)

    const tick = () => {
      if (!this.analyser || !this.audioCtx) return
      this.analyser.getFloatTimeDomainData(buf)
      const freq = autoCorrelate(buf, this.audioCtx.sampleRate)
      const sample: PitchSample = { t: this.audioCtx.currentTime - this.startTime, freqHz: freq }
      this.samples.push(sample)
      this.onSample?.(sample)
      this.rafId = requestAnimationFrame(tick)
    }
    this.rafId = requestAnimationFrame(tick)
  }

  stop(): PitchSample[] {
    if (this.rafId) cancelAnimationFrame(this.rafId)
    this.stream?.getTracks().forEach((t) => t.stop())
    this.audioCtx?.close()
    this.rafId = null
    this.analyser = null
    this.audioCtx = null
    this.stream = null
    return this.samples
  }
}

export function isMicSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
}
