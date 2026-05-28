const CHAT_KEY = 'chat:messages'
const DATA_KEY = 'events:data'
const MAX_MESSAGES = 50

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Accept',
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  })
}

async function readMessages(kv) {
  const raw = await kv.get(CHAT_KEY)
  if (!raw) return []
  try {
    const messages = JSON.parse(raw)
    return Array.isArray(messages) ? messages : []
  } catch (e) {
    return []
  }
}

async function readEventData(kv) {
  const raw = await kv.get(DATA_KEY)
  if (!raw) return { keos: [] }
  try {
    return JSON.parse(raw) || { keos: [] }
  } catch (e) {
    return { keos: [] }
  }
}

function createMessage(text) {
  return {
    id: crypto.randomUUID(),
    text: String(text || '').trim().slice(0, 500),
    timestamp: new Date().toISOString(),
  }
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

    const url = new URL(request.url)
    const kv = env.NHAU_KV
    if (!kv) return json({ error: 'Missing KV binding NHAU_KV' }, 500)

    if (url.pathname === '/' && request.method === 'GET' && url.searchParams.get('action') === 'load') {
      return json(await readEventData(kv))
    }

    if (url.pathname === '/' && request.method === 'POST') {
      const body = await request.json().catch(() => null)
      if (!body || typeof body !== 'object') return json({ error: 'Invalid payload' }, 400)
      const data = { ...body, updatedAt: new Date().toISOString() }
      await kv.put(DATA_KEY, JSON.stringify(data))
      return json(data)
    }

    if (url.pathname === '/chat/list' && request.method === 'GET') {
      const messages = await readMessages(kv)
      return json({ messages: messages.slice(-MAX_MESSAGES) })
    }

    if (url.pathname === '/chat/send' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}))
      const message = createMessage(body.text)
      if (!message.text) return json({ error: 'Message text is required' }, 400)
      const messages = await readMessages(kv)
      const next = [...messages, message].slice(-MAX_MESSAGES)
      await kv.put(CHAT_KEY, JSON.stringify(next))
      return json({ message })
    }

    return json({ error: 'Not found' }, 404)
  },
}
