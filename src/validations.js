import { createElement } from "./utils.js";
import { showNotification } from "./components/notifications.js";

// Fonction pour valider si un numéro existe déjà
async function isPhoneNumberUnique(phone) {
  try {
    const response = await fetch("http://localhost:3000/users");
    const users = await response.json();
    return !users.some((user) => user.phone === phone);
  } catch (error) {
    console.error("Erreur lors de la vérification du numéro:", error);
    return false;
  }
}

// Fonction pour compter les occurrences d'un nom et retourner le prochain numéro
async function getNextNameNumber(name) {
  try {
    const response = await fetch("http://localhost:3000/users");
    const users = await response.json();

    // Normaliser le nom de base (enlever les numéros existants)
    const baseName = name.replace(/\s+\d+$/, "").toLowerCase();

    // Récupérer tous les contacts avec le même nom de base
    const similarNames = users.filter((user) => {
      const userBaseName = user.name.replace(/\s+\d+$/, "").toLowerCase();
      return userBaseName === baseName;
    });

    if (similarNames.length === 0) {
      return 0; // Premier contact avec ce nom
    }

    // Trouver le plus grand numéro utilisé
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

// Fonction principale de validation modifiée
export async function validateContact(contact) {
  const errors = [];

  // Validation du nom
  if (!contact.name) {
    errors.push("Le nom est obligatoire");
  } else {
    // Générer les initiales
    contact.initials = contact.name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .join("");

    const nextNumber = await getNextNameNumber(contact.name);
    if (nextNumber > 0) {
      const baseName = contact.name.replace(/\s+\d+$/, "");
      contact.name = `${baseName} ${nextNumber}`;
    }
  }

  // Validation du numéro de téléphone
  if (!contact.phone) {
    errors.push("Le numéro de téléphone est obligatoire");
  } else if (!/^\d{10}$/.test(contact.phone)) {
    errors.push("Le numéro de téléphone doit contenir 10 chiffres");
  } else {
    const isUnique = await isPhoneNumberUnique(contact.phone);
    if (!isUnique) {
      errors.push("Ce numéro de téléphone existe déjà");
    }
  }

  // Si la validation réussit
  if (errors.length === 0) {
    // Sauvegarder le contact avec ses initiales
    const savedContact = await saveContact({
      ...contact,
      status: "online",
      lastSeen: new Date().toISOString(),
    });

    // Afficher le message de bienvenue
    showNotification(`Bienvenue ${contact.name} ! 👋`, {
      type: "success",
      duration: 3000,
    });

    // Mettre à jour l'interface
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

// Fonction pour mettre à jour l'ordre des contacts
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

    // Déclencher un événement pour mettre à jour l'interface
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
