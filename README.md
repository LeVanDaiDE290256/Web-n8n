# Guideline chạy Web n8n AI Chat

Tài liệu này hướng dẫn chạy project từ đầu. Project gồm ba phần:

1. **PostgreSQL**: chạy bằng `docker-compose.yml`, dùng cho Chat Memory của n8n.
2. **n8n**: import workflow và cấu hình Gemini + PostgreSQL credential.
3. **Frontend**: chạy bằng `Dockerfile` hoặc VS Code Live Server.

> `Dockerfile` chỉ đóng gói frontend. `docker-compose.yml` hiện chỉ chạy PostgreSQL. n8n vẫn cần chạy riêng.

## 1. Kiểm tra các file cần có

```text
Dockerfile              # Docker image cho frontend Nginx
docker-compose.yml      # PostgreSQL container
.env                    # Biến PostgreSQL
index.html              # Giao diện
style.css               # CSS
app.js                  # Gọi webhook n8n
web-n8n (2).json        # Workflow để import vào n8n
```

## 2. Chuẩn bị

Cài các công cụ sau:

- Docker Desktop và bảo đảm Docker Desktop đang mở.
- n8n đang chạy tại `http://localhost:5678`.
- Tài khoản/API key Google Gemini.

Kiểm tra `.env` có nội dung sau:

```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=123456
POSTGRES_DB=logchat_db
```

Không commit `.env` nếu dùng mật khẩu hoặc API key thật.

## 3. Chạy database PostgreSQL

Mở PowerShell trong thư mục project và chạy:

```powershell
docker compose up -d
```

Kiểm tra PostgreSQL đã chạy:

```powershell
docker compose ps
```

Kết quả mong đợi: service `postgres` có trạng thái `running`.

Thông tin kết nối database:

```text
Host: localhost
Port: 5433
Database: logchat_db
Username: admin
Password: 123456
SSL: tắt
```

Xem log nếu database không chạy được:

```powershell
docker compose logs -f postgres
```

## 4. Import workflow vào n8n

1. Mở `http://localhost:5678`.
2. Chọn **Import from File**.
3. Chọn file `web-n8n (2).json`.
4. Mở workflow vừa import.

Sau khi import, cần cấu hình lại credential. Workflow JSON không bao gồm API key và password kết nối database của bạn.

### 4.1. Cấu hình Gemini

1. Mở node **OpenAI Chat Model**.
2. Node này thực tế dùng **Google Gemini**.
3. Tạo hoặc chọn Google Gemini credential có API key của bạn.
4. Lưu node.

### 4.2. Cấu hình PostgreSQL Chat Memory

1. Mở node **Chat Memory**.
2. Tạo hoặc chọn PostgreSQL credential.
3. Nhập:

   ```text
   Host: localhost
   Port: 5433
   Database: logchat_db
   User: admin
   Password: 123456
   SSL: tắt
   ```

4. Lưu credential và node.

> Nếu n8n đang chạy trong một Docker container khác trên Windows, Host không dùng `localhost`; dùng `host.docker.internal`.

### 4.3. Kiểm tra Webhook và response

Trong node **Zalo Webhook**, đặt:

```text
HTTP Method: POST
Path: chat-web
Respond: Using 'Respond to Webhook' Node
```

Trong node **Respond to Webhook**:

```text
Respond With: JSON
```

Response Body phải trả JSON với trường `reply`. Nếu dùng Expression cho cả ô, nhập:

```js
{{ JSON.stringify({ reply: $json.output }) }}
```

Phần xem trước phải có dạng:

```json
{"reply":"Nội dung phản hồi của AI"}
```

Không để kết quả bắt đầu bằng `=` hoặc hiển thị `[object Object]`, vì frontend sẽ không đọc được response đó.

## 5. Chạy workflow n8n

### Chế độ thử nghiệm

1. Trong workflow, bấm **Execute workflow**.
2. Giữ workflow ở trạng thái chờ request.
3. Frontend dùng URL test:

   ```js
   http://localhost:5678/webhook-test/chat-web
   ```

### Chế độ sử dụng lâu dài

1. Bật toggle **Active** cho workflow.
2. Trong `app.js`, đổi URL thành:

   ```js
   const N8N_WEBHOOK_URL = "http://localhost:5678/webhook/chat-web";
   ```

3. Lưu `app.js` và build lại frontend nếu bạn chạy bằng Docker.

## 6. Chạy frontend bằng Dockerfile

`Dockerfile` dùng Nginx để phục vụ `index.html`, `style.css` và `app.js`.

### 6.1. Build Docker image

Trong thư mục có `Dockerfile`, chạy:

```powershell
docker build -t web-n8n-frontend .
```

### 6.2. Chạy frontend container

```powershell
docker run --name web-n8n-frontend -p 8080:80 -d web-n8n-frontend
```

Mở trình duyệt tại:

```text
http://localhost:8080
```

### 6.3. Khi sửa frontend

Docker image không tự cập nhật source. Sau khi sửa `index.html`, `style.css` hoặc `app.js`, chạy:

```powershell
docker rm -f web-n8n-frontend
docker build -t web-n8n-frontend .
docker run --name web-n8n-frontend -p 8080:80 -d web-n8n-frontend
```

## 7. Cách test chat

1. Đảm bảo PostgreSQL, n8n workflow và frontend đều đang chạy.
2. Mở `http://localhost:8080`.
3. Nhập tin nhắn và bấm **Send**.
4. Web gửi request sau đến n8n:

   ```json
   {
     "message": "Xin chào",
     "sender": "user"
   }
   ```

5. n8n phải trả:

   ```json
   {
     "reply": "Chào bạn! Tôi có thể giúp gì?"
   }
   ```

6. Câu trả lời xuất hiện trong khung chat.

## 8. Xử lý lỗi thường gặp

| Lỗi | Cách xử lý |
| --- | --- |
| `port is already allocated` | Đổi cổng phía trái trong `docker-compose.yml`, ví dụ `5434:5432`; sau đó credential n8n phải dùng port `5434`. |
| Không kết nối được PostgreSQL | Chạy `docker compose ps`, kiểm tra `.env`, rồi xem `docker compose logs -f postgres`. |
| Webhook test không hoạt động | Bấm **Execute workflow** trước khi gửi từ web. |
| Workflow Active nhưng web không gọi được | Dùng `/webhook/chat-web`, không dùng `/webhook-test/chat-web`. |
| Web không hiện câu trả lời | Node Respond to Webhook phải trả JSON có `reply`, không phải text thuần. |
| `Invalid JSON in Response Body` | Kiểm tra expression response; kết quả phải là `{"reply":"..."}` và không có dấu `=` ở đầu. |
| Lỗi CORS | Cấu hình CORS trong n8n hoặc chạy frontend/n8n phía sau cùng một domain/proxy. |

## 9. Gửi project cho người khác

Gửi source code, `Dockerfile`, `docker-compose.yml`, workflow JSON và README. Không gửi `.env` thật hoặc Gemini API key.

Người nhận cần tự tạo `.env`, chạy database bằng `docker compose up -d`, tự tạo Gemini/PostgreSQL credential trong n8n, import workflow, rồi build frontend theo mục 6.
