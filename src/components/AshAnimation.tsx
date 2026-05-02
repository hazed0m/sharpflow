import { AnimatePresence, motion } from 'framer-motion'

interface AshAnimationProps {
  visible: boolean
}

export function AshAnimation({ visible }: AshAnimationProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35 }}
          className="pointer-events-none absolute inset-x-0 top-0 mx-auto flex w-full max-w-xl justify-center"
        >
          <div className="rounded-full border border-rose-300 bg-rose-100 px-4 py-2 text-sm text-rose-800 shadow-lg shadow-rose-200/50 backdrop-blur-sm dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-100 dark:shadow-rose-500/20">
            💨 Task burned. Ashes are tracked here to help you learn faster.
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
