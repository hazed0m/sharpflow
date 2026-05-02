import { useEffect, useMemo, useState } from 'react'
import { useSharpFlowStore } from '../../store/useSharpFlowStore'
import { CharacterIllustration } from '../../components/CharacterIllustration'
import { Timer } from '../../components/Timer'
import { TaskInput } from '../../components/TaskInput'
import { AshAnimation } from '../../components/AshAnimation'

export function FocusScreen() {
  const [burning, setBurning] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  const {
    tasks,
    activeTaskId,
    prompt,
    mood,
    completeTask,
    skipTask,
    extendTask,
    burnActiveTask,
    addTask,
  } = useSharpFlowStore((state) => ({
    tasks: state.tasks,
    activeTaskId: state.activeTaskId,
    prompt: state.prompt,
    mood: state.mood,
    completeTask: state.completeTask,
    skipTask: state.skipTask,
    extendTask: state.extendTask,
    burnActiveTask: state.burnActiveTask,
    addTask: state.addTask,
  }))

  const activeTask = useMemo(
    () => tasks.find((task) => task.id === activeTaskId),
    [tasks, activeTaskId],
  )

  const queuedTasks = tasks.filter((task) => task.status === 'pending')
  const canExtend = activeTask ? activeTask.extensions < 2 : false

  useEffect(() => {
    if (!activeTask && queuedTasks.length > 0) {
      // When the active task clears, the store should already choose the next one.
      setResetKey((value) => value + 1)
    }
  }, [activeTask, queuedTasks.length])

  const handleBurn = () => {
    setBurning(true)
    burnActiveTask()
    setResetKey((value) => value + 1)
    window.setTimeout(() => setBurning(false), 2200)
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/20 bg-white/95 p-6 shadow-glow ring-1 ring-slate-200/30 transition-colors duration-300 dark:border-white/10 dark:bg-slate-950/90 dark:ring-white/10 sm:p-8">
      <AshAnimation visible={burning} />
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/20 bg-slate-50/90 p-6 shadow-xl ring-1 ring-slate-200/30 transition-colors duration-300 dark:border-white/10 dark:bg-slate-900/90">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">SharpFlow focus</p>
                <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">One task. One timer. One flow.</h1>
              </div>
              <div className="rounded-3xl bg-slate-200 px-4 py-2 text-sm text-amber-700 shadow-inner shadow-black/10 dark:bg-slate-800/80 dark:text-amber-300">
                Queue {queuedTasks.length + (activeTask ? 1 : 0)}/5
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
              SharpFlow is not a task dump. It is a pressure-free space for the next actionable step you can complete now.
            </p>
          </div>

          <TaskInput onSubmit={addTask} disabled={queuedTasks.length + (activeTask ? 1 : 0) >= 5} />
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200/20 bg-slate-50/90 p-6 shadow-glow ring-1 ring-slate-200/30 transition-colors duration-300 dark:border-white/10 dark:bg-slate-900/90 dark:ring-white/5">
            {activeTask ? (
              <>
                <div className="flex items-center justify-between gap-4">
                  <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Current task</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{activeTask.title}</h2>
                </div>
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs uppercase tracking-[0.35em] text-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
                    {activeTask.timerMinutes} min
                  </span>
                </div>

                <div className="mt-6">
                  <Timer
                    active={Boolean(activeTask)}
                    durationMinutes={activeTask.timerMinutes}
                    resetKey={resetKey}
                    onComplete={handleBurn}
                    onTick={() => null}
                  />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => {
                      completeTask()
                      setResetKey((value) => value + 1)
                    }}
                    className="rounded-3xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      skipTask()
                      setBurning(true)
                      window.setTimeout(() => setBurning(false), 2200)
                      setResetKey((value) => value + 1)
                    }}
                    className="rounded-3xl bg-slate-400 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                  >
                    Skip
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      extendTask()
                      setResetKey((value) => value + 1)
                    }}
                    disabled={!canExtend}
                    className="rounded-3xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-3 text-sm font-semibold text-slate-950 transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Extend
                  </button>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {activeTask.extensions > 0
                    ? `${activeTask.extensions} extension${activeTask.extensions > 1 ? 's' : ''} used.`
                    : 'Keep extensions rare. This is about action, not delay.'}
                </p>
              </>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-100 p-6 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-400">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-slate-500">No active task</p>
                <p className="mt-3 text-lg font-medium text-slate-900 dark:text-white">Add one clear next step to start your focus cycle.</p>
              </div>
            )}
          </div>

          <CharacterIllustration mood={mood} message={prompt} />
        </div>
      </div>
    </section>
  )
}
