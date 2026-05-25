const DATA_KEY = 'nhauplanner:data:v1'
const THEME_KEY = 'nhauplanner:theme:v1'

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
