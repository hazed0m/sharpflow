import { useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'sharpflow-theme'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const prefersDark = useCallback(() => window.matchMedia('(prefers-color-scheme: dark)').matches, [])

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(STORAGE_KEY) as 'light' | 'dark' | null
    const initialTheme = savedTheme ?? (prefersDark() ? 'dark' : 'light')
    setTheme(initialTheme)
    document.documentElement.classList.toggle('dark', initialTheme === 'dark')
  }, [prefersDark])

  // Device preference readout state
  const devicePrefDisplay = prefersDark() ? '💾 Your device prefers dark mode' : '💾 Your device prefers light mode'

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
    window.localStorage.setItem(STORAGE_KEY, nextTheme)
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={theme === 'dark'}
      className="inline-flex items-center gap-3 rounded-full bg-slate-200 p-1 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/10 ring-1 ring-slate-300/40 transition duration-300 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:shadow-black/20 dark:ring-slate-700/40 dark:hover:bg-slate-600"
      title={`${devicePrefDisplay} | Currently using ${theme === 'dark' ? 'Dark' : 'Light'} theme`}
    >
      <span className="flex items-center gap-2">
        <span className="text-base">{theme === 'dark' ? '🌙' : '☀️'}</span>
        <span className="hidden sm:inline">{theme === 'dark' ? 'Dark' : 'Light'}</span>
      </span>

      <span className="relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full bg-white shadow-inner transition-colors duration-300 dark:bg-slate-800">
        <span
          className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-amber-400 shadow transition-transform duration-300 dark:bg-white ${
            theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  )
}