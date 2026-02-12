import { createRoot } from 'react-dom/client'
import App from './App'
import type { AppConfig, ThemeColors } from './types'
import { initSupabase } from './services/supabase'
import styles from './styles/index.css?inline'

class FocusTimerElement extends HTMLElement {
  private shadow: ShadowRoot

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    // Inject styles into shadow DOM
    const styleEl = document.createElement('style')
    styleEl.textContent = styles
    this.shadow.appendChild(styleEl)

    // Create mount point
    const mountPoint = document.createElement('div')
    mountPoint.id = 'focus-timer-root'
    this.shadow.appendChild(mountPoint)

    // Read config from attributes
    const config = this.readConfig()

    // Init Supabase
    initSupabase(config.supabaseUrl, config.supabaseKey)

    // Render
    createRoot(mountPoint).render(<App config={config} />)
  }

  private readConfig(): AppConfig {
    const config: AppConfig = {}

    const work = this.getAttribute('work')
    if (work) config.workDuration = parseInt(work, 10)

    const shortBreak = this.getAttribute('short-break')
    if (shortBreak) config.shortBreakDuration = parseInt(shortBreak, 10)

    const longBreak = this.getAttribute('long-break')
    if (longBreak) config.longBreakDuration = parseInt(longBreak, 10)

    const interval = this.getAttribute('long-break-interval')
    if (interval) config.longBreakInterval = parseInt(interval, 10)

    if (this.getAttribute('compact') === 'true') config.compact = true

    const sbUrl = this.getAttribute('supabase-url')
    if (sbUrl) config.supabaseUrl = sbUrl

    const sbKey = this.getAttribute('supabase-key')
    if (sbKey) config.supabaseKey = sbKey

    // Theme colors
    const theme: Partial<ThemeColors> = {}
    const colorAttrs: [string, keyof ThemeColors][] = [
      ['color-primary', 'primary'],
      ['color-background', 'background'],
      ['color-surface', 'surface'],
      ['color-text', 'text'],
      ['color-accent', 'accent'],
    ]
    let hasTheme = false
    for (const [attr, key] of colorAttrs) {
      const val = this.getAttribute(attr)
      if (val) {
        theme[key] = val
        hasTheme = true
      }
    }
    if (hasTheme) config.theme = theme

    return config
  }
}

customElements.define('focus-timer', FocusTimerElement)
