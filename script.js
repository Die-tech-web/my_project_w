import { creerSidebar } from "./layout_components.js";

const app = document.getElementById("app");

const mainWrapper = createElement("div", {
  class: "p-6 h-full"
});
const container = createElement("div", {
  class: "flex h-full bg-white rounded-xl shadow overflow-hidden"
});

const sidebar = creerSidebar();
container.appendChild(sidebar);
mainWrapper.appendChild(container);
app.appendChild(mainWrapper);
