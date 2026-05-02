import { useMemo } from 'react'
import { useSharpFlowStore } from '../store/useSharpFlowStore'

export function AnalyticsSummary() {
  const { tasks, memories } = useSharpFlowStore((state) => ({
    tasks: state.tasks,
    memories: state.memories,
  }))

  const metrics = useMemo(() => {
    const completedTasks = tasks.filter((task) => task.status === 'completed')
    const burnedTasks = tasks.filter((task) => task.status === 'ash')
    const totalFocusMinutes = completedTasks.reduce((sum, task) => sum + task.timerMinutes, 0)
    const averageFocusMinutes = completedTasks.length ? Math.round(totalFocusMinutes / completedTasks.length) : 0

    return {
      completedCount: completedTasks.length,
      burnedCount: burnedTasks.length,
      memoryCount: memories.length,
      averageFocusMinutes,
    }
  }, [tasks, memories])

  return (
    <section className="rounded-[2rem] border border-slate-200/20 bg-white/95 p-6 shadow-glow ring-1 ring-slate-200/30 transition-colors duration-300 dark:border-white/10 dark:bg-slate-950/90 dark:ring-white/10">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Focus metrics</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Low-key progress overview</h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl">
          A supportive summary of your task momentum, not a scorecard. Use it to keep the flow visible and the pressure gentle.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-3xl border border-slate-300 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-600 dark:text-slate-400">Completed</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-600 dark:text-emerald-300">{metrics.completedCount}</p>
        </div>
        <div className="rounded-3xl border border-slate-300 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-600 dark:text-slate-400">Burned</p>
          <p className="mt-3 text-3xl font-semibold text-amber-600 dark:text-amber-300">{metrics.burnedCount}</p>
        </div>
        <div className="rounded-3xl border border-slate-300 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-600 dark:text-slate-400">Memories</p>
          <p className="mt-3 text-3xl font-semibold text-sky-600 dark:text-sky-300">{metrics.memoryCount}</p>
        </div>
        <div className="rounded-3xl border border-slate-300 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-600 dark:text-slate-400">Avg focus</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{metrics.averageFocusMinutes} min</p>
        </div>
      </div>
    </section>
  )
}
