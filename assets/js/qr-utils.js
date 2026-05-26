/**
 * QR Code utilities for Nhậu Planner
 * Generate QR codes for invite links
 */

/**
 * Generate QR code for invite link
 * @param {string} inviteLink - Full invite link URL
 * @param {HTMLCanvasElement} canvas - Canvas element to draw QR code
 */
export function generateInviteQR(inviteLink, canvas) {
  if (!canvas || !window.QRCode) {
    console.warn('QR Code library not loaded or canvas not found')
    return
  }

  // Clear previous QR
  canvas.width = 0
  canvas.height = 0

  // Generate new QR code
  try {
    new QRCode(canvas, {
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
export function downloadQRCode(canvas, fileName = 'invite-qr.png') {
  if (!canvas) {
    console.warn('Canvas not found')
    return false
  }

  try {
    // Create link and download
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `${fileName}-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    return true
  } catch (e) {
    console.error('Failed to download QR code:', e)
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
