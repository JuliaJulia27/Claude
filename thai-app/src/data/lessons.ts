import type { Category } from '../domain/types'

export interface LessonModule {
  id: string
  category: Category | 'tone-theory'
  title: { ru: string; fr: string }
  intro: { ru: string; fr: string }
}

export const LESSON_MODULES: LessonModule[] = [
  {
    id: 'l-00',
    category: 'tone-theory',
    title: { ru: '5 тонов тайского языка', fr: 'Les 5 tons du thaï' },
    intro: {
      ru: 'В тайском языке высота голоса меняет значение слова. Всего 5 тонов: средний, низкий, нисходящий, высокий и восходящий. Каждому слогу в приложении соответствует кривая — учитесь узнавать и воспроизводить её форму голосом.',
      fr: 'En thaï, la hauteur de la voix change le sens du mot. Il y a 5 tons : moyen, bas, descendant, haut et montant. Chaque syllabe est associée à une courbe — apprenez à la reconnaître et à la reproduire avec votre voix.',
    },
  },
  {
    id: 'l-01',
    category: 'greetings',
    title: { ru: 'Приветствия и вежливость', fr: 'Salutations et politesse' },
    intro: {
      ru: 'Базовые фразы для знакомства и вежливого общения — с ними начинается любой разговор.',
      fr: 'Les phrases de base pour faire connaissance et être poli — tout dialogue commence par elles.',
    },
  },
  {
    id: 'l-02',
    category: 'numbers',
    title: { ru: 'Числа 0–10', fr: 'Nombres 0–10' },
    intro: {
      ru: 'Числительные нужны для цен, времени и количества. Обратите внимание: у каждого числа свой тон.',
      fr: 'Les nombres servent pour les prix, l’heure et les quantités. Chaque nombre a son propre ton.',
    },
  },
  {
    id: 'l-03',
    category: 'basics',
    title: { ru: 'Базовые фразы', fr: 'Phrases de base' },
    intro: {
      ru: 'Да/нет, я/ты, понимаю/не понимаю — конструктор для простых диалогов.',
      fr: '« oui/non », « je/tu », « je comprends/je ne comprends pas » — de quoi construire des dialogues simples.',
    },
  },
  {
    id: 'l-04',
    category: 'food',
    title: { ru: 'Еда и напитки', fr: 'Nourriture et boissons' },
    intro: { ru: 'Заказ еды и описание вкуса.', fr: 'Commander à manger et décrire le goût.' },
  },
  {
    id: 'l-05',
    category: 'directions',
    title: { ru: 'Направления', fr: 'Directions' },
    intro: { ru: 'Как спросить и понять дорогу.', fr: 'Comment demander et comprendre un itinéraire.' },
  },
  {
    id: 'l-06',
    category: 'shopping',
    title: { ru: 'Покупки', fr: 'Achats' },
    intro: { ru: 'Торговаться и спрашивать цену.', fr: 'Négocier et demander le prix.' },
  },
  {
    id: 'l-07',
    category: 'family',
    title: { ru: 'Семья', fr: 'Famille' },
    intro: { ru: 'Члены семьи.', fr: 'Les membres de la famille.' },
  },
  {
    id: 'l-08',
    category: 'time',
    title: { ru: 'Время', fr: 'Temps' },
    intro: { ru: 'Сегодня, завтра, вчера.', fr: 'Aujourd’hui, demain, hier.' },
  },
  {
    id: 'l-09',
    category: 'emergency',
    title: { ru: 'Экстренные ситуации', fr: 'Urgences' },
    intro: { ru: 'Фразы на крайний случай.', fr: 'Phrases pour les cas urgents.' },
  },
]
