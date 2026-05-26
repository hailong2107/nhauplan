# Nhậu Planner

Nhậu Planner là một web app tĩnh cho việc "lên kèo" nhóm bằng giao diện tiếng Việt. Dự án chạy hoàn toàn trên trình duyệt, phù hợp deploy lên GitHub Pages hoặc bất kỳ static host nào.

## Tính năng chính
- Tạo kèo nhanh: tiêu đề, thời gian, địa điểm, người tạo, mô tả, danh sách tham gia
- Invite-only: kèo chỉ ai có link mời mới xem được
- Vote trực tiếp: Bia 🍺 / Nướng 🔥 / Lẩu 🫕
- Thêm/xóa người tham gia
- Xuất file `.ics` để thêm vào lịch
- Tìm kiếm và lọc kèo theo trạng thái
- Dark/Light mode với lưu trạng thái vào `localStorage`
- Dashboard hiển thị tổng số kèo và tổng lượt vote
- Toast thông báo, modal, form tiện dụng
- Lưu dữ liệu local-first, đồng bộ nền với Cloudflare Worker khi cấu hình API

## QR Code và invite
### Trong app
- Mỗi invite-only kèo tự động generate QR code cho link mời
- Hiển thị QR trong modal kèo
- Có thể copy link invite & download QR trực tiếp

### Trang QR generator riêng
Phiên bản riêng tại `qr-generator/` hỗ trợ nhiều loại QR code:
- URL / link
- Văn bản (Text)
- Email (`mailto:`)
- SMS / tin nhắn (`smsto:`)
- Gọi điện (`tel:`)
- WiFi
- vCard (liên hệ)
- Sự kiện Lịch (`VCALENDAR`)
- Telegram / Zalo share

### Tùy chỉnh QR
- Thiết lập kích thước QR
- Chọn màu mã, màu nền
- Xem preview trực tiếp
- Tải QR dưới dạng PNG
- Giao diện responsive, chạy tốt trên mobile

## Đồng bộ với Cloudflare Worker
Ứng dụng có module `assets/js/cloudflare-api.js` để đồng bộ dữ liệu với Cloudflare Worker API.

- GET/POST dữ liệu từ Cloudflare Worker
- Gửi API key qua `x-api-key` header và `api_key` query param
- Retry, timeout và cache response để tối ưu trải nghiệm
- Dữ liệu local-first, đồng bộ nền khi có kết nối

> Lưu ý: cần cấu hình `API_ENDPOINT` và `API_KEY` trong `assets/js/cloudflare-api.js` nếu muốn dùng sync với server.

## Cấu trúc dự án
- `index.html` — trang chính của ứng dụng
- `qr-generator/index.html` — trang QR generator độc lập
- `assets/css/styles.css` — stylesheet chính
- `assets/js/app.js` — khởi tạo app, binding sự kiện
- `assets/js/ui.js` — render DOM, modal, toast
- `assets/js/events.js` — xử lý tạo/vote/xóa kèo
- `assets/js/storage.js` — wrapper `localStorage`
- `assets/js/cloudflare-api.js` — client sync với Cloudflare Worker
- `assets/js/utils.js` — helper chung

## Chạy thử local
Tốt nhất dùng static server thay vì mở trực tiếp file `index.html`.

### Dùng Python 3
```bash
cd /Users/hailongnguyen/projects/nhauplan
python3 -m http.server 8000
```
Mở `http://localhost:8000`

### Dùng `serve`
```bash
npm install -g serve
serve -s . -l 8000
```

### Hoặc dùng Live Server trong VS Code

## Deploy lên GitHub Pages
1. Push mã nguồn lên GitHub
2. Vào repo → Settings → Pages
3. Chọn `Source: main branch` và `root` (`/`)
4. Lưu và chờ vài phút

> Nếu muốn deploy tự động với `gh-pages`, cài `gh-pages` và cấu hình script trong `package.json`.

## Invite-only flow
- Chọn checkbox invite-only khi tạo kèo
- Link mời được tạo ra và có thể copy hoặc chia sẻ
- Người khác mở link sẽ thấy kèo theo chế độ invite-only

## Ghi chú
- Ứng dụng hoạt động tốt trên trình duyệt hiện đại
- Tập trung vào trải nghiệm người dùng tiếng Việt
- Có thể mở rộng thêm sync server, chia sẻ kèo, hoặc multi-user sau này
