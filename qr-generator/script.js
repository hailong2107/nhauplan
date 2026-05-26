/**
 * QR Code Generator - Enhanced Script
 * Supports multiple QR types: URL, Text, Email, SMS, Call, WiFi, vCard, Event, Telegram, Zalo
 */

// ============================================================================
// QR TYPE FIELD CONFIGURATIONS
// ============================================================================

const QR_TYPE_CONFIG = {
  url: {
    label: '🔗 URL / Link',
    fields: [
      { id: 'url-input', label: 'URL', type: 'text', placeholder: 'https://example.com', required: true },
      { id: 'url-text', label: 'Message Text (Optional)', type: 'textarea', placeholder: 'Add a message' },
    ],
  },
  text: {
    label: '📝 Text',
    fields: [
      { id: 'text-input', label: 'Text Content', type: 'textarea', placeholder: 'Enter text to encode', required: true },
    ],
  },
  email: {
    label: '📧 Email',
    fields: [
      { id: 'email-address', label: 'Email Address *', type: 'email', placeholder: 'recipient@example.com', required: true },
      { id: 'email-subject', label: 'Subject (Optional)', type: 'text', placeholder: 'Email subject' },
      { id: 'email-body', label: 'Message (Optional)', type: 'textarea', placeholder: 'Email body' },
    ],
  },
  sms: {
    label: '💬 SMS / Tin nhắn',
    fields: [
      { id: 'sms-phone', label: 'Phone Number *', type: 'tel', placeholder: '+84912345678', required: true },
      { id: 'sms-message', label: 'Message (Optional)', type: 'textarea', placeholder: 'SMS message' },
    ],
  },
  call: {
    label: '☎️ Gọi điện',
    fields: [
      { id: 'call-phone', label: 'Phone Number *', type: 'tel', placeholder: '+84912345678', required: true },
    ],
  },
  wifi: {
    label: '📶 WiFi',
    fields: [
      { id: 'wifi-ssid', label: 'WiFi Name (SSID) *', type: 'text', placeholder: 'Network name', required: true },
      { id: 'wifi-password', label: 'Password *', type: 'password', placeholder: 'WiFi password', required: true },
      { id: 'wifi-security', label: 'Security Type', type: 'select', options: [
        { value: 'WPA', label: 'WPA / WPA2' },
        { value: 'WEP', label: 'WEP' },
        { value: 'nopass', label: 'No Password' },
      ], required: true },
      { id: 'wifi-hidden', label: 'Hidden Network?', type: 'checkbox' },
    ],
  },
  vcard: {
    label: '👤 vCard (Thẻ liên hệ)',
    fields: [
      { id: 'vcard-name', label: 'Full Name *', type: 'text', placeholder: 'John Doe', required: true },
      { id: 'vcard-phone', label: 'Phone', type: 'tel', placeholder: '+84912345678' },
      { id: 'vcard-email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
      { id: 'vcard-company', label: 'Company', type: 'text', placeholder: 'Company name' },
      { id: 'vcard-url', label: 'Website', type: 'url', placeholder: 'https://example.com' },
    ],
  },
  event: {
    label: '📅 Calendar Event',
    fields: [
      { id: 'event-title', label: 'Event Title *', type: 'text', placeholder: 'Event name', required: true },
      { id: 'event-start', label: 'Start Time *', type: 'datetime-local', required: true },
      { id: 'event-end', label: 'End Time', type: 'datetime-local' },
      { id: 'event-location', label: 'Location', type: 'text', placeholder: 'Event location' },
      { id: 'event-description', label: 'Description', type: 'textarea', placeholder: 'Event details' },
    ],
  },
  telegram: {
    label: '✈️ Telegram Share',
    fields: [
      { id: 'tg-url', label: 'URL to Share *', type: 'text', placeholder: 'https://example.com', required: true },
      { id: 'tg-text', label: 'Message Text (Optional)', type: 'textarea', placeholder: 'Share message' },
    ],
  },
  zalo: {
    label: '💬 Zalo Share',
    fields: [
      { id: 'zalo-url', label: 'URL to Share *', type: 'text', placeholder: 'https://example.com', required: true },
      { id: 'zalo-text', label: 'Message Text (Optional)', type: 'textarea', placeholder: 'Share message' },
    ],
  },
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const state = {
  currentLink: '',
  currentSize: 'medium',
  currentFgColor: '#000000',
  currentBgColor: '#ffffff',
  qrInstance: null,
  isMobile: false,
  currentType: 'url',
};

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const DOM = {
  form: document.getElementById('qr-form'),
  qrType: document.getElementById('qr-type'),
  dynamicFields: document.getElementById('dynamic-fields'),
  size: document.getElementById('size'),
  fgColor: document.getElementById('fg-color'),
  bgColor: document.getElementById('bg-color'),
  errorMessage: document.getElementById('error-message'),
  emptyState: document.getElementById('empty-state'),
  previewContainer: document.getElementById('preview-container'),
  qrContainer: document.getElementById('qr-container'),
  qrCanvas: document.getElementById('qr-canvas'),
  linkPreview: document.getElementById('link-preview'),
  copyLinkBtn: document.getElementById('copy-link-btn'),
  copyFeedback: document.getElementById('copy-feedback'),
  downloadQrBtn: document.getElementById('download-qr-btn'),
  openInAppBtn: document.getElementById('open-in-app-btn'),
  mobileInfo: document.getElementById('mobile-info'),
  desktopInfo: document.getElementById('desktop-info'),
  toast: document.getElementById('toast'),
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function showError(message) {
  DOM.errorMessage.textContent = message;
  DOM.errorMessage.classList.remove('hidden');
  setTimeout(() => {
    DOM.errorMessage.classList.add('hidden');
  }, 5000);
}

function showToast(message, duration = 3000) {
  DOM.toast.textContent = message;
  DOM.toast.classList.add('show');
  setTimeout(() => {
    DOM.toast.classList.remove('show');
  }, duration);
}

function detectMobile() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    userAgent.toLowerCase()
  );
}

function getSizeInPixels(size) {
  const sizes = { small: 150, medium: 250, large: 400 };
  return sizes[size] || sizes.medium;
}

function encodeForUrl(text) {
  return encodeURIComponent(text);
}

function normalizeValue(value) {
  return value ? String(value).trim() : '';
}

// ============================================================================
// STORAGE
// ============================================================================

function saveToStorage(data) {
  try {
    localStorage.setItem('qr-generator-data', JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
  }
}

function loadFromStorage() {
  try {
    const data = localStorage.getItem('qr-generator-data');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.warn('Could not load from localStorage:', e);
    return null;
  }
}

function restoreFormFromStorage() {
  const data = loadFromStorage();
  if (!data) return;
  if (data.type) {
    state.currentType = data.type;
    DOM.qrType.value = data.type;
    renderDynamicFields(data.type);
  }

  document.querySelectorAll('#dynamic-fields input, #dynamic-fields textarea, #dynamic-fields select').forEach(field => {
    if (data[field.id] !== undefined) {
      if (field.type === 'checkbox') {
        field.checked = Boolean(data[field.id]);
      } else {
        field.value = data[field.id] || '';
      }
    }
  });

  DOM.size.value = data.size || 'medium';
  DOM.fgColor.value = data.fgColor || '#000000';
  DOM.bgColor.value = data.bgColor || '#ffffff';
}

// ============================================================================
// DYNAMIC FIELDS RENDERING
// ============================================================================

function renderDynamicFields(qrType) {
  const config = QR_TYPE_CONFIG[qrType] || QR_TYPE_CONFIG.url;
  const container = DOM.dynamicFields;
  container.innerHTML = '';

  config.fields.forEach(field => {
    const group = document.createElement('div');
    group.className = 'form-group';

    if (field.type === 'textarea') {
      const label = document.createElement('label');
      label.className = 'label';
      label.textContent = field.label;
      label.htmlFor = field.id;

      const textarea = document.createElement('textarea');
      textarea.id = field.id;
      textarea.className = 'input textarea';
      textarea.placeholder = field.placeholder || '';
      if (field.required) textarea.required = true;

      group.append(label, textarea);
    } else if (field.type === 'select') {
      const label = document.createElement('label');
      label.className = 'label';
      label.textContent = field.label;
      label.htmlFor = field.id;

      const select = document.createElement('select');
      select.id = field.id;
      select.className = 'input';
      if (field.required) select.required = true;

      field.options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        select.appendChild(option);
      });

      group.append(label, select);
    } else if (field.type === 'checkbox') {
      const label = document.createElement('label');
      label.className = 'checkbox-row';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = field.id;

      const span = document.createElement('span');
      span.textContent = field.label;

      label.append(input, span);
      group.append(label);
    } else {
      const label = document.createElement('label');
      label.className = 'label';
      label.textContent = field.label;
      label.htmlFor = field.id;

      const input = document.createElement('input');
      input.type = field.type;
      input.id = field.id;
      input.className = 'input';
      input.placeholder = field.placeholder || '';
      if (field.required) input.required = true;

      group.append(label, input);
    }

    container.appendChild(group);
  });
}

