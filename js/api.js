import { API_CONFIG, CHAT_ACTION } from "./config.js";

export class ApiError extends Error {}

async function readJsonResponse(response) {
  try {
    return await response.json();
  } catch {
    throw new ApiError("Webhook không trả về JSON hợp lệ");
  }
}

function validateResponse(response, data) {
  if (!response.ok) {
    throw new ApiError(data?.reply || `Webhook trả về HTTP ${response.status}`);
  }

  if (!data || data.ok !== true) {
    throw new ApiError(data?.reply || "Javis không thể xử lý yêu cầu này");
  }

  if (typeof data.type !== "string") {
    throw new ApiError("Webhook không trả về type hợp lệ");
  }

  if (typeof data.reply !== "string") {
    throw new ApiError("Webhook không trả về trường reply hợp lệ");
  }
}

async function requestJson(url, options, errorMessages) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), API_CONFIG.requestTimeoutMs);
  let response;

  try {
    response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new ApiError(errorMessages.timeout);
    }

    throw new ApiError(errorMessages.connection);
  } finally {
    window.clearTimeout(timeoutId);
  }

  const data = await readJsonResponse(response);
  validateResponse(response, data);
  return data;
}

export async function sendMessage({ sessionId, message, payload = {} }) {
  return requestJson(
    API_CONFIG.webhookUrl,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: CHAT_ACTION,
        session_id: sessionId,
        message,
        payload,
      }),
    },
    {
      timeout: "Javis phản hồi quá lâu. Hãy thử lại.",
      connection: "Không thể kết nối tới Javis. Hãy kiểm tra n8n rồi thử lại.",
    },
  );
}

export async function getHistory(sessionId) {
  const historyUrl = new URL(API_CONFIG.historyUrl);
  historyUrl.searchParams.set("session_id", sessionId);

  const data = await requestJson(
    historyUrl,
    { method: "GET" },
    {
      timeout: "Tải lịch sử trò chuyện quá lâu. Hãy thử lại.",
      connection: "Không thể tải lịch sử trò chuyện. Hãy kiểm tra n8n rồi thử lại.",
    },
  );

  if (data.type !== "history") {
    throw new ApiError("Webhook không trả về dữ liệu lịch sử hợp lệ");
  }

  if (!Array.isArray(data.data?.messages)) {
    throw new ApiError("Webhook không trả về danh sách lịch sử hợp lệ");
  }

  return data;
}
