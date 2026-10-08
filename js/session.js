const SESSION_STORAGE_KEY = "chat_session_id";

function createSessionId() {
  if (typeof crypto.randomUUID !== "function") {
    throw new Error("Trình duyệt không hỗ trợ tạo session ID");
  }

  return crypto.randomUUID();
}

export function getSessionId() {
  let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);

  if (!sessionId) {
    sessionId = createSessionId();
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }

  return sessionId;
}

export function createNewSession() {
  const sessionId = createSessionId();
  localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  return sessionId;
}

export function clearSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}
