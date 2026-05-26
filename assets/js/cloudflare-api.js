/**
 * Cloudflare Worker API client for Nhậu Planner events.
 *
 * This module is intentionally modular and vanilla JS only.
 * It provides a fast cached load path, background sync,
 * retryable POSTs, frontend rate limiting, and graceful error handling.
 */

import { saveData as saveLocalData } from './storage.js'

const API_ENDPOINT = 'https://hidden-star-cca9.hailong2107.workers.dev/'
const API_KEY = '' // Add your Cloudflare Worker API key here, or call setApiKey() at runtime.
const CACHE_KEY = 'nhauplanner:event-cache:v1'
const RATE_LIMIT_KEY = 'nhauplanner:event-rate:v1'
const REQUEST_TIMEOUT_MS = 5000
const MAX_RETRIES = 2
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 10_000
const CACHE_REFRESH_MS = 60_000
const CACHE_VERSION = '1.0'

let saveLock = null
let syncInProgress = false
let rateHistory = null

function now() {
  return Date.now()
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value)
  } catch (e) {
    return null
  }
}

function loadStoredItem(key) {
  try {
    return safeJsonParse(localStorage.getItem(key))
  } catch (e) {
    return null
  }
}

function saveStoredItem(key, payload) {
  try {
    localStorage.setItem(key, JSON.stringify(payload))
  } catch (e) {
    console.warn('[CloudflareAPI] Unable to save to localStorage', e)
  }
}

function pruneRateHistory(records = []) {
  const cutoff = now() - RATE_LIMIT_WINDOW_MS
  return records.filter((ts) => ts > cutoff)
}

function getRateHistory() {
  if (rateHistory) return rateHistory
  rateHistory = pruneRateHistory(loadStoredItem(RATE_LIMIT_KEY) || [])
  return rateHistory
}

function recordRateRequest() {
  const records = getRateHistory()
  records.push(now())
  const pruned = pruneRateHistory(records)
  rateHistory = pruned
  saveStoredItem(RATE_LIMIT_KEY, pruned)
}

function isRateLimited() {
  const records = getRateHistory()
  return records.length >= RATE_LIMIT_MAX
}

function buildHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  const apiKey = getApiKey()
  if (apiKey) {
    headers['x-api-key'] = apiKey
  }
  return headers
}

function createAbortSignal(timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const signal = controller.signal
  signal.addEventListener('abort', () => clearTimeout(timer))
  return signal
}

async function fetchWithTimeout(url, options = {}) {
  const signal = createAbortSignal(REQUEST_TIMEOUT_MS)
  const response = await fetch(url, { ...options, signal })
  return response
}

async function parseJsonSafe(response) {
  try {
    return await response.json()
  } catch (e) {
    return null
  }
}

function isAuthError(status) {
  return status === 401 || status === 403
}

function getCacheEntry() {
  const raw = loadStoredItem(CACHE_KEY)
  if (!raw || typeof raw !== 'object') return null
  if (!raw.data) return null
  return {
    version: raw.version || '0',
    timestamp: raw.timestamp || 0,
    lastSyncedAt: raw.lastSyncedAt || 0,
    data: raw.data,
  }
}

function setCacheEntry(data) {
  const entry = {
    version: CACHE_VERSION,
    timestamp: now(),
    lastSyncedAt: now(),
    data,
  }
  saveStoredItem(CACHE_KEY, entry)
  saveLocalData(data)
  return entry
}

function updateCacheTimestamp(data, lastSyncedAt = now()) {
  const entry = {
    version: CACHE_VERSION,
    timestamp: now(),
    lastSyncedAt,
    data,
  }
  saveStoredItem(CACHE_KEY, entry)
  saveLocalData(data)
  return entry
}

function dispatchCloudflareUpdate(data) {
  try {
    window.dispatchEvent(new CustomEvent('cloudflare-data-updated', { detail: { data } }))
  } catch (e) {
    console.warn('[CloudflareAPI] Unable to dispatch update event', e)
  }
}

async function fetchServerData() {
  try {
    const url = new URL(API_ENDPOINT)
    url.searchParams.set('action', 'load')
    const apiKey = getApiKey()
    if (apiKey) {
      url.searchParams.set('api_key', apiKey)
    }
    const response = await fetchWithTimeout(url.toString(), {
      method: 'GET',
      headers: buildHeaders(),
    })

    if (!response.ok) {
      if (isAuthError(response.status)) {
        return { ok: false, status: response.status, error: 'Unauthorized or forbidden' }
      }
      return { ok: false, status: response.status, error: `Server returned ${response.status}` }
    }

    const json = await parseJsonSafe(response)
    if (!json) {
      return { ok: false, status: response.status, error: 'Invalid JSON from server' }
    }

    return { ok: true, status: response.status, data: json }
  } catch (error) {
    if (error.name === 'AbortError') {
      return { ok: false, status: 0, error: 'Request timed out' }
    }
    return { ok: false, status: 0, error: error.message || 'Network error' }
  }
}

