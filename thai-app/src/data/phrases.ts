import type { Phrase } from '../domain/types'

/**
 * Стартовый набор фраз со слоговой тональной разметкой.
 * Тоны и транскрипции опираются на стандартные правила тайской орфографии
 * (класс согласной + долгота гласной + конечный звук + тоновый знак) и на
 * общепризнанные учебные примеры (числительные, приветствия, классический
 * набор "кха/кхаа" и предложение "ไม้ใหม่ไม่ไหม้ไหม").
 * Перед публикацией расширенный словарь стоит сверить с носителем языка —
 * структура данных рассчитана на лёгкое добавление новых записей.
 */
export const PHRASES: Phrase[] = [
  // --- Приветствия ---
  {
    id: 'gr-01', category: 'greetings', ru: 'Здравствуйте', fr: 'Bonjour', thai: 'สวัสดี', difficulty: 1,
    syllables: [
      { thai: 'สะ', cyr: 'са', tone: 'low' },
      { thai: 'หวัส', cyr: 'ват', tone: 'low' },
      { thai: 'ดี', cyr: 'дии', tone: 'mid' },
    ],
  },
  {
    id: 'gr-02', category: 'greetings', ru: 'Здравствуйте (муж., вежливо)', fr: 'Bonjour (homme, poli)', thai: 'ครับ', difficulty: 1,
    syllables: [{ thai: 'ครับ', cyr: 'кхрап', tone: 'high' }],
  },
  {
    id: 'gr-03', category: 'greetings', ru: 'вежливая частица (жен., утверждение)', fr: 'particule polie (femme, affirmation)', thai: 'ค่ะ', difficulty: 1,
    syllables: [{ thai: 'ค่ะ', cyr: 'кха', tone: 'falling' }],
  },
  {
    id: 'gr-04', category: 'greetings', ru: 'вежливая частица (жен., вопрос)', fr: 'particule polie (femme, question)', thai: 'คะ', difficulty: 1,
    syllables: [{ thai: 'คะ', cyr: 'кха', tone: 'high' }],
  },
  {
    id: 'gr-05', category: 'greetings', ru: 'Как дела?', fr: 'Comment ça va ?', thai: 'สบายดีไหม', difficulty: 2,
    syllables: [
      { thai: 'สะ', cyr: 'са', tone: 'low' },
      { thai: 'บาย', cyr: 'баай', tone: 'mid' },
      { thai: 'ดี', cyr: 'дии', tone: 'mid' },
      { thai: 'ไหม', cyr: 'май', tone: 'rising' },
    ],
  },
  {
    id: 'gr-06', category: 'greetings', ru: 'Всё хорошо', fr: 'Ça va bien', thai: 'สบายดี', difficulty: 1,
    syllables: [
      { thai: 'สะ', cyr: 'са', tone: 'low' },
      { thai: 'บาย', cyr: 'баай', tone: 'mid' },
      { thai: 'ดี', cyr: 'дии', tone: 'mid' },
    ],
  },
  {
    id: 'gr-07', category: 'greetings', ru: 'До свидания', fr: 'Au revoir', thai: 'ลาก่อน', difficulty: 1,
    syllables: [
      { thai: 'ลา', cyr: 'лаа', tone: 'mid' },
      { thai: 'ก่อน', cyr: 'кон', tone: 'low' },
    ],
  },
  {
    id: 'gr-08', category: 'greetings', ru: 'Спасибо', fr: 'Merci', thai: 'ขอบคุณ', difficulty: 1,
    syllables: [
      { thai: 'ขอบ', cyr: 'кхоп', tone: 'low' },
      { thai: 'คุณ', cyr: 'кхун', tone: 'mid' },
    ],
  },
  {
    id: 'gr-09', category: 'greetings', ru: 'Извините', fr: 'Excusez-moi / Pardon', thai: 'ขอโทษ', difficulty: 1,
    syllables: [
      { thai: 'ขอ', cyr: 'кхо', tone: 'rising' },
      { thai: 'โทษ', cyr: 'тхоот', tone: 'falling' },
    ],
  },
  {
    id: 'gr-10', category: 'greetings', ru: 'Ничего страшного', fr: 'Ce n’est pas grave', thai: 'ไม่เป็นไร', difficulty: 2,
    syllables: [
      { thai: 'ไม่', cyr: 'май', tone: 'falling' },
      { thai: 'เป็น', cyr: 'пен', tone: 'mid' },
      { thai: 'ไร', cyr: 'рай', tone: 'mid' },
    ],
  },
  {
    id: 'gr-11', category: 'greetings', ru: 'Как тебя зовут?', fr: 'Comment tu t’appelles ?', thai: 'ชื่ออะไร', difficulty: 2,
    syllables: [
      { thai: 'ชื่อ', cyr: 'чы', tone: 'falling' },
      { thai: 'อะ', cyr: 'а', tone: 'low' },
      { thai: 'ไร', cyr: 'рай', tone: 'mid' },
    ],
  },

  // --- Числа ---
  { id: 'num-0', category: 'numbers', ru: 'ноль', fr: 'zéro', thai: 'ศูนย์', difficulty: 1, syllables: [{ thai: 'ศูนย์', cyr: 'суун', tone: 'rising' }] },
  { id: 'num-1', category: 'numbers', ru: 'один', fr: 'un', thai: 'หนึ่ง', difficulty: 1, syllables: [{ thai: 'หนึ่ง', cyr: 'нынг', tone: 'low' }] },
  { id: 'num-2', category: 'numbers', ru: 'два', fr: 'deux', thai: 'สอง', difficulty: 1, syllables: [{ thai: 'สอง', cyr: 'сонг', tone: 'rising' }] },
  { id: 'num-3', category: 'numbers', ru: 'три', fr: 'trois', thai: 'สาม', difficulty: 1, syllables: [{ thai: 'สาม', cyr: 'саам', tone: 'rising' }] },
  { id: 'num-4', category: 'numbers', ru: 'четыре', fr: 'quatre', thai: 'สี่', difficulty: 1, syllables: [{ thai: 'สี่', cyr: 'сии', tone: 'low' }] },
  { id: 'num-5', category: 'numbers', ru: 'пять', fr: 'cinq', thai: 'ห้า', difficulty: 1, syllables: [{ thai: 'ห้า', cyr: 'хаа', tone: 'falling' }] },
  { id: 'num-6', category: 'numbers', ru: 'шесть', fr: 'six', thai: 'หก', difficulty: 1, syllables: [{ thai: 'หก', cyr: 'хок', tone: 'low' }] },
  { id: 'num-7', category: 'numbers', ru: 'семь', fr: 'sept', thai: 'เจ็ด', difficulty: 1, syllables: [{ thai: 'เจ็ด', cyr: 'джет', tone: 'low' }] },
  { id: 'num-8', category: 'numbers', ru: 'восемь', fr: 'huit', thai: 'แปด', difficulty: 1, syllables: [{ thai: 'แปด', cyr: 'пэт', tone: 'low' }] },
  { id: 'num-9', category: 'numbers', ru: 'девять', fr: 'neuf', thai: 'เก้า', difficulty: 1, syllables: [{ thai: 'เก้า', cyr: 'као', tone: 'falling' }] },
  { id: 'num-10', category: 'numbers', ru: 'десять', fr: 'dix', thai: 'สิบ', difficulty: 1, syllables: [{ thai: 'สิบ', cyr: 'сип', tone: 'low' }] },

  // --- Базовые фразы ---
  { id: 'ba-01', category: 'basics', ru: 'да (верно)', fr: 'oui (correct)', thai: 'ใช่', difficulty: 1, syllables: [{ thai: 'ใช่', cyr: 'чай', tone: 'falling' }] },
  { id: 'ba-02', category: 'basics', ru: 'нет (неверно)', fr: 'non (incorrect)', thai: 'ไม่ใช่', difficulty: 1, syllables: [{ thai: 'ไม่', cyr: 'май', tone: 'falling' }, { thai: 'ใช่', cyr: 'чай', tone: 'falling' }] },
  { id: 'ba-03', category: 'basics', ru: 'мочь / получилось', fr: 'pouvoir / réussi', thai: 'ได้', difficulty: 1, syllables: [{ thai: 'ได้', cyr: 'дай', tone: 'falling' }] },
  { id: 'ba-04', category: 'basics', ru: 'не могу', fr: 'ne peux pas', thai: 'ไม่ได้', difficulty: 1, syllables: [{ thai: 'ไม่', cyr: 'май', tone: 'falling' }, { thai: 'ได้', cyr: 'дай', tone: 'falling' }] },
  { id: 'ba-05', category: 'basics', ru: 'я (муж.)', fr: 'je (homme)', thai: 'ผม', difficulty: 1, syllables: [{ thai: 'ผม', cyr: 'пхом', tone: 'rising' }] },
  { id: 'ba-06', category: 'basics', ru: 'я (жен.)', fr: 'je (femme)', thai: 'ดิฉัน', difficulty: 1, syllables: [{ thai: 'ดิ', cyr: 'ди', tone: 'low' }, { thai: 'ฉัน', cyr: 'чан', tone: 'rising' }] },
  { id: 'ba-07', category: 'basics', ru: 'ты / вы', fr: 'tu / vous', thai: 'คุณ', difficulty: 1, syllables: [{ thai: 'คุณ', cyr: 'кхун', tone: 'mid' }] },
  { id: 'ba-08', category: 'basics', ru: 'понимаю', fr: 'je comprends', thai: 'เข้าใจ', difficulty: 2, syllables: [{ thai: 'เข้า', cyr: 'кхао', tone: 'falling' }, { thai: 'ใจ', cyr: 'чай', tone: 'mid' }] },
  { id: 'ba-09', category: 'basics', ru: 'не понимаю', fr: 'je ne comprends pas', thai: 'ไม่เข้าใจ', difficulty: 2, syllables: [{ thai: 'ไม่', cyr: 'май', tone: 'falling' }, { thai: 'เข้า', cyr: 'кхао', tone: 'falling' }, { thai: 'ใจ', cyr: 'чай', tone: 'mid' }] },
  { id: 'ba-10', category: 'basics', ru: 'Помогите!', fr: 'Aidez-moi !', thai: 'ช่วยด้วย', difficulty: 2, syllables: [{ thai: 'ช่วย', cyr: 'чуай', tone: 'falling' }, { thai: 'ด้วย', cyr: 'дуай', tone: 'falling' }] },

  // --- Еда ---
  { id: 'fo-01', category: 'food', ru: 'рис', fr: 'riz', thai: 'ข้าว', difficulty: 1, syllables: [{ thai: 'ข้าว', cyr: 'кхао', tone: 'falling' }] },
  { id: 'fo-02', category: 'food', ru: 'вода', fr: 'eau', thai: 'น้ำ', difficulty: 1, syllables: [{ thai: 'น้ำ', cyr: 'наам', tone: 'high' }] },
  { id: 'fo-03', category: 'food', ru: 'вкусно', fr: 'délicieux', thai: 'อร่อย', difficulty: 1, syllables: [{ thai: 'อ', cyr: 'а', tone: 'low' }, { thai: 'ร่อย', cyr: 'рой', tone: 'falling' }] },
  { id: 'fo-04', category: 'food', ru: 'острый', fr: 'épicé', thai: 'เผ็ด', difficulty: 1, syllables: [{ thai: 'เผ็ด', cyr: 'пхет', tone: 'low' }] },
  { id: 'fo-05', category: 'food', ru: 'сладкий', fr: 'sucré', thai: 'หวาน', difficulty: 1, syllables: [{ thai: 'หวาน', cyr: 'ваан', tone: 'rising' }] },
  { id: 'fo-06', category: 'food', ru: 'жареный рис', fr: 'riz frit', thai: 'ข้าวผัด', difficulty: 2, syllables: [{ thai: 'ข้าว', cyr: 'кхао', tone: 'falling' }, { thai: 'ผัด', cyr: 'пхат', tone: 'low' }] },
  { id: 'fo-07', category: 'food', ru: 'кофе', fr: 'café', thai: 'กาแฟ', difficulty: 1, syllables: [{ thai: 'กา', cyr: 'каа', tone: 'mid' }, { thai: 'แฟ', cyr: 'фэ', tone: 'mid' }] },
  { id: 'fo-08', category: 'food', ru: 'чай', fr: 'thé', thai: 'ชา', difficulty: 1, syllables: [{ thai: 'ชา', cyr: 'чаа', tone: 'mid' }] },

  // --- Направления ---
  { id: 'di-01', category: 'directions', ru: 'где?', fr: 'où ?', thai: 'ที่ไหน', difficulty: 1, syllables: [{ thai: 'ที่', cyr: 'тхии', tone: 'falling' }, { thai: 'ไหน', cyr: 'най', tone: 'rising' }] },
  { id: 'di-02', category: 'directions', ru: 'налево', fr: 'à gauche', thai: 'ซ้าย', difficulty: 1, syllables: [{ thai: 'ซ้าย', cyr: 'саай', tone: 'high' }] },
  { id: 'di-03', category: 'directions', ru: 'направо', fr: 'à droite', thai: 'ขวา', difficulty: 1, syllables: [{ thai: 'ขวา', cyr: 'кхваа', tone: 'rising' }] },
  { id: 'di-04', category: 'directions', ru: 'прямо', fr: 'tout droit', thai: 'ตรงไป', difficulty: 1, syllables: [{ thai: 'ตรง', cyr: 'тронг', tone: 'mid' }, { thai: 'ไป', cyr: 'пай', tone: 'mid' }] },
  { id: 'di-05', category: 'directions', ru: 'туалет', fr: 'toilettes', thai: 'ห้องน้ำ', difficulty: 1, syllables: [{ thai: 'ห้อง', cyr: 'хонг', tone: 'falling' }, { thai: 'น้ำ', cyr: 'наам', tone: 'high' }] },

  // --- Покупки ---
  { id: 'sh-01', category: 'shopping', ru: 'сколько стоит?', fr: 'combien ça coûte ?', thai: 'เท่าไหร่', difficulty: 2, syllables: [{ thai: 'เท่า', cyr: 'тхао', tone: 'falling' }, { thai: 'ไหร่', cyr: 'рай', tone: 'low' }] },
  { id: 'sh-02', category: 'shopping', ru: 'дорого', fr: 'cher', thai: 'แพง', difficulty: 1, syllables: [{ thai: 'แพง', cyr: 'пхэнг', tone: 'mid' }] },
  { id: 'sh-03', category: 'shopping', ru: 'дёшево', fr: 'pas cher', thai: 'ถูก', difficulty: 1, syllables: [{ thai: 'ถูก', cyr: 'тхуук', tone: 'low' }] },
  { id: 'sh-04', category: 'shopping', ru: 'покупать', fr: 'acheter', thai: 'ซื้อ', difficulty: 1, syllables: [{ thai: 'ซื้อ', cyr: 'сы', tone: 'high' }] },

  // --- Экстренные ситуации ---
  { id: 'em-01', category: 'emergency', ru: 'врач', fr: 'médecin', thai: 'หมอ', difficulty: 1, syllables: [{ thai: 'หมอ', cyr: 'мо', tone: 'rising' }] },
  { id: 'em-02', category: 'emergency', ru: 'полиция', fr: 'police', thai: 'ตำรวจ', difficulty: 2, syllables: [{ thai: 'ตำ', cyr: 'там', tone: 'mid' }, { thai: 'รวจ', cyr: 'руат', tone: 'falling' }] },
  { id: 'em-03', category: 'emergency', ru: 'Пожар!', fr: 'Au feu !', thai: 'ไฟไหม้', difficulty: 2, syllables: [{ thai: 'ไฟ', cyr: 'фай', tone: 'mid' }, { thai: 'ไหม้', cyr: 'май', tone: 'falling' }] },
  { id: 'em-04', category: 'emergency', ru: 'Помогите!', fr: 'Au secours !', thai: 'ช่วยด้วย', difficulty: 2, syllables: [{ thai: 'ช่วย', cyr: 'чуай', tone: 'falling' }, { thai: 'ด้วย', cyr: 'дуай', tone: 'falling' }] },

  // --- Семья ---
  { id: 'fa-01', category: 'family', ru: 'отец', fr: 'père', thai: 'พ่อ', difficulty: 1, syllables: [{ thai: 'พ่อ', cyr: 'пхо', tone: 'falling' }] },
  { id: 'fa-02', category: 'family', ru: 'мать', fr: 'mère', thai: 'แม่', difficulty: 1, syllables: [{ thai: 'แม่', cyr: 'мэ', tone: 'falling' }] },
  { id: 'fa-03', category: 'family', ru: 'старший брат/сестра', fr: 'grand frère / grande sœur', thai: 'พี่', difficulty: 1, syllables: [{ thai: 'พี่', cyr: 'пхии', tone: 'falling' }] },
  { id: 'fa-04', category: 'family', ru: 'младший брат/сестра', fr: 'petit frère / petite sœur', thai: 'น้อง', difficulty: 1, syllables: [{ thai: 'น้อง', cyr: 'нонг', tone: 'high' }] },
  { id: 'fa-05', category: 'family', ru: 'семья', fr: 'famille', thai: 'ครอบครัว', difficulty: 2, syllables: [{ thai: 'ครอบ', cyr: 'кхроп', tone: 'falling' }, { thai: 'ครัว', cyr: 'кхруа', tone: 'mid' }] },

  // --- Время ---
  { id: 'ti-01', category: 'time', ru: 'сегодня', fr: 'aujourd’hui', thai: 'วันนี้', difficulty: 1, syllables: [{ thai: 'วัน', cyr: 'ван', tone: 'mid' }, { thai: 'นี้', cyr: 'нии', tone: 'high' }] },
  { id: 'ti-02', category: 'time', ru: 'завтра', fr: 'demain', thai: 'พรุ่งนี้', difficulty: 2, syllables: [{ thai: 'พรุ่ง', cyr: 'пхрунг', tone: 'falling' }, { thai: 'นี้', cyr: 'нии', tone: 'high' }] },
  { id: 'ti-03', category: 'time', ru: 'вчера', fr: 'hier', thai: 'เมื่อวาน', difficulty: 2, syllables: [{ thai: 'เมื่อ', cyr: 'мыа', tone: 'falling' }, { thai: 'วาน', cyr: 'ваан', tone: 'mid' }] },

  // --- Тренировка тонов: канонический учебный набор ---
  { id: 'to-01', category: 'tones', ru: 'нога (восходящий тон)', fr: 'jambe (ton montant)', thai: 'ขา', difficulty: 1, notes: 'Классический учебный пример: кхаа-кха̀а-кха̂а-кха́а-кхаа на пяти тонах.', syllables: [{ thai: 'ขา', cyr: 'кхаа', tone: 'rising' }] },
  { id: 'to-02', category: 'tones', ru: 'галангал, специя (низкий тон)', fr: 'galanga, épice (ton bas)', thai: 'ข่า', difficulty: 1, syllables: [{ thai: 'ข่า', cyr: 'кхаа', tone: 'low' }] },
  { id: 'to-03', category: 'tones', ru: 'цена, стоимость (нисходящий тон)', fr: 'prix, valeur (ton descendant)', thai: 'ค่า', difficulty: 1, syllables: [{ thai: 'ค่า', cyr: 'кхаа', tone: 'falling' }] },
  { id: 'to-04', category: 'tones', ru: 'торговать (высокий тон)', fr: 'faire du commerce (ton haut)', thai: 'ค้า', difficulty: 1, syllables: [{ thai: 'ค้า', cyr: 'кхаа', tone: 'high' }] },
  { id: 'to-05', category: 'tones', ru: 'застрять (средний тон)', fr: 'être coincé (ton moyen)', thai: 'คา', difficulty: 1, syllables: [{ thai: 'คา', cyr: 'кхаа', tone: 'mid' }] },
  {
    id: 'to-06', category: 'tones', ru: 'Новое дерево не горит, правда?', fr: 'Le bois neuf ne brûle pas, n’est-ce pas ?', thai: 'ไม้ใหม่ไม่ไหม้ไหม', difficulty: 3,
    notes: 'Знаменитая тайская скороговорка, демонстрирующая все 5 тонов на одном слоге "май".',
    syllables: [
      { thai: 'ไม้', cyr: 'маай', tone: 'high' },
      { thai: 'ใหม่', cyr: 'май', tone: 'low' },
      { thai: 'ไม่', cyr: 'май', tone: 'falling' },
      { thai: 'ไหม้', cyr: 'май', tone: 'falling' },
      { thai: 'ไหม', cyr: 'май', tone: 'rising' },
    ],
  },
]

export function phrasesByCategory(category: string): Phrase[] {
  return PHRASES.filter((p) => p.category === category)
}
