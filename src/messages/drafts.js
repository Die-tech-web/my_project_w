const DRAFTS_KEY = "whatsapp_drafts";

export const DraftsManager = {
  saveDraft(chatId, text) {
    const drafts = this.getAllDrafts();
    drafts[chatId] = {
      text,
      timestamp: Date.now(),
    };
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  },

  getDraft(chatId) {
    const drafts = this.getAllDrafts();
    return drafts[chatId];
  },

  getAllDrafts() {
    try {
      return JSON.parse(localStorage.getItem(DRAFTS_KEY) || "{}");
    } catch {
      return {};
    }
  },
};
