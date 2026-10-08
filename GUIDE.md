# Hướng dẫn chạy Javis AI Chat

README chỉ giới thiệu project. Tài liệu này hướng dẫn chạy đầy đủ môi trường local.

## 1. Chuẩn bị

Cần có Docker Desktop, n8n đang chạy tại `http://localhost:5678` và Gemini API key.

Tạo `.env` từ `.env.example`, rồi điền cấu hình PostgreSQL:

```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=123456
POSTGRES_DB=logchat_db
```

Không commit file `.env` nếu dùng mật khẩu thật.

## 2. Chạy PostgreSQL

Tại thư mục project:

```powershell
docker compose up -d
docker compose ps
```

Thông tin kết nối:

```text
Host: localhost
Port: 5433
Database: logchat_db
User: admin
Password: 123456
SSL: tắt
```

Xem log khi có lỗi:

```powershell
docker compose logs -f postgres
```

## 3. Cấu hình workflow chat n8n

1. Mở n8n tại `http://localhost:5678`.
2. Import file `n8n workflow/chat Javis.json`.
3. Cấu hình Gemini credential trong node AI model.
4. Cấu hình PostgreSQL credential cho Chat Memory bằng thông tin ở mục 2.
5. Đặt Chat Memory dùng `session_id` request làm custom session key.
6. Trong Webhook chat, dùng `POST /chat-web` và `Respond to Webhook` node.

Workflow chat cần nhận body:

```json
{
  "action": "chat",
  "session_id": "uuid",
  "message": "Nội dung chat",
  "payload": {}
}
```

Workflow cần trả contract thành công/lỗi như trong [README](./README.md#api-contract-hiện-tại).

## 4. Cấu hình webhook lịch sử n8n

Import file `n8n workflow/get log chat.json`, sau đó kiểm tra/cấu hình lại PostgreSQL credential trong các node liên quan. Workflow này dùng endpoint:

```text
GET /chat-history?session_id=...
```

Luồng node:

```text
Webhook → IF có session_id?
  ├─ true  → Postgres Execute Query → Respond History 200
  └─ false → Respond Error 400
```

SQL của node Postgres:

```sql
SELECT
  id,
  message->>'type' AS role,
  message->>'content' AS content
FROM chat_messages
WHERE session_id = $1
ORDER BY id ASC;
```

Truyền `query.session_id` vào **Query Parameters** của node Postgres; không ghép trực tiếp dữ liệu vào SQL. Bật **Always Output Data** để session mới trả `messages: []`.

Response thành công:

```json
{
  "ok": true,
  "type": "history",
  "reply": "",
  "data": {
    "messages": []
  }
}
```

Nếu thiếu `session_id`, trả HTTP `400`:

```json
{
  "ok": false,
  "type": "error",
  "reply": "Thiếu session_id.",
  "data": null
}
```

## 5. Cấu hình URL frontend

Project hiện dùng production URL vì các workflow đã **Active**:

```js
webhookUrl: "http://localhost:5678/webhook/chat-web",
historyUrl: "http://localhost:5678/webhook/chat-history",
```

Chỉ khi test thủ công trong n8n bằng **Execute workflow**, tạm đổi cả hai URL sang test mode:

```js
webhookUrl: "http://localhost:5678/webhook-test/chat-web",
historyUrl: "http://localhost:5678/webhook-test/chat-history",
```

Hai URL phải cùng chế độ; không dùng một URL test và một URL production.

## 6. Chạy frontend

### Dùng VS Code

Mở `index.html`, sau đó bấm **Go Live**.

### Dùng Docker

```powershell
docker build -t web-n8n-frontend .
docker run --name web-n8n-frontend -p 8080:80 -d web-n8n-frontend
```

Mở `http://localhost:8080`.

Sau khi sửa `index.html`, `style.css` hoặc bất kỳ file nào trong `js/`, build lại:

```powershell
docker rm -f web-n8n-frontend
docker build -t web-n8n-frontend .
docker run --name web-n8n-frontend -p 8080:80 -d web-n8n-frontend
```

## 7. Test

Test chat: gửi một tin từ web, kiểm tra Network request có `action: "chat"`, `session_id` và `payload: {}`.

Test lịch sử: refresh trang. Web phải gọi `GET /chat-history` với session hiện tại và render các tin `human`/`ai` theo đúng thứ tự.

Test session mới: bấm **Cuộc hội thoại mới**. Bubble cũ biến mất, session mới được tạo và lịch sử cũ không bị xóa khỏi PostgreSQL.

## 8. Xử lý lỗi thường gặp

| Vấn đề | Cách xử lý |
| --- | --- |
| Webhook test 404 | Bấm **Execute workflow** rồi gọi lại; webhook test chỉ nhận một request mỗi lần execute. |
| Workflow Active nhưng không gọi được | Dùng URL `/webhook/...` trong cả `webhookUrl` và `historyUrl`. |
| `there is no parameter $1` | Thêm `Query Parameters` cho node Postgres và truyền `query.session_id`. |
| Không kết nối PostgreSQL | Chạy `docker compose ps`, kiểm tra `.env` và log PostgreSQL. |
| CORS trong trình duyệt | Cấu hình CORS trên n8n hoặc đưa frontend/n8n qua cùng proxy/domain. |
