import { focusModules } from '../data/modules'
import { useSharpFlowStore } from '../store/useSharpFlowStore'

export function ModuleSelector() {
  const { selectedModuleId, setSelectedModule } = useSharpFlowStore((state) => ({
    selectedModuleId: state.selectedModuleId,
    setSelectedModule: state.setSelectedModule,
  }))

  return (
    <section className="rounded-[2rem] border border-slate-200/20 bg-white/95 p-6 shadow-glow ring-1 ring-slate-200/30 transition-colors duration-300 dark:border-white/10 dark:bg-slate-950/90 dark:ring-white/10">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Focus ritual</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Choose a prompt style</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-400">
          Pick a mode that helps you stay sharp without overthinking the task queue.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {focusModules.map((module) => (
          <button
            key={module.id}
            type="button"
            onClick={() => setSelectedModule(module.id)}
            className={`rounded-3xl border px-4 py-4 text-left transition ${
              selectedModuleId === module.id
                ? 'border-amber-400 bg-amber-400/10 text-white shadow-lg shadow-amber-400/10'
                : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600 hover:bg-slate-900/80'
            }`}
          >
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">{module.name}</p>
            <p className="mt-3 text-sm leading-6 text-slate-200">{module.description}</p>
          </button>
        ))}
      </div>
    </section>
  )
}
