// Обёртка над Web Speech API (SpeechRecognition) для голосового ввода фраз.
// Поддерживается в Chrome/Edge/Safari (с префиксом webkit-), отсутствует в Firefox —
// в этом случае isSpeechInputSupported() вернёт false и кнопку микрофона не показываем.

type SpeechLang = 'ru' | 'fr'

function getRecognitionCtor(): (new () => any) | null {
  const w = window as any
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function isSpeechInputSupported(): boolean {
  return typeof window !== 'undefined' && getRecognitionCtor() !== null
}

export interface SpeechInputController {
  stop: () => void
}

export type SpeechInputErrorKind = 'permission' | 'no-speech' | 'unsupported' | 'other'

export function startSpeechInput(
  lang: SpeechLang,
  onResult: (transcript: string) => void,
  onEnd: () => void,
  onError: (kind: SpeechInputErrorKind) => void,
): SpeechInputController | null {
  const Ctor = getRecognitionCtor()
  if (!Ctor) {
    onError('unsupported')
    return null
  }

  const recognition = new Ctor()
  recognition.lang = lang === 'ru' ? 'ru-RU' : 'fr-FR'
  recognition.interimResults = false
  recognition.maxAlternatives = 1

  recognition.onresult = (event: any) => {
    const transcript = event.results?.[0]?.[0]?.transcript
    if (transcript) onResult(transcript)
  }
  recognition.onerror = (event: any) => {
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') onError('permission')
    else if (event.error === 'no-speech') onError('no-speech')
    else onError('other')
  }
  recognition.onend = () => onEnd()

  try {
    recognition.start()
  } catch {
    onError('other')
    return null
  }

  return { stop: () => recognition.stop() }
}
