"use strict";

import { initUser } from "./content-script-steam-user";
import { initFriendsManager } from "./content-script-steam-friends-manager";

function isPage(type) {
  const pages = {
    user: ".playerAvatarAutoSizeInner",
    friendsManager: ".friends_content"
  };

  return Boolean(document.querySelector(pages[type]));
}

async function init() {
  if (isPage("user")) {
    await initUser();
  } else if (isPage("friendsManager")) {
    initFriendsManager();
  }
}

init();