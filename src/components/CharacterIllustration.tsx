import { motion } from 'framer-motion'
import type { CharacterMood } from '../types'

const moodMap: Record<CharacterMood, { label: string; color: string; expression: string }> = {
  calm: { label: 'I’ve got your back.', color: 'from-sky-500 to-indigo-600', expression: '🙂' },
  focused: { label: 'Lock in the next step.', color: 'from-violet-500 to-fuchsia-500', expression: '🧠' },
  cheerful: { label: 'Nice work — keep the rhythm.', color: 'from-emerald-400 to-teal-500', expression: '😄' },
  concerned: { label: 'Stay sharp. One clear task.', color: 'from-orange-500 to-rose-500', expression: '😟' },
}

interface CharacterIllustrationProps {
  mood: CharacterMood
  message: string
}

export function CharacterIllustration({ mood, message }: CharacterIllustrationProps) {
  const moodState = moodMap[mood]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-black/20"
    >
      <div className={`mb-4 inline-flex items-center gap-3 rounded-3xl bg-gradient-to-r ${moodState.color} px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20`}>
        <span className="text-2xl">{moodState.expression}</span>
        <span>{moodState.label}</span>
      </div>
      <p className="text-sm leading-6 text-slate-300">{message}</p>
    </motion.div>
  )
}
