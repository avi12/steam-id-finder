"use strict";

import SteamID from "steamid";

export const initial = {
  flag: "",
  idsSourceMod: [
    {
      idType: "id",
      isGenerate: true
    },
    {
      idType: "id-32-bit",
      isGenerate: false
    },
    {
      idType: "id-64-bit",
      isGenerate: false
    }
  ]
};

export const mapIdTypesToNames = {
  id: "ID",
  "id-32-bit": "32-bit ID",
  "id-64-bit": "64-bit ID"
};

/**
 * Get from the storage. If "key" isn't provided, it will retrieve all the keys from that storage area.
 * @param {"sync"|"local"} storageArea Where to retrieve the value from.
 * @param {string?} key The storage name.
 * @returns {Promise<object?>} The value.
 */
export async function getStorage(storageArea, key) {
  return new Promise(resolve => {
    chrome.storage[storageArea].get(key, result => {
      resolve(key ? result[key] : result);
    });
  });
}

/**
 * Extracts the ID from the Steam URL.
 * @param {string} url The user profile's URL.
 * @returns {string} The ID.
 */
export function getUserId(url) {
  const urlMatch = url.match(/(?:profiles|id|u)\/(?<id>[^\/?]+)/);
  return urlMatch.groups.id;
}

/**
 * Converts to another ID.
 * @param {object} data The user's data object.
 * @param {"id"|"id-32-bit"|"id-64-bit"} idDest What the output ID will be,
 * @returns {string}
 */
export function convertId({ data, idDest }) {
  // https://developer.valvesoftware.com/wiki/SteamID
  const steamId = new SteamID(data.steamid);
  switch (idDest) {
    case "id":
      return steamId.getSteam2RenderedID();

    case "id-32-bit":
      return steamId.getSteam3RenderedID();

    case "id-64-bit":
      return steamId.getSteamID64();
  }
}

/**
 * Copy a string to the clipboard.
 * @param {string} text The string to copy.
 */
export async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    copyFallback(text);
  }
}

function copyFallback(text) {
  try {
    if (document?.queryCommandSupported("copy")) {
      const elTextarea = document.createElement("textarea");
      elTextarea.value = text;
      elTextarea.style.top = "0";
      elTextarea.style.left = "0";
      elTextarea.style.position = "fixed";
      elTextarea.style.opacity = "0";
      document.body.append(elTextarea);
      elTextarea.focus();
      elTextarea.select();
      try {
        document.execCommand("copy");
      } catch {}
      elTextarea.remove();
    }
  } catch {}
}

/**
 * @param {object} user The user object.
 * @returns {string} Some more data:  // {visible user name} ( {profile URL} )
 */
export function getExtendedData(user) {
  return `// ${user.personaname} ( https://steamcommunity.com/profiles/${user.steamid} )`;
}

/**
 * @param {object[]} usersData
 * @param {"id"|"id-32-bit"|"id-64-bit"} idType
 * @returns {Promise<string>} The text.
 */
export async function getTextForUsers({ usersData, idType }) {
  const text = await Promise.all(
    usersData.map(user => getTextForSingleUser(user, idType))
  );
  return text.join("\n");
}

/**
 * @param {object} userData
 * @param {"id"|"id-32-bit"|"id-64-bit"} idType
 * @returns {Promise<string>} The text.
 */
export async function getTextForSingleUser(userData, idType) {
  const {
    idsSourceMod = initial.idsSourceMod,
    flag = initial.flag
  } = await getStorage("sync");

  const textArray = [userData[idType]];

  const { isGenerate } = idsSourceMod.find(
    sourceMod => sourceMod.idType === idType
  );
  if (isGenerate) {
    if (flag !== "") {
      textArray.push(flag);
    }
    textArray.push(getExtendedData(userData));
  }
  return textArray.join(" ");
}
