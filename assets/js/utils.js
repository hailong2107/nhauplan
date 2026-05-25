export function q(sel, el = document) { return el.querySelector(sel) }
export function qa(sel, el = document) { return Array.from(el.querySelectorAll(sel)) }

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v
    else if (k === 'dataset') Object.assign(node.dataset, v)
    else node.setAttribute(k, v)
  }
  for (const c of children) {
    if (c == null) continue
    node.append(typeof c === 'string' ? document.createTextNode(c) : c)
  }
  return node
}

export function formatDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  try {
    return d.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
  } catch (e) {
    return d.toString()
  }
}

export function debounce(fn, wait = 250) {
  let t
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), wait) }
}
