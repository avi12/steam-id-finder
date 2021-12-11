"use strict";

import { convertId, getTextForSingleUser, getUser } from "./shared-scripts/utils";
import { IDExamples, IDs, IDsToLabels, IDTypes } from "./types/steam-user-ids.model";
import type { Player } from "./types/steam-user.model";

const idsContextMenus = [
  {
    idType: IDs.id,
    spaces: 12
  },
  {
    idType: IDs.id32bit,
    spaces: 1
  },
  {
    idType: IDs.id64bit,
    spaces: 1
  }
];

for (const { idType, spaces } of idsContextMenus) {
  chrome.contextMenus.create({
    title: `Copy ${IDsToLabels[idType]}${" ".repeat(spaces)}- ${IDExamples[idType]}`,
    id: idType,
    contexts: ["link"],
    targetUrlPatterns: ["https://steamcommunity.com/id/*", "https://steamcommunity.com/profiles/*"]
  });
}

chrome.contextMenus.onClicked.addListener(async ({ menuItemId, linkUrl }) => {
  const user: Player = await getUser(linkUrl);
  const idType = menuItemId as IDTypes;
  chrome.storage.local.set({
    copyText: await getTextForSingleUser(user, idType, convertId(user.steamid, idType))
  });
});
