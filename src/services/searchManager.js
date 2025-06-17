import { API_ENDPOINTS } from "../config.js";
import { createElement } from "../utils.js";

export function createContactElement(contact) {
  if (!contact || !contact.name) return null;

  const element = createElement("div", {
    class: "flex items-center p-3 hover:bg-[#1e3d59] cursor-pointer rounded-lg",
    onclick: () => {
      if (window.handleContactClick) {
        window.handleContactClick(contact);
      }
    },
  });

  element.innerHTML = `
    <div class="w-10 h-10 rounded-full bg-[#4a90e2] flex items-center justify-center text-white mr-3">
      ${contact.name.charAt(0).toUpperCase()}
    </div>
    <div class="flex-1">
      <h3 class="font-medium text-white">${contact.name}</h3>
      <p class="text-sm text-gray-300">${contact.phone || ""}</p>
    </div>
  `;

  return element;
}

export function createGroupElement(group) {
  if (!group || !group.name) return null;

  const element = createElement("div", {
    class: "flex items-center p-3 hover:bg-[#1e3d59] cursor-pointer rounded-lg",
    onclick: () => {
      if (window.handleGroupClick) {
        window.handleGroupClick(group);
      }
    },
  });

  element.innerHTML = `
    <div class="w-10 h-10 bg-[#4a90e2] rounded-full flex items-center justify-center text-white mr-3">
      <i class="fas fa-users"></i>
    </div>
    <div class="flex-1">
      <h3 class="font-medium text-white">${group.name}</h3>
      <p class="text-sm text-gray-300">${
        group.members ? group.members.length : 0
      } participants</p>
    </div>
  `;

  return element;
}
