import { useRef } from 'react'
import { exportUserData, importUserData } from '../db/db'
import { useSettings, type Gender } from '../hooks/useSettings'

const GENDER_OPTIONS: { value: Gender; ru: string; fr: string }[] = [
  { value: 'male', ru: 'Мужской (ครับ)', fr: 'Homme (ครับ)' },
  { value: 'female', ru: 'Женский (ค่ะ/คะ)', fr: 'Femme (ค่ะ/คะ)' },
  { value: 'unspecified', ru: 'Не указывать', fr: 'Ne pas préciser' },
]

export function SettingsScreen() {
  const uiLang = useSettings((s) => s.uiLang)
  const setUiLang = useSettings((s) => s.setUiLang)
  const gender = useSettings((s) => s.gender)
  const setGender = useSettings((s) => s.setGender)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleExport() {
    const data = await exportUserData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `thai-tones-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const data = JSON.parse(text)
    await importUserData(data)
    alert(uiLang === 'ru' ? 'Данные успешно импортированы' : 'Données importées avec succès')
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 py-5">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <p className="mb-2 text-sm font-semibold">{uiLang === 'ru' ? 'Язык интерфейса' : "Langue de l'interface"}</p>
        <div className="flex gap-2">
          {(['ru', 'fr'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setUiLang(l)}
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                uiLang === l ? 'bg-emerald-500 text-emerald-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {l === 'ru' ? 'Русский' : 'Français'}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <p className="mb-1 text-sm font-semibold">
          {uiLang === 'ru' ? 'Ваш пол (для вежливых частиц)' : 'Votre genre (particules de politesse)'}
        </p>
        <p className="mb-2 text-xs text-slate-500">
          {uiLang === 'ru'
            ? 'На экране «Перевод» к фразе автоматически добавится ครับ (муж.) или ค่ะ/คะ (жен.).'
            : 'Sur l’écran « Traduction », ครับ (homme) ou ค่ะ/คะ (femme) sera ajouté automatiquement à la phrase.'}
        </p>
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setGender(opt.value)}
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                gender === opt.value ? 'bg-emerald-500 text-emerald-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {uiLang === 'ru' ? opt.ru : opt.fr}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3">
        <p className="text-sm font-semibold">{uiLang === 'ru' ? 'Данные' : 'Données'}</p>
        <p className="text-xs text-slate-500">
          {uiLang === 'ru'
            ? 'Весь прогресс хранится локально на устройстве (IndexedDB). Сделайте резервную копию перед сменой браузера или устройства.'
            : "Toute votre progression est stockée localement sur l'appareil (IndexedDB). Faites une sauvegarde avant de changer de navigateur ou d'appareil."}
        </p>
        <div className="flex gap-2">
          <button onClick={handleExport} className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold">
            {uiLang === 'ru' ? 'Экспорт' : 'Exporter'}
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold"
          >
            {uiLang === 'ru' ? 'Импорт' : 'Importer'}
          </button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={handleImport} />
        </div>
      </div>

      <div className="rounded-xl border border-amber-900 bg-amber-950/40 p-4 text-xs text-amber-300">
        {uiLang === 'ru'
          ? 'Куррированный разговорник (карточки, уроки, тренажёр тонов) сверен вручную по стандартным правилам тайской орфографии. Для фраз вне разговорника перевод и тональная разметка на экране «Перевод» строятся автоматически (правила чтения + онлайн-перевод) и не проверены человеком — для редких слов возможны ошибки в тоне.'
          : 'Le recueil de phrases (cartes, leçons, entraîneur de tons) est vérifié manuellement selon les règles orthographiques thaïes standard. Pour les phrases hors recueil, la traduction et le marquage tonal sur l’écran « Traduction » sont générés automatiquement (règles de lecture + traduction en ligne) et non vérifiés par un humain — des erreurs de ton sont possibles sur des mots rares.'}
      </div>
    </div>
  )
}
