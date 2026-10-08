# Javis AI Chat

Javis là web chat đơn giản kết nối n8n, Google Gemini và PostgreSQL. Người dùng gửi tin nhắn từ trình duyệt, n8n dùng AI Agent để phản hồi, còn PostgreSQL Chat Memory lưu ngữ cảnh theo từng phiên trò chuyện.

## Cách hoạt động

```text
Browser
  → n8n Webhook
  → AI Agent + Gemini
  → PostgreSQL Chat Memory
  → n8n trả JSON
  → Browser hiển thị phản hồi
```

Mỗi trình duyệt có `session_id` riêng được lưu trong `localStorage`. Session ID được gửi cùng mọi request để tách lịch sử hội thoại.

## Tính năng hiện có

- Gửi chat bằng nút Send hoặc phím Enter; `Shift + Enter` xuống dòng.
- UI composer tự giãn theo nội dung, giới hạn 1.000 ký tự và chặn gửi trùng.
- Trạng thái `Javis đang trả lời…`, lỗi thân thiện và tự cuộn chat.
- Render nội dung user an toàn bằng `textContent`.
- Render Markdown từ AI bằng `marked`, sau đó sanitize qua DOMPurify.
- API contract mở rộng: `action`, `session_id`, `message`, `payload`.
- Tải lịch sử theo `session_id` qua webhook lịch sử n8n.
- Nút **Cuộc hội thoại mới** tạo session mới mà không xóa lịch sử cũ trong PostgreSQL.
- Frontend tách thành ES Modules; PostgreSQL và frontend có thể chạy bằng Docker.

## Cấu trúc source

```text
.
├── index.html            # Giao diện chat
├── style.css             # Kiểu dáng responsive
├── js/
│   ├── config.js         # URL webhook, timeout, giới hạn giao diện
│   ├── session.js        # Quản lý session_id
│   ├── api.js            # Gọi và kiểm tra n8n API
│   ├── ui.js             # Render chat, trạng thái và composer
│   └── main.js           # Điều phối luồng ứng dụng
├── n8n workflow/
│   ├── chat Javis.json    # Workflow chat để import vào n8n
│   └── get log chat.json  # Workflow GET lịch sử chat
├── docker-compose.yml    # PostgreSQL
├── Dockerfile            # Frontend Nginx
└── .env.example          # Mẫu biến môi trường PostgreSQL
```

## API contract hiện tại

Request chat:

```json
{
  "action": "chat",
  "session_id": "uuid",
  "message": "Xin chào",
  "payload": {}
}
```

Response thành công:

```json
{
  "ok": true,
  "type": "text",
  "reply": "Chào bạn!",
  "data": null
}
```

Response lỗi:

```json
{
  "ok": false,
  "type": "error",
  "reply": "Thông báo lỗi thân thiện",
  "data": null
}
```

## Tính năng sắp tới

- Sidebar nhiều hội thoại và đổi tên hội thoại.
- Lưu metadata hội thoại trên server thay vì chỉ lưu danh sách local.
- Đăng nhập, `user_id` và kiểm tra quyền sở hữu session.
- Đính kèm tệp/hình ảnh và nhập liệu bằng giọng nói.
- AI actions mới: `summarize`, `todo_assist`, response kiểu `list` hoặc `card`.

## Hướng dẫn chạy project

Xem hướng dẫn cài đặt, cấu hình n8n, Docker, PostgreSQL và test API tại:

→ [GUIDE.md](./GUIDE.md)
