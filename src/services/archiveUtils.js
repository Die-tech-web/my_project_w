import axios from "axios";

const BASE_URL = "http://localhost:3000";

export const archiveItem = async (itemId, itemType) => {
  const newArchive = {
    id: Date.now().toString(),
    itemId,
    itemType,
    archivedAt: new Date().toISOString(),
  };

  await axios.post(`${BASE_URL}/archives`, newArchive);
  return newArchive;
};

export const getArchives = async () => {
  const response = await axios.get(`${BASE_URL}/archives`);
  return response.data;
};