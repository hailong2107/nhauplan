import { q, qa, el, formatDateTime } from './utils.js'
import * as Events from './events.js'
import { loadData } from './storage.js'

const toastEl = () => q('#toast')
const keoListEl = () => q('#keo-list')

export function showToast(msg, timeout = 2500) {
  const t = toastEl()
  t.textContent = msg
  t.classList.add('show')
  clearTimeout(t._h)
  t._h = setTimeout(() => t.classList.remove('show'), timeout)
}

export function updateInviteNote(inviteToken = '', hiddenCount = 0) {
  const note = q('#invite-note')
  if (!note) return
  if (inviteToken) {
    note.textContent = 'Bạn đang xem chế độ mời riêng. Những kèo invite phù hợp đã hiển thị.'
    note.classList.add('active')
    return
  }
  if (hiddenCount > 0) {
    note.textContent = `Có ${hiddenCount} kèo riêng chỉ dành cho người có link mời. Nếu bạn có link, hãy mở trang với ?invite=CODE.`
    note.classList.add('active')
    return
  }
  note.textContent = ''
  note.classList.remove('active')
}

export function openModal() {
  const m = q('#modal')
  m.setAttribute('aria-hidden', 'false')
}

export function closeModal() {
  const m = q('#modal')
  m.setAttribute('aria-hidden', 'true')
}

function createVoteButton(type, label, count) {
  const btn = el('button', { class: 'vote-btn', 'data-type': type })
  btn.innerHTML = `${label} <span class="vote-count">${count||0}</span>`
  return btn
}

function createKeoCard(keo) {
  const card = el('div', { class: 'card', dataset: { id: keo.id } })
  const title = el('h3', {}, keo.title)
  const badge = keo.inviteOnly ? el('div', { class: 'invite-badge' }, 'Link mời') : null
  const meta = el('div', { class: 'meta' }, `${formatDateTime(keo.datetime)} • ${keo.location || 'Chưa rõ'}`)
  const votes = el('div', { class: 'votes' })
  const bBtn = createVoteButton('bia', 'Bia 🍺', keo.votes?.bia)
  const nBtn = createVoteButton('nuong', 'Nướng 🔥', keo.votes?.nuong)
  const lBtn = createVoteButton('lau', 'Lẩu 🫕', keo.votes?.lau)
  votes.append(bBtn, nBtn, lBtn)

  const part = el('div', { class: 'participants' }, `Ai tham gia: ${keo.participants && keo.participants.length ? keo.participants.join(', ') : 'Chưa ai'}`)
  
  const deleteCodeNote = el('div', { class: 'delete-code-note', style: 'font-size: 0.85rem; color: #999; margin-top: 0.5rem;' })
  deleteCodeNote.innerHTML = `<strong style="color: #666;">Mã xóa:</strong> <code style="background: #f0f0f0; padding: 0.2rem 0.4rem; border-radius: 3px;">${keo.deleteCode || 'N/A'}</code>`

  const actions = el('div', { class: 'small-actions' })
  const inputName = el('input', { class: 'input', placeholder: 'Thêm tên...' })
  inputName.style.flex = '1'
  const btnAddPart = el('button', { class: 'btn small' }, 'Thêm')
  const btnIcs = el('button', { class: 'btn small' }, 'Thêm vào lịch')
  const btnShare = keo.inviteOnly ? el('button', { class: 'btn small ghost' }, 'Sao chép link mời') : null
  const btnDelete = el('button', { class: 'btn light' }, 'Xoá')
  if (btnShare) actions.append(inputName, btnAddPart, btnIcs, btnShare, btnDelete)
  else actions.append(inputName, btnAddPart, btnIcs, btnDelete)

  if (badge) card.append(title, badge, meta, votes, part, deleteCodeNote, actions)
  else card.append(title, meta, votes, part, deleteCodeNote, actions)

  // listeners
  votes.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.vote-btn')
    if (!btn) return
    const type = btn.dataset.type
    // animate
    btn.classList.add('pulse')
    setTimeout(() => btn.classList.remove('pulse'), 300)
    const name = prompt('Bạn tên gì? (để tính leaderboard)', '') || 'Ẩn danh'
    import('./events.js').then(mod => {
      mod.voteKeo(keo.id, type, name)
      updateKeoInDom(keo.id)
      showToast('Vote thành công!')
    })
  })

  btnAddPart.addEventListener('click', () => {
    const name = inputName.value.trim()
    if (!name) { showToast('Nhập tên đã') ; return }
    import('./events.js').then(mod => {
      mod.addParticipant(keo.id, name)
      updateKeoInDom(keo.id)
      inputName.value = ''
      showToast(`${name} đã được thêm vào danh sách`)
    })
  })

  btnIcs.addEventListener('click', async () => {
    const mod = await import('./events.js')
    const url = mod.exportIcs(keo)
    const a = document.createElement('a')
    a.href = url
    a.download = `${keo.title.replace(/\s+/g,'_') || 'keo'}.ics`
    document.body.appendChild(a)
    a.click()
    a.remove()
    showToast('Đã thêm vào lịch!')
  })

  if (keo.inviteOnly && btnShare) {
    btnShare.addEventListener('click', async () => {
      const invitation = new URL(window.location.href)
      invitation.searchParams.set('invite', keo.inviteCode)
      const link = invitation.toString()
      try {
        await navigator.clipboard.writeText(link)
        showToast('Đã sao chép link mời!')
      } catch (e) {
        const temp = document.createElement('textarea')
        temp.value = link
        document.body.appendChild(temp)
        temp.select()
        document.execCommand('copy')
        temp.remove()
        showToast('Đã sao chép link mời!')
      }
    })
  }

  btnDelete.addEventListener('click', () => {
    const code = prompt(`Nhập mã xóa kèo (gợi ý: ${keo.deleteCode}):`, '')
    if (code === null || code === '') return
    import('./events.js').then(mod => {
      const ok = mod.deleteKeo(keo.id, code)
      if (ok) {
        removeKeoFromDom(keo.id)
        showToast('Kèo đã được xoá')
      } else {
        showToast('❌ Mã xóa không chính xác!')
      }
    })
  })

  return card
}

