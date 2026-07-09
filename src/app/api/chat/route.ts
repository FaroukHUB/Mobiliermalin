/**
 * POST /api/chat
 *
 * Endpoint principal du chatbot Malin.
 * Reçoit un historique de messages, appelle Google Gemini (compatible
 * OpenAI), exécute les appels d'outils (tool use) en boucle, et renvoie
 * la réponse finale en streaming (Server-Sent Events).
 *
 * Modèle : gemini-2.0-flash (gratuit, 15 req/min)
 * Endpoint : Google AI Studio compatible OpenAI
 *
 * Body attendu :
 * {
 *   messages: [
 *     { role: 'user' | 'assistant', content: string }
 *   ]
 * }
 *
 * Réponse (SSE) :
 *   data: {"type":"text","content":"Bonjour ! "}\n\n
 *   data: {"type":"text","content":"Je suis Malin..."}\n\n
 *   data: {"type":"done"}\n\n
 */

import { SYSTEM_PROMPT, TOOLS_SCHEMA, executeToolCall } from '@/lib/chat-context'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Google Gemini via API compatible OpenAI — gratuite jusqu'à 15 req/min.
// Ce endpoint accepte le même format que xAI/OpenAI, donc quasi aucun
// changement de code par rapport à la version Grok.
const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'
// gemini-2.5-flash : modèle courant recommandé pour le free tier
// (1500 requests/jour, 15 requests/minute, tool use supporté)
const MODEL = 'gemini-2.5-flash'
const MAX_TOOL_ITERATIONS = 5

type Msg = {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content?: string | null
  tool_calls?: Array<{
    id: string
    type: 'function'
    function: { name: string; arguments: string }
  }>
  tool_call_id?: string
  name?: string
}

async function callGemini(messages: Msg[], useTools: boolean) {
  const res = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      ...(useTools && { tools: TOOLS_SCHEMA, tool_choice: 'auto' }),
      temperature: 0.5,
      max_tokens: 1200,
    }),
  })

  if (!res.ok) {
    const err = await res.text().catch(() => '')
    // Log complet côté serveur pour diagnostiquer
    console.error(`[gemini] ${res.status} error:`, err)
    // Message brut renvoyé à l'utilisateur pour permettre le diagnostic
    throw new Error(`Gemini ${res.status} : ${err.slice(0, 600)}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message as Msg
}

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({
        error:
          'GEMINI_API_KEY absent côté serveur. Ajouter dans Vercel Env Vars (récupérer sur aistudio.google.com/apikey).',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  let userMessages: Msg[]
  try {
    const body = await req.json()
    userMessages = body.messages
    if (!Array.isArray(userMessages) || userMessages.length === 0) {
      throw new Error('Messages vides')
    }
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'Body invalide : { messages: [{role, content}] } requis.',
        detail: err instanceof Error ? err.message : 'inconnu',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  // Nettoie l'historique : garde uniquement role + content, limite à 20 derniers
  const cleaned: Msg[] = userMessages
    .filter(
      (m): m is Msg =>
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0,
    )
    .slice(-20)

  // Construit le contexte : system + historique
  const conversation: Msg[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...cleaned,
  ]

  // Boucle tool use : jusqu'à MAX_TOOL_ITERATIONS
  let finalText = ''
  let lastAnyContent = ''
  try {
    for (let iter = 0; iter < MAX_TOOL_ITERATIONS; iter++) {
      // À la dernière itération : on force Gemini à répondre en texte
      // (pas d'outils dispo) pour éviter une boucle infinie de tool_calls
      const useTools = iter < MAX_TOOL_ITERATIONS - 1
      const msg = await callGemini(conversation, useTools)

      console.log(`[chat] iter ${iter} :`, {
        hasContent: !!msg.content,
        contentLength: msg.content?.length || 0,
        toolCallsCount: msg.tool_calls?.length || 0,
        useToolsThisRound: useTools,
      })

      // Capture tout contenu texte au passage (au cas où on doit fallback)
      if (msg.content && msg.content.trim()) {
        lastAnyContent = msg.content
      }

      conversation.push(msg)

      // Si l'assistant a demandé des outils : exécute et boucle
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        for (const tc of msg.tool_calls) {
          let args: Record<string, unknown> = {}
          try {
            args = JSON.parse(tc.function.arguments || '{}')
          } catch {
            console.warn('[chat] tool_call args invalides:', tc.function.arguments)
            args = {}
          }
          console.log(`[chat] → tool_call ${tc.function.name}`, args)
          const result = await executeToolCall(tc.function.name, args)
          conversation.push({
            role: 'tool',
            tool_call_id: tc.id,
            name: tc.function.name,
            content: JSON.stringify(result),
          })
        }
        continue
      }

      // Sinon on a une réponse texte finale
      finalText = msg.content || ''
      break
    }
    // Fallback : si aucun finalText mais on a capturé du texte en cours
    // de route (Gemini a mélangé tool_calls + content), on l'utilise.
    if (!finalText && lastAnyContent) {
      finalText = lastAnyContent
    }
  } catch (err) {
    console.error('[chat] Gemini error:', err)
    return new Response(
      JSON.stringify({
        error:
          'Erreur IA : ' + (err instanceof Error ? err.message : 'inconnue'),
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    )
  }

  if (!finalText) {
    finalText =
      "Je n'ai pas trouvé de réponse claire. Peux-tu reformuler ta question ? Ou appelle-nous directement au 06 76 61 70 53."
  }

  // Streaming SSE : découpe en chunks de ~30 caractères pour simuler
  // un effet "réponse qui apparaît progressivement" (comme ChatGPT)
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const chunks = finalText.match(/.{1,30}(\s|$)|.+/gs) || [finalText]
      for (const chunk of chunks) {
        const data = JSON.stringify({ type: 'text', content: chunk })
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        // Petit délai pour un effet naturel de frappe
        await new Promise((r) => setTimeout(r, 20))
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
