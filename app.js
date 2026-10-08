const input = document.getElementById("message-input");
const button = document.getElementById("send-button");
const chatBox = document.getElementById("chat-box");

const MESSAGES_WEBHOOK_URL = "http://localhost:5678/webhook-test/get-message";

// ===============================
// GET: Load lịch sử tin nhắn
// ===============================
async function loadMessages() {
  try {
    const response = await fetch(MESSAGES_WEBHOOK_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    console.log("Lịch sử:", data);

    if (!data.success || !Array.isArray(data.messages)) {
      console.error("Dữ liệu không đúng:", data);
      return;
    }

    // Hiển thị lịch sử
    data.messages.forEach((item) => {
      chatBox.innerHTML += `
        <div class="message">
          <b>You:</b> ${item.message}
        </div>
      `;
    });
  } catch (error) {
    console.error("Lỗi loadMessages:", error);
  }
}

// ===============================
// Khi mở trang → load lịch sử
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  loadMessages();
});
