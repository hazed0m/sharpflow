import { create } from 'zustand'
import {
  fetchUserMemories,
  fetchUserTasks,
  upsertMemory,
  upsertTask,
} from '../services/supabase'
import type { MemoryEntry, TaskItem, CharacterMood } from '../types'

const STORAGE_KEY = 'sharpflow-state-v1'

interface SharpFlowState {
  tasks: TaskItem[]
  memories: MemoryEntry[]
  ash: TaskItem[]
  mood: CharacterMood
  prompt: string
  activeTaskId: string | null
  selectedModuleId: string
  userId: string | null
  initializeUser: (userId: string | null) => Promise<void>
  addTask: (title: string) => void
  completeTask: () => void
  skipTask: () => void
  extendTask: () => void
  burnActiveTask: () => void
  addMemory: (text: string, type: MemoryEntry['type']) => void
  setMood: (mood: CharacterMood) => void
  setPrompt: (prompt: string) => void
  setSelectedModule: (moduleId: string) => void
}

const hydrateState = (): Omit<SharpFlowState, keyof Pick<SharpFlowState, 'initializeUser' | 'addTask' | 'completeTask' | 'skipTask' | 'extendTask' | 'burnActiveTask' | 'addMemory' | 'setMood' | 'setPrompt' | 'setSelectedModule'>> => {
  if (typeof window === 'undefined') {
    return {
      tasks: [],
      memories: [],
      ash: [],
      mood: 'calm',
      prompt: 'Start with one focused task that feels clear.',
      activeTaskId: null,
      selectedModuleId: 'classic',
      userId: null,
    }
  }

  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (!saved) {
    return {
      tasks: [],
      memories: [],
      ash: [],
      mood: 'calm',
      prompt: 'Start with one focused task that feels clear.',
      activeTaskId: null,
      selectedModuleId: 'classic',
      userId: null,
    }
  }

  try {
    const parsed = JSON.parse(saved) as Omit<SharpFlowState, 'initializeUser' | 'addTask' | 'completeTask' | 'skipTask' | 'extendTask' | 'burnActiveTask' | 'addMemory' | 'setMood' | 'setPrompt' | 'setSelectedModule'>
    return {
      ...parsed,
      selectedModuleId: (parsed as { selectedModuleId?: string }).selectedModuleId ?? 'classic',
      userId: null,
    }
  } catch {
    return {
      tasks: [],
      memories: [],
      ash: [],
      mood: 'calm',
      prompt: 'Start with one focused task that feels clear.',
      activeTaskId: null,
      selectedModuleId: 'classic',
      userId: null,
    }
  }
}

