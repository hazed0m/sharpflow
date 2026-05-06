import { type ReactNode, useEffect, useRef, useState } from 'react'
import { supabase, getCurrentSession, onAuthStateChange, signInWithEmail, signInWithGoogle, signOut } from '../../services/supabase'
import { useHasMounted } from '../../hooks/useHasMounted'
import { useSharpFlowStore, GUEST_STORAGE_KEY, OFFLINE_BUFFER_KEY } from '../../store/useSharpFlowStore'
import { ThemeToggle } from '../../components/ThemeToggle'

interface AuthGateProps {
  children: ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const hasMounted = useHasMounted()
  const [status, setStatus] = useState<'loading' | 'ready'>('loading')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isGuestMode, setIsGuestMode] = useState(false)
  const initializeUser = useSharpFlowStore((state) => state.initializeUser)

  const isOfflineMode = !supabase

  // Use ref to store current session without triggering re-renders
  const currentSessionRef = useRef<Awaited<ReturnType<typeof getCurrentSession>> | null>(null)

  // Initialize session and auth listener once on mount
  useEffect(() => {
    if (isOfflineMode) {
      // Do not set status here, let the initial render handle it if offline.
      return
    }

    let mounted = true

    const init = async () => {
      // Fetch the initial session
      try {
        currentSessionRef.current = await getCurrentSession()
      } catch {
        // Ignore errors - will be picked up by auth state listener
      }

      if (!mounted) return

      // Apply the initial session state
      const userId = currentSessionRef.current?.data.session?.user?.id
      if (userId) {
        setUserEmail(currentSessionRef.current?.data.session?.user?.email ?? null)
        setIsGuestMode(false)
        void initializeUser(userId)
      }

      // Session check complete - show the UI
      setStatus('ready')
    }

    void init()

    // Listen for subsequent auth changes (OAuth redirects, sign-out, etc.)
    const unsubscribe = onAuthStateChange(async (_event, session) => {
      setTimeout(() => {
        if (session?.user?.email) {
          setUserEmail(session.user.email)
          setIsGuestMode(false)
          void initializeUser(session.user.id)
        }
        // Don't clear userEmail on null sessions — explicit sign-out handles that
      }, 500)
    })

    return () => {
      mounted = false
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleEmailSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email) return
    setStatus('loading')
    const result = await signInWithEmail(email)
    setMessage(result.error ? result.error.message : 'Check your inbox for a sign-in link.')
    setStatus('ready')
  }

  const handleGoogleSignIn = async () => {
    setStatus('loading')
    const result = await signInWithGoogle()
    if (result.error) {
      setMessage(result.error.message)
      setStatus('ready')
    }
    // If successful, the browser redirects to Google - loading state stays
  }

  const handleSignOut = async () => {
    setStatus('loading')
    await signOut()
    setUserEmail(null)
    setIsGuestMode(false)
    try {
      window.localStorage.removeItem('sharpflow-oauth-')
      window.localStorage.removeItem(GUEST_STORAGE_KEY)
      const session = await getCurrentSession()
      if (session?.data.session?.user?.id) {
        window.localStorage.removeItem(OFFLINE_BUFFER_KEY(session.data.session.user.id))
      }
    } catch (e) {
      console.warn('Failed to clear localStorage on logout:', e)
    }
    void initializeUser(null)
    setStatus('ready')
  }

  const handleExitGuestMode = async () => {
    setStatus('loading')
    try {
      window.localStorage.removeItem(GUEST_STORAGE_KEY)
      const session = await getCurrentSession()
      if (session?.data.session?.user?.id) {
        window.localStorage.removeItem(OFFLINE_BUFFER_KEY(session.data.session.user.id))
      }
    } catch (e) {
      console.warn('Failed to clear guest localStorage:', e)
    }
    setIsGuestMode(false)
    setUserEmail(null)
    void initializeUser(null)
    setStatus('ready')
  }

  const enterGuestMode = () => {
    setIsGuestMode(true)
    void initializeUser(null)
  }

  if (!hasMounted) {
    return null
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="flex flex-col items-center gap-8">
          {/* Animated spinner */}
          <div className="relative">
            <div className="h-20 w-20 animate-spin rounded-full border-4 border-slate-200 border-t-amber-400 dark:border-slate-700 dark:border-t-amber-400"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 opacity-75 animate-pulse"></div>
            </div>
          </div>
          <p className="rounded-3xl border border-slate-200/20 bg-white/95 px-6 py-6 text-sm text-slate-600 shadow-xl shadow-slate-900/10 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200 dark:shadow-black/20">
            Loading SharpFlow...
          </p>
        </div>
      </div>
    )
  }

  // Show login gate when not authenticated and Supabase is configured
  if (!userEmail && supabase && !isGuestMode) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-8 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-md rounded-[2rem] border border-slate-200/20 bg-white/95 p-8 shadow-glow ring-1 ring-slate-200/30 dark:border-white/10 dark:bg-slate-900/90">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-500/80">SharpFlow</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Welcome back</h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Sign in to sync your focus sessions, or continue as a guest.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {/* Google Sign-In - Primary Action */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full rounded-2xl bg-white border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 flex items-center justify-center gap-3"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500 dark:bg-slate-900 dark:text-slate-400">or</span>
              </div>
            </div>

            {/* Email Magic Link */}
            <form onSubmit={handleEmailSignIn} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
              />
              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                Send magic link
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500 dark:bg-slate-900 dark:text-slate-400">or</span>
              </div>
            </div>

            {/* Guest Mode */}
            <button
              type="button"
              onClick={enterGuestMode}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              Continue as guest
            </button>

            {message && (
              <div className="rounded-2xl border border-emerald-200/20 bg-emerald-700/10 p-3 text-sm text-emerald-100 text-center">
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-8 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100">
      {isOfflineMode ? (
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-amber-300/20 bg-amber-700/10 p-4 text-sm text-amber-100 shadow-lg shadow-amber-300/10 mb-6">
          <p className="font-medium">Offline mode enabled</p>
          <p className="mt-1 text-slate-300">Supabase is not configured, so your progress is saved locally in the browser for prototyping.</p>
        </div>
      ) : null}
      <div className="mx-auto max-w-6xl mb-6 flex flex-col gap-3 rounded-[2rem] border border-slate-200/20 bg-white/95 p-4 shadow-glow ring-1 ring-slate-200/30 transition-colors duration-300 dark:border-white/10 dark:bg-slate-900/90 dark:ring-white/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {userEmail ? `Signed in as ${userEmail}` : 'Guest mode active'}
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {supabase && userEmail && (
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 shadow-lg shadow-emerald-500/20"
              >
                Sign Out
              </button>
          )}
          {isGuestMode && (
            <button
              type="button"
              onClick={handleExitGuestMode}
              className="rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 shadow-lg shadow-emerald-500/20"
            >
              Exit Guest Mode
            </button>
          )}
        </div>
      </div>
      <header className="mx-auto max-w-6xl mb-8 rounded-[2rem] border border-slate-200/20 bg-white/95 p-6 shadow-glow ring-1 ring-slate-200/30 transition-colors duration-300 dark:border-white/10 dark:bg-slate-900/90 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-amber-500/80">SharpFlow</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">Train your attention without a dashboard.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
              Focus on the next immediate step with urgency, clarity, and the smallest meaningful queue.
            </p>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl">
        {children}
      </div>
    </div>
  )
}