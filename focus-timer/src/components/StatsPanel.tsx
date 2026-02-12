import { useMemo } from 'react'
import type { PomodoroRecord, DailyStats } from '../types'
import { getTodayDate, getWeekDates, getMonthDates, formatDateShort } from '../utils/time'

interface Props {
  records: PomodoroRecord[]
}

function aggregateDaily(records: PomodoroRecord[]): Map<string, DailyStats> {
  const map = new Map<string, DailyStats>()
  for (const r of records) {
    const date = r.completedAt.slice(0, 10)
    const existing = map.get(date) || {
      date,
      totalPomos: 0,
      totalWorkMinutes: 0,
      totalBreakMinutes: 0,
    }
    if (r.phase === 'work') {
      existing.totalPomos += 1
      existing.totalWorkMinutes += r.duration
    } else {
      existing.totalBreakMinutes += r.duration
    }
    map.set(date, existing)
  }
  return map
}

export function StatsPanel({ records }: Props) {
  const dailyMap = useMemo(() => aggregateDaily(records), [records])
  const today = getTodayDate()
  const todayStats = dailyMap.get(today)
  const weekDates = useMemo(() => getWeekDates(), [])
  const monthDates = useMemo(() => getMonthDates(), [])

  const weekTotal = weekDates.reduce((sum, d) => sum + (dailyMap.get(d)?.totalPomos || 0), 0)
  const monthMax = Math.max(1, ...monthDates.map(d => dailyMap.get(d)?.totalPomos || 0))

  // Bar chart data for the week
  const weekBars = weekDates.map(d => ({
    date: d,
    label: formatDateShort(d),
    pomos: dailyMap.get(d)?.totalPomos || 0,
    minutes: dailyMap.get(d)?.totalWorkMinutes || 0,
  }))

  const weekMax = Math.max(1, ...weekBars.map(b => b.pomos))

  return (
    <div className="stats-panel">
      <div className="panel-header">
        <h2>統計</h2>
      </div>

      {/* Today summary */}
      <div className="stats-today">
        <div className="stat-card">
          <div className="stat-value">{todayStats?.totalPomos || 0}</div>
          <div className="stat-label">今日番茄</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{todayStats?.totalWorkMinutes || 0}</div>
          <div className="stat-label">專注分鐘</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{weekTotal}</div>
          <div className="stat-label">本週番茄</div>
        </div>
      </div>

      {/* Weekly bar chart */}
      <div className="stats-section">
        <h3>本週趨勢</h3>
        <div className="bar-chart">
          {weekBars.map(bar => (
            <div key={bar.date} className="bar-col">
              <div className="bar-value">{bar.pomos || ''}</div>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ height: `${(bar.pomos / weekMax) * 100}%` }}
                />
              </div>
              <div className="bar-label">{bar.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly heat map */}
      <div className="stats-section">
        <h3>月度熱力圖</h3>
        <div className="heatmap">
          {monthDates.map(d => {
            const pomos = dailyMap.get(d)?.totalPomos || 0
            const intensity = pomos / monthMax
            return (
              <div
                key={d}
                className="heatmap-cell"
                style={{ opacity: pomos === 0 ? 0.1 : 0.2 + intensity * 0.8 }}
                title={`${formatDateShort(d)}: ${pomos} 個番茄`}
              >
                <span className="heatmap-label">{formatDateShort(d)}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div className="stats-section">
        <h3>最近記錄</h3>
        <div className="recent-list">
          {records.length === 0 && (
            <div className="task-empty">尚無記錄</div>
          )}
          {records.slice(-10).reverse().map(r => (
            <div key={r.id} className="recent-item">
              <span className={`recent-badge ${r.phase}`}>
                {r.phase === 'work' ? '專注' : r.phase === 'shortBreak' ? '短休' : '長休'}
              </span>
              <span className="recent-duration">{r.duration} 分鐘</span>
              <span className="recent-time">
                {new Date(r.completedAt).toLocaleTimeString('zh-TW', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
