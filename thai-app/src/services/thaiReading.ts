// Автоматическое чтение произвольного тайского текста: слоговая сегментация +
// определение тона по стандартным правилам тайской орфографии (класс
// согласной + долгота гласной + тип конечного звука + тоновый знак) +
// кириллическая транскрипция.
//
// В отличие от куррированного словаря (src/data/phrases.ts), где каждая
// запись сверена вручную, этот движок работает по правилам без словаря и
// может ошибаться на редких/нерегулярных словах (в основном заимствования
// из санскрита/пали со скрытыми гласными, например สวัสดี, ตำรวจ). Для
// типичных современных слов и фраз (в т.ч. результатов онлайн-перевода) он
// даёт корректный тон.

import type { Tone, Syllable } from '../domain/types'

type ConsClass = 'high' | 'mid' | 'low'

const HIGH_CONS = 'ขฃฉฐถผฝศษสห'
const MID_CONS = 'กจฎฏดตบปอ'
const LOW_CONS = 'คฅฆงชซฌญฑฒณทธนพฟภมยรลวฬฮ'
// Согласные, которые могут идти после "немой" ห/อ (ห-นำ), становясь высоким классом.
const NAM_TARGETS = new Set('งญนมยรลว'.split(''))

function consonantClass(c: string): ConsClass | null {
  if (HIGH_CONS.includes(c)) return 'high'
  if (MID_CONS.includes(c)) return 'mid'
  if (LOW_CONS.includes(c)) return 'low'
  return null
}

// Финали-сонанты дают "живой" слог; всё, что не сонант, — "мёртвый" (стоп).
const SONORANT_FINALS = new Set('งนณญรลฬมยว'.split(''))

const INITIAL_CYR: Record<string, string> = {
  ก: 'к', ข: 'кх', ฃ: 'кх', ค: 'кх', ฅ: 'кх', ฆ: 'кх',
  ง: 'нг',
  จ: 'ч', ฉ: 'чх', ช: 'ч', ซ: 'с', ฌ: 'ч',
  ญ: 'й',
  ฎ: 'д', ฏ: 'т', ฐ: 'тх', ฑ: 'тх', ฒ: 'тх',
  ณ: 'н',
  ด: 'д', ต: 'т', ถ: 'тх', ท: 'тх', ธ: 'тх',
  น: 'н',
  บ: 'б', ป: 'п', ผ: 'пх', ฝ: 'ф', พ: 'пх', ฟ: 'ф', ภ: 'пх',
  ม: 'м',
  ย: 'й',
  ร: 'р',
  ล: 'л', ฬ: 'л',
  ว: 'в',
  ศ: 'с', ษ: 'с', ส: 'с',
  ห: 'х', ฮ: 'х',
  อ: '',
}

const FINAL_CYR: Record<string, string> = {
  ก: 'к', ข: 'к', ค: 'к', ฆ: 'к',
  ง: 'нг',
  จ: 'т', ช: 'т', ซ: 'т', ฌ: 'т', ฎ: 'т', ฏ: 'т', ฐ: 'т', ฑ: 'т', ฒ: 'т',
  ด: 'т', ต: 'т', ถ: 'т', ท: 'т', ธ: 'т', ศ: 'т', ษ: 'т', ส: 'т',
  ณ: 'н', น: 'н', ร: 'н', ล: 'н', ฬ: 'н',
  บ: 'п', ป: 'п', พ: 'п', ฟ: 'п', ภ: 'п',
  ม: 'м',
  ย: 'й',
  ว: 'у',
}

const LEADING_VOWELS = new Set(['เ', 'แ', 'โ', 'ใ', 'ไ'])
const TONE_MARKS = new Set(['่', '้', '๊', '๋'])
const ABOVE_VOWEL_SIGNS = new Set(['ั', 'ิ', 'ี', 'ึ', 'ื', '็'])
const BELOW_VOWEL_SIGNS = new Set(['ุ', 'ู'])
const FOLLOWING_VOWEL_CHARS = new Set(['ะ', 'า', 'ำ', 'อ', 'ๅ'])
const isConsonant = (c: string) => consonantClass(c) !== null

function classify(c: string): ConsClass {
  return consonantClass(c) ?? 'mid'
}

function resolveTone(cls: ConsClass, mark: string | null, isLive: boolean, isLong: boolean): Tone {
  if (mark === '๊') return 'high'
  if (mark === '๋') return 'rising'
  if (mark === '้') return cls === 'low' ? 'high' : 'falling'
  if (mark === '่') return cls === 'low' ? 'falling' : 'low'
  if (isLive) return cls === 'high' ? 'rising' : 'mid'
  if (cls === 'low') return isLong ? 'falling' : 'high'
  return 'low'
}

