export const API_CONFIG = Object.freeze({
  webhookUrl: "http://localhost:5678/webhook/chat-web",
  historyUrl: "http://localhost:5678/webhook/chat-history",
  requestTimeoutMs: 30_000,
  maxMessageLength: 1000,
  maxComposerHeight: 360,
});

export const CHAT_ACTION = "chat";
