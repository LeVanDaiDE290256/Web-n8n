import { getHistory, sendMessage } from "./api.js";
import { createNewSession, getSessionId } from "./session.js";
import {
  appendBotMessage,
  appendErrorMessage,
  appendUserMessage,
  bindComposerEvents,
  bindNewConversationEvent,
  clearChatMessages,
  clearMessage,
  focusComposer,
  getMessage,
  refreshComposer,
  renderHistory,
  setSendingState,
  showHistoryNotice,
} from "./ui.js";

let isSending = false;

function refreshUI() {
  refreshComposer(isSending);
}

async function sendCurrentMessage() {
  const message = getMessage();

  if (!message || isSending) {
    return;
  }

  const pendingUserMessage = appendUserMessage(message);
  isSending = true;
  setSendingState(true);
  refreshUI();

  try {
    const data = await sendMessage({
      sessionId: getSessionId(),
      message,
    });

    clearMessage();
    refreshUI();
    appendBotMessage(data.reply);
  } catch (error) {
    console.error(error);
    pendingUserMessage.remove();
    appendErrorMessage(error instanceof Error
      ? error.message
      : "Không thể nhận phản hồi từ Javis. Hãy kiểm tra n8n rồi thử lại.");
  } finally {
    isSending = false;
    setSendingState(false);
    refreshUI();
    focusComposer();
  }
}

async function loadHistory() {
  try {
    const data = await getHistory(getSessionId());
    renderHistory(data.data.messages);
  } catch (error) {
    console.error(error);
    showHistoryNotice("Không thể tải lịch sử cũ. Bạn vẫn có thể bắt đầu cuộc trò chuyện mới.");
  }
}

function startNewConversation() {
  if (isSending) {
    return;
  }

  createNewSession();
  clearChatMessages();
  focusComposer();
}

async function initialize() {
  refreshUI();
  await loadHistory();

  bindComposerEvents({
    onInput: refreshUI,
    onKeydown: (event) => {
      if (event.key !== "Enter" || event.shiftKey) {
        return;
      }

      event.preventDefault();
      sendCurrentMessage();
    },
    onSend: sendCurrentMessage,
  });

  bindNewConversationEvent(startNewConversation);

  refreshUI();
}

initialize();
