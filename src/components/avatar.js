import { createElement } from "../utils.js";

export function createAvatar(contact) {
  const initials = contact.name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return createElement(
    "div",
    {
      class:
        "w-10 h-10 rounded-full bg-[#E53935] flex items-center justify-center text-white font-medium mr-3",
      id: `avatar-${contact.id}`,
    },
    initials
  );
}
