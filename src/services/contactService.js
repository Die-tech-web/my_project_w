import { API_ENDPOINTS } from "../config.js";

export async function getContacts(forceRefresh = false) {
  const cacheKey = 'contactsList';
  
  // Si on force le refresh, on ignore le cache
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
    const response = await fetch(API_ENDPOINTS.USERS);
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}`);
    }
    
    const users = await response.json();
    console.log("Contacts récupérés depuis l'API:", users);
    
    // Mettre à jour le cache
    localStorage.setItem(cacheKey, JSON.stringify(users));
    
    return users;
  } catch (error) {
    console.error("Erreur récupération contacts:", error);
    return [];
  }
}

export function clearContactsCache() {
  localStorage.removeItem('contactsList');
}