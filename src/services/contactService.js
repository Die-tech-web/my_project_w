import { API_ENDPOINTS } from "../config.js";

export async function getContacts(forceRefresh = false) {
  const cacheKey = "contactsList";
  const currentUser = JSON.parse(localStorage.getItem("whatsappUser"));

  if (!currentUser?.id) return [];

  if (!forceRefresh) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (error) {
        console.error("Erreur parsing cache contacts:", error);
      }
    }
  }

  try {
    // Récupérer les relations de contacts de l'utilisateur
    const contactsResponse = await fetch(
      `${API_ENDPOINTS.CONTACTS}?ownerId=${currentUser.id}`
    );
    const contactRelations = await contactsResponse.json();

    // Récupérer les détails des utilisateurs pour chaque contact
    const contacts = await Promise.all(
      contactRelations.map(async (relation) => {
        const userResponse = await fetch(
          `${API_ENDPOINTS.USERS}/${relation.userId}`
        );
        const userData = await userResponse.json();
        return {
          ...userData,
          relationId: relation.id,
          createdAt: relation.createdAt,
        };
      })
    );

    const validContacts = contacts.filter((contact) => contact !== null);
    localStorage.setItem(cacheKey, JSON.stringify(validContacts));
    return validContacts;
  } catch (error) {
    console.error("Erreur récupération contacts:", error);
    return [];
  }
}

export function clearContactsCache() {
  localStorage.removeItem("contactsList");
}
