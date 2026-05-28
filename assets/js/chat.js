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
  }).then(readJson)
  return Array.isArray(json.messages) ? json.messages : []
}

export async function sendChatMessage(text) {
  const clean = String(text || '').trim()
  if (!clean) return null
  const json = await fetch(apiUrl('/chat/send'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ text: clean }),
  }).then(readJson)
  return json.message
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