async function postServerData(payload) {
  let attempt = 0
  let backoff = 300

  while (attempt <= MAX_RETRIES) {
    try {
      const url = new URL(API_ENDPOINT)
      const apiKey = getApiKey()
      if (apiKey) {
        url.searchParams.set('api_key', apiKey)
      }
      const response = await fetchWithTimeout(url.toString(), {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        if (isAuthError(response.status)) {
          return { ok: false, status: response.status, error: 'Unauthorized or forbidden' }
        }
        const text = await response.text().catch(() => '')
        const message = text || `Server returned ${response.status}`
        if (attempt >= MAX_RETRIES) {
          return { ok: false, status: response.status, error: message }
        }
      } else {
        const json = await parseJsonSafe(response)
        if (!json) {
          if (attempt >= MAX_RETRIES) {
            return { ok: false, status: response.status, error: 'Invalid JSON response' }
          }
        } else {
          return { ok: true, status: response.status, data: json }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        if (attempt >= MAX_RETRIES) {
          return { ok: false, status: 0, error: 'Request timed out' }
        }
      } else {
        if (attempt >= MAX_RETRIES) {
          return { ok: false, status: 0, error: error.message || 'Network error' }
        }
      }
    }

    attempt += 1
    await sleep(backoff)
    backoff *= 2
  }

  return { ok: false, status: 0, error: 'Unable to save data after retries' }
}

async function backgroundRefresh() {
  if (syncInProgress) return
  syncInProgress = true
  try {
    const result = await fetchServerData()
    if (result.ok) {
      updateCacheTimestamp(result.data, now())
      dispatchCloudflareUpdate(result.data)
    }
    return result
  } finally {
    syncInProgress = false
  }
}

function shouldBackgroundRefresh(entry) {
  if (!entry) return true
  return now() - entry.lastSyncedAt > CACHE_REFRESH_MS
}

/**
 * Load event data from cache first, then refresh from the server in background.
 * Returns cached data immediately if available.
 */
export async function loadData() {
  const cacheEntry = getCacheEntry()

  if (cacheEntry) {
    saveLocalData(cacheEntry.data)
    if (shouldBackgroundRefresh(cacheEntry)) {
      backgroundRefresh().catch(() => {})
    }
    return { source: 'cache', data: cacheEntry.data, meta: { cachedAt: cacheEntry.timestamp, version: cacheEntry.version } }
  }

  const serverResponse = await fetchServerData()
  if (serverResponse.ok) {
    const entry = setCacheEntry(serverResponse.data)
    return { source: 'server', data: entry.data, meta: { cachedAt: entry.timestamp, version: entry.version } }
  }

  return { source: 'error', data: { keos: [] }, error: serverResponse.error, status: serverResponse.status }
}

/**
 * Save event data to the Cloudflare Worker API.
 * Uses optimistic cache update, retries, and request locking.
 */
export async function saveData(payload) {
  if (saveLock) {
    return saveLock
  }

  if (isRateLimited()) {
    return { ok: false, error: 'Too many requests. Please wait a moment.', status: 429 }
  }

  recordRateRequest()
  const optimisticData = { ...payload, clientUpdatedAt: now() }
  updateCacheTimestamp(optimisticData, now())

  const savePromise = (async () => {
    try {
      const response = await postServerData(payload)
      if (response.ok && response.data) {
        updateCacheTimestamp(response.data, now())
        return { ok: true, data: response.data, status: response.status }
      }
      return { ok: false, error: response.error || 'Save failed', status: response.status }
    } catch (error) {
      return { ok: false, error: error.message || 'Save failed', status: 0 }
    }
  })()

  saveLock = savePromise.finally(() => {
    saveLock = null
  })

  return savePromise
}

export function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch (e) {
    console.warn('[CloudflareAPI] Failed to clear cache', e)
  }
}

export function setApiKey(value) {
  if (typeof value === 'string' && value.trim()) {
    window.__NHAU_WORKER_API_KEY = value.trim()
  }
}

export function getApiKey() {
  return window.__NHAU_WORKER_API_KEY || API_KEY
}

/**
 * Example usage:
 * import { loadData, saveData, clearCache } from './cloudflare-api.js'
 * const result = await loadData()
 * if (result.ok !== false) { render(result.data) }
 * const saveResult = await saveData({ keos: [] })
 */
