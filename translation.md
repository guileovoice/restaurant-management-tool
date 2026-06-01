# AI Prompt for Implementing Zero-Intrusion Dynamic Translation System

This prompt is designed to instruct an AI coding agent or a developer to implement the exact same client-side translation system (supporting English, Spanish, and Portuguese) in any other React/Next.js application.

---

### **System Architecture Overview**
Instead of manually wrapping thousands of hardcoded strings in a translate hook (like `t('key')`), we use a client-side DOM-based translation system. 
1. **React Context (`LanguageProvider`)**: Exposes the selected language (`en`, `es`, `pt`).
2. **DOM Walker (`TreeWalker`)**: On mount or language switch, it walks the active text nodes in the DOM and replaces English text with Spanish/Portuguese translations.
3. **`MutationObserver`**: Automatically translates any new text nodes added dynamically (e.g. dynamic settings, charts, listings, notifications, modals, and toasts).
4. **Original Text Cache**: Stores original text values on a custom property of the DOM elements (`__originalText` and `__originalPlaceholder`) to enable perfect, self-healing translation reverting when switching back to English or other languages.
5. **No-Translate Exclusion (`data-no-translate="true"`)**: Skips elements (like the LanguageSelector itself or dynamic user names) to prevent their labels from being corrupted by translation attempts.
6. **Toast Confirmations**: Replaces browser-blocking prompts (like `window.confirm`) with in-app toast notifications that fit the dark theme and are dynamically translatable.

---

## **Step-by-Step Implementation Instructions**

### **Step 1: Create the Translation Dictionary**
Create a translation dictionary file (e.g., `src/lib/translations.ts`). The keys must be the exact English strings that appear in your UI.

```typescript
export type Language = 'en' | 'es' | 'pt';

export const translations: Record<string, Record<'es' | 'pt', string>> = {
  // Navigation
  "Overview": { es: "Vista general", pt: "Visão geral" },
  "AI Analytics": { es: "Analítica de IA", pt: "Análise de IA" },
  "Live Orders": { es: "Pedidos en vivo", pt: "Pedidos em tempo real" },
  "Settings": { es: "Ajustes", pt: "Configurações" },
  // Common Forms
  "Email": { es: "Correo electrónico", pt: "E-mail" },
  "Password": { es: "Contraseña", pt: "Senha" },
  "Sign in": { es: "Iniciar sesión", pt: "Entrar" },
  // Add any custom strings found in your files here...
};
```

---

### **Step 2: Create the Language Provider**
Create a component `src/components/shared/LanguageProvider.tsx` that hosts the context, saves choice to `localStorage`, and handles DOM translation scans/observers.

```tsx
'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Language, translations } from '@/lib/translations'

interface LanguageContextProps {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextProps>({
  language: 'en',
  setLanguage: () => {},
})

export const useLanguage = () => useContext(LanguageContext)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  // Load language from localStorage after mount
  useEffect(() => {
    const savedLang = localStorage.getItem('app-language') as Language
    if (savedLang && (savedLang === 'en' || savedLang === 'es' || savedLang === 'pt')) {
      setLanguageState(savedLang)
    }
    setMounted(true)
  }, [])

  const setLanguage = (lang: Language) => {
    localStorage.setItem('app-language', lang)
    setLanguageState(lang)
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', lang)
    }
  }

  // Helper: Translates text matching keys in dictionary
  const translateText = (text: string, lang: Language): string => {
    if (lang === 'en') return text
    const trimmed = text.trim()
    if (!trimmed) return text

    // Check direct match
    const translation = translations[trimmed]
    if (translation && translation[lang]) {
      const leading = text.match(/^\s*/)?.[0] || ''
      const trailing = text.match(/\s*$/)?.[0] || ''
      return leading + translation[lang] + trailing
    }

    // Check case-insensitive match
    const lowerTrimmed = trimmed.toLowerCase()
    const matchKey = Object.keys(translations).find(
      key => key.trim().toLowerCase() === lowerTrimmed
    )
    if (matchKey) {
      const translationLower = translations[matchKey]
      if (translationLower && translationLower[lang]) {
        const leading = text.match(/^\s*/)?.[0] || ''
        const trailing = text.match(/\s*$/)?.[0] || ''
        return leading + translationLower[lang] + trailing
      }
    }

    return text
  }

  // Translates a single DOM node (skipping script, styles, code blocks, or [data-no-translate])
  const translateNode = (node: Node, lang: Language) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue || ''
      const parent = node.parentElement
      if (parent) {
        const tagName = parent.tagName.toUpperCase()
        if (tagName === 'SCRIPT' || tagName === 'STYLE' || tagName === 'TEXTAREA' || tagName === 'CODE') {
          return
        }
        if (parent.closest('[data-no-translate="true"]')) {
          return
        }
      }

      const nodeObj = node as any
      if (nodeObj.__originalText === undefined) {
        nodeObj.__originalText = text
      }

      const originalText = nodeObj.__originalText
      const translated = translateText(originalText, lang)
      if (node.nodeValue !== translated) {
        node.nodeValue = translated
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      if (el.closest('[data-no-translate="true"]')) {
        return
      }
      
      // Translate input and textarea placeholders
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        const input = el as HTMLInputElement
        const placeholder = input.getAttribute('placeholder')
        if (placeholder) {
          const elObj = el as any
          if (elObj.__originalPlaceholder === undefined) {
            elObj.__originalPlaceholder = placeholder
          }
          const originalPl = elObj.__originalPlaceholder
          const translatedPl = translateText(originalPl, lang)
          if (input.placeholder !== translatedPl) {
            input.placeholder = translatedPl
          }
        }
      }
    }
  }

  useEffect(() => {
    if (!mounted) return

    if (language === 'en') {
      // Revert everything to English
      const revertTree = (root: Node) => {
        const walker = document.createTreeWalker(
          root, 
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              const parent = node.parentElement
              if (parent && parent.closest('[data-no-translate="true"]')) {
                return NodeFilter.FILTER_REJECT
              }
              return NodeFilter.FILTER_ACCEPT
            }
          }
        )
        let node = walker.nextNode()
        while (node) {
          const nodeObj = node as any
          if (nodeObj.__originalText !== undefined && node.nodeValue !== nodeObj.__originalText) {
            node.nodeValue = nodeObj.__originalText
          }
          node = walker.nextNode()
        }

        const inputs = (root as HTMLElement).querySelectorAll?.('input, textarea') || []
        inputs.forEach(input => {
          if (input.closest('[data-no-translate="true"]')) return
          const inputObj = input as any
          if (inputObj.__originalPlaceholder !== undefined) {
            (input as HTMLInputElement).placeholder = inputObj.__originalPlaceholder
          }
        })
      }

      revertTree(document.body)
      return
    }

    const translateTree = (root: Node) => {
      const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            const parent = node.parentElement
            if (parent) {
              const tag = parent.tagName.toUpperCase()
              if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA' || tag === 'CODE') {
                return NodeFilter.FILTER_REJECT
              }
              if (parent.closest('[data-no-translate="true"]')) {
                return NodeFilter.FILTER_REJECT
              }
            }
            return NodeFilter.FILTER_ACCEPT
          }
        }
      )

      let node = walker.nextNode()
      while (node) {
        translateNode(node, language)
        node = walker.nextNode()
      }

      if (root.nodeType === Node.ELEMENT_NODE) {
        const inputs = (root as HTMLElement).querySelectorAll?.('input, textarea') || []
        inputs.forEach(input => {
          if (input.closest('[data-no-translate="true"]')) return
          translateNode(input, language)
        })
      }
    }

    // Run translation
    translateTree(document.body)

    // MutationObserver monitors dynamic DOM additions (modals, charts, notifications)
    const observer = new MutationObserver((mutations) => {
      observer.disconnect()

      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          translateNode(mutation.target, language)
        } else if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            translateTree(node)
          })
        }
      }

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    })

    return () => {
      observer.disconnect()
    }
  }, [language, mounted])

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}
```

