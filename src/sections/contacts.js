function handleContactClick(contact) {
  const mainContent = document.querySelector("#main-content");
  mainContent.innerHTML = "";
  const chatView = createChatView(contact);
  mainContent.appendChild(chatView);
}