// ============================================================================
// QR CODE GENERATION - TYPE-SPECIFIC
// ============================================================================

function generateLinkForType(type, formData) {
  switch (type) {
    case 'url':
      return formData['url-input'] || null;

    case 'text':
      return formData['text-input'] || null;

    case 'email': {
      const email = normalizeValue(formData['email-address']);
      const subject = normalizeValue(formData['email-subject']);
      const body = normalizeValue(formData['email-body']);
      if (!email) return null;
      const params = new URLSearchParams();
      if (subject) params.append('subject', subject);
      if (body) params.append('body', body);
      return `mailto:${email}${params.toString() ? '?' + params.toString() : ''}`;
    }

    case 'sms': {
      const phone = normalizeValue(formData['sms-phone']);
      const message = normalizeValue(formData['sms-message']);
      if (!phone) return null;
      return `smsto:${phone}${message ? '?body=' + encodeForUrl(message) : ''}`;
    }

    case 'call': {
      const phone = normalizeValue(formData['call-phone']);
      if (!phone) return null;
      return `tel:${phone}`;
    }

    case 'wifi': {
      const ssid = normalizeValue(formData['wifi-ssid']);
      const password = normalizeValue(formData['wifi-password']);
      const security = normalizeValue(formData['wifi-security']) || 'WPA';
      const hidden = formData['wifi-hidden'] ? 'true' : 'false';
      if (!ssid) return null;
      return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden};;`;
    }

    case 'vcard': {
      const name = normalizeValue(formData['vcard-name']);
      if (!name) return null;
      const phone = normalizeValue(formData['vcard-phone']);
      const email = normalizeValue(formData['vcard-email']);
      const company = normalizeValue(formData['vcard-company']);
      const url = normalizeValue(formData['vcard-url']);
      let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
      vcard += `FN:${name}\n`;
      if (phone) vcard += `TEL:${phone}\n`;
      if (email) vcard += `EMAIL:${email}\n`;
      if (company) vcard += `ORG:${company}\n`;
      if (url) vcard += `URL:${url}\n`;
      vcard += 'END:VCARD';
      return vcard;
    }

    case 'event': {
      const title = normalizeValue(formData['event-title']);
      const start = normalizeValue(formData['event-start']);
      const end = normalizeValue(formData['event-end']);
      const location = normalizeValue(formData['event-location']);
      const description = normalizeValue(formData['event-description']);
      if (!title || !start) return null;
      const formatDate = (dt) => new Date(dt).toISOString().replace(/[-:Z]/g, '').split('.')[0];
      let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\n';
      ics += `SUMMARY:${title}\n`;
      ics += `DTSTART:${formatDate(start)}\n`;
      if (end) ics += `DTEND:${formatDate(end)}\n`;
      if (location) ics += `LOCATION:${location}\n`;
      if (description) ics += `DESCRIPTION:${description}\n`;
      ics += 'END:VEVENT\nEND:VCALENDAR';
      return ics;
    }

    case 'telegram': {
      const url = normalizeValue(formData['tg-url']);
      const text = normalizeValue(formData['tg-text']);
      if (!url) return null;
      return `https://t.me/share/url?url=${encodeForUrl(url)}${text ? '&text=' + encodeForUrl(text) : ''}`;
    }

    case 'zalo': {
      const url = normalizeValue(formData['zalo-url']);
      const text = normalizeValue(formData['zalo-text']);
      if (!url) return null;
      return `https://zalo.me/?${encodeForUrl(url)}`;
    }

    default:
      return null;
  }
}