interface VowelInfo {
  cyr: string
  isLong: boolean
  forceLive?: boolean
  consumed: number // сколько доп. символов (следующих за уже учтёнными above/below) занял "хвост" гласной (алоне, ีย, ือ и т.п.)
}

/** Определяет "хвостовую" часть гласной (следующую за above/below знаком, если он есть). */
function resolveVowelTail(leading: string | null, above: string | null, chars: string[], i: number): VowelInfo {
  const c1 = chars[i]
  const c2 = chars[i + 1]

  // เ-ีย / -ีย (долгая "ия")
  if (above === 'ี' && c1 === 'ย') {
    if (c2 === 'ะ') return { cyr: 'ия', isLong: false, consumed: 2 }
    return { cyr: 'ия', isLong: true, consumed: 1 }
  }
  // เ-ือ / -ือ (долгая "ыа")
  if (above === 'ื' && c1 === 'อ') {
    if (c2 === 'ะ') return { cyr: 'ыа', isLong: false, consumed: 2 }
    return { cyr: 'ыа', isLong: true, consumed: 1 }
  }
  // เ-า (дифтонг "ао")
  if (leading === 'เ' && c1 === 'า') return { cyr: 'ао', isLong: true, forceLive: true, consumed: 1 }
  // เ-อ / เ-อะ
  if (leading === 'เ' && c1 === 'อ') {
    if (c2 === 'ะ') return { cyr: 'ё', isLong: false, consumed: 2 }
    return { cyr: 'ёо', isLong: true, consumed: 1 }
  }
  // เ-าะ
  if (leading === 'เ' && c1 === 'า' && c2 === 'ะ') return { cyr: 'о', isLong: false, consumed: 2 }
  // เ-ะ / แ-ะ / โ-ะ
  if (leading && c1 === 'ะ') {
    const cyr = leading === 'เ' ? 'е' : leading === 'แ' ? 'э' : 'о'
    return { cyr, isLong: false, consumed: 1 }
  }
  if (leading === 'ไ' || leading === 'ใ') return { cyr: 'ай', isLong: true, forceLive: true, consumed: 0 }
  // "голая" ведущая гласная без above-знака (если above задан — приоритет у него, см. ниже)
  if (leading === 'เ' && !above) return { cyr: 'ээ', isLong: true, consumed: 0 }
  if (leading === 'แ' && !above) return { cyr: 'ээ', isLong: true, consumed: 0 }
  if (leading === 'โ' && !above) return { cyr: 'оо', isLong: true, consumed: 0 }

  if (above === 'ั' && c1 === 'ว') return { cyr: 'уа', isLong: false, forceLive: true, consumed: 1 }
  if (above === 'ั') return { cyr: 'а', isLong: false, consumed: 0 }
  if (above === 'ิ') return { cyr: 'и', isLong: false, consumed: 0 }
  if (above === 'ี') return { cyr: 'ии', isLong: true, consumed: 0 }
  if (above === 'ึ') return { cyr: 'ы', isLong: false, consumed: 0 }
  if (above === 'ื') return { cyr: 'ыы', isLong: true, consumed: 0 }
  if (above === '็') return { cyr: 'э', isLong: false, consumed: 0 }

  if (c1 === 'ั' && c2 === 'ว') return { cyr: 'уа', isLong: true, consumed: 2 }
  if (c1 === 'ว' && !FOLLOWING_VOWEL_CHARS.has(c2 ?? '')) return { cyr: 'уа', isLong: true, forceLive: true, consumed: 1 }
  if (c1 === 'ะ') return { cyr: 'а', isLong: false, consumed: 1 }
  if (c1 === 'า' && c2 === 'ย') return { cyr: 'аай', isLong: true, forceLive: true, consumed: 2 }
  if (c1 === 'า' && c2 === 'ว') return { cyr: 'аау', isLong: true, forceLive: true, consumed: 2 }
  if (c1 === 'า') return { cyr: 'аа', isLong: true, consumed: 1 }
  if (c1 === 'ำ') return { cyr: 'ам', isLong: true, forceLive: true, consumed: 1 }
  if (c1 === 'อ') return { cyr: 'оо', isLong: true, consumed: 1 }

  return { cyr: 'а', isLong: false, consumed: 0 } // скрытая гласная (нерегулярные слова)
}

