import { createElement } from "../utils.js";
import { updateDiscussions } from "../sections/discussions.js";
import { updateDiffusionGroups } from "../sections/diffusion.js";

export function createGroupModal() {
  const currentUser = JSON.parse(localStorage.getItem("whatsappUser"));
  const modal = createElement("div", {
    class:
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",
    id: "groupModal",
  });

  const content = `
    <div class="bg-white rounded-xl p-6 w-[400px]">
      <h3 class="text-xl font-bold mb-4 text-gray-800">Créer un groupe</h3>
      <form id="groupForm" class="space-y-4">
        <input type="text" id="groupName" placeholder="Nom du groupe" 
          class="w-full px-4 py-3 rounded-xl bg-gray-50 border focus:border-[#95D2B3]">
        
        <!-- Administrateur par défaut -->
        <div class="p-2 bg-gray-50 rounded-lg mb-2">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-[#95D2B3] rounded-full flex items-center justify-center text-white">
              <i class="fas fa-user-shield"></i>
            </div>
            <div class="ml-3">
              <p class="text-gray-900 font-medium">Vous (Administrateur)</p>
              <p class="text-gray-500 text-sm">${
                currentUser ? currentUser.phone : ""
              }</p>
            </div>
          </div>
        </div>

        <p class="text-sm text-gray-500 mb-2">Membres du groupe</p>
        <div id="membersList" class="max-h-48 overflow-y-auto space-y-2"></div>
        <div class="flex justify-end gap-3 mt-4">
          <button type="button" class="px-4 py-2 text-gray-600 bg-gray-100 rounded-xl" id="cancelBtn">Annuler</button>
          <button type="submit" class="px-4 py-2 text-white bg-[#95D2B3] rounded-xl">Créer</button>
        </div>
      </form>
    </div>
  `;

  modal.innerHTML = content;

  // Charger les contacts avec un style amélioré
  fetch("http://localhost:3000/users")
    .then((res) => res.json())
    .then((users) => {
      const membersList = modal.querySelector("#membersList");
      users
        .filter((user) => user.id !== currentUser.id) // Exclure l'utilisateur courant
        .forEach((user) => {
          const label = createElement("label", {
            class:
              "flex items-center p-2 hover:bg-gray-50 cursor-pointer rounded-lg",
          });

          label.innerHTML = `
            <input type="checkbox" value="${user.id}" class="mr-3 h-4 w-4 rounded border-gray-300 text-[#95D2B3]">
            <div class="flex flex-col">
              <span class="text-gray-900 font-medium">${user.name}</span>
              <span class="text-gray-500 text-sm">${user.phone}</span>
            </div>
          `;

          membersList.appendChild(label);
        });
    });

  // Gérer la création du groupe
  modal.querySelector("#groupForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = modal.querySelector("#groupName").value;
    const selectedMembers = [
      ...modal.querySelectorAll("input[type=checkbox]:checked"),
    ].map((cb) => cb.value);

    if (!name || selectedMembers.length === 0) return;

    const groupData = {
      name,
      members: [currentUser.id, ...selectedMembers],
      admin: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("http://localhost:3000/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(groupData),
      });

      if (response.ok) {
        // Message de succès
        const successMessage = createElement(
          "div",
          {
            class:
              "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg",
            style: "z-index: 9999",
          },
          "Groupe créé avec succès"
        );

        document.body.appendChild(successMessage);
        setTimeout(() => successMessage.remove(), 3000);

        modal.remove();

        // Déclencher la mise à jour
        updateDiscussions();
        updateDiffusionGroups();
        window.dispatchEvent(new CustomEvent("groupCreated"));
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  });

  modal.querySelector("#cancelBtn").onclick = () => modal.remove();

  window.addEventListener("groupCreated", () => {
    loadContacts();
  });

  return modal;
}
