# Web → n8n Chat Demo

Demo nhỏ kết nối giao diện chat HTML/CSS/JavaScript với một workflow n8n qua Webhook.

Khi người dùng gửi tin nhắn, trang web gửi `POST` đến n8n. Workflow hiện tại đọc trường `message`, chuyển nội dung sang chữ thường và trả kết quả về để hiển thị trong khung chat.

## Chức năng

- Giao diện chat đơn giản, không cần framework hay cài đặt package.
- Gửi JSON đến n8n bằng `fetch`.
- Workflow n8n phản hồi JSON theo định dạng `{ "success": true, "reply": "..." }`.
- Minh hoạ node **Webhook** → **Code** → **Respond to Webhook**.

## Cấu trúc dự án

```text
.
├── index.html          # Giao diện chat
├── style.css           # Kiểu dáng giao diện
├── app.js              # Gọi webhook n8n và hiển thị phản hồi
└── workflow n8n.json   # Workflow để import vào n8n
```

## Yêu cầu

- n8n đang chạy tại `http://localhost:5678`.
- Trình duyệt hiện đại.

## Cài đặt và chạy

1. Mở n8n tại `http://localhost:5678`.
2. Trong n8n, chọn **Import from File** và chọn file `workflow n8n.json`.
3. Mở workflow **My workflow**.
4. Nhấn **Execute workflow** để webhook thử nghiệm sẵn sàng nhận request.
5. Phục vụ thư mục dự án bằng một HTTP server. Ví dụ, nếu đã cài Python:

   ```bash
   python -m http.server 5500
   ```

6. Mở `http://localhost:5500` trên trình duyệt, nhập tin nhắn và nhấn **Send**.

## Luồng hoạt động

```text
Browser
  └─ POST /webhook-test/chat-web  { "message": "Xin Chào" }
       └─ n8n Webhook → Code in JavaScript → Respond to Webhook
            └─ { "success": true, "reply": "xin chào" }
```

## Cấu hình webhook

URL đang dùng trong [app.js](./app.js) là:

```js
const N8N_WEBHOOK_URL = "http://localhost:5678/webhook-test/chat-web";
```

Đây là **test URL**, nên chỉ hoạt động khi workflow đang ở trạng thái **Execute workflow** trong n8n. Để dùng lâu dài, hãy bật workflow thành **Active** và đổi URL thành:

```js
const N8N_WEBHOOK_URL = "http://localhost:5678/webhook/chat-web";
```

Nếu frontend và n8n chạy ở hai domain/port khác nhau và trình duyệt báo lỗi CORS, hãy cấu hình CORS trên n8n hoặc chạy frontend qua proxy phù hợp.

## Dữ liệu trao đổi

Request từ frontend:

```json
{ "message": "Hello N8N" }
```

Response từ workflow:

```json
{ "success": true, "reply": "hello n8n" }
```

## Tuỳ biến

Sửa node **Code in JavaScript** trong n8n để thay phần chuyển chữ thường bằng logic riêng, chẳng hạn gọi AI, cơ sở dữ liệu hoặc một API khác. Giữ trường `reply` trong response nếu muốn dùng nguyên phần hiển thị hiện tại ở frontend.
