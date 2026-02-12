// Timer types
export type TimerPhase = 'work' | 'shortBreak' | 'longBreak'
export type TimerStatus = 'idle' | 'running' | 'paused'

export interface TimerSettings {
  workDuration: number      // minutes
  shortBreakDuration: number // minutes
  longBreakDuration: number  // minutes
  longBreakInterval: number  // every N work sessions
  autoStartBreaks: boolean
  autoStartWork: boolean
}

export interface TimerState {
  phase: TimerPhase
  status: TimerStatus
  remainingSeconds: number
  currentSession: number    // which work session we're on (1-based)
  totalWorkSessions: number // completed work sessions today
}

// Task types
export interface Task {
  id: string
  title: string
  estimatedPomos: number
  completedPomos: number
  completed: boolean
  createdAt: string
}

// Stats types
export interface PomodoroRecord {
  id: string
  taskId: string | null
  startedAt: string
  completedAt: string
  duration: number // actual minutes
  phase: TimerPhase
}

export interface DailyStats {
  date: string // YYYY-MM-DD
  totalPomos: number
  totalWorkMinutes: number
  totalBreakMinutes: number
}

// Theme types
export interface ThemeColors {
  primary: string
  background: string
  surface: string
  surfaceAlt: string
  text: string
  textSecondary: string
  accent: string
  success: string
  warning: string
  danger: string
  border: string
}

export interface ThemeConfig {
  name: string
  colors: ThemeColors
}

// App config passed via URL params or widget attributes
export interface AppConfig {
  theme?: Partial<ThemeColors>
  workDuration?: number
  shortBreakDuration?: number
  longBreakDuration?: number
  longBreakInterval?: number
  supabaseUrl?: string
  supabaseKey?: string
  compact?: boolean
}