export function renderKeoList(filter = 'all', search = '', inviteToken = '') {
  const data = loadData()
  const list = data.keos || []
  const wrap = keoListEl()
  wrap.innerHTML = ''
  const hiddenCount = list.filter(k => k.inviteOnly && k.inviteCode !== inviteToken).length
  updateInviteNote(inviteToken, hiddenCount)
  const items = list.filter(k => {
    if (k.inviteOnly && k.inviteCode !== inviteToken) return false
    const s = (k.title + ' ' + k.location).toLowerCase()
    if (search && !s.includes(search.toLowerCase())) return false
    if (filter === 'upcoming') return new Date(k.datetime) > new Date()
    if (filter === 'past') return new Date(k.datetime) <= new Date()
    return true
  })
  if (items.length === 0) {
    const empty = el('div', { class: 'empty' })
    empty.innerHTML = document.getElementById('empty-state').innerHTML
    wrap.appendChild(empty)
  } else {
    items.forEach(k => wrap.appendChild(createKeoCard(k)))
  }
  updateDashboard()
  updateLeaderboard()
}

export function addKeoToList(keo) {
  const wrap = keoListEl()
  const card = createKeoCard(keo)
  // insert on top
  if (wrap.firstChild) wrap.insertBefore(card, wrap.firstChild)
  else wrap.appendChild(card)
  updateDashboard()
  updateLeaderboard()
}

export function updateKeoInDom(id) {
  const data = loadData()
  const keo = (data.keos||[]).find(k=>k.id===id)
  if (!keo) return
  const wrap = keoListEl()
  const card = wrap.querySelector(`[data-id="${id}"]`)
  if (!card) return
  // update votes
  const b = card.querySelector('[data-type="bia"] .vote-count')
  const n = card.querySelector('[data-type="nuong"] .vote-count')
  const l = card.querySelector('[data-type="lau"] .vote-count')
  if (b) b.textContent = keo.votes?.bia || 0
  if (n) n.textContent = keo.votes?.nuong || 0
  if (l) l.textContent = keo.votes?.lau || 0
  // update participants
  const p = card.querySelector('.participants')
  if (p) p.textContent = `Ai tham gia: ${keo.participants && keo.participants.length ? keo.participants.join(', ') : 'Chưa ai'}`
  updateDashboard()
  updateLeaderboard()
}

export function removeKeoFromDom(id) {
  const wrap = keoListEl()
  const card = wrap.querySelector(`[data-id="${id}"]`)
  if (card) card.remove()
  updateDashboard()
  updateLeaderboard()
}

export function updateDashboard() {
  const data = loadData()
  const keos = data.keos || []
  const totalKeo = keos.length
  const totalVotes = keos.reduce((s,k)=> s + ((k.votes && (k.votes.bia||0) + (k.votes.nuong||0) + (k.votes.lau||0))||0),0)
  q('#total-keo').textContent = totalKeo
  q('#total-votes').textContent = totalVotes
}

export function updateLeaderboard() {
  const s = Events.stats()
  q('#leader-creator').textContent = s.leaderCreator
  q('#leader-voter').textContent = s.leaderVoter
}
