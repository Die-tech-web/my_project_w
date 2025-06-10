import { createElement } from "../utils.js";

export function createMessageBubble({ text, timestamp, status, isSent }) {
  const bubble = createElement("div", {
    class: `flex ${isSent ? "justify-end" : "justify-start"} mb-2`,
  });

  const messageContent = createElement("div", {
    class: `max-w-[70%] rounded-lg p-3 ${
      isSent ? "bg-[#95D2B3] text-white" : "bg-gray-100 text-gray-800"
    }`,
  });

  const textEl = createElement("p", { class: "break-words" }, text);

  const footer = createElement("div", {
    class: "flex items-center justify-end gap-1 mt-1 text-xs",
  });

  const time = createElement(
    "span",
    {
      class: isSent ? "text-white/80" : "text-gray-500",
    },
    new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  );

  footer.appendChild(time);

  if (isSent) {
    const statusIcon = createElement("i", {
      class: `fas fa-${
        status === "sent"
          ? "check"
          : status === "delivered"
          ? "check-double"
          : status === "read"
          ? "check-double text-blue-400"
          : "check"
      } ml-1`,
    });
    footer.appendChild(statusIcon);
  }

  messageContent.append(textEl, footer);
  bubble.appendChild(messageContent);

  return bubble;
}
