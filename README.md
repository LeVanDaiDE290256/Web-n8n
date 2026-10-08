# Web n8n – Hiển thị lịch sử tin nhắn

Trang web tĩnh, viết bằng HTML, CSS và JavaScript, dùng để lấy và hiển thị các tin nhắn đã lưu trong **Data Table** của n8n.

Khi trang được mở, `app.js` gửi một request `GET` đến webhook n8n. Workflow n8n đọc toàn bộ dữ liệu trong Data Table và trả về JSON; trang web sau đó hiển thị từng tin nhắn trong khung chat.

## Thành phần

| File | Mục đích |
| --- | --- |
| `index.html` | Cấu trúc giao diện trang chat |
| `style.css` | Kiểu dáng giao diện |
| `app.js` | Gọi webhook và hiển thị lịch sử tin nhắn |
| `web-n8n (1).json` | Workflow n8n để lấy dữ liệu từ Data Table |

## Điều kiện cần

- n8n đang chạy tại `http://localhost:5678`.
- Data Table `chats_message` đã tồn tại trong n8n và có cột `message`.
- Một HTTP server để mở frontend, ví dụ VS Code Live Server (nút **Go Live**).

## Cài đặt workflow n8n

1. Mở n8n tại `http://localhost:5678`.
2. Chọn **Import from File** và chọn `web-n8n (1).json`.
3. Trong node **Get row(s)**, chọn đúng Data Table chứa lịch sử chat nếu Data Table của bạn khác `chats_message`.
4. Để thử nghiệm, mở workflow và bấm **Execute workflow**.

Workflow sử dụng webhook:

```text
GET /webhook-test/get-message
```

Sau khi chạy thử, workflow sẽ đọc tất cả các dòng trong Data Table và trả về dữ liệu theo dạng:

```json
{
  "success": true,
  "messages": [
    { "message": "Xin chào" },
    { "message": "Nội dung tin nhắn khác" }
  ]
}
```

## Chạy frontend

1. Mở thư mục project bằng VS Code.
2. Mở file `index.html`.
3. Bấm **Go Live** ở thanh trạng thái VS Code.
4. Trình duyệt sẽ mở trang web. Khi tải trang, lịch sử tin nhắn sẽ được gọi từ n8n và hiển thị.

Bạn cũng có thể chạy một web server khác, ví dụ:

```bash
python -m http.server 5500
```

Sau đó mở `http://localhost:5500`.

## Cấu hình webhook

URL hiện tại trong `app.js` là:

```js
const MESSAGES_WEBHOOK_URL = "http://localhost:5678/webhook-test/get-message";
```

Đây là **test URL**, nên chỉ hoạt động khi bạn đã bấm **Execute workflow** trong n8n.

Để dùng ổn định, hãy bật workflow thành **Active**, rồi đổi URL trong `app.js` thành:

```js
const MESSAGES_WEBHOOK_URL = "http://localhost:5678/webhook/get-message";
```

## Lưu ý

Phiên bản hiện tại chỉ **đọc và hiển thị lịch sử tin nhắn**. Ô nhập và nút **Send** trong giao diện chưa được gắn xử lý để gửi tin nhắn mới.

Nếu trình duyệt báo lỗi CORS, hãy cấu hình CORS cho n8n hoặc dùng proxy phù hợp giữa frontend và n8n.