function generateQR(link, size, fgColor, bgColor) {
  // clear previous
  if (DOM.qrCanvas) DOM.qrCanvas.innerHTML = '';

  try {
    state.qrInstance = new QRCode(DOM.qrCanvas, {
      text: link,
      width: size,
      height: size,
      colorDark: fgColor,
      colorLight: bgColor,
      correctLevel: QRCode.CorrectLevel.H,
    });
    showToast('QR code generated successfully!');
  } catch (e) {
    showError('Failed to generate QR code: ' + (e && e.message ? e.message : e));
  }
}

function redrawQR() {
  if (state.currentLink) {
    const size = getSizeInPixels(DOM.size.value);
    generateQR(state.currentLink, size, DOM.fgColor.value, DOM.bgColor.value);
  }
}

// ============================================================================
// DOWNLOAD
// ============================================================================

function downloadQR() {
  if (!DOM.qrCanvas || !state.currentLink) {
    showError('Generate a QR code first');
    return;
  }

  try {
    // find inner img or canvas created by qrcode.js
    const inner = DOM.qrCanvas.querySelector('img') || DOM.qrCanvas.querySelector('canvas');
    if (!inner) {
      showError('Không tìm thấy QR để tải xuống');
      return;
    }

    if (inner.tagName.toLowerCase() === 'canvas') {
      const url = inner.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-code-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('QR code downloaded!');
      return;
    }

    // img case
    const imgSrc = inner.src;
    if (!imgSrc) {
      showError('QR image source unavailable');
      return;
    }
    if (imgSrc.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = imgSrc;
      a.download = `qr-code-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('QR code downloaded!');
      return;
    }

    // fetch remote src
    fetch(imgSrc).then(r => r.blob()).then(blob => {
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `qr-code-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      showToast('QR code downloaded!');
    }).catch(() => showError('Failed to download QR code'));
  } catch (error) {
    showError('Failed to download QR code');
  }
}

