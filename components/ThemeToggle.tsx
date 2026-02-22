'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from './ui/button'
import { useState, useEffect, useCallback } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

type Theme = 'light' | 'dark' | 'system'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved) {
      setThemeState(saved)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement

    const apply = (resolved: 'light' | 'dark') => {
      setResolvedTheme(resolved)
      if (resolved === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      apply(mq.matches ? 'dark' : 'light')
      const handler = (e: MediaQueryListEvent) => apply(e.matches ? 'dark' : 'light')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    } else {
      apply(theme)
    }
  }, [theme, mounted])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          {resolvedTheme === 'dark' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={theme === 'light' ? 'text-primary font-medium' : ''}
        >
          <Sun className="h-4 w-4 mr-2" />
          Clair
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={theme === 'dark' ? 'text-primary font-medium' : ''}
        >
          <Moon className="h-4 w-4 mr-2" />
          Sombre
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={theme === 'system' ? 'text-primary font-medium' : ''}
        >
          <Monitor className="h-4 w-4 mr-2" />
          Système
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
