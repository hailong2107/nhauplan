const DATA_KEY = 'nhauplanner:data:v1'
const THEME_KEY = 'nhauplanner:theme:v1'
const ADMIN_KEY_STORAGE = 'nhauplanner:admin:v1'

export function loadData() {
  try {
    const raw = localStorage.getItem(DATA_KEY)
    if (!raw) return { keos: [] }
    return JSON.parse(raw)
  } catch (e) { return { keos: [] } }
}

export function saveData(data) {
  localStorage.setItem(DATA_KEY, JSON.stringify(data))
}

export function generateId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2,8)
}

export function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'dark'
}

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme)
}

export function setAdminKey(key) {
  if (key && typeof key === 'string' && key.trim().length > 0) {
    localStorage.setItem(ADMIN_KEY_STORAGE, key.trim())
    return true
  }
  return false
}

export function getAdminKey() {
  return localStorage.getItem(ADMIN_KEY_STORAGE) || ''
}

export function verifyAdminKey(key) {
  const stored = getAdminKey()
  return stored && key === stored
}

export function clearAdminKey() {
  localStorage.removeItem(ADMIN_KEY_STORAGE)
}

export function isAdminMode() {
  return !!getAdminKey()
}
