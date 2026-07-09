'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { MessageCircle, X, Send, Sparkles, RotateCcw } from 'lucide-react'

/**
 * Chatbot IA Mobilier Malin — widget flottant.
 *
 * - Bouton flottant en bas à gauche (WhatsApp est déjà à droite)
 * - Clic → ouvre une modale de chat
 * - Streaming SSE depuis /api/chat
 * - Historique persisté dans localStorage (survit au reload)
 * - Bouton reset pour repartir de zéro
 *
 * Un seul composant client pour minimiser le JS envoyé au navigateur
 * quand le widget est fermé (le contenu de la modale n'est monté qu'à
 * l'ouverture).
 */

type Message = {
  role: 'user' | 'assistant'
  content: string
}

const STORAGE_KEY = 'mm-chat-history-v1'
const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content:
    "Bonjour, je suis **Malin**, l'assistant IA de Mobilier Malin. Je peux t'aider à trouver un fauteuil, un bureau, une armoire — ou t'orienter vers notre équipe pour un projet plus complexe. Que cherches-tu ?",
}

// Rendu minimal markdown : gras + liens
function renderMessage(content: string): string {
  return content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-gold-dark underline underline-offset-2 hover:text-gold" target="_self">$1</a>',
    )
    .replace(/\n/g, '<br />')
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Restaure l'historique au montage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed: Message[] = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed)
      }
    } catch {}
  }, [])

  // Persiste à chaque changement
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {}
  }, [messages])

  // Auto-scroll en bas
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  // Focus input quand on ouvre
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const resetChat = () => {
    setMessages([WELCOME_MESSAGE])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: text },
    ]
    setMessages(newMessages)
    setLoading(true)

    // Ajoute un message assistant vide qu'on va remplir en streaming
    setMessages([...newMessages, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erreur inconnue' }))
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: `⚠️ ${err.error || 'Erreur de connexion à l\'IA.'} Appelle-nous au **06 76 61 70 53** si l'urgence est réelle.`,
          },
        ])
        setLoading(false)
        return
      }

      // Parse le stream SSE
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      let buffer = ''

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const evt = JSON.parse(line.slice(6))
            if (evt.type === 'text') {
              accumulated += evt.content
              setMessages([
                ...newMessages,
                { role: 'assistant', content: accumulated },
              ])
            } else if (evt.type === 'done') {
              break
            }
          } catch {}
        }
      }
    } catch (err) {
      console.error('[chat] fetch error', err)
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content:
            "⚠️ Erreur de connexion. Vérifie ton réseau ou appelle-nous au **06 76 61 70 53**.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Bouton flottant en bas à gauche */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Ouvrir l'assistant IA Malin"
          className="fixed bottom-5 left-5 md:bottom-6 md:left-6 z-40 group inline-flex items-center gap-2.5 pl-3.5 pr-4 md:pl-4 md:pr-5 rounded-full bg-ink text-ivory shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          style={{ height: '52px' }}
        >
          <div className="relative">
            <MessageCircle
              className="h-5 w-5 shrink-0"
              strokeWidth={1.5}
            />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-gold animate-pulse" />
          </div>
          <span className="text-sm font-medium hidden sm:inline">
            Poser une question
          </span>
        </button>
      )}

      {/* Fenêtre modale du chat */}
      {isOpen && (
        <>
          {/* Backdrop cliquable pour fermer (mobile only) */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-ink/40 md:hidden"
            aria-hidden
          />

          <div
            className="fixed inset-0 md:inset-auto md:bottom-6 md:left-6 md:right-auto md:top-auto md:w-[400px] md:h-[600px] z-50 bg-ivory-light md:rounded-xl shadow-2xl flex flex-col overflow-hidden md:border md:border-line"
            role="dialog"
            aria-label="Assistant IA Mobilier Malin"
          >
            {/* Header */}
            <div className="bg-ink text-ivory px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gold/20 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-gold" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="font-serif text-base leading-tight">Malin</p>
                  <p className="text-xs text-ivory/60 leading-tight">
                    Assistant Mobilier Malin
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={resetChat}
                  aria-label="Nouvelle conversation"
                  title="Nouvelle conversation"
                  className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-ivory/10 transition"
                >
                  <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Fermer"
                  className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-ivory/10 transition"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-ivory-light"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-gold text-ink rounded-br-sm'
                        : 'bg-white text-ink border border-line rounded-bl-sm'
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: renderMessage(m.content || '…'),
                    }}
                  />
                </div>
              ))}
              {loading && messages[messages.length - 1]?.content === '' && (
                <div className="flex justify-start">
                  <div className="bg-white text-ink border border-line rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <span
                        className="h-2 w-2 rounded-full bg-ink-mute animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      />
                      <span
                        className="h-2 w-2 rounded-full bg-ink-mute animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      />
                      <span
                        className="h-2 w-2 rounded-full bg-ink-mute animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-line bg-white p-3 shrink-0">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Écris ta question…"
                  rows={1}
                  disabled={loading}
                  className="flex-1 resize-none border border-line bg-ivory-light px-3 py-2.5 rounded-lg text-sm text-ink placeholder:text-ink-mute focus:outline-none focus:border-gold max-h-32"
                  style={{ minHeight: '42px' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  aria-label="Envoyer"
                  className={`h-[42px] w-[42px] flex items-center justify-center rounded-lg transition ${
                    loading || !input.trim()
                      ? 'bg-line text-ink-mute cursor-not-allowed'
                      : 'bg-ink text-ivory hover:bg-ink-soft'
                  }`}
                >
                  <Send className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
              <p className="mt-2 text-[0.65rem] text-ink-mute text-center">
                Assistant IA basé sur Grok — peut se tromper. Pour les commandes,
                appelez le{' '}
                <Link
                  href="tel:+33676617053"
                  className="text-gold-dark hover:text-gold underline underline-offset-2"
                >
                  06 76 61 70 53
                </Link>
                .
              </p>
            </div>
          </div>
        </>
      )}
    </>
  )
}
