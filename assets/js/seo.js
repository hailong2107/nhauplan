const DEFAULT_TITLE = 'Nhậu Planner - Lên kèo cùng anh em'
const DEFAULT_DESCRIPTION = 'Tạo kèo nhanh, mời bạn bè, vote kiểu nhậu, chat nhẹ và thêm vào lịch.'

function setAttr(selector, attr, value) {
  const node = document.querySelector(selector)
  if (node && value) node.setAttribute(attr, value)
}

export function slugify(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function updateMeta({ title = DEFAULT_TITLE, description = DEFAULT_DESCRIPTION, url = window.location.href, image = '/assets/og-image.png' } = {}) {
  document.title = title
  setAttr('meta[name="description"]', 'content', description)
  setAttr('meta[property="og:title"]', 'content', title)
  setAttr('meta[property="og:description"]', 'content', description)
  setAttr('meta[property="og:url"]', 'content', url)
  setAttr('meta[property="og:image"]', 'content', new URL(image, window.location.origin).href)
  setAttr('meta[name="twitter:title"]', 'content', title)
  setAttr('meta[name="twitter:description"]', 'content', description)
  setAttr('meta[name="twitter:image"]', 'content', new URL(image, window.location.origin).href)
  const canonical = document.querySelector('link[rel="canonical"]')
  if (canonical) canonical.href = url.split('?')[0]
}

export function initSeo(inviteToken = '') {
  const title = inviteToken ? 'Nhậu Planner - Kèo mời riêng' : DEFAULT_TITLE
  const description = inviteToken
    ? 'Mở kèo mời riêng, vote món, chat cùng anh em và thêm lịch.'
    : DEFAULT_DESCRIPTION
  updateMeta({ title, description })
}
