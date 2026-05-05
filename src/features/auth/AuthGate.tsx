import { type ReactNode, useEffect, useRef, useState } from 'react'
import { supabase, getCurrentSession, onAuthStateChange, signInWithEmail, signInWithGoogle, signOut } from '../../services/supabase'
import { useHasMounted } from '../../hooks/useHasMounted'
import { useSharpFlowStore } from '../../store/useSharpFlowStore'
import { ThemeToggle } from '../../components/ThemeToggle'

interface AuthGateProps {
  children: ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const hasMounted = useHasMounted()
  // Start with loading state, but will transition to ready after mount or timeout
  const [status, setStatus] = useState<'loading' | 'ready' | 'offline'>('loading')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isGuestMode, setIsGuestMode] = useState(false)
  const initializeUser = useSharpFlowStore((state) => state.initializeUser)

  const isOfflineMode = !supabase

  // Use ref to store current session without triggering re-renders
  const currentSessionRef = useRef<Awaited<ReturnType<typeof getCurrentSession>> | null>(null)

  useEffect(() => {
    if (!isOfflineMode) {
      (async () => {
        try {
          currentSessionRef.current = await getCurrentSession()
        } catch {
          // Ignore errors - will be handled by auth state listener
        }
      })()
    }

    const unsubscribe = onAuthStateChange(async (_event, session) => {
      // Debounce auth state changes to avoid rapid updates during redirect
      setTimeout(() => {
        setUserEmail(session?.user?.email ?? null)
        if (session?.user?.id) {
          setIsGuestMode(false)
          void initializeUser(session.user.id)
        } else {
          // Session ended - only update if not already in guest mode or loading
          if (!isGuestMode && status === 'ready') {
            setUserEmail(null)
            void initializeUser(null)
          }
        }
      }, 500)
    })

    return unsubscribe
  }, [hasMounted, isOfflineMode])

  // Restore state from pre-loaded session in a separate effect
  useEffect(() => {
    if (!isOfflineMode && currentSessionRef.current?.data.session?.user?.id) {
      setUserEmail(currentSessionRef.current.data.session.user.email ?? null)
      setIsGuestMode(false)
      void initializeUser(currentSessionRef.current.data.session.user.id)
    } else if (
      !currentSessionRef.current?.data.session?.user?.email && 
      !isGuestMode && 
      status === 'ready'
    ) {
      // No session - show login screen
      setUserEmail(null)
      void initializeUser(null)
    }

    // Transition to ready state after mount or timeout - prevents stuck loading screen
    if (hasMounted && !isOfflineMode) {
      const timer = setTimeout(() => void setStatus('ready'), 100)
      return () => clearTimeout(timer)
    } else if (!hasMounted) {
      // Clean up on unmount - prevent memory leaks and stuck states
      if (status === 'loading') {
        void setStatus('ready')
      }
    }

    return () => {
      // Cleanup function for the component
      if (status === 'loading') {
        void setStatus('ready')
      }
    }
  }, [isOfflineMode, isGuestMode, status])

  const handleEmailSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email) return
    const result = await signInWithEmail(email)
    setMessage(result.error ? result.error.message : 'Check your inbox for a sign-in link.')
  }

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle()
    if (result.error) {
      setMessage(result.error.message)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setUserEmail(null)
    setIsGuestMode(false)
    void initializeUser(null)
  }

  const handleGuestMode = () => {
    setIsGuestMode(true)
    setStatus('ready')
  }

  const handleExitGuestMode = () => {
    // Clear guest mode state and show login screen again
    setIsGuestMode(false)
    setUserEmail(null)
    void initializeUser(null)
  }

  if (!hasMounted) {
    return null
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p className="rounded-3xl border border-white/10 bg-slate-900/80 px-6 py-5 text-sm text-slate-200 shadow-xl shadow-black/20">
          Loading SharpFlow...
        </p>
      </div>
    )
  }

  if (!userEmail && supabase && !isGuestMode) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-8 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200/20 bg-white/95 p-8 shadow-glow ring-1 ring-slate-200/30 dark:border-white/10 dark:bg-slate-900/90">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Sign in to SharpFlow</h1>
              <p className="mt-3 text-slate-600 dark:text-slate-400">Use secure email sign-in or Google sign-in. Your task progress is private and lightweight.</p>
            </div>
            <ThemeToggle />
          </div>
          <form className="mt-8 grid gap-4" onSubmit={handleEmailSignIn}>
            <label className="block text-sm font-semibold text-slate-300" htmlFor="email-signin">
              Email address
            </label>
            <input
              id="email-signin"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/70 focus:ring-2 focus:ring-sky-400/10"
            />
            <button className="rounded-3xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-400/20 transition hover:brightness-110">
              Send sign-in link
            </button>
          </form>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="rounded-3xl border border-white/10 bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Sign in with Google
            </button>
            <button
              type="button"
              onClick={handleGuestMode}
              className="rounded-3xl bg-slate-700 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-600"
            >
              Use guest mode
            </button>
          </div>
          {message ? <p className="mt-4 text-sm text-amber-300">{message}</p> : null}
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
          {/* Sign out button - always shown when user is signed in */}
          {supabase && userEmail && (
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-3xl bg-slate-800 px-4 py-2 text-sm text-white transition hover:bg-slate-700"
            >
              Sign out
            </button>
          )}
          {/* Exit Guest Mode button - only shown in guest mode */}
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