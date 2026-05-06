import React from 'react'

interface TabButtonProps {
  id: string | number
  label: string
  isActive: boolean
  onClick: () => void
}

export function TabButton({ id, label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1.5 rounded-lg px-6 py-3 text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'border-b-2 border-indigo-500 bg-gradient-to-r from-indigo-50 to-blue-50/40 text-indigo-700 dark:from-indigo-950/30 dark:to-blue-950/30 dark:text-indigo-300 shadow-sm'
          : 'border-b border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200'
      }`}
    >
      <span className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</span>
    </button>
  )
}

export default TabButton