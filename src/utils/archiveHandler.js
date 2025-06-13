import { archiveItem } from "../services/archiveUtils";
import { toast } from "react-toastify";

export const handleItemClick = async (event, id, type) => {
  if (event.ctrlKey) {
    try {
      await archiveItem(id, type);
      toast.success(
        `${type === "contact" ? "Contact" : "Groupe"} archivé avec succès`
      );
    } catch (error) {
      toast.error("Erreur lors de l'archivage");
    }
  }
};
