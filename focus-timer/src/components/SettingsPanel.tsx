import { useState } from 'react'
import type { TimerSettings, ThemeColors, ThemeConfig } from '../types'
import { exportData, importData } from '../services/storage'

interface Props {
  settings: TimerSettings
  onSaveSettings: (s: TimerSettings) => void
  presets: ThemeConfig[]
  currentThemeIndex: number
  activeColors: ThemeColors
  onSelectPreset: (i: number) => void
  onUpdateColor: (key: keyof ThemeColors, value: string) => void
  onResetCustom: () => void
  onClose: () => void
}

const COLOR_LABELS: Record<keyof ThemeColors, string> = {
  primary: '主色調',
  background: '背景色',
  surface: '面板色',
  surfaceAlt: '面板副色',
  text: '文字色',
  textSecondary: '次要文字',
  accent: '強調色',
  success: '成功色',
  warning: '警告色',
  danger: '危險色',
  border: '邊框色',
}

export function SettingsPanel({
  settings,
  onSaveSettings,
  presets,
  currentThemeIndex,
  activeColors,
  onSelectPreset,
  onUpdateColor,
  onResetCustom,
  onClose,
}: Props) {
  const [local, setLocal] = useState(settings)
  const [tab, setTab] = useState<'timer' | 'theme' | 'data'>('timer')

  const handleSave = () => {
    onSaveSettings(local)
    onClose()
  }

  const handleExport = () => {
    const json = exportData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `focus-timer-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        try {
          importData(reader.result as string)
          window.location.reload()
        } catch {
          alert('匯入失敗：檔案格式錯誤')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h2>設定</h2>
          <button className="btn-icon" onClick={onClose}>×</button>
        </div>

        <div className="settings-tabs">
          <button
            className={`settings-tab ${tab === 'timer' ? 'active' : ''}`}
            onClick={() => setTab('timer')}
          >
            計時器
          </button>
          <button
            className={`settings-tab ${tab === 'theme' ? 'active' : ''}`}
            onClick={() => setTab('theme')}
          >
            主題
          </button>
          <button
            className={`settings-tab ${tab === 'data' ? 'active' : ''}`}
            onClick={() => setTab('data')}
          >
            資料
          </button>
        </div>

        <div className="settings-body">
          {tab === 'timer' && (
            <div className="settings-section">
              <label className="setting-row">
                <span>工作時長（分鐘）</span>
                <input
                  type="number"
                  className="input input-sm"
                  min={1}
                  max={120}
                  value={local.workDuration}
                  onChange={e => setLocal(p => ({ ...p, workDuration: parseInt(e.target.value) || 25 }))}
                />
              </label>
              <label className="setting-row">
                <span>短休息（分鐘）</span>
                <input
                  type="number"
                  className="input input-sm"
                  min={1}
                  max={30}
                  value={local.shortBreakDuration}
                  onChange={e => setLocal(p => ({ ...p, shortBreakDuration: parseInt(e.target.value) || 5 }))}
                />
              </label>
              <label className="setting-row">
                <span>長休息（分鐘）</span>
                <input
                  type="number"
                  className="input input-sm"
                  min={1}
                  max={60}
                  value={local.longBreakDuration}
                  onChange={e => setLocal(p => ({ ...p, longBreakDuration: parseInt(e.target.value) || 15 }))}
                />
              </label>
              <label className="setting-row">
                <span>長休息間隔（每 N 輪）</span>
                <input
                  type="number"
                  className="input input-sm"
                  min={2}
                  max={10}
                  value={local.longBreakInterval}
                  onChange={e => setLocal(p => ({ ...p, longBreakInterval: parseInt(e.target.value) || 4 }))}
                />
              </label>
              <label className="setting-row">
                <span>自動開始休息</span>
                <input
                  type="checkbox"
                  checked={local.autoStartBreaks}
                  onChange={e => setLocal(p => ({ ...p, autoStartBreaks: e.target.checked }))}
                />
              </label>
              <label className="setting-row">
                <span>自動開始工作</span>
                <input
                  type="checkbox"
                  checked={local.autoStartWork}
                  onChange={e => setLocal(p => ({ ...p, autoStartWork: e.target.checked }))}
                />
              </label>
              <button className="btn btn-primary" onClick={handleSave}>
                儲存設定
              </button>
            </div>
          )}

          {tab === 'theme' && (
            <div className="settings-section">
              <h3>預設主題</h3>
              <div className="preset-grid">
                {presets.map((preset, i) => (
                  <button
                    key={i}
                    className={`preset-card ${i === currentThemeIndex ? 'active' : ''}`}
                    onClick={() => onSelectPreset(i)}
                  >
                    <div className="preset-colors">
                      <span style={{ background: preset.colors.primary }} />
                      <span style={{ background: preset.colors.background }} />
                      <span style={{ background: preset.colors.surface }} />
                      <span style={{ background: preset.colors.accent }} />
                    </div>
                    <span className="preset-name">{preset.name}</span>
                  </button>
                ))}
              </div>

              <h3>自訂色碼</h3>
              <div className="color-grid">
                {(Object.keys(COLOR_LABELS) as (keyof ThemeColors)[]).map(key => (
                  <label key={key} className="color-row">
                    <span>{COLOR_LABELS[key]}</span>
                    <div className="color-input-group">
                      <input
                        type="color"
                        value={activeColors[key]}
                        onChange={e => onUpdateColor(key, e.target.value)}
                      />
                      <input
                        type="text"
                        className="input input-xs"
                        value={activeColors[key]}
                        onChange={e => onUpdateColor(key, e.target.value)}
                      />
                    </div>
                  </label>
                ))}
              </div>
              <button className="btn btn-ghost" onClick={onResetCustom}>
                重置自訂色彩
              </button>
            </div>
          )}

          {tab === 'data' && (
            <div className="settings-section">
              <h3>資料管理</h3>
              <p className="text-secondary">匯出或匯入你的番茄鐘資料（設定、任務、記錄）。</p>
              <div className="data-actions">
                <button className="btn btn-primary" onClick={handleExport}>
                  匯出 JSON
                </button>
                <button className="btn btn-ghost" onClick={handleImport}>
                  匯入 JSON
                </button>
              </div>
              <h3>Supabase 雲端同步</h3>
              <p className="text-secondary">
                在 <code>.env</code> 中設定 <code>VITE_SUPABASE_URL</code> 和 <code>VITE_SUPABASE_ANON_KEY</code>，
                或通過 URL 參數 <code>?supabaseUrl=...&supabaseKey=...</code> 傳入。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
