import { useState } from 'react'

const STORAGE_KEY = 'sharpflow-theme'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Initialize theme on component mount to match saved preference
  const initializedTheme = (() => {
    const saved = localStorage.getItem(STORAGE_KEY) || null
    if (!saved) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      localStorage.setItem(STORAGE_KEY, prefersDark ? 'dark' : 'light')
    }
    return saved ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  })()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login attempt:', { email, password })
    // TODO: Connect to authentication backend (Supabase/Auth0/etc.)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-black dark:via-slate-900 dark:to-slate-950">
      <div 
        className="w-full max-w-md mx-4"
        style={{ 
          animation: 'fadeIn 0.6s ease-out',
          transform: `translateY(1rem)`,
          animationFillMode: 'forwards' as const,
        }}
      >
        <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
          {/* Decorative header gradient */}
          <div className="h-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-pulse" />
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Logo / Title area */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SharpFlow Login
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Sign in to continue your focus journey
              </p>
            </div>

            {/* Email input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:ring-blue-400/50"
              />
            </div>

            {/* Password input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:ring-blue-400/50"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign In
            </button>

            {/* Footer links */}
            <div className="flex justify-center gap-4 text-sm">
              <a href="#" className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
                Forgot password?
              </a>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <a href="#" className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
                Create account
              </a>
            </div>

            {/* Theme indicator */}
            <div className="mt-6 pt-6 border-t border-slate-200/50 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <span>💾</span>
                Theme: {initializedTheme === 'dark' ? '🌙 Dark mode' : '☀️ Light mode'}
              </p>
            </div>
          </form>
        </div>

        {/* Decorative background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 left-8 w-72 h-72 bg-blue-400/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-20 right-8 w-96 h-96 bg-indigo-400/15 rounded-full blur-[100px] animate-pulse delay-75" />
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(1rem); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}