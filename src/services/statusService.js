import { API_ENDPOINTS } from "../config.js";

export async function createStatus(statusData) {
  try {
    const currentUser = JSON.parse(localStorage.getItem("whatsappUser"));
    if (!currentUser) {
      throw new Error("Utilisateur non connecté");
    }

    const statusToCreate = {
      ...statusData,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), 
      views: [],
      isActive: true
    };

    const response = await fetch(API_ENDPOINTS.STATUS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(statusToCreate),
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur création statut:", error);
    return null;
  }
}

export async function getAllStatus() {
  try {
    const currentUser = JSON.parse(localStorage.getItem("whatsappUser"));
    if (!currentUser) return [];

    const response = await fetch(`${API_ENDPOINTS.STATUS}?_sort=timestamp&_order=desc`);
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}`);
    }

    const allStatus = await response.json();
    
    // Filtrer les statuts actifs et non expirés
    const activeStatus = allStatus.filter(status => {
      const expiresAt = new Date(status.expiresAt);
      const now = new Date();
      return expiresAt > now && status.isActive;
    });

    // Séparer les statuts de l'utilisateur connecté et des autres
    const myStatus = activeStatus.filter(status => status.userId === currentUser.id);
    const othersStatus = activeStatus.filter(status => status.userId !== currentUser.id);

    return { myStatus, othersStatus, all: activeStatus };
  } catch (error) {
    console.error("Erreur récupération statuts:", error);
    return { myStatus: [], othersStatus: [], all: [] };
  }
}

export async function getUserStatus(userId) {
  try {
    const response = await fetch(`${API_ENDPOINTS.STATUS}?userId=${userId}&_sort=timestamp&_order=desc`);
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}`);
    }

    const userStatus = await response.json();
    
    // Filtrer les statuts actifs et non expirés
    return userStatus.filter(status => {
      const expiresAt = new Date(status.expiresAt);
      const now = new Date();
      return expiresAt > now && status.isActive;
    });
  } catch (error) {
    console.error("Erreur récupération statuts utilisateur:", error);
    return [];
  }
}

export async function deleteStatus(statusId) {
  try {
    const currentUser = JSON.parse(localStorage.getItem("whatsappUser"));
    if (!currentUser) return false;

    // Vérifier que le statut appartient à l'utilisateur connecté
    const statusResponse = await fetch(`${API_ENDPOINTS.STATUS}/${statusId}`);
    const status = await statusResponse.json();
    
    if (status.userId !== currentUser.id) {
      throw new Error("Vous ne pouvez supprimer que vos propres statuts");
    }

    const response = await fetch(`${API_ENDPOINTS.STATUS}/${statusId}`, {
      method: "DELETE",
    });

    return response.ok;
  } catch (error) {
    console.error("Erreur suppression statut:", error);
    return false;
  }
}

export async function addStatusView(statusId, viewerId) {
  try {
    const statusResponse = await fetch(`${API_ENDPOINTS.STATUS}/${statusId}`);
    const status = await statusResponse.json();
    
    if (!status.views) status.views = [];
    
    // Ne pas ajouter de vue si c'est le propriétaire du statut
    if (status.userId === viewerId) {
      return true;
    }
    
    if (!status.views.includes(viewerId)) {
      status.views.push(viewerId);
      
      const response = await fetch(`${API_ENDPOINTS.STATUS}/${statusId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ views: status.views }),
      });

      return response.ok;
    }
    
    return true;
  } catch (error) {
    console.error("Erreur ajout vue statut:", error);
    return false;
  }
}

export function canCreateStatus() {
  const currentUser = JSON.parse(localStorage.getItem("whatsappUser"));
  return currentUser !== null;
}

export function canViewStatus() {
  const currentUser = JSON.parse(localStorage.getItem("whatsappUser"));
  return currentUser !== null;
}