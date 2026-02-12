import type { TimerState, TimerPhase } from '../types'
import { formatTime } from '../utils/time'

interface Props {
  state: TimerState
  totalDurationSeconds: number
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onSkip: () => void
  onSwitchPhase: (phase: TimerPhase) => void
}

const PHASE_LABELS: Record<TimerPhase, string> = {
  work: '專注',
  shortBreak: '短休息',
  longBreak: '長休息',
}

export function TimerDisplay({
  state,
  totalDurationSeconds,
  onStart,
  onPause,
  onResume,
  onReset,
  onSkip,
  onSwitchPhase,
}: Props) {
  const progress = 1 - state.remainingSeconds / totalDurationSeconds
  const circumference = 2 * Math.PI * 120
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div className="timer-display">
      <div className="phase-tabs">
        {(['work', 'shortBreak', 'longBreak'] as TimerPhase[]).map(phase => (
          <button
            key={phase}
            className={`phase-tab ${state.phase === phase ? 'active' : ''}`}
            onClick={() => onSwitchPhase(phase)}
            disabled={state.status === 'running'}
          >
            {PHASE_LABELS[phase]}
          </button>
        ))}
      </div>

      <div className="timer-ring-container">
        <svg className="timer-ring" viewBox="0 0 260 260">
          <circle
            className="timer-ring-bg"
            cx="130"
            cy="130"
            r="120"
            fill="none"
            strokeWidth="6"
          />
          <circle
            className="timer-ring-progress"
            cx="130"
            cy="130"
            r="120"
            fill="none"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 130 130)"
          />
        </svg>
        <div className="timer-center">
          <div className="timer-time">{formatTime(state.remainingSeconds)}</div>
          <div className="timer-phase-label">{PHASE_LABELS[state.phase]}</div>
          <div className="timer-session">
            第 {state.currentSession} 輪 · 已完成 {state.totalWorkSessions} 個番茄
          </div>
        </div>
      </div>

      <div className="timer-controls">
        {state.status === 'idle' && (
          <button className="btn btn-primary btn-lg" onClick={onStart}>
            開始
          </button>
        )}
        {state.status === 'running' && (
          <button className="btn btn-warning btn-lg" onClick={onPause}>
            暫停
          </button>
        )}
        {state.status === 'paused' && (
          <>
            <button className="btn btn-primary btn-lg" onClick={onResume}>
              繼續
            </button>
            <button className="btn btn-ghost" onClick={onReset}>
              重置
            </button>
          </>
        )}
        {state.status !== 'idle' && (
          <button className="btn btn-ghost" onClick={onSkip}>
            跳過
          </button>
        )}
      </div>
    </div>
  )
}
