// Онлайн-перевод произвольных фраз для фраз вне локального куррированного
// словаря — работает только при наличии подключения к интернету.
// Важно: тональная разметка и кириллическая транскрипция для таких переводов
// не проверялись вручную, поэтому ToneCurve для них не строится — только
// тайский текст и озвучка через TTS.
//
// Пробуем два независимых бесплатных провайдера без API-ключа по очереди:
// сначала MyMemory (документированно поддерживает CORS для запросов прямо со
// страницы браузера), затем неофициальный эндпоинт Google Translate как
// бонусный резерв — у него на practике часто нет CORS-заголовков для обычных
// веб-страниц (он рассчитан на серверные/расширения-контексты), поэтому из
// браузера он может систематически падать с ошибкой сети — тогда просто
// используется первый провайдер.

export type OnlineTranslateErrorKind = 'offline' | 'network' | 'quota' | 'empty'

export class OnlineTranslateError extends Error {
  kind: OnlineTranslateErrorKind
  detail?: string
  constructor(kind: OnlineTranslateErrorKind, detail?: string) {
    super(detail ?? kind)
    this.kind = kind
    this.detail = detail
  }
}

export interface OnlineTranslationResult {
  thai: string
  provider: 'google' | 'mymemory'
}

const PROVIDER_TIMEOUT_MS = 6000

/** fetch с таймаутом: медленный/зависший провайдер не должен блокировать весь пайплайн. */
function fetchWithTimeout(url: string, timeoutMs = PROVIDER_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer))
}

async function translateViaGoogle(text: string, lang: 'ru' | 'fr'): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${lang}&tl=th&dt=t&q=${encodeURIComponent(text)}`
  const res = await fetchWithTimeout(url)
  if (!res.ok) throw new Error(`google http ${res.status}`)
  const data = await res.json()
  const chunks = data?.[0]
  if (!Array.isArray(chunks)) throw new Error('google: unexpected response shape')
  const thai = chunks.map((chunk: unknown) => (Array.isArray(chunk) ? chunk[0] : '')).join('')
  if (!thai.trim()) throw new Error('google: empty translation')
  return thai
}

async function translateViaMyMemory(text: string, lang: 'ru' | 'fr'): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${lang}|th`
  const res = await fetchWithTimeout(url)
  if (!res.ok) throw new Error(`mymemory http ${res.status}`)
  const data = await res.json()
  const thai: unknown = data?.responseData?.translatedText
  if (typeof thai !== 'string' || !thai.trim()) throw new Error('mymemory: empty translation')
  if (/MYMEMORY WARNING/i.test(thai)) throw new Error('mymemory: daily quota exceeded')
  return thai
}

export async function translateOnline(text: string, lang: 'ru' | 'fr'): Promise<OnlineTranslationResult> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new OnlineTranslateError('offline')
  }

  const errors: string[] = []

  try {
    const thai = await translateViaMyMemory(text, lang)
    return { thai, provider: 'mymemory' }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    errors.push(`MyMemory: ${message}`)
    console.error('[onlineTranslate] MyMemory provider failed:', err)
  }

  try {
    const thai = await translateViaGoogle(text, lang)
    return { thai, provider: 'google' }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    errors.push(`Google: ${message}`)
    console.error('[onlineTranslate] Google provider failed:', err)
  }

  const detail = errors.join(' · ')
  const kind: OnlineTranslateErrorKind = /quota/i.test(detail) ? 'quota' : 'network'
  throw new OnlineTranslateError(kind, detail)
}
