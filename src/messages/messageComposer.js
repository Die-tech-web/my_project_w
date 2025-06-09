import { createElement } from "../utils.js";

export function createMessageComposer({ onSend, onDraftSave }) {
  const container = createElement("div", {
    class: "flex flex-col bg-white border-t border-gray-200 p-3",
  });

  const textarea = createElement("textarea", {
    class:
      "w-full min-h-[40px] max-h-[120px] px-4 py-2 rounded-lg border border-gray-300 focus:border-[#95D2B3] resize-none",
    placeholder: "Écrivez votre message...",
  });

  // Auto-expand textarea
  textarea.addEventListener("input", () => {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  });

  const toolbar = createElement("div", {
    class: "flex items-center gap-3 mt-2",
  });

  // Emoji button
  const emojiBtn = createElement("button", {
    class: "text-gray-500 hover:text-[#95D2B3]",
  });
  emojiBtn.innerHTML = '<i class="far fa-smile text-xl"></i>';

  // Attachment button
  const attachBtn = createElement("button", {
    class: "text-gray-500 hover:text-[#95D2B3]",
  });
  attachBtn.innerHTML = '<i class="fas fa-paperclip text-xl"></i>';

  // Send button
  const sendBtn = createElement("button", {
    class:
      "ml-auto bg-[#95D2B3] text-white px-4 py-2 rounded-full hover:bg-[#7BC0A1]",
    onclick: () => {
      const text = textarea.value.trim();
      if (text) {
        onSend(text);
        textarea.value = "";
        textarea.style.height = "auto";
      }
    },
  });
  sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';

  // Auto-save draft
  let draftTimeout;
  textarea.addEventListener("input", () => {
    clearTimeout(draftTimeout);
    draftTimeout = setTimeout(() => {
      onDraftSave(textarea.value);
    }, 1000);
  });

  toolbar.append(emojiBtn, attachBtn, sendBtn);
  container.append(textarea, toolbar);

  return container;
}
