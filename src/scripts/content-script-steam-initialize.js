function isPage(type) {
  const pages = {
    user: ".playerAvatarAutoSizeInner",
    friendsManager: ".friends_content"
  };

  return Boolean(document.querySelector(pages[type]));
}

async function init() {
  if (isPage("user")) {
    const { initUser } = await import("./content-script-steam-user");
    initUser();
    return;
  }

  if (isPage("friendsManager")) {
    const { initFriendsManager } = await import(
      "./content-script-steam-friends-manager"
    );
    initFriendsManager();
  }
}

init();