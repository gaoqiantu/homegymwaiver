'use client'

import { LanguageProvider } from '@/hooks/use-translation'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  )
}
