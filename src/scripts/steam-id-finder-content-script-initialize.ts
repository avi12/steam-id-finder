"use strict";

import { insertIdsToBody } from "./steam-id-finder-content-script-user";
import { insertIdControlsToBody } from "./steam-id-finder-content-script-friends-manager";
import { RegexPages, RegexPageTypes } from "../types/steam-page.model";
import { copy } from "../shared-scripts/utils";

function isPage(regex: RegexPages): boolean {
  return Boolean(location.pathname.match(regex));
}

function registerContextMenuCopyHandler() {
  chrome.storage.onChanged.addListener(async ({ copyText }) => {
    if (copyText) {
      await copy(copyText.newValue);
    }
  });
}

async function init(): Promise<void> {
  registerContextMenuCopyHandler();

  if (isPage(RegexPageTypes.user)) {
    await insertIdsToBody();
    return;
  }

  if (isPage(RegexPageTypes.friendsManager)) {
    await insertIdControlsToBody();
  }
}

init();
