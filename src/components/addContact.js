import { createElement } from "../utils.js";
import { validateContact } from "../validations.js"; // Ajout de l'import

export function createAddContactModal() {
  // Overlay modal
  const overlay = createElement("div", {
    class:
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",
    id: "contactModal",
  });

  // Modal content
  const modal = createElement("div", {
    class: "bg-white rounded-xl p-6 w-[400px]",
  });

  const title = createElement(
    "h3",
    {
      class: "text-xl font-bold mb-4 text-center text-gray-800",
    },
    "Ajouter un contact"
  );

  // Fonction pour afficher les messages d'erreur (réutilisée du login)
  const showError = (fieldId, message) => {
    const existingError = document.getElementById(`${fieldId}-error`);
    if (existingError) {
      existingError.textContent = message;
    } else {
      const errorElement = createElement(
        "p",
        {
          id: `${fieldId}-error`,
          class: "text-red-500 text-xs mt-1",
        },
        message
      );
      document.getElementById(fieldId).parentNode.appendChild(errorElement);
    }
  };

  // Fonction pour nettoyer les messages d'erreur
  const clearErrors = () => {
    document.querySelectorAll("[id$='-error']").forEach((el) => el.remove());
  };

  const form = createElement("form", {
    class: "space-y-4",
    onsubmit: async (e) => {
      e.preventDefault();
      clearErrors();

      const formData = {
        name: `${document.getElementById("contactFirstName").value} ${
          document.getElementById("contactLastName").value
        }`.trim(),
        phone: document.getElementById("contactPhone").value,
      };

      // Utiliser validateContact au lieu de validateForm
      const validation = await validateContact(formData);

      if (!validation.isValid) {
        validation.errors.forEach((error) => {
          if (error.includes("téléphone")) {
            showError("contactPhone", error);
          } else {
            showError("contactFirstName", error);
          }
        });
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: validation.contact.name, // Utiliser le nom potentiellement modifié
            phone: formData.phone,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
            status: "online",
            lastSeen: new Date().toISOString(),
          }),
        });

        if (response.ok) {
          overlay.remove();
          window.dispatchEvent(new CustomEvent("contactAdded"));
        }
      } catch (error) {
        showError("form", "Erreur de connexion au serveur");
      }
    },
  });

  // Champs du formulaire
  const fields = [
    {
      label: "Prénom",
      id: "contactFirstName",
      placeholder: "Entrez le prénom",
    },
    { label: "Nom", id: "contactLastName", placeholder: "Entrez le nom" },
    { label: "Numéro", id: "contactPhone", placeholder: "Entrez le numéro" },
  ];

  fields.forEach((field) => {
    const fieldContainer = createElement("div", {
      class: "space-y-1",
    });

    const label = createElement(
      "label",
      {
        class: "block text-sm font-medium text-[#95D2B3]",
      },
      field.label
    );

    const input = createElement("input", {
      type: field.id.includes("Phone") ? "tel" : "text",
      id: field.id,
      placeholder: field.placeholder,
      class:
        "w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 placeholder-gray-400 focus:outline-none focus:border-[#95D2B3]",
      oninput: () => {
        const errorEl = document.getElementById(`${field.id}-error`);
        if (errorEl) errorEl.remove();
      },
    });

    fieldContainer.appendChild(label);
    fieldContainer.appendChild(input);
    form.appendChild(fieldContainer);
  });

  const buttons = createElement("div", {
    class: "flex justify-end space-x-3 mt-6",
  });

  const cancelButton = createElement(
    "button",
    {
      type: "button",
      class:
        "px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl",
      onclick: () => overlay.remove(),
    },
    "Annuler"
  );

  const submitButton = createElement(
    "button",
    {
      type: "submit",
      class:
        "px-4 py-2 text-sm font-medium text-white bg-[#95D2B3] hover:bg-[#7BC0A1] rounded-xl",
    },
    "Ajouter"
  );

  buttons.appendChild(cancelButton);
  buttons.appendChild(submitButton);
  form.appendChild(buttons);

  modal.appendChild(title);
  modal.appendChild(form);
  overlay.appendChild(modal);

  return overlay;
}
