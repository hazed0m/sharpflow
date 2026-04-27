import { useEffect, useState } from 'react'

interface TimerProps {
  durationMinutes: number
  onComplete: () => void
  onTick?: (remainingSeconds: number) => void
  active: boolean
  resetKey: number
}

export function Timer({ durationMinutes, onComplete, onTick, active, resetKey }: TimerProps) {
  const [remaining, setRemaining] = useState(durationMinutes * 60)

  useEffect(() => {
    setRemaining(durationMinutes * 60)
  }, [durationMinutes, resetKey])

  useEffect(() => {
    if (!active) return undefined

    const interval = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(interval)
          onComplete()
          return 0
        }
        const next = current - 1
        onTick?.(next)
        return next
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [active, onComplete, onTick])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60

  return (
    <div className="flex items-center justify-center rounded-3xl bg-slate-900/90 px-4 py-5 text-center shadow-lg shadow-black/20 ring-1 ring-white/10">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Focus timer</p>
        <p className="mt-3 text-5xl font-semibold text-white sm:text-6xl">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </p>
        <p className="mt-2 text-xs uppercase tracking-[0.32em] text-amber-300/80">Keep your rhythm</p>
      </div>
    </div>
  )
}
