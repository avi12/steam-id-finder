"use strict";

import {
  convertId,
  copy,
  getStorage,
  getTextForSingleUser,
  getUserId
} from "./utilities";
import apiKey from "../data/api-key.json";
import SteamID from "steamid";

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason !== "update") {
    return;
  }

  const idsSourceMod = await getStorage("sync", "generateSourceModLine");
  if (!idsSourceMod) {
    return;
  }

  const iType = idsSourceMod.findIndex(({ idType }) => idType === "id-2");
  if (iType <= -1) {
    return;
  }
  idsSourceMod[iType].idType = "id";

  chrome.storage.sync.remove("generateSourceModLine", () => {
    chrome.storage.sync.set({ idsSourceMod });
  });
});

chrome.runtime.onConnect.addListener(port => {
  switch (port.name) {
    case "request-data":
      port.onMessage.addListener(async ({ ids }) => {
        const data = await idsToMultiUserData(ids);
        port.postMessage(data);
      });
      break;
    case "convert-id":
      port.onMessage.addListener(object => {
        port.postMessage(convertId(object));
      });
  }
});

chrome.contextMenus.create({
  title: "Copy ID            - STEAM_X:Y:ZZZZ",
  id: "id",
  contexts: ["link"],
  targetUrlPatterns: [
    "https://steamcommunity.com/id/*",
    "https://steamcommunity.com/profiles/*",
    "https://backpack.tf/u/*"
  ]
});

chrome.contextMenus.create({
  title: "Copy 32-bit ID - [U:1:YYYYYYY]",
  id: "id-32-bit",
  contexts: ["link"],
  targetUrlPatterns: [
    "https://steamcommunity.com/id/*",
    "https://steamcommunity.com/profiles/*",
    "https://backpack.tf/u/*"
  ]
});

chrome.contextMenus.create({
  title: "Copy 64-bit ID - 7656119XXXXXXXXXX",
  id: "id-64-bit",
  contexts: ["link"],
  targetUrlPatterns: [
    "https://steamcommunity.com/id/*",
    "https://steamcommunity.com/profiles/*",
    "https://backpack.tf/u/*"
  ]
});

chrome.contextMenus.onClicked.addListener(async ({ menuItemId, linkUrl }) => {
  const id = getUserId(linkUrl);
  const userData = await idsToMultiUserData([id]);
  const textForSingleUser = await getTextForSingleUser(userData[0], menuItemId);
  copy(textForSingleUser);
});

/**
 * @param {string} url
 * @returns {Promise<JSON>}
 */
async function getJson(url) {
  const response = await fetch(url);
  return response.json();
}

/**
 * Returns a string to fetch the URL that retrieves the data
 * @param {string} type The type. "64-bit" to get the 64-bit ID from a custom URL, or "data" to get the data from a 64-bit numerical ID.
 * @param {string} id The ID.
 * @returns {Promise<string>} The URL
 */
async function getUrl({ type, id }) {
  // https://steamcommunity.com/dev/apikey
  switch (type) {
    case "64-bit":
      return `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001?key=${apiKey}&vanityurl=${id}`;
    case "data":
      return `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002?key=${apiKey}&steamids=${id}`;
  }
}

/**
 * @param {string} id The ID, either custom URL or 64-bit ID
 * @returns {Promise<{response: {steamid: string}|object}>}
 */
async function to64bitID(id) {
  try {
    new SteamID(id);
    return {
      response: {
        steamid: id
      }
    };
  } catch {
    const url = await getUrl({ type: "64-bit", id });
    return getJson(url);
  }
}

/**
 * Returns the JSON of the users' data.
 * @param {Promise<string>[]} promises64bitId The string array.
 * @returns {Promise<JSON>} The data.
 */
async function getUsersData(promises64bitId) {
  const metadatas = await Promise.all(promises64bitId);
  const _64bitIds = metadatas.map(({ response }) => response.steamid);
  const url = await getUrl({ type: "data", id: _64bitIds.join(",") });
  return getJson(url);
}

/**
 * @param {string[]} ids List of users' IDs. Can contain both 64-bit IDs and custom URLs.
 * @returns {object} The data object of all the users. The order of the input doesn't affect the order of the output.
 */
async function idsToMultiUserData(ids) {
  const userIds = [...ids];

  const promise64bitIds = userIds.map(to64bitID);
  const data = await getUsersData(promise64bitIds);
  return data.response.players.map(user => ({
    ...user,
    // Adding the additional IDs to the fetched player object so it's easy to access later
    id: convertId({ data: user, idDest: "id" }),
    "id-32-bit": convertId({ data: user, idDest: "id-32-bit" }),
    "id-64-bit": user.steamid
  }));
}
