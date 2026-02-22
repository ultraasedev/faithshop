'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SignOutButton() {
  return (
    <Button
      variant="outline"
      className="gap-2"
      onClick={() => signOut({ callbackUrl: '/' })}
    >
      <LogOut className="w-4 h-4" /> Se déconnecter
    </Button>
  )
}
