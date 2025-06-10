import { createElement } from "../utils.js";

export function createUserProfileModal() {
  const user = JSON.parse(localStorage.getItem("whatsappUser"));
  if (!user) return null;

  const overlay = createElement("div", {
    class: "fixed inset-0 bg-black/50 flex items-center justify-center z-50",
    onclick: (e) => {
      if (e.target === overlay) overlay.remove();
    },
  });

  const modal = createElement("div", {
    class: "bg-[#1F2937] rounded-xl w-[400px] overflow-hidden",
    onclick: (e) => e.stopPropagation(),
  });

  const header = createElement("div", {
    class: "bg-[#95D2B3] p-4 flex items-center",
  });

  header.innerHTML = `
    <button class="text-white mr-4">
      <i class="fas fa-arrow-left"></i>
    </button>
    <h2 class="text-white text-lg font-medium">Profil</h2>
  `;

  header.querySelector("button").onclick = () => overlay.remove();

  const photoSection = createElement("div", {
    class: "flex flex-col items-center py-8",
  });

  const avatarContainer = createElement("div", {
    class: "w-32 h-32 bg-[#95D2B3] rounded-full flex items-center justify-center mb-4",
  });

  const avatar = createElement("div", {
    class: "text-white text-4xl",
    innerHTML: `<i class="fas fa-user"></i>`,
  });

  const addPhotoBtn = createElement("button", {
    class: "text-[#95D2B3] text-sm",
    innerHTML: "AJOUTER UNE PHOTO DE PROFIL",
  });

  avatarContainer.appendChild(avatar);
  photoSection.append(avatarContainer, addPhotoBtn);

  const infoSection = createElement("div", {
    class: "px-6 py-4 space-y-6",
  });

  const nameSection = createElement("div", {
    class: "space-y-1",
  });
  nameSection.innerHTML = `
    <p class="text-[#95D2B3] text-sm">Votre nom</p>
    <div class="flex justify-between items-center">
      <p class="text-white">${user.firstName} ${user.lastName}</p>
      <button class="text-[#95D2B3]"><i class="fas fa-pen"></i></button>
    </div>
  `;

  // Description
  const infoTextSection = createElement("div", {
    class: "text-gray-400 text-sm py-2",
  });
  infoTextSection.innerHTML = `
    <p>Il ne s'agit pas de votre nom d'utilisateur ou code PIN.</p>
    <p>Ce nom sera visible par vos contacts WhatsApp.</p>
  `;

  // Téléphone
  const phoneSection = createElement("div", {
    class: "space-y-1 pt-4",
  });
  phoneSection.innerHTML = `
    <p class="text-[#95D2B3] text-sm">Téléphone</p>
    <p class="text-white">${user.phone}</p>
  `;

  infoSection.append(nameSection, infoTextSection, phoneSection);
  modal.append(header, photoSection, infoSection);
  overlay.appendChild(modal);

  return overlay;
}