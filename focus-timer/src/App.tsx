import { useState, useCallback, useEffect } from 'react'
import type { TimerSettings, PomodoroRecord, AppConfig } from './types'
import { useTimer } from './hooks/useTimer'
import { useTasks } from './hooks/useTasks'
import { useTheme } from './hooks/useTheme'
import { loadSettings, saveSettings, loadRecords } from './services/storage'
import { requestNotificationPermission } from './utils/sound'
import { TimerDisplay } from './components/TimerDisplay'
import { TaskList } from './components/TaskList'
import { StatsPanel } from './components/StatsPanel'
import { SettingsPanel } from './components/SettingsPanel'

interface Props {
  config?: AppConfig
}

export default function App({ config }: Props) {
  const [settings, setSettings] = useState<TimerSettings>(() => {
    const saved = loadSettings()
    return {
      ...saved,
      ...(config?.workDuration !== undefined && { workDuration: config.workDuration }),
      ...(config?.shortBreakDuration !== undefined && { shortBreakDuration: config.shortBreakDuration }),
      ...(config?.longBreakDuration !== undefined && { longBreakDuration: config.longBreakDuration }),
      ...(config?.longBreakInterval !== undefined && { longBreakInterval: config.longBreakInterval }),
    }
  })

  const [records, setRecords] = useState<PomodoroRecord[]>(() => loadRecords())
  const [showSettings, setShowSettings] = useState(false)

  const {
    tasks,
    activeTaskId,
    setActiveTaskId,
    addTask,
    removeTask,
    toggleTask,
    incrementPomo,
    updateTask,
    clearCompleted,
  } = useTasks()

  const handleRecordAdded = useCallback((updatedRecords: PomodoroRecord[]) => {
    setRecords(updatedRecords)
    // If there's an active task and this was a work session, increment pomo
    if (activeTaskId) {
      incrementPomo(activeTaskId)
    }
  }, [activeTaskId, incrementPomo])

  const {
    state: timerState,
    start,
    pause,
    resume,
    reset,
    skip,
    switchPhase,
  } = useTimer(settings, activeTaskId, handleRecordAdded)

  const {
    presets,
    currentThemeIndex,
    activeColors,
    selectPreset,
    updateColor,
    resetCustom,
  } = useTheme(config?.theme)

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  const handleSaveSettings = useCallback((newSettings: TimerSettings) => {
    setSettings(newSettings)
    saveSettings(newSettings)
  }, [])

  const totalDurationSeconds = (() => {
    switch (timerState.phase) {
      case 'work': return settings.workDuration * 60
      case 'shortBreak': return settings.shortBreakDuration * 60
      case 'longBreak': return settings.longBreakDuration * 60
    }
  })()

  const activeTask = tasks.find(t => t.id === activeTaskId)

  return (
    <div className={`app ${config?.compact ? 'compact' : ''}`}>
      <header className="app-header">
        <div className="app-logo">
          <img src="./tomato.svg" alt="" width="28" height="28" />
          <h1>Focus Timer</h1>
        </div>
        <div className="header-right">
          {activeTask && (
            <span className="active-task-badge">
              目前任務：{activeTask.title}
            </span>
          )}
          <button
            className="btn btn-ghost"
            onClick={() => setShowSettings(true)}
            aria-label="設定"
          >
            ⚙
          </button>
        </div>
      </header>

      <main className="dashboard">
        <section className="dashboard-left">
          <TimerDisplay
            state={timerState}
            totalDurationSeconds={totalDurationSeconds}
            onStart={start}
            onPause={pause}
            onResume={resume}
            onReset={reset}
            onSkip={skip}
            onSwitchPhase={switchPhase}
          />
        </section>

        <section className="dashboard-center">
          <TaskList
            tasks={tasks}
            activeTaskId={activeTaskId}
            onSetActive={setActiveTaskId}
            onAdd={addTask}
            onRemove={removeTask}
            onToggle={toggleTask}
            onUpdate={updateTask}
            onClearCompleted={clearCompleted}
          />
        </section>

        <section className="dashboard-right">
          <StatsPanel records={records} />
        </section>
      </main>

      {showSettings && (
        <SettingsPanel
          settings={settings}
          onSaveSettings={handleSaveSettings}
          presets={presets}
          currentThemeIndex={currentThemeIndex}
          activeColors={activeColors}
          onSelectPreset={selectPreset}
          onUpdateColor={updateColor}
          onResetCustom={resetCustom}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
