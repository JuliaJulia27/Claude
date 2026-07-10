// Онлайн-перевод произвольных фраз через публичный API MyMemory (без ключа,
// с CORS). Используется как запасной вариант, когда фразы нет в локальном
// куррированном словаре — работает только при наличии подключения к интернету.
// Важно: тональная разметка и кириллическая транскрипция для таких переводов
// не проверялись вручную, поэтому ToneCurve для них не строится — только
// тайский текст и озвучка через TTS.

export type OnlineTranslateErrorKind = 'offline' | 'network' | 'quota' | 'empty'

export class OnlineTranslateError extends Error {
  kind: OnlineTranslateErrorKind
  constructor(kind: OnlineTranslateErrorKind) {
    super(kind)
    this.kind = kind
  }
}

export interface OnlineTranslationResult {
  thai: string
}

export async function translateOnline(text: string, lang: 'ru' | 'fr'): Promise<OnlineTranslationResult> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new OnlineTranslateError('offline')
  }

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${lang}|th`
  let res: Response
  try {
    res = await fetch(url)
  } catch {
    throw new OnlineTranslateError('network')
  }
  if (!res.ok) throw new OnlineTranslateError('network')

  const data = await res.json().catch(() => null)
  const thai: unknown = data?.responseData?.translatedText
  if (typeof thai !== 'string' || !thai.trim()) throw new OnlineTranslateError('empty')
  if (/MYMEMORY WARNING/i.test(thai)) throw new OnlineTranslateError('quota')

  return { thai }
}
