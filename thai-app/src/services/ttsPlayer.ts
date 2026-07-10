let cachedThaiVoice: SpeechSynthesisVoice | null | undefined

function findThaiVoice(): SpeechSynthesisVoice | null {
  if (cachedThaiVoice !== undefined) return cachedThaiVoice
  const voices = window.speechSynthesis?.getVoices() ?? []
  cachedThaiVoice = voices.find((v) => v.lang.toLowerCase().startsWith('th')) ?? null
  return cachedThaiVoice
}

export function isTtsSupported(): boolean {
  return typeof window !== 'undefined' && !!window.speechSynthesis
}

export function hasThaiVoice(): boolean {
  return findThaiVoice() !== null
}

/** Озвучивает тайский текст через Web Speech API. Возвращает false, если голос th-TH не найден. */
export function speakThai(text: string, rate = 0.85): boolean {
  if (!isTtsSupported()) return false
  const voice = findThaiVoice()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'th-TH'
  utter.rate = rate
  if (voice) utter.voice = voice
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utter)
  return voice !== null
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => { cachedThaiVoice = undefined }
}
