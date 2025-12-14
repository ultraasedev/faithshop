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
  themes = []
}: { 
  children: React.ReactNode
  themes?: ThemeConfig[]
}) {
  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

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

  // Apply dynamic colors
  useEffect(() => {
    const root = document.documentElement
    
    let activeConfig: ThemeConfig | undefined

    if (themes.length > 0) {
      activeConfig = themes.find(t => t.name === resolvedTheme) || themes.find(t => t.isDefault)
    } else {
      // Fallback defaults if no themes provided
      if (resolvedTheme === 'dark') {
        activeConfig = {
          name: 'dark',
          isDefault: false,
          primaryColor: '#ffffff',
          secondaryColor: '#000000',
          accentColor: '#a3a3a3',
          backgroundColor: '#0a0a0a',
          textColor: '#ffffff',
          mutedColor: '#a3a3a3',
          borderColor: '#262626'
        }
      } else {
        activeConfig = {
          name: 'light',
          isDefault: true,
          primaryColor: '#000000',
          secondaryColor: '#ffffff',
          accentColor: '#666666',
          backgroundColor: '#ffffff',
          textColor: '#000000',
          mutedColor: '#6b7280',
          borderColor: '#e5e7eb'
        }
      }
    }
    
    if (activeConfig) {
      root.style.setProperty('--background', activeConfig.backgroundColor)
      root.style.setProperty('--foreground', activeConfig.textColor)
      root.style.setProperty('--primary', activeConfig.primaryColor)
      root.style.setProperty('--primary-foreground', activeConfig.secondaryColor)
      root.style.setProperty('--muted', activeConfig.mutedColor)
      root.style.setProperty('--muted-foreground', activeConfig.accentColor)
      root.style.setProperty('--border', activeConfig.borderColor)
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