export function readThai(text: string): Syllable[] {
  const chars = [...text.replace(/[\s​]+/g, '')]
  const syllables: Syllable[] = []
  let i = 0

  while (i < chars.length) {
    const start = i
    let leading: string | null = null
    if (LEADING_VOWELS.has(chars[i])) {
      leading = chars[i]
      i++
    }

    if (i >= chars.length || !isConsonant(chars[i])) {
      if (i < chars.length) {
        syllables.push({ thai: chars[i], cyr: chars[i], tone: 'mid' })
        i++
      }
      continue
    }

    // ห-นำ / อ-นำ: немая ведущая согласная делает следующий сонант высокого класса
    let namSilent: string | null = null
    if ((chars[i] === 'ห' || chars[i] === 'อ') && !leading && NAM_TARGETS.has(chars[i + 1] ?? '')) {
      namSilent = chars[i]
      i++
    }

    const initial = chars[i]
    i++
    let cluster: string | null = null
    if (!namSilent && i < chars.length && 'รลว'.includes(chars[i])) {
      const next = chars[i + 1]
      const looksLikeVowelOrEnd = !next || LEADING_VOWELS.has(next) || TONE_MARKS.has(next) || ABOVE_VOWEL_SIGNS.has(next) || BELOW_VOWEL_SIGNS.has(next) || FOLLOWING_VOWEL_CHARS.has(next) || !isConsonant(next)
      if (looksLikeVowelOrEnd) {
        cluster = chars[i]
        i++
      }
    }

    let below: string | null = null
    if (i < chars.length && BELOW_VOWEL_SIGNS.has(chars[i])) {
      below = chars[i]
      i++
    }

    let above: string | null = null
    if (i < chars.length && ABOVE_VOWEL_SIGNS.has(chars[i])) {
      above = chars[i]
      i++
    }

    let mark: string | null = null
    if (i < chars.length && TONE_MARKS.has(chars[i])) {
      mark = chars[i]
      i++
    }

    const tail = resolveVowelTail(leading, above, chars, i)
    i += tail.consumed
    let isLong = tail.isLong
    let vowelCyr = tail.cyr
    const forceLive = tail.forceLive
    if (below === 'ุ') { vowelCyr = 'у'; isLong = false }
    else if (below === 'ู') { vowelCyr = 'уу'; isLong = true }

    // финаль — согласная, за которой не следует явный признак начала нового
    // слога (above/below-знак или ведущая гласная — те принадлежат только
    // новому слогу). Тоновый знак после кандидата в финаль неоднозначен: если
    // гласная этого слога уже "самодостаточна" (например а̄, ия, ыа), то это,
    // скорее, новый слог; если гласная ещё не завершена (ведущая гласная без
    // явного "хвоста", как ไ/ใ/เ-а), то знак относится к финали текущего слога.
    let final: string | null = null
    if (i < chars.length && isConsonant(chars[i]) && chars[i] !== 'อ' && chars[i] !== 'ห') {
      const after = chars[i + 1]
      const afterAfter = chars[i + 2]
      // после кандидата идёт р/л/в, а за ним — гласная/конец слова: значит это
      // не финаль, а кластер начала следующего слога (например ก перед ลับ в "จะกลับ")
      const afterLooksLikeClusterStart =
        after !== undefined &&
        'รลว'.includes(after) &&
        (afterAfter === undefined || ABOVE_VOWEL_SIGNS.has(afterAfter) || BELOW_VOWEL_SIGNS.has(afterAfter) || TONE_MARKS.has(afterAfter) || FOLLOWING_VOWEL_CHARS.has(afterAfter) || LEADING_VOWELS.has(afterAfter) || !isConsonant(afterAfter))
      const afterStartsNewSyllable =
        after !== undefined &&
        (ABOVE_VOWEL_SIGNS.has(after) || BELOW_VOWEL_SIGNS.has(after) || FOLLOWING_VOWEL_CHARS.has(after) || afterLooksLikeClusterStart)
      const afterIsToneMark = after !== undefined && TONE_MARKS.has(after)
      const rejectDueToToneMark = afterIsToneMark && tail.consumed > 0
      if (!afterStartsNewSyllable && !rejectDueToToneMark) {
        final = chars[i]
        i++
      }
    }

    // тоновый знак после финали (когда above-знака не было)
    if (!mark && i < chars.length && TONE_MARKS.has(chars[i])) {
      mark = chars[i]
      i++
    }

    // "тхантхакхат" (์) делает предыдущую согласную немой — поглощаем молча
    if (i < chars.length && isConsonant(chars[i]) && chars[i + 1] === '์') {
      i += 2
    } else if (i < chars.length && chars[i] === '์') {
      i += 1
    }

    const cls: ConsClass = namSilent ? 'high' : classify(initial)
    const isLive = forceLive || (final ? SONORANT_FINALS.has(final) : isLong || !!leading)
    const tone = resolveTone(cls, mark, isLive, isLong)

    const initCyr = namSilent ? INITIAL_CYR[initial] ?? '' : INITIAL_CYR[initial] ?? ''
    const clusterCyr = cluster ? INITIAL_CYR[cluster] ?? '' : ''
    const finalCyr = final ? FINAL_CYR[final] ?? '' : ''
    const cyr = `${initCyr}${clusterCyr}${vowelCyr}${finalCyr}`

    const thaiSlice = chars.slice(start, i).join('')
    syllables.push({ thai: thaiSlice, cyr: cyr || thaiSlice, tone })
  }

  return syllables
}
