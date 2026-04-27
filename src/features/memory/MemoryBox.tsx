import { useState } from 'react'
import { useSharpFlowStore } from '../../store/useSharpFlowStore'

const memoryLabels = {
  note: 'Note',
  reflection: 'Reflection',
  win: 'Win',
} as const

export function MemoryBox() {
  const { memories, addMemory } = useSharpFlowStore((state) => ({
    memories: state.memories,
    addMemory: state.addMemory,
  }))
  const [text, setText] = useState('')
  const [type, setType] = useState<'note' | 'reflection' | 'win'>('reflection')

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!text.trim()) return
    addMemory(text.trim(), type)
    setText('')
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-black/20 ring-1 ring-white/10">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Memory box</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Private reflections</h2>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.35em] text-slate-400">
          safe + private
        </span>
      </div>

      <form className="space-y-4" onSubmit={handleSave}>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Capture a win, a quiet thought, or a quick post-mortem."
          className="min-h-[110px] w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-4 text-sm text-slate-100 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/10"
        />
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {Object.entries(memoryLabels).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setType(key as 'note' | 'reflection' | 'win')}
              className={`rounded-2xl px-4 py-2 text-sm transition ${type === key ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
            >
              {label}
            </button>
          ))}
          <button
            type="submit"
            className="ml-auto rounded-3xl bg-gradient-to-r from-sky-400 to-indigo-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/20 transition hover:brightness-110"
          >
            Save memory
          </button>
        </div>
      </form>

      <div className="mt-6 space-y-3">
        {memories.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 p-5 text-sm text-slate-400">
            No entries yet. Capture your process and keep the app feeling personal.
          </div>
        ) : (
          memories.map((entry) => (
            <div key={entry.id} className="rounded-3xl border border-white/5 bg-slate-900/70 p-4 text-sm text-slate-100">
              <p className="text-slate-400 uppercase tracking-[0.25em]">{entry.type}</p>
              <p className="mt-2 leading-6">{entry.text}</p>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
