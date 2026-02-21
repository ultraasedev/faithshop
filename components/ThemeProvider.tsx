'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeConfig {
  name: string
  isDefault: boolean
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  mutedColor: string
  borderColor: string
}

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
  mounted: boolean
}

const defaultContext: ThemeContextType = {
  theme: 'system',
  setTheme: () => {},
  resolvedTheme: 'light',
  mounted: false,
}

const ThemeContext = createContext<ThemeContextType>(defaultContext)

// Helper to convert hex to HSL (simplified) or RGB for Tailwind
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
    : '0 0 0'
}

export function ThemeProvider({
  children,
  themes = [],
  defaultDarkMode = false
}: {
  children: React.ReactNode
  themes?: ThemeConfig[]
  defaultDarkMode?: boolean
}) {
  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (defaultDarkMode) {
      // If no saved preference and admin set dark mode as default
      setTheme('dark')
    }
  }, [defaultDarkMode])

  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement

    const applyTheme = (newTheme: 'light' | 'dark') => {
      setResolvedTheme(newTheme)
      if (newTheme === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      applyTheme(systemTheme)
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light')
      }
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      applyTheme(theme)
    }
  }, [theme, mounted])

  // Apply dynamic colors only for admin-customized themes
  useEffect(() => {
    const root = document.documentElement
    const cssVars = ['--background', '--foreground', '--primary', '--primary-foreground', '--muted', '--muted-foreground', '--border']

    if (themes.length > 0) {
      const activeConfig = themes.find(t => t.name === resolvedTheme) || themes.find(t => t.isDefault)

      if (activeConfig && activeConfig.backgroundColor) {
        // Admin has configured custom theme colors - apply as inline styles
        root.style.setProperty('--background', activeConfig.backgroundColor)
        root.style.setProperty('--foreground', activeConfig.textColor)
        root.style.setProperty('--primary', activeConfig.primaryColor)
        root.style.setProperty('--primary-foreground', activeConfig.secondaryColor)
        root.style.setProperty('--muted', activeConfig.mutedColor)
        root.style.setProperty('--muted-foreground', activeConfig.accentColor)
        root.style.setProperty('--border', activeConfig.borderColor)
      } else {
        // No matching admin theme - clear inline styles so CSS :root/.dark takes over
        cssVars.forEach(v => root.style.removeProperty(v))
      }
    } else {
      // No admin themes configured - clear any stale inline styles, let CSS handle it
      cssVars.forEach(v => root.style.removeProperty(v))
    }
  }, [themes, resolvedTheme])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, resolvedTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
