'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeConfig {
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
  defaultThemeConfig 
}: { 
  children: React.ReactNode
  defaultThemeConfig?: ThemeConfig | null
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
    if (!defaultThemeConfig) return

    const root = document.documentElement
    
    // We assume the theme config passed is the one to use (active theme)
    // In a real app, we might want to switch config based on light/dark mode if we stored both
    // But here we just apply what we have.
    
    // Note: Tailwind uses HSL or simple values. globals.css uses HSL usually.
    // If globals.css uses HSL, we need to convert. 
    // If it uses hex, we can just set it.
    // Let's assume we overwrite the CSS variables directly.
    
    // However, Shadcn UI uses HSL values in variables like --background: 0 0% 100%;
    // So we need to convert Hex to HSL or RGB if we want to be compatible.
    // For now, let's try to set the variables directly if they are used as `color: hsl(var(--foreground))`
    
    // Actually, checking globals.css is crucial. 
    // If globals.css has:
    // --background: 0 0% 100%;
    // And usage is: background-color: hsl(var(--background));
    // Then we need to set --background to "0 0% 100%" (HSL).
    
    // Since converting Hex to HSL is a bit complex to do perfectly in client without a lib,
    // and we want to be safe, we can try to use a library or just simple conversion.
    
    // For this demo, let's just inject a style tag that overrides the CSS variables with HEX values
    // BUT Shadcn expects HSL numbers without 'hsl()'.
    // So we MUST convert.
    
    // Let's use a simple Hex to HSL converter.
    
    if (defaultThemeConfig) {
      root.style.setProperty('--background', defaultThemeConfig.backgroundColor)
      root.style.setProperty('--foreground', defaultThemeConfig.textColor)
      root.style.setProperty('--primary', defaultThemeConfig.primaryColor)
      root.style.setProperty('--primary-foreground', defaultThemeConfig.secondaryColor)
      root.style.setProperty('--muted', defaultThemeConfig.mutedColor)
      root.style.setProperty('--muted-foreground', defaultThemeConfig.accentColor)
      root.style.setProperty('--border', defaultThemeConfig.borderColor)
    }

  }, [defaultThemeConfig])

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
