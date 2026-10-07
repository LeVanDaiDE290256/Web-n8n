const input = document.getElementById("message-input");
const button = document.getElementById("send-button");
const chatBox = document.getElementById("chat-box");

const N8N_WEBHOOK_URL = "http://localhost:5678/webhook-test/chat-web";

button.addEventListener("click", async () => {
  const message = input.value.trim();

  if (!message) {
    return;
  }

  // Hiển thị tin nhắn của user
  chatBox.innerHTML += `
        <div class="message">
            <b>You:</b> ${message}
        </div>
    `;

  input.value = "";

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        message: message,
      }),
    });

    const data = await response.json();

    chatBox.innerHTML += `
        <div class="message">
            <b>n8n:</b> ${data.reply}
        </div>
    `;

    console.log(data);
  } catch (error) {
    console.error(error);
  }
});
