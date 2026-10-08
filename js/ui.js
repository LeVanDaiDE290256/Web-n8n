import { API_CONFIG } from "./config.js";

const input = document.getElementById("message-input");
const button = document.getElementById("send-button");
const chatBox = document.getElementById("chat-box");
const messageCounter = document.getElementById("message-counter");
const composerShell = document.querySelector(".composer-shell");
const chatStatus = document.getElementById("chat-status");
const newConversationButton = document.getElementById("new-conversation-button");

function scrollChatToBottom() {
  chatBox.scrollTo({
    top: chatBox.scrollHeight,
    behavior: "smooth",
  });
}

function resizeComposer() {
  input.style.height = "auto";

  const nextHeight = Math.min(input.scrollHeight, API_CONFIG.maxComposerHeight);
  input.style.height = `${nextHeight}px`;
  input.classList.toggle("has-scrollbar", input.scrollHeight > API_CONFIG.maxComposerHeight);
  composerShell.classList.toggle("is-expanded", nextHeight > 42);
}

function createMessageElement(className, tagName, text) {
  const messageElement = document.createElement("div");
  const messageContent = document.createElement(tagName);

  messageElement.className = `message ${className}`;
  messageContent.textContent = text;
  messageElement.append(messageContent);
  return messageElement;
}

function createBotMessageElement(reply) {
  const messageElement = document.createElement("div");
  const messageContent = document.createElement("div");
  const replyText = String(reply ?? "");

  messageElement.className = "message bot";
  messageContent.className = "message-content";

  if (typeof marked === "undefined" || typeof DOMPurify === "undefined") {
    messageContent.textContent = replyText;
  } else {
    const renderedMarkdown = marked.parse(replyText, {
      breaks: true,
      gfm: true,
    });

    messageContent.innerHTML = DOMPurify.sanitize(renderedMarkdown);
  }

  messageElement.append(messageContent);
  return messageElement;
}

export function refreshComposer(isSending) {
  const messageLength = input.value.length;
  const hasMessage = input.value.trim().length > 0;

  messageCounter.textContent = `${messageLength} / ${API_CONFIG.maxMessageLength}`;
  button.disabled = isSending || !hasMessage || messageLength > API_CONFIG.maxMessageLength;
  composerShell.classList.toggle("has-message", hasMessage);
  resizeComposer();
}

export function setSendingState(sending) {
  input.disabled = sending;
  newConversationButton.disabled = sending;
  composerShell.classList.toggle("is-sending", sending);
  chatStatus.classList.remove("is-notice");
  chatStatus.hidden = !sending;
  chatStatus.textContent = sending ? "Javis đang trả lời…" : "";

  if (sending) {
    scrollChatToBottom();
  }
}

export function getMessage() {
  return input.value.trim();
}

export function clearMessage() {
  input.value = "";
}

export function focusComposer() {
  input.focus();
}

export function appendUserMessage(message) {
  const messageElement = createMessageElement("user", "p", message);

  chatBox.append(messageElement);
  scrollChatToBottom();
  return messageElement;
}

export function appendBotMessage(reply) {
  const messageElement = createBotMessageElement(reply);

  chatBox.append(messageElement);
  scrollChatToBottom();
}

export function appendErrorMessage(message) {
  const messageElement = createMessageElement("error", "p", message);

  chatBox.append(messageElement);
  scrollChatToBottom();
}

export function clearChatMessages() {
  chatBox.replaceChildren();

  if (chatStatus.classList.contains("is-notice")) {
    chatStatus.hidden = true;
    chatStatus.classList.remove("is-notice");
    chatStatus.textContent = "";
  }
}

export function renderHistory(messages) {
  clearChatMessages();

  messages.forEach((message) => {
    if (message.role === "human") {
      chatBox.append(createMessageElement("user", "p", String(message.content ?? "")));
    }

    if (message.role === "ai") {
      chatBox.append(createBotMessageElement(message.content));
    }
  });

  if (messages.length > 0) {
    scrollChatToBottom();
  }
}

export function showHistoryNotice(message) {
  chatStatus.hidden = false;
  chatStatus.classList.add("is-notice");
  chatStatus.textContent = message;
}

export function bindComposerEvents({ onInput, onKeydown, onSend }) {
  input.addEventListener("input", onInput);
  input.addEventListener("keydown", onKeydown);
  button.addEventListener("click", onSend);
}

export function bindNewConversationEvent(onNewConversation) {
  newConversationButton.addEventListener("click", onNewConversation);
}
