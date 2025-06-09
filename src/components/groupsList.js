import { createElement } from "../utils.js";

export function updateGroupsList() {
  const groupsContainer = document.querySelector(".section-diffusion");
  if (!groupsContainer) return;

  fetch("http://localhost:3000/groups")
    .then((res) => res.json())
    .then((groups) => {
      const groupsList =
        groupsContainer.querySelector(".flex-1") || groupsContainer;
      groupsList.innerHTML = "";

      groups.forEach((group) => {
        const groupElement = createElement("div", {
          class:
            "flex items-center p-3 hover:bg-[#0A6847] group cursor-pointer",
        });

        groupElement.innerHTML = `
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-[#95D2B3] rounded-full flex items-center justify-center text-white">
              <i class="fas fa-users"></i>
            </div>
            <div>
              <h3 class="font-medium text-gray-800 group-hover:text-white">${group.name}</h3>
              <p class="text-sm text-gray-500 group-hover:text-white/80">${group.members.length} participants</p>
            </div>
          </div>
        `;

        groupsList.appendChild(groupElement);
      });
    });
}
