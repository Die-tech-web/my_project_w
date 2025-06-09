import { createElement } from "./utils.js";
import { validateForm } from "./utils/validation.js";

export function createLoginForm() {
  const container = createElement("div", {
    class: "fixed inset-0 flex items-center justify-center bg-[#95D2B3]",
  });

  const formCard = createElement("div", {
    class: "bg-white p-8 rounded-3xl shadow-2xl w-[400px]",
  });

  // Logo WhatsApp
  const logoContainer = createElement("div", {
    class:
      "w-16 h-16 bg-[#95D2B3] rounded-full mx-auto mb-4 flex items-center justify-center",
  });

  const logo = createElement("i", {
    class: "fab fa-whatsapp text-white text-3xl",
  });
  logoContainer.appendChild(logo);

  const title = createElement(
    "h2",
    {
      class: "text-2xl font-bold text-center mb-2 text-gray-800",
    },
    "WhatsApp"
  );

  const subtitle = createElement(
    "p",
    {
      class: "text-center text-gray-500 mb-6",
    },
    "Connectez-vous à votre compte"
  );

  // Fonction pour afficher les messages d'erreur
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
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        phone: document.getElementById("phone").value,
      };

      const errors = validateForm(formData);

      if (Object.keys(errors).length > 0) {
        // Afficher les erreurs sous chaque champ
        Object.entries(errors).forEach(([field, message]) => {
          showError(field, message);
        });
        return;
      }

      try {
        // Vérifier si l'utilisateur existe
        const response = await fetch(
          `http://localhost:3000/users?phone=${formData.phone}`
        );
        const users = await response.json();

        let userId;
        if (users.length === 0) {
          // Créer un nouvel utilisateur
          const newUser = {
            name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.firstName}`,
            status: "online",
            lastSeen: new Date().toISOString(),
          };

          const createResponse = await fetch("http://localhost:3000/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser),
          });
          const createdUser = await createResponse.json();
          userId = createdUser.id;
        } else {
          userId = users[0].id;
        }

        // Sauvegarder les infos dans localStorage
        localStorage.setItem(
          "whatsappUser",
          JSON.stringify({
            id: userId,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
          })
        );

        // Rediriger vers l'interface principale
        window.location.reload();
      } catch (error) {
        showError("form", "Erreur de connexion au serveur");
      }
    },
  });

  // Créer les champs avec le nouveau style
  const fields = [
    {
      label: "Prénom",
      id: "firstName",
      placeholder: "Entrez votre prénom",
    },
    {
      label: "Nom",
      id: "lastName",
      placeholder: "Entrez votre nom",
    },
    {
      label: "Numéro de téléphone",
      id: "phone",
      placeholder: "Entrez  votre numero",
    },
  ];

  // Modifier la création des champs pour inclure la gestion des erreurs
  fields.forEach((field) => {
    const fieldContainer = createElement("div", {
      class: "space-y-1",
    });

    const label = createElement(
      "label",
      {
        class: "block text-[#95D2B3] text-sm",
      },
      field.label
    );

    const input = createElement("input", {
      type: field.id === "phone" ? "tel" : "text",
      id: field.id,
      placeholder: field.placeholder,
      class:
        "w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 placeholder-gray-400 focus:outline-none focus:border-[#95D2B3]",
      // Ajout d'un gestionnaire d'événements pour effacer l'erreur lors de la saisie
      oninput: () => {
        const errorEl = document.getElementById(`${field.id}-error`);
        if (errorEl) errorEl.remove();
      },
    });

    fieldContainer.appendChild(label);
    fieldContainer.appendChild(input);
    form.appendChild(fieldContainer);
  });

  const submitButton = createElement(
    "button",
    {
      type: "submit",
      class:
        "w-full py-3 bg-[#95D2B3] text-white rounded-xl mt-6 hover:bg-[#7BC0A1] transition-colors duration-200",
    },
    "Se connecter"
  );

  const forgotPassword = createElement(
    "p",
    {
      class:
        "text-center text-[#95D2B3] text-sm mt-4 cursor-pointer hover:underline",
    },
    "Mot de passe oublié ?"
  );

  const terms = createElement(
    "p",
    {
      class: "text-center text-gray-400 text-xs mt-6",
    },
    "En vous connectant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité."
  );

  form.appendChild(submitButton);
  formCard.appendChild(logoContainer);
  formCard.appendChild(title);
  formCard.appendChild(subtitle);
  formCard.appendChild(form);
  formCard.appendChild(forgotPassword);
  formCard.appendChild(terms);
  container.appendChild(formCard);

  return container;
}
