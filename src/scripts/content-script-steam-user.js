"use strict";

import { convertId, copy, getUserId, mapIdTypesToNames } from "./utilities";

export async function initUser() {
  const data = await getCurrentUserData();
  const userDataToPrint = convertUserIdsWithSourceMod(data);
  appendUserDataToUI(userDataToPrint);
  initializeSingleUserEvents();
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

/**
 * @param {object[]} ids
 */
async function appendUserDataToUI(ids) {
  const elParent = document.querySelector(".profile_item_links");

  const elContainerIds = document.createElement("div");
  elParent.insertBefore(elContainerIds, elParent.firstElementChild);

  elContainerIds.classList.add("steam-ids");
  elContainerIds.innerHTML = getIdsMarkup(ids);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      elContainerIds.classList.add("steam-ids--visible");
    });
  });
}

function initializeSingleUserEvents() {
  const elContainerIds = document.querySelector(".steam-ids");
  elContainerIds.addEventListener("click", ({ target: elId }) => {
    if (!elId.classList.contains("steam-ids__id-copy")) {
      return;
    }
    copy(elId.getAttribute(`data-${elId.dataset.idType}`));
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
        .map(user => {
          return `
        <tr>
            <td class="steam-ids__id-name">${
              mapIdTypesToNames[user.idType]
            }</td>
            <td>
              <a class="steam-ids__id-copy whiteLink" data-${user.idType}="${
            user.id
          }" data-id-type="${user.idType}">
                ${user.id}
              </a>
              <!-- .whiteLink is provided by Steam-->
            </td>
        </tr>
    `;
        })
        .join("")}
</table>
    `;
}