// ============================================================================
// SHARING
// ============================================================================

function copyLinkToClipboard() {
  if (!state.currentLink) {
    showError('Generate a link first');
    return;
  }

  navigator.clipboard
    .writeText(state.currentLink)
    .then(() => {
      DOM.copyFeedback.classList.remove('hidden');
      setTimeout(() => {
        DOM.copyFeedback.classList.add('hidden');
      }, 2000);
      showToast('Link copied to clipboard!');
    })
    .catch(() => {
      showError('Failed to copy link');
    });
}

function openInApp() {
  if (!state.currentLink) {
    showError('Generate a link first');
    return;
  }
  window.open(state.currentLink, '_blank');
}

// ============================================================================
// UI
// ============================================================================

function updateUI() {
  const hasData = !!state.currentLink;
  DOM.emptyState.classList.toggle('hidden', hasData);
  DOM.previewContainer.classList.toggle('hidden', !hasData);
  DOM.qrContainer.classList.toggle('hidden', !hasData);

  if (hasData) {
    state.isMobile = detectMobile();
    DOM.mobileInfo.classList.toggle('hidden', !state.isMobile);
    DOM.desktopInfo.classList.toggle('hidden', state.isMobile);
  }
}

function updateLinkPreview(link) {
  DOM.linkPreview.innerHTML = `<strong>Generated:</strong><br><code style="word-break:break-all;font-size:0.85em">${link}</code>`;
}

