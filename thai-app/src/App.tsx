import { HashRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomeScreen } from './screens/HomeScreen'
import { TranslateScreen } from './screens/TranslateScreen'
import { PhrasebookScreen } from './screens/PhrasebookScreen'
import { LessonsScreen } from './screens/LessonsScreen'
import { LessonDetailScreen } from './screens/LessonDetailScreen'
import { ExercisesHomeScreen } from './screens/ExercisesHomeScreen'
import { FlashcardsScreen } from './screens/FlashcardsScreen'
import { QuizScreen } from './screens/QuizScreen'
import { ListeningScreen } from './screens/ListeningScreen'
import { ToneTrainerScreen } from './screens/ToneTrainerScreen'
import { ProgressScreen } from './screens/ProgressScreen'
import { SettingsScreen } from './screens/SettingsScreen'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/translate" element={<TranslateScreen />} />
          <Route path="/phrasebook" element={<PhrasebookScreen />} />
          <Route path="/lessons" element={<LessonsScreen />} />
          <Route path="/lessons/:id" element={<LessonDetailScreen />} />
          <Route path="/exercises" element={<ExercisesHomeScreen />} />
          <Route path="/exercises/flashcards" element={<FlashcardsScreen />} />
          <Route path="/exercises/quiz" element={<QuizScreen />} />
          <Route path="/exercises/listening" element={<ListeningScreen />} />
          <Route path="/tone-trainer" element={<ToneTrainerScreen />} />
          <Route path="/progress" element={<ProgressScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
