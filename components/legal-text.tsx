'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/use-translation'
import { WAIVER_SECTIONS } from '@/lib/constants'
import { CheckCircle2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LegalTextProps {
  onScrolledToBottom: () => void
  hasScrolledToBottom: boolean
}

export function LegalText({ onScrolledToBottom, hasScrolledToBottom }: LegalTextProps) {
  const { t, language } = useTranslation()
  const [isNearBottom, setIsNearBottom] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const checkScrollPosition = useCallback(() => {
    const element = scrollRef.current
    if (!element) return

    const { scrollTop, scrollHeight, clientHeight } = element
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 30

    setIsNearBottom(scrollTop + clientHeight >= scrollHeight - 100)

    if (isAtBottom && !hasScrolledToBottom) {
      onScrolledToBottom()
    }
  }, [hasScrolledToBottom, onScrolledToBottom])

  // Check on mount in case content is short
  useEffect(() => {
    const timer = setTimeout(() => {
      checkScrollPosition()
    }, 100)
    return () => clearTimeout(timer)
  }, [checkScrollPosition])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('legalTitle')}</h3>
        {hasScrolledToBottom ? (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
          </span>
        ) : (
          <span className="flex items-center gap-1 text-sm text-muted-foreground animate-pulse">
            <ChevronDown className="h-4 w-4" />
            {t('scrollToRead')}
          </span>
        )}
      </div>
      <div 
        className={cn(
          "relative rounded-md border bg-muted/30 transition-colors",
          hasScrolledToBottom && "border-green-500/50"
        )}
      >
        <div 
          ref={scrollRef}
          className="h-80 overflow-y-auto p-4 overscroll-contain"
          onScroll={checkScrollPosition}
          onTouchMove={checkScrollPosition}
        >
          <div className="space-y-6">
            {WAIVER_SECTIONS.map((section, index) => (
              <div key={index} className="space-y-3">
                <h4 className="font-bold text-base text-primary">
                  {language === 'zh' ? section.titleZh : section.titleEn}
                </h4>
                <div className="space-y-2 text-sm leading-relaxed text-foreground/80">
                  <p className="whitespace-pre-line">{section.contentEn}</p>
                  <p className="whitespace-pre-line text-muted-foreground">{section.contentZh}</p>
                </div>
              </div>
            ))}
            {/* Extra padding at bottom to ensure scroll detection works */}
            <div className="h-4" />
          </div>
        </div>
        {!isNearBottom && !hasScrolledToBottom && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-muted/80 to-transparent pointer-events-none rounded-b-md" />
        )}
      </div>
    </div>
  )
}
