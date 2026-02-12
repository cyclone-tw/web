import { useState, useRef, useCallback, useEffect } from 'react'
import type { TimerState, TimerPhase, TimerSettings, PomodoroRecord } from '../types'
import { playWorkComplete, playBreakComplete } from '../utils/sound'
import { sendNotification } from '../utils/sound'
import { generateId } from '../utils/id'
import { addRecord } from '../services/storage'

function getDuration(phase: TimerPhase, settings: TimerSettings): number {
  switch (phase) {
    case 'work': return settings.workDuration * 60
    case 'shortBreak': return settings.shortBreakDuration * 60
    case 'longBreak': return settings.longBreakDuration * 60
  }
}

export function useTimer(
  settings: TimerSettings,
  activeTaskId: string | null,
  onRecordAdded: (records: PomodoroRecord[]) => void,
) {
  const [state, setState] = useState<TimerState>({
    phase: 'work',
    status: 'idle',
    remainingSeconds: getDuration('work', settings),
    currentSession: 1,
    totalWorkSessions: 0,
  })

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const phaseStartRef = useRef<string | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Update remaining time when settings change and timer is idle
  useEffect(() => {
    if (state.status === 'idle') {
      setState(prev => ({
        ...prev,
        remainingSeconds: getDuration(prev.phase, settings),
      }))
    }
  }, [settings, state.status])

  const completePhase = useCallback(() => {
    clearTimer()

    setState(prev => {
      const now = new Date().toISOString()

      // Record completed pomodoro
      if (phaseStartRef.current) {
        const record: PomodoroRecord = {
          id: generateId(),
          taskId: prev.phase === 'work' ? activeTaskId : null,
          startedAt: phaseStartRef.current,
          completedAt: now,
          duration: prev.phase === 'work' ? settings.workDuration :
            prev.phase === 'shortBreak' ? settings.shortBreakDuration :
              settings.longBreakDuration,
          phase: prev.phase,
        }
        const updated = addRecord(record)
        onRecordAdded(updated)
      }

      if (prev.phase === 'work') {
        playWorkComplete()
        sendNotification('工作階段完成!', '休息一下吧')

        const newTotal = prev.totalWorkSessions + 1
        const isLongBreak = newTotal % settings.longBreakInterval === 0
        const nextPhase: TimerPhase = isLongBreak ? 'longBreak' : 'shortBreak'

        return {
          phase: nextPhase,
          status: settings.autoStartBreaks ? 'running' : 'idle',
          remainingSeconds: getDuration(nextPhase, settings),
          currentSession: prev.currentSession,
          totalWorkSessions: newTotal,
        }
      } else {
        playBreakComplete()
        sendNotification('休息結束!', '開始下一輪專注')

        const nextSession = prev.phase === 'longBreak' ? 1 : prev.currentSession + 1

        return {
          phase: 'work',
          status: settings.autoStartWork ? 'running' : 'idle',
          remainingSeconds: getDuration('work', settings),
          currentSession: nextSession,
          totalWorkSessions: prev.totalWorkSessions,
        }
      }
    })
  }, [clearTimer, settings, activeTaskId, onRecordAdded])

  const tick = useCallback(() => {
    setState(prev => {
      if (prev.remainingSeconds <= 1) {
        // Will complete on next cycle
        return { ...prev, remainingSeconds: 0 }
      }
      return { ...prev, remainingSeconds: prev.remainingSeconds - 1 }
    })
  }, [])

  // Watch for 0 remaining to complete phase
  useEffect(() => {
    if (state.remainingSeconds === 0 && state.status === 'running') {
      completePhase()
    }
  }, [state.remainingSeconds, state.status, completePhase])

  // Auto-start after phase transition
  useEffect(() => {
    if (state.status === 'running' && !intervalRef.current) {
      phaseStartRef.current = new Date().toISOString()
      intervalRef.current = setInterval(tick, 1000)
    }
  }, [state.status, tick])

  const start = useCallback(() => {
    if (state.status === 'running') return
    phaseStartRef.current = new Date().toISOString()
    setState(prev => ({ ...prev, status: 'running' }))
    intervalRef.current = setInterval(tick, 1000)
  }, [state.status, tick])

  const pause = useCallback(() => {
    clearTimer()
    setState(prev => ({ ...prev, status: 'paused' }))
  }, [clearTimer])

  const resume = useCallback(() => {
    setState(prev => ({ ...prev, status: 'running' }))
    intervalRef.current = setInterval(tick, 1000)
  }, [tick])

  const reset = useCallback(() => {
    clearTimer()
    phaseStartRef.current = null
    setState(prev => ({
      ...prev,
      status: 'idle',
      remainingSeconds: getDuration(prev.phase, settings),
    }))
  }, [clearTimer, settings])

  const skip = useCallback(() => {
    completePhase()
  }, [completePhase])

  const switchPhase = useCallback((phase: TimerPhase) => {
    clearTimer()
    phaseStartRef.current = null
    setState(prev => ({
      ...prev,
      phase,
      status: 'idle',
      remainingSeconds: getDuration(phase, settings),
    }))
  }, [clearTimer, settings])

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  // Update document title
  useEffect(() => {
    const phaseLabels: Record<TimerPhase, string> = {
      work: '專注',
      shortBreak: '短休息',
      longBreak: '長休息',
    }
    const m = Math.floor(state.remainingSeconds / 60)
    const s = state.remainingSeconds % 60
    const timeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    document.title = state.status === 'idle'
      ? 'Focus Timer - 專注計時器'
      : `${timeStr} - ${phaseLabels[state.phase]}`
  }, [state.remainingSeconds, state.phase, state.status])

  return {
    state,
    start,
    pause,
    resume,
    reset,
    skip,
    switchPhase,
  }
}
