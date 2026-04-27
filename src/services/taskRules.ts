const taskTriggers = [
  'later',
  'maybe',
  'someday',
  'could',
  'should',
  'might',
  'if I',
  'if you',
  'research',
  'learn more',
  'find out',
  'plan to',
  'think about',
]

const verbPattern = /\b(do|write|call|send|review|finish|prepare|draft|plan|schedule|clean|organize|buy|update|fix|test|build|share|submit|set up|start|complete|reply|record)\b/i

export function normalizeTaskText(text: string) {
  return text.trim().replace(/\s+/g, ' ')
}

export function validateActionableTask(text: string) {
  const cleaned = normalizeTaskText(text)
  if (!cleaned) {
    return { valid: false, message: 'Please enter a short, concrete next step.' }
  }

  if (cleaned.length < 15) {
    return { valid: false, message: 'Make it more specific so it is easy to start.' }
  }

  if (!verbPattern.test(cleaned)) {
    return {
      valid: false,
      message: 'Use a clear action word: do, call, write, finish, send, or review.',
    }
  }

  const lower = cleaned.toLowerCase()
  if (taskTriggers.some((trigger) => lower.includes(trigger))) {
    return {
      valid: false,
      message:
        'This sounds vague. Rewrite it as a single, actionable step you can start now.',
    }
  }

  if (cleaned.includes('?')) {
    return {
      valid: false,
      message: 'Turn questions into the next action you can complete right away.',
    }
  }

  return { valid: true, message: '' }
}
