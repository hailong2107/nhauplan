import { loadData as loadLocalData, saveData as saveLocalData, generateId } from './storage.js'
import { saveData as saveCloudData } from './cloudflare-api.js'

export const SUGGESTIONS = [
  'Kèo chill cuối tuần',
  'Nhậu nhẹ thôi (nói dối)',
  'Tối nay không về sớm',
  'Team building bất ổn',
  'Kèo gọi 1 ly thôi',
  'Uống nhẹ, cười tẹt ga',
]

function persist(data) {
  saveLocalData(data)
  saveCloudData(data).catch((err) => {
    console.warn('[events] Cloudflare save failed', err)
  })
}

export function createKeo({ title, datetime, location, creator, participants = [], inviteOnly = false, inviteCode = '' }) {
  const data = loadLocalData()
  const keo = {
    id: generateId('k_'),
    title: title.trim(),
    datetime: datetime || new Date().toISOString(),
    location: location || '',
    creator: (creator || 'Ẩn danh').trim(),
    participants: participants.filter(Boolean).map(s => s.trim()),
    votes: { bia: 0, nuong: 0, lau: 0 },
    voters: [],
    inviteOnly: Boolean(inviteOnly),
    inviteCode: inviteOnly ? (inviteCode || generateId('inv_')) : '',
    createdAt: new Date().toISOString()
  }
  data.keos = data.keos || []
  data.keos.unshift(keo)
  persist(data)
  return keo
}

export function deleteKeo(id) {
  const data = loadLocalData()
  data.keos = (data.keos || []).filter(k => k.id !== id)
  persist(data)
}

export function voteKeo(id, type = 'bia', voter = 'Ẩn danh') {
  const data = loadLocalData()
  const keo = (data.keos || []).find(k => k.id === id)
  if (!keo) return null
  if (!keo.votes) keo.votes = { bia:0, nuong:0, lau:0 }
  if (!['bia','nuong','lau'].includes(type)) type = 'bia'
  keo.votes[type] = (keo.votes[type] || 0) + 1
  keo.voters.push({ name: (voter || 'Ẩn danh').trim(), type, at: new Date().toISOString() })
  persist(data)
  return keo
}

export function addParticipant(id, name) {
  const data = loadLocalData()
  const keo = (data.keos || []).find(k => k.id === id)
  if (!keo) return null
  const clean = (name || '').trim()
  if (!clean) return keo
  keo.participants = keo.participants || []
  if (!keo.participants.includes(clean)) keo.participants.push(clean)
  persist(data)
  return keo
}

export function exportIcs(keo) {
  if (!keo) return null
  const dtStart = new Date(keo.datetime || keo.createdAt)
  const dtEnd = new Date(dtStart.getTime() + 1000 * 60 * 60 * 2) // 2h
  const toICSDate = d => d.toISOString().replace(/-|:|\.\d{3}/g, '')
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Nhau Planner//EN',
    'BEGIN:VEVENT',
    `UID:${keo.id}`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(dtStart)}`,
    `DTEND:${toICSDate(dtEnd)}`,
    `SUMMARY:${keo.title}`,
    `DESCRIPTION:Địa điểm: ${keo.location}\\nNgười tạo: ${keo.creator}`,
    `LOCATION:${keo.location}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  return URL.createObjectURL(blob)
}

export function suggestKeo() {
  const i = Math.floor(Math.random() * SUGGESTIONS.length)
  return SUGGESTIONS[i]
}

export function stats() {
  const data = loadLocalData()
  const keos = data.keos || []
  const totalKeo = keos.length
  const totalVotes = keos.reduce((s,k) => s + ((k.votes && (k.votes.bia||0) + (k.votes.nuong||0) + (k.votes.lau||0))||0), 0)
  // leader creator
  const creatorsCount = {}
  const votersCount = {}
  keos.forEach(k => {
    creatorsCount[k.creator] = (creatorsCount[k.creator] || 0) + 1;
    (k.voters || []).forEach(v => { votersCount[v.name] = (votersCount[v.name]||0)+1 })
  })
  const leaderCreator = Object.entries(creatorsCount).sort((a,b)=>b[1]-a[1])[0]
  const leaderVoter = Object.entries(votersCount).sort((a,b)=>b[1]-a[1])[0]
  return {
    totalKeo,
    totalVotes,
    leaderCreator: leaderCreator ? `${leaderCreator[0]} (${leaderCreator[1]})` : '—',
    leaderVoter: leaderVoter ? `${leaderVoter[0]} (${leaderVoter[1]})` : '—'
  }
}
