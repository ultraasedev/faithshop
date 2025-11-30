'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { Button } from './ui/button'
import { useState, useRef, useEffect } from 'react'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme, mounted } = useTheme()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Don't render interactive until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="h-9 w-9"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-background border rounded-md shadow-lg z-50">
          <button
            onClick={() => { setTheme('light'); setOpen(false); }}
            className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-secondary ${theme === 'light' ? 'text-primary font-medium' : ''}`}
          >
            <Sun className="h-4 w-4" />
            Clair
          </button>
          <button
            onClick={() => { setTheme('dark'); setOpen(false); }}
            className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-secondary ${theme === 'dark' ? 'text-primary font-medium' : ''}`}
          >
            <Moon className="h-4 w-4" />
            Sombre
          </button>
          <button
            onClick={() => { setTheme('system'); setOpen(false); }}
            className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-secondary ${theme === 'system' ? 'text-primary font-medium' : ''}`}
          >
            <Monitor className="h-4 w-4" />
            Système
          </button>
        </div>
      )}
    </div>
  )
}
