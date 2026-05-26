/**
 * QR Code utilities for Nhậu Planner
 * Generate QR codes for invite links
 */

/**
 * Generate QR code for invite link
 * @param {string} inviteLink - Full invite link URL
 * @param {HTMLElement} container - Container element (div) to render QR code into
 */
export function generateInviteQR(inviteLink, container) {
  if (!container || !window.QRCode) {
    console.warn('QR Code library not loaded or container not found')
    return
  }

  // Clear previous QR
  container.innerHTML = ''

  // Generate new QR code into container (qrcode.js creates an <img> or <canvas> inside)
  try {
    new QRCode(container, {
      text: inviteLink,
      width: 200,
      height: 200,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H,
    })
  } catch (e) {
    console.error('Failed to generate QR code:', e)
  }
}

/**
 * Download QR code as PNG
 * @param {HTMLCanvasElement} canvas - Canvas with QR code
 * @param {string} fileName - Name for downloaded file
 */
export async function downloadQRCode(containerOrCanvas, fileName = 'invite-qr.png') {
  if (!containerOrCanvas) {
    console.warn('QR element not found')
    return false
  }

  // If it's a canvas element, use toDataURL
  if (containerOrCanvas.tagName && containerOrCanvas.tagName.toLowerCase() === 'canvas') {
    try {
      const link = document.createElement('a')
      link.href = containerOrCanvas.toDataURL('image/png')
      link.download = `${fileName}-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return true
    } catch (e) {
      console.error('Failed to download canvas QR code:', e)
      return false
    }
  }

  // Otherwise, look for an <img> or <canvas> inside the container
  const img = containerOrCanvas.querySelector && (containerOrCanvas.querySelector('img') || containerOrCanvas.querySelector('canvas'))
  if (!img) {
    console.warn('No img or canvas found inside QR container')
    return false
  }

  // If it's a canvas inside, use toDataURL
  if (img.tagName && img.tagName.toLowerCase() === 'canvas') {
    try {
      const link = document.createElement('a')
      link.href = img.toDataURL('image/png')
      link.download = `${fileName}-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return true
    } catch (e) {
      console.error('Failed to download inner canvas QR code:', e)
      return false
    }
  }

  // Otherwise, it's an <img> with src data/url — fetch and download
  try {
    const url = img.src
    // If data URL, download directly
    if (url && url.startsWith('data:')) {
      const link = document.createElement('a')
      link.href = url
      link.download = `${fileName}-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return true
    }

    // Otherwise fetch the resource and download blob
    if (url) {
      const res = await fetch(url)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `${fileName}-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
      return true
    }

    console.warn('QR image URL unavailable')
    return false
  } catch (err) {
    console.error('Failed to fetch QR image for download:', err)
    return false
  }
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>}
 */
export function copyToClipboard(text) {
  return navigator.clipboard
    .writeText(text)
    .then(() => true)
    .catch(() => false)
}
