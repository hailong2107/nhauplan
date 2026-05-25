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

Nếu bạn muốn dùng `gh-pages` branch tự động:

```bash
npm init -y
npm install --save-dev gh-pages
# thêm script vào package.json
# "predeploy": "", "deploy": "gh-pages -d ."
npm run deploy
```