function saveState(state: Omit<SharpFlowState, 'initializeUser' | 'addTask' | 'completeTask' | 'skipTask' | 'extendTask' | 'burnActiveTask' | 'addMemory' | 'setMood' | 'setPrompt' | 'setSelectedModule' | 'userId'>) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const useSharpFlowStore = create<SharpFlowState>((set, get) => {
  const baseState = hydrateState()

  const save = () => {
    const { tasks, memories, ash, mood, prompt, activeTaskId, selectedModuleId } = get()
    saveState({ tasks, memories, ash, mood, prompt, activeTaskId, selectedModuleId })
  }

  return {
    ...baseState,
    userId: null,
    async initializeUser(userId) {
      set(() => ({ userId }))
      if (!userId) return

      const localState = get()
      const [tasksResult, memoriesResult] = await Promise.all([
        fetchUserTasks(userId),
        fetchUserMemories(userId),
      ])

      if (tasksResult.error || memoriesResult.error) {
        return
      }

      const remoteTasks = (tasksResult.data ?? []).map((item: Record<string, unknown>) => ({
        id: item.id as string,
        title: item.title as string,
        status: item.status as TaskItem['status'],
        createdAt: new Date(item.created_at as string).getTime(),
        timerMinutes: item.timer_minutes as number,
        extensions: item.extensions as number,
        userId: item.user_id as string,
      }))

      const remoteMemories = (memoriesResult.data ?? []).map((item: Record<string, unknown>) => ({
        id: item.id as string,
        text: item.text as string,
        type: item.type as MemoryEntry['type'],
        createdAt: new Date(item.created_at as string).getTime(),
        userId: item.user_id as string,
      }))

      if (remoteTasks.length > 0) {
        const activeTask = remoteTasks.find((task) => task.status === 'active')
        const nextPending = remoteTasks.find((task) => task.status === 'pending')
        set({ tasks: remoteTasks, activeTaskId: activeTask?.id ?? nextPending?.id ?? null })
      } else if (localState.tasks.length > 0) {
        await Promise.all(localState.tasks.map((task) => upsertTask(task, userId)))
      }

      if (remoteMemories.length > 0) {
        set({ memories: remoteMemories })
      } else if (localState.memories.length > 0) {
        await Promise.all(localState.memories.map((memory) => upsertMemory(memory, userId)))
      }

      save()
    },
    addTask(title) {
      const nextTask: TaskItem = {
        id: crypto.randomUUID(),
        title,
        status: get().activeTaskId ? 'pending' : 'active',
        createdAt: Date.now(),
        timerMinutes: 25,
        extensions: 0,
      }

      set((state) => {
        const queued = state.tasks.filter((task) => task.status !== 'ash' && task.status !== 'completed')
        if (queued.length >= 5) {
          return {
            prompt: 'Queue is full. Finish one task before adding another.',
          }
        }

        return {
          tasks: [...state.tasks, nextTask],
          activeTaskId: state.activeTaskId ?? nextTask.id,
          prompt: state.activeTaskId
            ? 'Your queue is waiting. Keep the focus screen open.'
            : 'Task ready. Begin the timer and act now.',
        }
      })
      save()
      const userId = get().userId
      if (userId) {
        void upsertTask(nextTask, userId)
      }
    },
    completeTask() {
      const updatedTasks: TaskItem[] = get().tasks.map((task) =>
        task.id === get().activeTaskId ? { ...task, status: 'completed' as TaskItem['status'] } : task,
      )
      const completedTask = updatedTasks.find((task) => task.id === get().activeTaskId)

      set((state) => {
        if (!state.activeTaskId) return state
        const nextPending = state.tasks.find((task) => task.status === 'pending')
        return {
          tasks: updatedTasks,
          activeTaskId: nextPending?.id ?? null,
          mood: 'cheerful',
          prompt: 'Nice work. Let the next task be crisp and quick.',
        }
      })
      save()
      const userId = get().userId
      if (userId && completedTask) {
        void upsertTask(completedTask, userId)
      }
    },
    skipTask() {
      const updatedTasks: TaskItem[] = get().tasks.map((task) =>
        task.id === get().activeTaskId ? { ...task, status: 'ash' as TaskItem['status'] } : task,
      )
      const skippedTask = updatedTasks.find((task) => task.id === get().activeTaskId)

      set((state) => {
        if (!state.activeTaskId) return state
        const nextPending = state.tasks.find((task) => task.status === 'pending')
        return {
          tasks: updatedTasks,
          ash: [
            ...state.ash,
            ...state.tasks.filter((task) => task.id === state.activeTaskId && task.status === 'active'),
          ],
          activeTaskId: nextPending?.id ?? null,
          mood: 'concerned',
          prompt: 'This one burned. Keep the next step clearer and shorter.',
        }
      })
      save()
      const userId = get().userId
      if (userId && skippedTask) {
        void upsertTask(skippedTask, userId)
      }
    },
    extendTask() {
      const activeTask = get().tasks.find((task) => task.id === get().activeTaskId)
      if (!activeTask || activeTask.extensions >= 2) {
        set(() => ({ prompt: 'Extension limit reached. Finish this cycle first.' }))
        return
      }

      const updatedTasks: TaskItem[] = get().tasks.map((task) =>
        task.id === get().activeTaskId
          ? { ...task, timerMinutes: task.timerMinutes + 5, extensions: task.extensions + 1 }
          : task,
      )
      const extendedTask = updatedTasks.find((task) => task.id === get().activeTaskId)

      set(() => ({ tasks: updatedTasks, prompt: 'Extra 5 minutes granted. Keep the next step tight.' }))
      save()
      const userId = get().userId
      if (userId && extendedTask) {
        void upsertTask(extendedTask, userId)
      }
    },
    burnActiveTask() {
      const updatedTasks: TaskItem[] = get().tasks.map((task) =>
        task.id === get().activeTaskId ? { ...task, status: 'ash' as TaskItem['status'] } : task,
      )
      const burnedTask = updatedTasks.find((task) => task.id === get().activeTaskId)
      const ashTask = get().tasks.find((task) => task.id === get().activeTaskId && task.status === 'active')
      const nextPending = get().tasks.find((task) => task.status === 'pending')

      set(() => ({
        tasks: updatedTasks,
        ash: ashTask ? [...get().ash, ashTask] : get().ash,
        activeTaskId: nextPending?.id ?? null,
        mood: 'concerned',
        prompt: 'The timer ended. Let the next attempt be sharper.',
      }))
      save()
      const userId = get().userId
      if (userId && burnedTask) {
        void upsertTask(burnedTask, userId)
      }
    },
    addMemory(text, type) {
      const newMemory: MemoryEntry = {
        id: crypto.randomUUID(),
        text,
        type,
        createdAt: Date.now(),
      }

      set((state) => ({
        memories: [...state.memories, newMemory],
        prompt: 'Memory saved. Reflecting is part of building momentum.',
      }))
      save()
      const userId = get().userId
      if (userId) {
        void upsertMemory(newMemory, userId)
      }
    },
    setMood(mood) {
      set(() => ({ mood }))
      save()
    },
    setPrompt(prompt) {
      set(() => ({ prompt }))
      save()
    },
    setSelectedModule(moduleId) {
      const modulePrompt = moduleId === 'quick-start'
        ? 'Choose a task you can begin in the next minute.'
        : moduleId === 'recovery'
        ? 'Focus on the smallest next step and keep the pressure kind.'
        : 'Start with one focused task that feels clear.'

      const mood: CharacterMood = moduleId === 'quick-start' ? 'focused' : moduleId === 'recovery' ? 'cheerful' : 'calm'

      set(() => ({ selectedModuleId: moduleId, prompt: modulePrompt, mood }))
      save()
    },
  }
})
