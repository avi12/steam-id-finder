"use strict";

(async () => {
  if (isPage("user")) {
    const data = await getCurrentUserData();

    const userDataToPrint = [
      {
        idName: "ID 2",
        idType: "id-2",
        data
      },
      {
        idName: "32-bit ID",
        idType: "id-32-bit",
        data
      },
      {
        idName: "64-bit ID",
        idType: "id-64-bit",
        data
      }
    ];

    appendUserDataToUI(userDataToPrint);
    initializeSingleUserClickEvents();
  }

  /**
   * @returns {Promise<object>} The data of the current user.
   */
  async function getCurrentUserData() {
    const id = getUserId(location.href);
    const port = chrome.runtime.connect({ name: "request-data" });
    port.postMessage({ ids: [id] });
    const users = await new Promise((resolve) => {
      port.onMessage.addListener(resolve);
    });
    return users[0];
  }

  /**
   * @param {object[]} ids
   */
  function appendUserDataToUI(ids) {
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

  function initializeSingleUserClickEvents() {
    const elContainerIds = document.querySelector(".steam-ids");
    elContainerIds.addEventListener("click", ({ target: elId }) => {
      if (elId.classList.contains("steam-ids__id-copy")) {
        copy(elId.getAttribute(`data-${elId.dataset.idType}`));
      }
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
        .map((user) => {
          const convertedId = convertId({
            data: user.data,
            idDest: user.idType
          });
          return `
        <tr>
            <td class="steam-ids__id-name">${user.idName}</td>
            <td>
              <!-- prettier-ignore -->
              <a class="whiteLink steam-ids__id-copy" data-${user.idType}="${convertedId}" data-id-type="${user.idType}">${convertedId}</a>
              <!-- .whiteLink is provided by Steam-->
            </td>
        </tr>
    `;
        })
        .join("")}
</table>
    `;
  }
})();
