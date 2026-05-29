const API_ENDPOINT = 'https://hidden-star-cca9.hailong2107.workers.dev'
const POLL_MS = 4000

function apiUrl(path) {
  return `${API_ENDPOINT.replace(/\/$/, '')}${path}`
}

async function readJson(response) {
  const json = await response.json().catch(() => null)
  if (!response.ok) throw new Error(json?.error || `Chat API ${response.status}`)
  return json
}

export async function listChatMessages() {
  const json = await fetch(apiUrl('/chat/list'), {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  }).then(readJson)
  if (Array.isArray(json.messages)) return json.messages
  if (Array.isArray(json?.data)) return json.data
  if (Array.isArray(json)) return json
  if (json && typeof json === 'object' && 'text' in json) {
    return [{ id: json.id || `remote-${Date.now()}`, text: json.text, timestamp: json.timestamp || new Date().toISOString() }]
  }
  return []
}

export async function sendChatMessage(text) {
  const clean = String(text || '').trim()
  if (!clean) return null
  const json = await fetch(apiUrl('/chat/send'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({ text: clean }),
  }).then(readJson)
  return json.message || { id: `local-${Date.now()}`, text: clean, timestamp: new Date().toISOString() }
}

export function startChatPolling(onMessages, interval = POLL_MS) {
  let stopped = false

  async function tick() {
    try {
      const messages = await listChatMessages()
      if (!stopped) onMessages(messages)
    } catch (error) {
      console.warn('[chat] Poll failed', error)
    }
  }

  tick()
  const timer = setInterval(tick, interval)
  return () => {
    stopped = true
    clearInterval(timer)
  }
}
