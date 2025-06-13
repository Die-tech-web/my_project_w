import { createElement } from "../utils.js";

export function createDeleteConfirmationModal(type, item, onConfirm) {
  const overlay = createElement("div", {
    class:
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",
  });

  const modal = createElement("div", {
    class: "bg-white rounded-xl p-6 w-[400px] shadow-xl",
  });

  const content = createElement("div", {
    class: "text-center",
  });

  const icon = createElement("div", {
    class:
      "mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4",
  });
  icon.innerHTML = '<i class="fas fa-trash text-red-500 text-xl"></i>';

  const title = createElement(
    "h3",
    {
      class: "text-lg font-medium text-gray-900 mb-2",
    },
    `Supprimer ${type === "contact" ? "le contact" : "le groupe"}`
  );

  const message = createElement(
    "p",
    {
      class: "text-gray-500 mb-6",
    },
    `Voulez-vous vraiment supprimer ${
      type === "contact" ? "ce contact" : "ce groupe"
    } ?`
  );

  const buttonsContainer = createElement("div", {
    class: "flex justify-end space-x-3",
  });

  const cancelButton = createElement(
    "button",
    {
      class: "px-4 py-2 text-gray-500 hover:text-gray-700 font-medium",
      onclick: () => overlay.remove(),
    },
    "Annuler"
  );

  const confirmButton = createElement(
    "button",
    {
      class:
        "px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium",
      onclick: async () => {
        await onConfirm();
        overlay.remove();
      },
    },
    "Supprimer"
  );

  buttonsContainer.append(cancelButton, confirmButton);
  content.append(icon, title, message, buttonsContainer);
  modal.appendChild(content);
  overlay.appendChild(modal);

  return overlay;
}
