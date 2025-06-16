import { createElement } from "./utils.js";
import { showNotification } from "./components/notifications.js";
import { API_URL, API_ENDPOINTS } from "./config.js";

// Fonction pour valider si un numéro existe déjà
async function isPhoneNumberUnique(phone) {
  try {
    const response = await fetch(`${API_URL}/users`);
    const users = await response.json();
    return !users.some((user) => user.phone === phone);
  } catch (error) {
    console.error("Erreur lors de la vérification du numéro:", error);
    return false;
  }
}

async function getNextNameNumber(name) {
  try {
    const response = await fetch("http://localhost:3000/users");
    const users = await response.json();

    const baseName = name.replace(/\s+\d+$/, "").toLowerCase();

    const similarNames = users.filter((user) => {
      const userBaseName = user.name.replace(/\s+\d+$/, "").toLowerCase();
      return userBaseName === baseName;
    });

    if (similarNames.length === 0) {
      return 0; // Premier contact avec ce nom
    }

    const numbers = similarNames.map((user) => {
      const match = user.name.match(/\s+(\d+)$/);
      return match ? parseInt(match[1]) : 1;
    });

    return Math.max(...numbers) + 1;
  } catch (error) {
    console.error("Erreur lors du comptage des noms:", error);
    return 0;
  }
}

export async function validateContact(contact) {
  const errors = [];

  if (!contact.name || contact.name.trim().length === 0) {
    errors.push("Le nom est requis");
  }

  if (!contact.phone) {
    errors.push("Le numéro de téléphone est requis");
  } else if (!/^\d{10}$/.test(contact.phone)) {
    errors.push("Le numéro doit contenir 10 chiffres");
  } else {
    const isUnique = await isPhoneNumberUnique(contact.phone);
    if (!isUnique) {
      errors.push("Ce numéro de téléphone existe déjà");
    }
  }

  if (errors.length === 0) {
    const savedContact = await saveContact({
      ...contact,
      status: "online",
      lastSeen: new Date().toISOString(),
    });

    showNotification(`Bienvenue ${contact.name} ! 👋`, {
      type: "success",
      duration: 3000,
    });

    window.dispatchEvent(
      new CustomEvent("userConnected", {
        detail: savedContact,
      })
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    contact,
  };
}

async function saveContact(contact) {
  try {
    const response = await fetch("http://localhost:3000/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contact),
    });
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du contact:", error);
    throw error;
  }
}

async function updateContactOrder(newContact) {
  try {
    const updatedContact = {
      ...newContact,
      lastSeen: new Date().toISOString(),
      status: "online",
      initials: newContact.initials || newContact.name.charAt(0).toUpperCase(),
    };

    await fetch(`http://localhost:3000/users/${newContact.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedContact),
    });

    window.dispatchEvent(
      new CustomEvent("contactOrderUpdated", {
        detail: updatedContact,
      })
    );
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de l'ordre des contacts:",
      error
    );
  }
}

// Dans le fichier qui crée l'avatar (probablement chatView.js ou un composant similaire)
function createAvatar(contact) {
  return createElement(
    "div",
    {
      class:
        "w-10 h-10 rounded-full bg-[#0A6847] flex items-center justify-center text-white font-medium mr-3",
    },
    contact.initials || contact.name.charAt(0).toUpperCase()
  );
}
