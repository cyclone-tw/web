import type { Task, PomodoroRecord, TimerSettings, ThemeColors } from '../types'
import { getSupabase } from './supabase'

const KEYS = {
  settings: 'focus-timer:settings',
  tasks: 'focus-timer:tasks',
  records: 'focus-timer:records',
  theme: 'focus-timer:theme',
} as const

// ── Local Storage helpers ──

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : fallback
  } catch {
    return fallback
  }
}

function saveLocal<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data))
}

// ── Settings ──

const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartWork: false,
}

export function loadSettings(): TimerSettings {
  return loadLocal(KEYS.settings, DEFAULT_SETTINGS)
}

export function saveSettings(settings: TimerSettings): void {
  saveLocal(KEYS.settings, settings)
  syncSettingsToCloud(settings)
}

// ── Tasks ──

export function loadTasks(): Task[] {
  return loadLocal(KEYS.tasks, [])
}

export function saveTasks(tasks: Task[]): void {
  saveLocal(KEYS.tasks, tasks)
  syncTasksToCloud(tasks)
}

// ── Records ──

export function loadRecords(): PomodoroRecord[] {
  return loadLocal(KEYS.records, [])
}

export function saveRecords(records: PomodoroRecord[]): void {
  saveLocal(KEYS.records, records)
  syncRecordsToCloud(records)
}

export function addRecord(record: PomodoroRecord): PomodoroRecord[] {
  const records = loadRecords()
  records.push(record)
  saveRecords(records)
  return records
}

// ── Theme ──

export function loadThemeColors(): Partial<ThemeColors> | null {
  return loadLocal<Partial<ThemeColors> | null>(KEYS.theme, null)
}

export function saveThemeColors(colors: Partial<ThemeColors>): void {
  saveLocal(KEYS.theme, colors)
}

// ── Supabase cloud sync ──

async function syncSettingsToCloud(settings: TimerSettings): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  try {
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return
    await sb.from('settings').upsert({
      user_id: user.id,
      data: settings,
      updated_at: new Date().toISOString(),
    })
  } catch {
    // Silently fail – local storage is the fallback
  }
}

async function syncTasksToCloud(tasks: Task[]): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  try {
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return
    await sb.from('tasks').upsert({
      user_id: user.id,
      data: tasks,
      updated_at: new Date().toISOString(),
    })
  } catch {
    // Silently fail
  }
}

async function syncRecordsToCloud(records: PomodoroRecord[]): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  try {
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return
    await sb.from('records').upsert({
      user_id: user.id,
      data: records,
      updated_at: new Date().toISOString(),
    })
  } catch {
    // Silently fail
  }
}

export async function pullFromCloud(): Promise<{
  settings?: TimerSettings
  tasks?: Task[]
  records?: PomodoroRecord[]
} | null> {
  const sb = getSupabase()
  if (!sb) return null
  try {
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return null

    const [settingsRes, tasksRes, recordsRes] = await Promise.all([
      sb.from('settings').select('data').eq('user_id', user.id).single(),
      sb.from('tasks').select('data').eq('user_id', user.id).single(),
      sb.from('records').select('data').eq('user_id', user.id).single(),
    ])

    return {
      settings: settingsRes.data?.data as TimerSettings | undefined,
      tasks: tasksRes.data?.data as Task[] | undefined,
      records: recordsRes.data?.data as PomodoroRecord[] | undefined,
    }
  } catch {
    return null
  }
}

// ── Export / Import ──

export function exportData(): string {
  return JSON.stringify({
    settings: loadSettings(),
    tasks: loadTasks(),
    records: loadRecords(),
    theme: loadThemeColors(),
    exportedAt: new Date().toISOString(),
  }, null, 2)
}

export function importData(json: string): void {
  const data = JSON.parse(json) as {
    settings?: TimerSettings
    tasks?: Task[]
    records?: PomodoroRecord[]
    theme?: Partial<ThemeColors>
  }
  if (data.settings) saveLocal(KEYS.settings, data.settings)
  if (data.tasks) saveLocal(KEYS.tasks, data.tasks)
  if (data.records) saveLocal(KEYS.records, data.records)
  if (data.theme) saveLocal(KEYS.theme, data.theme)
}
