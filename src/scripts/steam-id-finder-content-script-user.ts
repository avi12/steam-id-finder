"use strict";

import { convertId, copy, getTextForSingleUser, getUser } from "../shared-scripts/utils";
import type { Player } from "../types/steam-user.model";
import type { IDToValue, IDTypes } from "../types/steam-user-ids.model";
import { IDs, IDsToLabels } from "../types/steam-user-ids.model";

let gIds: IDToValue;

function getIdsMarkup(): string {
  return (
    "<table>" +
    Object.entries(gIds).reduce((html, [idType, idValue]) => {
      return (
        html +
        `
<tr>
  <td class="steam-ids__id-name">${IDsToLabels[idType]}</td
  ><td><a class="steam-ids__id-copy whiteLink" data-id-type="${idType}">${idValue}</a></td>
</tr>`
      );
    }, "") +
    "</table>"
  );
}

function createMarkup(): void {
  const elParent = document.querySelector(".profile_content");
  elParent.innerHTML += `
<div class="profile_content_inner">
  <div class="profile_leftcol">&nbsp;</div>
  <div class="profile_rightcol"></div>
</div>
  `;
}

function appendUserDataToUI(user: Player) {
  let elParent = document.querySelector(".profile_item_links");

  const isPrivate = user.communityvisibilitystate !== 3;
  if (isPrivate) {
    createMarkup();
    elParent = document.querySelector(".profile_rightcol");
  }

  const elContainerIds = document.createElement("div");
  const isUserVacBanned = Boolean(document.querySelector(".profile_ban_status"));
  if (isPrivate || isUserVacBanned) {
    elParent.append(elContainerIds);
  } else {
    elParent.insertBefore(elContainerIds, elParent.firstElementChild);
  }

  // Blending the IDs container into the DOM
  elContainerIds.classList.add("steam-ids");
  elContainerIds.innerHTML = getIdsMarkup();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      elContainerIds.classList.add("steam-ids--visible");
    });
  });

  elContainerIds.addEventListener("click", async ({ target }: Event) => {
    const elId = target as HTMLDivElement;
    if (!elId.classList.contains("steam-ids__id-copy")) {
      return;
    }

    const idType = elId.dataset.idType as IDTypes;
    const text = await getTextForSingleUser(user, idType, gIds[idType]);
    await copy(text);

    elId.style.transition = "0.25s color";
    elId.style.color = "lime";
    setTimeout(() => {
      elId.style.color = "";
    }, 700);
  });
}

export async function insertIdsToBody(): Promise<void> {
  const user: Player = await getUser(location.href);
  gIds = {
    [IDs.id]: convertId(user.steamid, IDs.id),
    [IDs.id32bit]: convertId(user.steamid, IDs.id32bit),
    [IDs.id64bit]: convertId(user.steamid, IDs.id64bit)
  };

  appendUserDataToUI(user);
}