---

### **Step 3: Create the Language Selector**
Create the UI switcher at `src/components/shared/LanguageSelector.tsx`. Note the critical use of **`data-no-translate="true"`** on the triggers and dropdown overlays to prevent the dropdown text itself from being parsed or overridden by the translator.

```tsx
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
        className="w-40 bg-surface border-border p-1.5 rounded-xl shadow-xl"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-colors focus:bg-surface2",
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
```

---

### **Step 4: Integrate the Provider and Selector**
1. **Wrap Root Layout**: Open `src/app/layout.tsx` (or your main layout) and import `LanguageProvider` to wrap the children:
   ```tsx
   import { LanguageProvider } from "@/components/shared/LanguageProvider";
   // ...
   <LanguageProvider>
     {children}
   </LanguageProvider>
   ```
2. **Mount Switcher**: Place the `<LanguageSelector />` inside:
   - Your landing page's main navigation headers.
   - Your login/signup page layouts (e.g., positioned `absolute top-6 right-6`).
   - Your dashboard header/topbar components.

---

### **Step 5: Replace Browser confirm Dialogs with Toast Confirmations**
To prevent standard gray browser prompts from blocking UI execution (and to allow full translation of prompts), write custom confirmation toasts using `react-hot-toast` that render in-app confirmation overlays.

**Implementation Example:**
```tsx
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'

// Replaces standard confirm() call
const handleDeleteItem = (itemId: string) => {
  toast((t) => (
    <div className="flex flex-col gap-3 text-text-primary min-w-[280px]">
      <p className="text-xs font-semibold leading-relaxed">
        Are you sure you want to delete this item?
      </p>
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm"
          className="h-7 px-2.5 text-[10px] font-bold uppercase border-border cursor-pointer bg-surface hover:bg-surface2" 
          onClick={() => toast.dismiss(t.id)}
        >
          Cancel
        </Button>
        <Button 
          size="sm"
          className="h-7 px-2.5 text-[10px] font-bold uppercase bg-danger hover:bg-red-600 text-white cursor-pointer" 
          onClick={async () => {
            toast.dismiss(t.id);
            // Execute deletion logic here...
            toast.success('Item deleted successfully!');
          }}
        >
          Confirm
        </Button>
      </div>
    </div>
  ), {
    duration: 10000,
    position: 'top-center',
    style: {
      background: '#1A1A24',
      border: '1px solid #2E2E3F',
    }
  });
};
```
*Tip: If you need dynamic parameters (like a user's name), separate them into independent JSX elements inside the paragraph tag so that the standard English sentence segments can still be matched and translated by the walker, while leaving the dynamic name text alone.*

---

## **Verify Your Changes**
After making these changes, run `npm run build` or `npm run dev` to verify the build compiles perfectly. Select your new languages in the dropdown; all matching English sentences will automatically convert to Spanish or Portuguese without any translation hydration mismatch on the server!