// ============================================================================
// FORM HANDLING
// ============================================================================

function handleFormSubmit(event) {
  event.preventDefault();
  DOM.errorMessage.classList.add('hidden');

  const formData = {};
  document.querySelectorAll('#dynamic-fields input, #dynamic-fields textarea, #dynamic-fields select').forEach(field => {
    if (field.type === 'checkbox') {
      formData[field.id] = field.checked;
    } else {
      formData[field.id] = field.value.trim();
    }
  });

  const link = generateLinkForType(state.currentType, formData);
  if (!link) {
    showError('Please fill in all required fields');
    return;
  }

  state.currentLink = link;
  state.currentSize = DOM.size.value;
  state.currentFgColor = DOM.fgColor.value;
  state.currentBgColor = DOM.bgColor.value;

  const size = getSizeInPixels(state.currentSize);
  generateQR(link, size, state.currentFgColor, state.currentBgColor);
  updateLinkPreview(link);
  updateUI();

  saveToStorage({ ...formData, type: state.currentType, size: state.currentSize, fgColor: state.currentFgColor, bgColor: state.currentBgColor });
}

function handleTypeChange() {
  state.currentType = DOM.qrType.value;
  renderDynamicFields(state.currentType);
  DOM.emptyState.classList.remove('hidden');
  DOM.previewContainer.classList.add('hidden');
  DOM.qrContainer.classList.add('hidden');
}

function handleSizeChange() {
  state.currentSize = DOM.size.value;
  redrawQR();
}

function handleColorChange() {
  state.currentFgColor = DOM.fgColor.value;
  state.currentBgColor = DOM.bgColor.value;
  redrawQR();
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
  DOM.form.addEventListener('submit', handleFormSubmit);
  DOM.qrType.addEventListener('change', handleTypeChange);
  DOM.size.addEventListener('change', handleSizeChange);
  DOM.fgColor.addEventListener('change', handleColorChange);
  DOM.bgColor.addEventListener('change', handleColorChange);
  DOM.copyLinkBtn.addEventListener('click', copyLinkToClipboard);
  DOM.downloadQrBtn.addEventListener('click', downloadQR);
  DOM.openInAppBtn.addEventListener('click', openInApp);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function init() {
  state.isMobile = detectMobile();
  renderDynamicFields(state.currentType);
  restoreFormFromStorage();
  setupEventListeners();
  updateUI();
  console.log('✨ Enhanced QR Code Generator initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Accept links from parent window (main app) via postMessage
function handleExternalLink(link) {
  if (!link) return;
  state.currentType = 'url';
  DOM.qrType.value = 'url';
  renderDynamicFields('url');
  // Allow DOM to render
  setTimeout(() => {
    const input = document.getElementById('url-input');
    if (input) input.value = link;
    const formData = { 'url-input': link };
    const generated = generateLinkForType('url', formData);
    if (!generated) return;
    state.currentLink = generated;
    state.currentSize = DOM.size.value;
    state.currentFgColor = DOM.fgColor.value;
    state.currentBgColor = DOM.bgColor.value;
    const size = getSizeInPixels(state.currentSize);
    generateQR(state.currentLink, size, state.currentFgColor, state.currentBgColor);
    updateLinkPreview(state.currentLink);
    updateUI();
    saveToStorage({ ...formData, type: 'url', size: state.currentSize, fgColor: state.currentFgColor, bgColor: state.currentBgColor });
  }, 60);
}

window.addEventListener('message', (ev) => {
  try {
    const data = ev.data || {};
    if (data && data.type === 'loadLink') {
      handleExternalLink(data.link);
    }
  } catch (e) {}
});
