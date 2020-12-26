"use strict";

import { copy, getTextForUsers, getUserId } from "./utilities";

export function initFriendsManager() {
  const elPage = document.querySelector(".friends_content");
  const elContainerActionButtons = () =>
    document.querySelector(".manage_action").parentElement;

  appendCopyButtonsToContainer(elContainerActionButtons());
  const observerContent = new MutationObserver(mutations => {
    const isPageFriendsManager =
      mutations[0].target.firstElementChild.id === "friends_list";
    if (!isPageFriendsManager) {
      return;
    }
    appendCopyButtonsToContainer(elContainerActionButtons());
  });
  observerContent.observe(elPage, {
    attributes: true,
    attributeFilter: ["class"]
  });
}

/**
 * @param {HTMLElement} elContainer
 */
function appendCopyButtonsToContainer(elContainer) {
  const elFragment = document.createDocumentFragment();
  elFragment.append(
    createCopyButton("Copy ID", "id"),
    createCopyButton("Copy 32-bit ID", "id-32-bit"),
    createCopyButton("Copy 64-bit ID", "id-64-bit")
  );

  const { nextElementSibling: elAfterActionButtons } = getLastElement(
    ".manage_action"
  );
  elContainer.insertBefore(elFragment, elAfterActionButtons);
}

/**
 * @param {string} label
 * @param {string} id
 * @returns {HTMLSpanElement}
 */
function createCopyButton(label, id) {
  const elButton = document.createElement("span");
  elButton.classList.add(
    // Steam's own classes for styling the button
    "manage_action",
    "btnv6_lightblue_blue",
    "btn_medium",
    // My own class to interact with it via JS and style via CSS
    "steam-button-copy-ids"
  );
  elButton.innerHTML = `<span>${label}</span>`;
  elButton.dataset.copyId = id;
  elButton.addEventListener("click", prepareToCopyId);
  return elButton;
}

/**
 * @param {string} selector
 * @returns {HTMLElement} The last element of the given selector.
 */
function getLastElement(selector) {
  const elActionButtons = document.querySelectorAll(selector);
  return elActionButtons[elActionButtons.length - 1];
}

function printError() {
  const elScript = document.createElement("script");
  const showAlert = () => {
    ExecFriendAction("", "friends/all");
  };
  elScript.textContent = `(${showAlert})()`;
  document.head.append(elScript);
}

/**
 * A click listener for when clicking one of the Copy buttons.
 * @param {HTMLSpanElement} elButton
 */
async function prepareToCopyId({ target: elButton }) {
  const elUsersSelected = Array.from(
    document.querySelectorAll(".select_friend_checkbox:checked")
  );
  const isUsersChecked = elUsersSelected.length > 0;

  if (!isUsersChecked) {
    printError();
    return;
  }

  // Convert the users' IDs to the ID that is corresponding the clicked-button
  const usersData = await getSelectedUsersData(elUsersSelected);

  // Generate strings for each user. Add flags if the user wants them for the clicked ID
  const text = await getTextForUsers({
    usersData,
    idType: elButton.dataset.copyId
  });

  // Copy the generated text
  copy(text);

  applyInputTransition(elButton, "success");
}

/**
 * Returns the data of the selected users.
 * @param {HTMLElement[]} elUsersSelected
 * @returns {Promise<object[]>}
 */
async function getSelectedUsersData(elUsersSelected) {
  function elementToUserId(element) {
    element = element.closest(".selectable");
    const elA = element.querySelector(".selectable_overlay");
    return getUserId(elA.href);
  }

  const ids = elUsersSelected.map(elementToUserId);

  const port = chrome.runtime.connect({ name: "request-data" });
  port.postMessage({ ids });
  return new Promise(resolve => {
    port.onMessage.addListener(resolve);
  });
}

/**
 * @param {HTMLElement} element
 * @param {"error"|"success"} status
 */
function applyInputTransition(element, status) {
  const baseClass = "steam-button-copy-ids";
  if (!element.classList.contains(baseClass)) {
    element = element.parentElement;
  }

  // Making a gradient transition using ::before - look in main.css
  element.classList.add(`${baseClass}--active`);
  element.classList.add(`${baseClass}--${status}`);

  setTimeout(() => {
    element.classList.remove(`${baseClass}--active`);

    setTimeout(() => {
      element.classList.remove(`${baseClass}--${status}`);
    }, 300);
  }, 600);
}
