import { useState, useCallback, useEffect, useMemo } from 'react'
import type { ThemeColors, ThemeConfig } from '../types'
import { loadThemeColors, saveThemeColors } from '../services/storage'

const PRESET_THEMES: ThemeConfig[] = [
  {
    name: '深色經典',
    colors: {
      primary: '#e74c3c',
      background: '#1a1a2e',
      surface: '#16213e',
      surfaceAlt: '#0f3460',
      text: '#eaeaea',
      textSecondary: '#a0a0b0',
      accent: '#e94560',
      success: '#2ecc71',
      warning: '#f39c12',
      danger: '#e74c3c',
      border: '#2a2a4a',
    },
  },
  {
    name: '淺色清新',
    colors: {
      primary: '#e74c3c',
      background: '#f5f5f0',
      surface: '#ffffff',
      surfaceAlt: '#f0ebe3',
      text: '#2d3436',
      textSecondary: '#636e72',
      accent: '#e17055',
      success: '#00b894',
      warning: '#fdcb6e',
      danger: '#d63031',
      border: '#dfe6e9',
    },
  },
  {
    name: '莫蘭迪',
    colors: {
      primary: '#b8836a',
      background: '#f2ede9',
      surface: '#faf6f2',
      surfaceAlt: '#e8ddd5',
      text: '#5a4a42',
      textSecondary: '#8a7b73',
      accent: '#c4967a',
      success: '#7d9f85',
      warning: '#d4a76a',
      danger: '#c07070',
      border: '#d9d0c7',
    },
  },
  {
    name: '海洋藍',
    colors: {
      primary: '#0984e3',
      background: '#0c1821',
      surface: '#1b2838',
      surfaceAlt: '#2a3f54',
      text: '#dfe6ed',
      textSecondary: '#8dabc4',
      accent: '#74b9ff',
      success: '#55efc4',
      warning: '#ffeaa7',
      danger: '#ff7675',
      border: '#344d65',
    },
  },
  {
    name: '森林綠',
    colors: {
      primary: '#27ae60',
      background: '#1a2e1a',
      surface: '#243524',
      surfaceAlt: '#2d452d',
      text: '#e0eed0',
      textSecondary: '#98b888',
      accent: '#6fcf97',
      success: '#27ae60',
      warning: '#f2c94c',
      danger: '#eb5757',
      border: '#3a5a3a',
    },
  },
]

export function useTheme(initialOverrides?: Partial<ThemeColors>) {
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0)
  const [customColors, setCustomColors] = useState<Partial<ThemeColors>>(() => {
    const saved = loadThemeColors()
    return { ...saved, ...initialOverrides }
  })

  const activeColors = useMemo((): ThemeColors => {
    const base = PRESET_THEMES[currentThemeIndex].colors
    return { ...base, ...customColors }
  }, [currentThemeIndex, customColors])

  // Apply CSS variables
  useEffect(() => {
    const root = document.documentElement
    Object.entries(activeColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${camelToKebab(key)}`, value)
    })
  }, [activeColors])

  const selectPreset = useCallback((index: number) => {
    setCurrentThemeIndex(index)
    setCustomColors({})
    saveThemeColors({})
  }, [])

  const updateColor = useCallback((key: keyof ThemeColors, value: string) => {
    setCustomColors(prev => {
      const next = { ...prev, [key]: value }
      saveThemeColors(next)
      return next
    })
  }, [])

  const resetCustom = useCallback(() => {
    setCustomColors({})
    saveThemeColors({})
  }, [])

  return {
    presets: PRESET_THEMES,
    currentThemeIndex,
    activeColors,
    customColors,
    selectPreset,
    updateColor,
    resetCustom,
  }
}

function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}
