"use strict";

import {
  convertId,
  copy,
  getTextForSingleUser,
  getUserId,
  mapIdTypesToNames
} from "./utilities";

export async function initUser() {
  const data = await getCurrentUserData();
  const userDataToPrint = convertUserIdsWithSourceMod(data);
  appendUserDataToUI({
    ids: userDataToPrint,
    isPrivate: data.personastate === 0
  });
  initializeSingleUserEvents(data);
}

/**
 * @returns {Promise<object>} The data of the current user.
 */
async function getCurrentUserData() {
  const id = getUserId(location.href);
  const port = chrome.runtime.connect({ name: "request-data" });
  port.postMessage({ ids: [id] });
  const users = await new Promise(resolve => {
    port.onMessage.addListener(resolve);
  });
  return users[0];
}

/**
 * @param {object} data
 * @returns {{idType: string, id: string}[]}
 */
function convertUserIdsWithSourceMod(data) {
  const idsToConvertTo = ["id", "id-32-bit", "id-64-bit"];
  return idsToConvertTo.map(idType => ({
    idType,
    id: convertId({ data, idDest: idType })
  }));
}

function createMarkup() {
  const elParent = document.querySelector(".profile_content");
  elParent.innerHTML += `
<div class="profile_content_inner">
  <div class="profile_leftcol">&nbsp;</div>
  <div class="profile_rightcol"></div>
</div>
  `;
}

/**
 * @param {object[]} ids
 * @param {boolean} isPrivate
 */
function appendUserDataToUI({ ids, isPrivate }) {
  let elParent = document.querySelector(
    ".profile_item_links, .profile_content_rightcol"
  );

  if (isPrivate) {
    createMarkup();
    elParent = document.querySelector(".profile_rightcol");
  }

  const elContainerIds = document.createElement("div");
  const isUserVacBanned = document.querySelector(".profile_ban_status");
  if (!isPrivate && !isUserVacBanned) {
    elParent.insertBefore(elContainerIds, elParent.firstElementChild);
  } else {
    elParent.append(elContainerIds);
  }

  elContainerIds.classList.add("steam-ids");
  elContainerIds.innerHTML = getIdsMarkup(ids);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      elContainerIds.classList.add("steam-ids--visible");
    });
  });
}

function initializeSingleUserEvents(userData) {
  const elContainerIds = document.querySelector(".steam-ids");
  elContainerIds.addEventListener("click", async ({ target: elId }) => {
    if (!elId.classList.contains("steam-ids__id-copy")) {
      return;
    }
    const text = await getTextForSingleUser(userData, elId.dataset.idType);
    copy(text);

    elId.style.transition = "0.25s color";
    elId.style.color = "lime";
    setTimeout(() => {
      elId.style.color = "";
    }, 700);
  });
}

/**
 * @param {object[]} userDataDetails
 * @returns {string} The IDs table that's displayed in the user profile.
 */
function getIdsMarkup(userDataDetails) {
  return `
    <table>
      ${userDataDetails
        .map(
          // prettier-ignore
          user => `
        <tr>
            <td class="steam-ids__id-name">${mapIdTypesToNames[user.idType]}</td>
            <td>
              <a class="steam-ids__id-copy whiteLink" data-id-type="${user.idType}">
                ${user.id}
              </a>
              <!-- .whiteLink is provided by Steam -->
            </td>
        </tr>
    `
        )
        .join("")}
</table>
    `;
}
