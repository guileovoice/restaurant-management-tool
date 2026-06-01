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
    const savedLang = localStorage.getItem('guileo-language') as Language
    if (savedLang && (savedLang === 'en' || savedLang === 'es' || savedLang === 'pt')) {
      setLanguageState(savedLang)
    }
    setMounted(true)
  }, [])

  const setLanguage = (lang: Language) => {
    localStorage.setItem('guileo-language', lang)
    setLanguageState(lang)
    
    // Update html tag lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', lang)
    }
  }

  // Translation helper
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

  // DOM node translator
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
      
      // Translate placeholders
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

  // MutationObserver & initial traverse
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
      // Walk text nodes
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

      // Walk placeholders
      if (root.nodeType === Node.ELEMENT_NODE) {
        const inputs = (root as HTMLElement).querySelectorAll?.('input, textarea') || []
        inputs.forEach(input => {
          if (input.closest('[data-no-translate="true"]')) return
          translateNode(input, language)
        })
      }
    }

    // Do initial translation on mount / language change
    translateTree(document.body)

    // MutationObserver to translate any dynamic DOM updates
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
