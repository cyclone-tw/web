import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { parseUrlConfig } from './utils/url-params'
import { initSupabase } from './services/supabase'
import './styles/index.css'

const config = parseUrlConfig()

// Initialize Supabase if configured
initSupabase(config.supabaseUrl, config.supabaseKey)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App config={config} />
  </StrictMode>,
)
