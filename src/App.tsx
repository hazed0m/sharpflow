import { AuthGate } from './features/auth/AuthGate'
import { FocusScreen } from './features/focus/FocusScreen'
import { MemoryBox } from './features/memory/MemoryBox'
import { AnalyticsSummary } from './components/AnalyticsSummary'
import { ModuleSelector } from './components/ModuleSelector'

function App() {
  return (
    <AuthGate>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 py-6">
        <ModuleSelector />
        <AnalyticsSummary />
        <FocusScreen />
        <MemoryBox />
      </div>
    </AuthGate>
  )
}

export default App
