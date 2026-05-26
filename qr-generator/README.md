# QR Code Generator

A powerful, lightweight, and modern QR code generator for creating shareable QR codes across multiple platforms (Telegram, Zalo, and direct links).

## 🚀 Features

### Core Features
- ✅ **Multi-Platform Support**: Generate share links for Telegram, Zalo, and custom URLs
- ✅ **Dynamic QR Codes**: Generate QR codes that encode the platform-specific links
- ✅ **High-Quality Output**: Download QR codes as PNG images
- ✅ **Copy to Clipboard**: Easily copy generated links for sharing

### Advanced Features
- 🎨 **Color Customization**: Choose custom foreground and background colors for QR codes
- 📏 **Size Selection**: Select from Small (150px), Medium (250px), or Large (400px)
- 📱 **Mobile-Aware UI**: Detects mobile devices and shows platform-specific actions
- 💾 **Local Storage**: Automatically saves your last input and restores it on reload
- 🌙 **Dark Mode Support**: Automatically adapts to system dark mode preference

### User Experience
- 🔗 **Link Preview**: See the complete share link before generating QR code
- 🎯 **Error Handling**: Clear error messages for invalid inputs
- 📲 **Direct App Opening**: On mobile, open the generated link directly in the platform app
- 📊 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- ♿ **Accessibility**: Built with semantic HTML and proper ARIA labels

## 📋 How to Use

### 1. Basic QR Code Generation

1. **Select Platform**:
   - `Direct Link`: Share a custom URL
   - `Telegram`: Creates a Telegram share link
   - `Zalo`: Creates a Zalo share link

2. **Enter URL**: Paste the URL you want to share
   - Example: `https://example.com`
   - Example: `https://github.com/user/repo`

3. **Add Message** (Optional):
   - Add a caption or message to accompany the link
   - This text will be included in the share link

4. **Customize QR Code**:
   - Choose size: Small, Medium, or Large
   - Set foreground color (QR code color)
   - Set background color (whitespace color)

5. **Generate**: Click "Generate QR Code"

### 2. Download QR Code

- Click "Download QR Code" to save as PNG
- QR code includes padding for clean appearance
- Filename includes timestamp: `qr-code-1234567890.png`

### 3. Share Your Link

- **Copy Link**: Click "Copy Link" to copy the generated share link to clipboard
- **Open in App** (Mobile only): Open the link directly in the platform app
- **Scan**: Share the QR code image for others to scan

## 🛠️ Structure

```
qr-generator/
├── index.html      # Main page structure and form
├── style.css       # Responsive styling and themes
├── script.js       # Application logic and QR generation
└── README.md       # This file
```

## 📦 Dependencies

- **QR Code Library**: [qrcode.js](https://davidsharp.com/qrcode/) - CDN version
- **No Backend Required**: Fully static, runs in browser only

## 🚀 Deployment

### GitHub Pages Deployment

1. **Add to your GitHub Pages repository**:
   ```bash
   cd your-github-pages-repo
   mkdir -p qr-generator
   cp -r qr-generator/* qr-generator/
   ```

2. **Access via**:
   ```
   https://yourusername.github.io/qr-generator/
   ```

### Local Testing

1. **Simple HTTP Server** (Python):
   ```bash
   cd qr-generator
   python3 -m http.server 8000
   # Visit: http://localhost:8000
   ```

2. **Using Node.js http-server**:
   ```bash
   npm install -g http-server
   cd qr-generator
   http-server
   ```

3. **Using VS Code Live Server**:
   - Install the "Live Server" extension
   - Right-click `index.html` → "Open with Live Server"

## 📱 Platform Link Formats

### Telegram
```
https://t.me/share/url?url={encoded_url}&text={encoded_text}
```
- Opens Telegram share dialog
- Pre-fills URL and optional message
- Users select chat/channel to share

### Zalo
```
https://zalo.me/?{encoded_url}
```
- Opens Zalo app or web
- Shares the link
- Note: Zalo support may vary

### Direct Link
- Raw URL without platform wrapper
- Suitable for email, messaging, or other channels

## 💾 Local Storage

The app automatically saves:
- Platform selection
- URL and message text
- QR code size
- Custom colors

Data is restored when you revisit the page. To clear, open browser DevTools:
```javascript
localStorage.removeItem('qr-generator-data');
```

## 🎨 Customization

### Change Theme Colors

Edit `style.css` `:root` variables:
```css
:root {
    --primary: #6366f1;        /* Main gradient color */
    --primary-dark: #4f46e5;
    --secondary: #8b5cf6;
    /* ... other variables ... */
}
```

### Adjust QR Code Default Size

Edit in `script.js`:
```javascript
function getSizeInPixels(size) {
    const sizes = {
        small: 150,     // Adjust these values
        medium: 250,
        large: 400,
    };
    // ...
}
```

## 🔒 Security Notes

- ✅ All processing happens in the browser
- ✅ No data sent to any server
- ✅ URLs are safely encoded
- ✅ No tracking or analytics included
- ✅ Safe to use for private/sensitive links

## 🐛 Troubleshooting

### QR Code Not Generating
- Ensure the URL is valid (starts with `http://` or `https://`)
- Check browser console for errors
- Try refreshing the page

### Colors Not Changing
- Click outside the color picker to apply changes
- Ensure you click "Generate QR Code" after changing colors

### Download Not Working
- Check browser permissions
- Try different browser if issue persists
- Ensure pop-ups aren't blocked

### Link Not Copying
- Check clipboard permissions in browser
- Verify link was generated successfully

## 📞 Support

For issues or suggestions:
1. Check browser console (F12) for error messages
2. Verify URL format is correct
3. Clear localStorage if experiencing persistent issues
4. Test in incognito/private mode to exclude extensions

## 📄 License

MIT License - Feel free to use and modify

## 🎯 Future Enhancements

Potential features for future versions:
- [ ] Add logo to center of QR code
- [ ] Batch QR generation
- [ ] URL shortener integration
- [ ] QR code analytics/tracking
- [ ] Custom QR code design templates
- [ ] Bulk download functionality
- [ ] Share history/favorite links

## 📊 Technical Details

### QR Code Error Correction
- Uses High error correction level (30% recovery)
- Suitable for outdoor, printed, or large-scale sharing

### Size Recommendations
- **Small (150px)**: Digital sharing, social media
- **Medium (250px)**: Standard print, web display
- **Large (400px)**: Posters, promotional materials

### Browser Compatibility
- ✅ Chrome/Chromium 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

**Created with ❤️ for easy QR code generation and sharing**
