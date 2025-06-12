export function clearUserCache() {
  // Supprimer tous les caches utilisateurs possibles
  const keysToRemove = [
    'cachedUsers',
    'usersList',
    'contacts',
    'whatsappContacts',
    'allUsers'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log("Cache utilisateurs nettoyé");
}

export function forceRefreshData() {
  clearUserCache();
  
  // Recharger la page pour forcer la récupération des nouvelles données
  window.location.reload();
}