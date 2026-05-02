import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { normalizeTaskText, validateActionableTask } from '../services/taskRules'

interface TaskInputProps {
  onSubmit: (text: string) => void
  disabled?: boolean
}

export function TaskInput({ onSubmit, disabled }: TaskInputProps) {
  const [value, setValue] = useState('')
  const [feedback, setFeedback] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const resizeTextarea = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = '0px'
    textarea.style.height = `${textarea.scrollHeight}px`
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleaned = normalizeTaskText(value)
    const result = validateActionableTask(cleaned)
    if (!result.valid) {
      setFeedback(result.message)
      return
    }

    onSubmit(cleaned)
    setValue('')
    setFeedback('Task added. Keep the wording tight and immediate.')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="rounded-3xl border border-slate-200/20 bg-white/95 p-4 shadow-glow ring-1 ring-slate-200/30 transition-colors duration-300 dark:border-white/10 dark:bg-slate-950/90 dark:ring-white/10">
        <label htmlFor="task-input" className="block text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
          Next actionable step
        </label>
        <textarea
          id="task-input"
          ref={textareaRef}
          rows={1}
          value={value}
          disabled={disabled}
          onChange={(event) => {
            setValue(event.target.value)
            resizeTextarea()
          }}
          placeholder="Example: open the project file and review the first section"
          className="mt-3 min-h-[100px] w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition-all duration-200 ease-in-out focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/10"
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-h-[1.5rem] text-sm text-slate-400">
          {feedback || 'Keep it simple and start with the very next thing you can do.'}
        </p>
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-400/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add focus task
        </button>
      </div>
    </form>
  )
}
