import { renderKeoList, openModal, closeModal, addKeoToList, showToast } from './ui.js'
import * as Events from './events.js'
import * as Storage from './storage.js'
import { q, debounce } from './utils.js'
function bind() {
  q('#open-create').addEventListener('click', () => {
    q('#form-create').reset()
    openModal()
    // focus slightly after opening to allow animations
    setTimeout(() => q('#input-title').focus(), 80)
  })

  q('#modal-close').addEventListener('click', () => closeModal())
  q('#btn-cancel').addEventListener('click', () => closeModal())

  // form submit (Enter in inputs)
  q('#form-create').addEventListener('submit', (ev) => {
    ev.preventDefault()
    handleCreateKeo()
  })

  q('#btn-add').addEventListener('click', () => handleCreateKeo())

  q('#suggest-keo').addEventListener('click', () => {
    const s = Events.suggestKeo()
    q('#input-title').value = s
    showToast('Gợi ý kèo đã sẵn sàng')
    q('#input-datetime').focus()
  })

  const doRender = () => renderKeoList(q('#filter').value, q('#search').value.trim())
  q('#filter').addEventListener('change', doRender)
  q('#clear-search').addEventListener('click', () => { q('#search').value=''; doRender() })
  q('#search').addEventListener('input', debounce(doRender, 180))

  q('#toggle-theme').addEventListener('click', () => {
    const current = document.getElementById('app').classList.contains('light-mode') ? 'light' : 'dark'
    const next = current === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    Storage.setTheme(next)
  })

  // close modal on Escape
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      const m = document.getElementById('modal')
      if (m && m.getAttribute('aria-hidden') === 'false') closeModal()
    }
  })
}

function applyTheme(theme) {
  const app = document.getElementById('app')
  if (theme === 'light') {
    app.classList.add('light-mode')
  } else {
    app.classList.remove('light-mode')
  }
  // update toggle button text/aria
  const tbtn = q('#toggle-theme')
  if (tbtn) {
    if (theme === 'light') {
      tbtn.textContent = 'Sáng ☀️'
      tbtn.setAttribute('aria-pressed', 'true')
    } else {
      tbtn.textContent = 'Tối 🌙'
      tbtn.setAttribute('aria-pressed', 'false')
    }
  }
}

function handleCreateKeo() {
  const btn = q('#btn-add')
  if (btn.disabled) return
  const title = q('#input-title').value.trim()
  const datetime = q('#input-datetime').value
  const location = q('#input-location').value.trim()
  const creator = q('#input-creator').value.trim() || 'Ẩn danh'
  const participants = q('#input-participants').value.split('\n').map(s=>s.trim()).filter(Boolean)
  if (!title) { showToast('Vui lòng nhập tiêu đề kèo'); q('#input-title').focus(); return }
  if (!datetime) { showToast('Vui lòng chọn thời gian'); q('#input-datetime').focus(); return }
  try {
    btn.disabled = true
    const keo = Events.createKeo({ title, datetime, location, creator, participants })
    addKeoToList(keo)
    closeModal()
    showToast('Kèo đã được tạo!')
  } catch (e) {
    console.error('Tạo kèo lỗi', e)
    showToast('Có lỗi khi tạo kèo')
  } finally {
    setTimeout(() => { if (btn) btn.disabled = false }, 600)
  }
}

function init() {
  // load theme
  const t = Storage.getTheme() || 'dark'
  applyTheme(t)
  bind()
  // initial render using current controls
  renderKeoList(q('#filter').value, q('#search').value.trim())
}

document.addEventListener('DOMContentLoaded', init)
