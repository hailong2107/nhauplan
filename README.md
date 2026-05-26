Nhậu Planner

Mini web app cho việc "lên kèo" — 100% giao diện tiếng Việt, không cần backend. Dự án tĩnh, phù hợp deploy trên GitHub Pages.

Tính năng chính
- Tạo kèo: tiêu đề, thời gian, địa điểm, người tạo, danh sách tham gia
- Gợi ý kèo tự động
- Vote kiểu: Bia 🍺 / Nướng 🔥 / Lẩu 🫕 (cập nhật điểm ngay lập tức)
- Thêm người tham gia
- Xuất file `.ics` (Thêm vào lịch)
- Tìm kiếm & lọc (sắp diễn ra / đã qua)
- Dark/Light mode (lưu vào `localStorage`)
- Dashboard: tổng kèo, tổng lượt vote
- Toàn bộ UI bằng tiếng Việt, có toast và modal
- **QR Code Generator**: Tạo QR code cho link invite kèo + tool riêng với nhiều loại QR

QR Code Generator
- **Tích hợp trong app**: Khi tạo kèo invite-only, tự động generate QR code cho link mời, copy link và download QR ngay trong modal tạo kèo
- **Trang riêng** (`/qr-generator/`): Tool toàn chức năng mở rộng tương tự maclife.vn/qr-codes
  - Text QR
  - URL / Link QR
  - Email QR (`mailto:`)
  - SMS / Tin nhắn QR
  - Call QR (`tel:`)
  - WiFi QR (SSID, mật khẩu, mã bảo mật, hidden)
  - vCard (thẻ liên hệ)
  - Calendar Event / sự kiện
  - Telegram / Zalo Share Links
- **Tùy chỉnh**: Kích thước, màu nền, màu mã, download PNG
- **Mobile-friendly**: Detect mobile, hiển thị nút "Mở trong app" khi phù hợp
- **Lưu tự động**: localStorage lưu input gần nhất để reload tiện lợi

### Mở rộng chức năng QR
- `qr-generator/index.html` là trang QR tool riêng, đã được nâng cấp để hỗ trợ nhiều loại QR
- Các trường input tự động thay đổi theo loại QR bạn chọn
- Kết quả hiển thị preview đường dẫn và QR trong cùng một trang
- Hỗ trợ tải QR dưới dạng PNG
- Giao diện responsive, dễ dùng trên điện thoại và desktop

### Ví dụ nội dung QR
- `https://example.com` → URL
- `Hello world` → Text
- `mailto:email@example.com?subject=Hello&body=Hi` → Email
- `smsto:+84912345678?body=Xin chào` → SMS
- `tel:+84912345678` → Call
- `WIFI:T:WPA;S:SSID;P:password;H:false;;` → WiFi
- `BEGIN:VCARD...END:VCARD` → vCard
- `BEGIN:VCALENDAR...END:VEVENT...END:VCALENDAR` → Event


Cấu trúc dự án
- `index.html` — trang chính (HTML, meta SEO, ARIA)
- `assets/css/styles.css` — stylesheet chính
- `assets/js/app.js` — khởi tạo app, binding global
- `assets/js/ui.js` — rendering DOM, toast, modal
- `assets/js/events.js` — thao tác dữ liệu (create/vote/delete/export)
- `assets/js/storage.js` — wrapper `localStorage`
- `assets/js/utils.js` — helper DOM & utils

Chạy nhanh (local)
Cách đơn giản nhất là mở `index.html` bằng một static server (tránh `file://` do module/import):

- Dùng Python 3 (trong thư mục project):

```bash
python3 -m http.server 8000
# Mở http://localhost:8000
```

- Hoặc dùng `serve` (yarn / npm):

```bash
npm install -g serve
serve -s . -l 8000
```

- Hoặc mở bằng extension `Live Server` trong VS Code.

Deploy lên GitHub Pages
1. Push mã nguồn lên GitHub (branch `main` hoặc `gh-pages`).
2. Cách nhanh (không cần build): vào trang repo → Settings → Pages → Source: `main` branch / root (`/`) → Save. Chờ vài phút, site sẽ có dạng `https://<username>.github.io/<repo>/`.

Tự động deploy bằng GitHub Action
- Nếu repo dùng branch `main`, action sẽ tự động chạy mỗi khi push lên `main`.
- Action sẽ upload toàn bộ thư mục gốc lên Pages mà không cần bước build riêng.

Nếu bạn muốn dùng `gh-pages` branch tự động:

```bash
npm init -y
npm install --save-dev gh-pages
# thêm script vào package.json
# "predeploy": "", "deploy": "gh-pages -d ."
npm run deploy
```

Invite link
- Khi tạo kèo, đánh dấu checkbox "Chỉ những ai có link invite mới xem kèo này".
- Sau khi tạo kèo, nếu kèo là invite-only, sẽ có nút "Sao chép link mời" trên thẻ kèo.
- Người nhận link sẽ mở trang với tham số URL `?invite=...` để xem chế độ mời.
