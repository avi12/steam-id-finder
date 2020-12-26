import { initUser } from "./content-script-steam-user";
import { initFriendsManager } from "./content-script-steam-friends-manager";

function isPage(type) {
  const pages = {
    user: ".playerAvatarAutoSizeInner",
    friendsManager: ".friends_content"
  };

  return Boolean(document.querySelector(pages[type]));
}

if (isPage("user")) {
  initUser();
} else if (isPage("friendsManager")) {
  initFriendsManager();
}