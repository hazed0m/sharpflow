export type TaskStatus = 'active' | 'pending' | 'ash' | 'completed'

export interface TaskItem {
  id: string
  title: string
  status: TaskStatus
  createdAt: number
  timerMinutes: number
  extensions: number
  userId?: string
}

export type MemoryType = 'note' | 'reflection' | 'win'

export interface MemoryEntry {
  id: string
  text: string
  type: MemoryType
  createdAt: number
  userId?: string
}

export type CharacterMood = 'calm' | 'focused' | 'cheerful' | 'concerned'
