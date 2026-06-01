'use client'

import { useLanguage } from './LanguageProvider'
import { Globe, ChevronDown, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface LanguageSelectorProps {
  className?: string
}

export function LanguageSelector({ className }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage()

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'pt', label: 'Português', flag: '🇵🇹' },
  ] as const

  const currentLang = languages.find((l) => l.code === language) || languages[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          data-no-translate="true"
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface2 transition-all duration-200 outline-none cursor-pointer text-xs font-semibold text-text-primary active:scale-95",
            className
          )}
        >
          <Globe className="w-4 h-4 text-primary" />
          <span className="flex items-center gap-1.5">
            <span>{currentLang.flag}</span>
            <span className="hidden sm:inline">{currentLang.label}</span>
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        data-no-translate="true"
        align="end"
        className="w-40 bg-surface border-border p-1.5 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-1 duration-150"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-colors focus:bg-surface2 focus:text-text-primary",
              language === lang.code ? "text-primary bg-primary/10" : "text-text-primary"
            )}
          >
            <span className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </span>
            {language === lang.code && <Check className="w-3.5 h-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
