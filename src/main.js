import "./style.css";
import javascriptLogo from "./javascript.svg";
import viteLogo from "/vite.svg";
import { setupCounter } from "./counter.js";
import { createElement } from "./utils.js";
import { creerInterface } from "./interface.js";
import { createLoginForm } from "./login.js";
import { creerSectionDiffusion } from "./sections/diffusion.js";

// Rendre createElement disponible globalement
window.createElement = createElement;

document.querySelector("#app").innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
`;

setupCounter(document.querySelector("#counter"));

function init() {
  const app = document.getElementById("app");
  if (!app) return;

  const user = localStorage.getItem("whatsappUser");

  if (user) {
    app.appendChild(creerInterface());
  } else {
    app.appendChild(createLoginForm());
  }

  const diffusionSection = creerSectionDiffusion();
  // Ajouter la section où nécessaire dans votre layout
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
