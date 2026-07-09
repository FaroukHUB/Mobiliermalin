/**
 * POST /api/chat
 *
 * Endpoint principal du chatbot Malin.
 * Reçoit un historique de messages, appelle Grok (xAI), exécute les
 * appels d'outils (tool use) en boucle, et renvoie la réponse finale
 * en streaming (Server-Sent Events).
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

const XAI_ENDPOINT = 'https://api.x.ai/v1/chat/completions'
const MODEL = 'grok-4-fast'
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

async function callGrok(messages: Msg[], useTools: boolean) {
  const res = await fetch(XAI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.XAI_API_KEY}`,
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
    throw new Error(`xAI ${res.status} : ${err.slice(0, 500)}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message as Msg
}

export async function POST(req: Request) {
  if (!process.env.XAI_API_KEY) {
    return new Response(
      JSON.stringify({
        error: 'XAI_API_KEY absent côté serveur. Ajouter dans Vercel Env Vars.',
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
  try {
    for (let iter = 0; iter < MAX_TOOL_ITERATIONS; iter++) {
      const msg = await callGrok(conversation, true)
      conversation.push(msg)

      // Si l'assistant a demandé des outils : exécute et boucle
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        for (const tc of msg.tool_calls) {
          let args: Record<string, unknown> = {}
          try {
            args = JSON.parse(tc.function.arguments || '{}')
          } catch {
            args = {}
          }
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
  } catch (err) {
    console.error('[chat] Grok error:', err)
    return new Response(
      JSON.stringify({
        error: 'Erreur Grok : ' + (err instanceof Error ? err.message : 'inconnue'),
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
