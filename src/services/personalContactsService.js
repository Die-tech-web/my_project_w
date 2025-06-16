import { API_ENDPOINTS } from "../config.js";

class PersonalContactsService {
  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem("whatsappUser"));
  }

  async addPersonalContact(contactData) {
    const response = await fetch(API_ENDPOINTS.USERS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: contactData.name,
        phone: contactData.phone,
        status: "online",
        lastSeen: new Date().toISOString(),
        initials: contactData.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase(),
      }),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'ajout du contact");
    }

    const newUser = await response.json();

    // Créer la relation de contact
    const contactResponse = await fetch(API_ENDPOINTS.CONTACTS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ownerId: contactData.ownerId,
        userId: newUser.id,
        createdAt: new Date().toISOString(),
      }),
    });

    if (!contactResponse.ok) {
      throw new Error("Erreur lors de la création de la relation de contact");
    }

    return newUser;
  }

  async getMyContacts() {
    try {
      if (!this.currentUser?.id) {
        return [];
      }

      // Récupérer d'abord les relations de contacts
      const contactsResponse = await fetch(
        `${API_ENDPOINTS.CONTACTS}?ownerId=${this.currentUser.id}`
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

      return contacts.filter((contact) => contact !== null);
    } catch (error) {
      console.error("Erreur lors de la récupération des contacts:", error);
      return [];
    }
  }

  async deleteContact(relationId) {
    try {
      const response = await fetch(`${API_ENDPOINTS.CONTACTS}/${relationId}`, {
        method: "DELETE",
      });
      return response.ok;
    } catch (error) {
      console.error("Erreur lors de la suppression du contact:", error);
      return false;
    }
  }
}

export const personalContactsService = new PersonalContactsService();
