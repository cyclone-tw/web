import type { AppConfig, ThemeColors } from '../types'

const COLOR_KEYS: (keyof ThemeColors)[] = [
  'primary', 'background', 'surface', 'surfaceAlt',
  'text', 'textSecondary', 'accent', 'success',
  'warning', 'danger', 'border',
]

export function parseUrlConfig(): AppConfig {
  const params = new URLSearchParams(window.location.search)
  const config: AppConfig = {}

  // Parse theme colors
  const themeColors: Partial<ThemeColors> = {}
  let hasThemeColor = false
  for (const key of COLOR_KEYS) {
    const val = params.get(key)
    if (val) {
      themeColors[key] = val.startsWith('#') ? val : `#${val}`
      hasThemeColor = true
    }
  }
  if (hasThemeColor) config.theme = themeColors

  // Parse timer settings
  const work = params.get('work')
  if (work) config.workDuration = parseInt(work, 10)

  const shortBreak = params.get('shortBreak')
  if (shortBreak) config.shortBreakDuration = parseInt(shortBreak, 10)

  const longBreak = params.get('longBreak')
  if (longBreak) config.longBreakDuration = parseInt(longBreak, 10)

  const interval = params.get('longBreakInterval')
  if (interval) config.longBreakInterval = parseInt(interval, 10)

  // Parse Supabase config
  const sbUrl = params.get('supabaseUrl')
  if (sbUrl) config.supabaseUrl = sbUrl

  const sbKey = params.get('supabaseKey')
  if (sbKey) config.supabaseKey = sbKey

  // Compact mode
  if (params.get('compact') === 'true') config.compact = true

  return config
}
