"use strict";

import { IDs, IDsToLabels, IDTypes } from "../types/steam-user-ids.model";
import { copy, getLastElement, idsToMultiUserData } from "../shared-scripts/utils";
const gSelManageAction = "manage_action";


function printError() {
  const elUsersNotSelectedError = document.querySelector("#selected_msg_err");
  const elUsersSelected = document.querySelector("#selected_msg");

  elUsersSelected.classList.add("hidden");
  elUsersNotSelectedError.classList.remove("hidden");

  // By default, the error comes with no text
  elUsersNotSelectedError.textContent = "You have not selected any friends.";
}

function applyInputTransition(element: HTMLElement, status: "success" | "error") {
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

async function getSelectedUsersData(
  elUsersSelected: NodeListOf<Element>,
  idType: IDTypes
): Promise<string[]> {
  const elementToProfileUrls = (element: HTMLElement): string => {
    element = element.closest(".selectable");
    const elA = element.querySelector(".selectable_overlay") as HTMLAnchorElement;
    return elA.href;
  };

  const urlProfiles = [...elUsersSelected].map(elementToProfileUrls);
  return idsToMultiUserData(urlProfiles, idType);
}

async function prepareToCopyId(e: Event): Promise<void> {
  const elUsersChecked = document.querySelectorAll(".select_friend_checkbox:checked");
  const isUsersChecked = elUsersChecked.length > 0;
  if (!isUsersChecked) {
    printError();
    return;
  }

  const elButton = e.target as HTMLSpanElement;
  const idType = elButton.dataset.copyId as IDTypes;

  const convertedIds = await getSelectedUsersData(elUsersChecked, idType);
  await copy(convertedIds.join("\n"));

  applyInputTransition(elButton, "success");
}

function createCopyButton(label: string, idType: IDTypes): HTMLSpanElement {
  const elButton = document.createElement("span");
  const classNames = {
    steam: [gSelManageAction, "btnv6_lightblue_blue", "btn_medium"],
    extension: ["steam-button-copy-ids"]
  };
  elButton.classList.add(...classNames.steam, ...classNames.extension);
  elButton.innerHTML = `<span>${label}</span>`;
  elButton.dataset.copyId = idType;
  elButton.addEventListener("click", prepareToCopyId);

  return elButton;
}

function appendCopyButtonsToContainer(elContainer: HTMLDivElement): void {
  const elFragment = document.createDocumentFragment();
  elFragment.append(
    // Copy ID
    createCopyButton(`Copy ${IDsToLabels[IDs.id]}`, IDs.id),
    // Copy 32-bit ID
    createCopyButton(`Copy ${IDsToLabels[IDs.id32bit]}`, IDs.id32bit),
    // Copy 64-bit ID
    createCopyButton(`Copy ${IDsToLabels[IDs.id64bit]}`, IDs.id64bit)
  );

  const elAfterActionButtons = getLastElement(`.${gSelManageAction}`).nextElementSibling;
  elContainer.insertBefore(elFragment, elAfterActionButtons);
}

export async function insertIdControlsToBody(): Promise<void> {
  const elPage = document.querySelector(".friends_content");
  const getElContainerActionButtons = (): HTMLDivElement =>
    document.querySelector(`.${gSelManageAction}`).parentElement as HTMLDivElement;

  appendCopyButtonsToContainer(getElContainerActionButtons());

  const observer = new MutationObserver(mutations => {
    const isPageFriendsManager =
      (<HTMLElement>mutations[0].target).firstElementChild.id === "friends_list";
    if (!isPageFriendsManager) {
      return;
    }
    appendCopyButtonsToContainer(getElContainerActionButtons());
  });
  observer.observe(elPage, { attributes: true, attributeFilter: ["class"] });
}
