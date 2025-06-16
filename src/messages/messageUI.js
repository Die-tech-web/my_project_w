import { createElement } from "../utils.js";

export function createMessageBubble({ text, timestamp, status, isSent }) {
  const bubble = createElement("div", {
    class: `flex ${isSent ? "justify-end" : "justify-start"} mb-2`,
  });

  const messageContent = createElement("div", {
    class: `max-w-[70%] rounded-lg p-3 ${
      isSent
        ? "bg-[#dcf8c6] text-black ml-auto"
        : "bg-white text-black border border-gray-200"
    }`,
  });

  const textEl = createElement(
    "p",
    {
      class: "break-words mb-1",
    },
    text
  );

  const footer = createElement("div", {
    class: "flex items-center justify-end gap-1 text-xs text-gray-500",
  });

  const time = createElement(
    "span",
    {
      class: "text-xs",
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
          ? "check-double text-blue-500"
          : "check"
      } ml-1`,
    });
    footer.appendChild(statusIcon);
  }

  messageContent.append(textEl, footer);
  bubble.appendChild(messageContent);

  return bubble;
}
