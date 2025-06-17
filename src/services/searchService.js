import { API_ENDPOINTS } from "../config.js";

export async function searchItems(query) {
  try {
    const [contactsResponse, groupsResponse] = await Promise.all([
      fetch(API_ENDPOINTS.CONTACTS),
      fetch(API_ENDPOINTS.GROUPS),
    ]);

    if (!contactsResponse.ok || !groupsResponse.ok) {
      throw new Error("Erreur lors de la récupération des données");
    }

    let contacts = await contactsResponse.json();
    let groups = await groupsResponse.json();

    // Filtrer si une recherche est effectuée
    if (query) {
      query = query.toLowerCase();

      contacts = contacts.filter((contact) =>
        contact?.name?.toLowerCase().includes(query)
      );

      groups = groups.filter((group) =>
        group?.name?.toLowerCase().includes(query)
      );
    }

    return { contacts, groups };
  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
    return { contacts: [], groups: [] };
  }
}
