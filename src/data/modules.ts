export interface FocusModule {
  id: string
  name: string
  description: string
  prompt: string
  tone: 'calm' | 'focused' | 'cheerful' | 'concerned'
}

export const focusModules: FocusModule[] = [
  {
    id: 'classic',
    name: 'Classic Flow',
    description: 'The original SharpFlow ritual: one task, one timer, one clear step.',
    prompt: 'Start with one focused task that feels clear.',
    tone: 'calm',
  },
  {
    id: 'quick-start',
    name: 'Quick Start',
    description: 'A short, high-energy mode for when you need immediate momentum.',
    prompt: 'Choose a task you can begin in the next minute.',
    tone: 'focused',
  },
  {
    id: 'recovery',
    name: 'Recovery',
    description: 'A gentler reset after a burned task or a stale session.',
    prompt: 'Focus on the smallest next step and keep the pressure kind.',
    tone: 'cheerful',
  },
]
