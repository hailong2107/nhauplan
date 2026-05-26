import { renderKeoList, openModal, closeModal, addKeoToList, showToast, updateInviteNote } from './ui.js'
import * as Events from './events.js'
import * as Storage from './storage.js'
import { loadData as loadCloudData } from './cloudflare-api.js'
import { q, debounce } from './utils.js'
import { generateInviteQR, downloadQRCode, copyToClipboard } from './qr-utils.js'
const inviteToken = new URLSearchParams(window.location.search).get('invite') || ''

// Store for tracking current QR/invite state during form
let currentFormState = {
  inviteCode: '',
  inviteLink: ''
}

function bind() {
  q('#open-create').addEventListener('click', () => {
    q('#form-create').reset()
    q('#qr-share-section').classList.add('hidden')
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

  const doRender = () => renderKeoList(q('#filter').value, q('#search').value.trim(), inviteToken)
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

  // Handle invite-only checkbox and QR generation
  q('#input-invite-only').addEventListener('change', (ev) => {
    handleInviteOnlyChange(ev.target.checked)
  })

  // Handle copy invite link button
  q('#btn-copy-invite').addEventListener('click', async () => {
    const linkInput = q('#invite-link-display')
    if (!linkInput.value) return
    const success = await copyToClipboard(linkInput.value)
    if (success) {
      q('#copy-text').classList.add('hidden')
      q('#copy-check').classList.remove('hidden')
      setTimeout(() => {
        q('#copy-text').classList.remove('hidden')
        q('#copy-check').classList.add('hidden')
      }, 2000)
      showToast('Link đã sao chép!')
    } else {
      showToast('Không thể sao chép link')
    }
  })

  // Handle download QR button
  q('#btn-download-qr').addEventListener('click', async () => {
    const canvas = q('#qr-canvas-modal')
    try {
      const ok = await downloadQRCode(canvas, 'nhau-invite')
      if (ok) showToast('QR code đã tải xuống!')
      else showToast('Không thể tải QR code')
    } catch (e) {
      showToast('Không thể tải QR code')
    }
  })

  // Open advanced QR generator iframe inside modal
  q('#btn-open-qr-advanced').addEventListener('click', () => {
    const iframe = q('#qr-generator-iframe')
    if (!iframe) return
    const isHidden = iframe.classList.contains('hidden')
    if (isHidden) {
      iframe.classList.remove('hidden')
      iframe.setAttribute('aria-hidden', 'false')
      // if there's already an invite link, send it to the generator
      if (currentFormState.inviteLink) {
        // give iframe a moment to be ready
        setTimeout(() => {
          try { iframe.contentWindow.postMessage({ type: 'loadLink', link: currentFormState.inviteLink }, '*') } catch (e) {}
        }, 180)
      }
    } else {
      iframe.classList.add('hidden')
      iframe.setAttribute('aria-hidden', 'true')
    }
  })
}

/**
 * Handle invite-only checkbox change
 */
function handleInviteOnlyChange(isChecked) {
  const section = q('#qr-share-section')
  if (!isChecked) {
    section.classList.add('hidden')
    currentFormState.inviteCode = ''
    currentFormState.inviteLink = ''
    return
  }

  // Generate invite code
  const inviteCode = Storage.generateId('inv_').slice(0, 12)
  
  // Create invite link
  const baseUrl = window.location.origin + window.location.pathname
  const inviteLink = `${baseUrl}?invite=${inviteCode}`
  
  // Store for later use in form submission
  currentFormState.inviteCode = inviteCode
  currentFormState.inviteLink = inviteLink
  
  // Update input
  const linkInput = q('#invite-link-display')
  linkInput.value = inviteLink
  
  // Generate and display QR code
  const canvas = q('#qr-canvas-modal')
  generateInviteQR(inviteLink, canvas)
  
  // Show section
  section.classList.remove('hidden')

  // If advanced iframe is open, send the link to it so it can auto-generate
  const iframe = q('#qr-generator-iframe')
  if (iframe && !iframe.classList.contains('hidden')) {
    try { iframe.contentWindow.postMessage({ type: 'loadLink', link: inviteLink }, '*') } catch (e) {}
  }
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
  const inviteOnly = q('#input-invite-only').checked
  if (!title) { showToast('Vui lòng nhập tiêu đề kèo'); q('#input-title').focus(); return }
  if (!datetime) { showToast('Vui lòng chọn thời gian'); q('#input-datetime').focus(); return }
  try {
    btn.disabled = true
    const keo = Events.createKeo({ 
      title, 
      datetime, 
      location, 
      creator, 
      participants, 
      inviteOnly,
      inviteCode: inviteOnly ? currentFormState.inviteCode : ''
    })
    addKeoToList(keo)
    closeModal()
    showToast('Kèo đã được tạo!')
    
    // If invite-only, show invite link after creation
    if (inviteOnly && keo.inviteCode) {
      const baseUrl = window.location.origin + window.location.pathname
      const inviteLink = `${baseUrl}?invite=${keo.inviteCode}`
      setTimeout(() => {
        showToast(`📱 Link mời: ${inviteLink}`)
      }, 600)
    }
    
    // Reset form state
    currentFormState = { inviteCode: '', inviteLink: '' }
  } catch (e) {
    console.error('Tạo kèo lỗi', e)
    showToast('Có lỗi khi tạo kèo')
  } finally {
    setTimeout(() => { if (btn) btn.disabled = false }, 600)
  }
}

async function hydrateCloudData() {
  const result = await loadCloudData()
  if (result.data) {
    const filter = q('#filter') ? q('#filter').value : 'all'
    const search = q('#search') ? q('#search').value.trim() : ''
    renderKeoList(filter, search, inviteToken)
    if (result.source === 'server') {
      showToast('Dữ liệu đã được đồng bộ từ server')
    }
  } else {
    console.warn('[app] Cloudflare load failed:', result.error)
  }
}

function init() {
  // load theme
  const t = Storage.getTheme() || 'dark'
  applyTheme(t)
  bind()
  // render cached local data quickly
  const filter = q('#filter') ? q('#filter').value : 'all'
  const search = q('#search') ? q('#search').value.trim() : ''
  renderKeoList(filter, search, inviteToken)
  updateInviteNote(inviteToken)
  // hydrate from Cloudflare worker in background
  hydrateCloudData()
}

document.addEventListener('DOMContentLoaded', init)
