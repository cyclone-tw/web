import { useState, useCallback } from 'react'
import type { Task } from '../types'
import { loadTasks, saveTasks } from '../services/storage'
import { generateId } from '../utils/id'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks())
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  const addTask = useCallback((title: string, estimatedPomos: number = 1) => {
    setTasks(prev => {
      const next = [...prev, {
        id: generateId(),
        title,
        estimatedPomos,
        completedPomos: 0,
        completed: false,
        createdAt: new Date().toISOString(),
      }]
      saveTasks(next)
      return next
    })
  }, [])

  const removeTask = useCallback((id: string) => {
    setTasks(prev => {
      const next = prev.filter(t => t.id !== id)
      saveTasks(next)
      return next
    })
    setActiveTaskId(prev => prev === id ? null : prev)
  }, [])

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => {
      const next = prev.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
      saveTasks(next)
      return next
    })
  }, [])

  const incrementPomo = useCallback((id: string) => {
    setTasks(prev => {
      const next = prev.map(t =>
        t.id === id ? { ...t, completedPomos: t.completedPomos + 1 } : t
      )
      saveTasks(next)
      return next
    })
  }, [])

  const updateTask = useCallback((id: string, updates: Partial<Pick<Task, 'title' | 'estimatedPomos'>>) => {
    setTasks(prev => {
      const next = prev.map(t =>
        t.id === id ? { ...t, ...updates } : t
      )
      saveTasks(next)
      return next
    })
  }, [])

  const clearCompleted = useCallback(() => {
    setTasks(prev => {
      const next = prev.filter(t => !t.completed)
      saveTasks(next)
      return next
    })
  }, [])

  return {
    tasks,
    activeTaskId,
    setActiveTaskId,
    addTask,
    removeTask,
    toggleTask,
    incrementPomo,
    updateTask,
    clearCompleted,
    setTasks,
  }
}
