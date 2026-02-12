import { useState } from 'react'
import type { Task } from '../types'

interface Props {
  tasks: Task[]
  activeTaskId: string | null
  onSetActive: (id: string | null) => void
  onAdd: (title: string, estimatedPomos: number) => void
  onRemove: (id: string) => void
  onToggle: (id: string) => void
  onUpdate: (id: string, updates: Partial<Pick<Task, 'title' | 'estimatedPomos'>>) => void
  onClearCompleted: () => void
}

export function TaskList({
  tasks,
  activeTaskId,
  onSetActive,
  onAdd,
  onRemove,
  onToggle,
  onUpdate,
  onClearCompleted,
}: Props) {
  const [newTitle, setNewTitle] = useState('')
  const [newPomos, setNewPomos] = useState(1)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const handleAdd = () => {
    const trimmed = newTitle.trim()
    if (!trimmed) return
    onAdd(trimmed, newPomos)
    setNewTitle('')
    setNewPomos(1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
  }

  const startEdit = (task: Task) => {
    setEditingId(task.id)
    setEditTitle(task.title)
  }

  const saveEdit = (id: string) => {
    const trimmed = editTitle.trim()
    if (trimmed) onUpdate(id, { title: trimmed })
    setEditingId(null)
  }

  const completedCount = tasks.filter(t => t.completed).length
  const totalPomos = tasks.reduce((sum, t) => sum + t.completedPomos, 0)

  return (
    <div className="task-list">
      <div className="panel-header">
        <h2>任務列表</h2>
        <span className="badge">{tasks.length} 個任務 · {totalPomos} 個番茄</span>
      </div>

      <div className="task-input-row">
        <input
          type="text"
          className="input"
          placeholder="新增任務..."
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <input
          type="number"
          className="input input-sm"
          min={1}
          max={20}
          value={newPomos}
          onChange={e => setNewPomos(parseInt(e.target.value) || 1)}
          title="預估番茄數"
        />
        <button className="btn btn-primary" onClick={handleAdd}>
          新增
        </button>
      </div>

      <div className="task-items">
        {tasks.length === 0 && (
          <div className="task-empty">尚無任務，新增一個開始吧</div>
        )}
        {tasks.map(task => (
          <div
            key={task.id}
            className={`task-item ${task.completed ? 'completed' : ''} ${activeTaskId === task.id ? 'active' : ''}`}
            onClick={() => !task.completed && onSetActive(activeTaskId === task.id ? null : task.id)}
          >
            <button
              className="task-check"
              onClick={e => { e.stopPropagation(); onToggle(task.id) }}
              aria-label={task.completed ? '標記未完成' : '標記完成'}
            >
              {task.completed ? '✓' : '○'}
            </button>

            <div className="task-content">
              {editingId === task.id ? (
                <input
                  className="input input-inline"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  onBlur={() => saveEdit(task.id)}
                  onKeyDown={e => e.key === 'Enter' && saveEdit(task.id)}
                  onClick={e => e.stopPropagation()}
                  autoFocus
                />
              ) : (
                <span
                  className="task-title"
                  onDoubleClick={e => { e.stopPropagation(); startEdit(task) }}
                >
                  {task.title}
                </span>
              )}
              <span className="task-pomo-count">
                {task.completedPomos}/{task.estimatedPomos}
              </span>
            </div>

            <div className="task-actions">
              <button
                className="btn-icon"
                onClick={e => { e.stopPropagation(); onRemove(task.id) }}
                aria-label="刪除任務"
                title="刪除"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {completedCount > 0 && (
        <button className="btn btn-ghost btn-sm task-clear" onClick={onClearCompleted}>
          清除已完成 ({completedCount})
        </button>
      )}
    </div>
  )
}
