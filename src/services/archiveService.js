import { API_ENDPOINTS } from "../config.js";
import { showNotification } from "../components/notifications.js";

class ArchiveService {
  constructor() {
    this.observers = new Set();
  }

  subscribe(callback) {
    this.observers.add(callback);
  }

  notifyObservers() {
    this.observers.forEach((callback) => callback());
  }

  async archiveContact(contactId) {
    try {
      const archive = {
        itemId: contactId,
        itemType: "contact",
        archivedAt: new Date().toISOString(),
      };

      const response = await fetch(API_ENDPOINTS.ARCHIVES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(archive),
      });

      if (!response.ok) throw new Error("Erreur lors de l'archivage");

      showNotification("Contact archivé avec succès", "success");
      document.dispatchEvent(new CustomEvent("contactArchived"));
      return true;
    } catch (error) {
      console.error("Erreur archivage:", error);
      showNotification("Erreur lors de l'archivage", "error");
      return false;
    }
  }

  async unarchiveContact(archiveId) {
    try {
      const response = await fetch(`${API_ENDPOINTS.ARCHIVES}/${archiveId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erreur lors du désarchivage");

      showNotification("Contact désarchivé avec succès", "success");
      document.dispatchEvent(new CustomEvent("contactUnarchived"));
      return true;
    } catch (error) {
      console.error("Erreur désarchivage:", error);
      showNotification("Erreur lors du désarchivage", "error");
      return false;
    }
  }

  async getArchivedContacts() {
    try {
      const [archivesResponse, contactsResponse] = await Promise.all([
        fetch(API_ENDPOINTS.ARCHIVES),
        fetch(API_ENDPOINTS.USERS),
      ]);

      const archives = await archivesResponse.json();
      const contacts = await contactsResponse.json();

      const archivedContacts = archives
        .filter((archive) => archive.itemType === "contact")
        .map((archive) => {
          const contact = contacts.find((c) => c.id === archive.itemId);
          return {
            ...archive,
            contactInfo: contact,
          };
        })
        .filter((archive) => archive.contactInfo); // Filter out archived contacts that no longer exist

      return archivedContacts;
    } catch (error) {
      console.error("Erreur lecture archives:", error);
      return [];
    }
  }
}

export const archiveService = new ArchiveService();
