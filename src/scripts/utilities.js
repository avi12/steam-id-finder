"use strict";

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
  const steam64bitIdentifier = BigInt("0x0110000100000000");
  const { steamid: id64Bit, communityvisibilitystate } = data;
  switch (idDest) {
    case "id": {
      const id = BigInt(id64Bit);
      const X = communityvisibilitystate === 3 ? 0 : 1;
      const Y = id % 2n;
      const Z = (id - steam64bitIdentifier) / 2n;
      return `STEAM_${X}:${Y}:${Z}`;
    }
    case "id-32-bit": {
      const id = BigInt(id64Bit);
      const Y = id - steam64bitIdentifier;
      return `[U:1:${Y}]`;
    }
    case "id-64-bit":
      return id64Bit;
  }
}

/**
 * Copy a string to the clipboard.
 * @param {string} text The string to copy.
 */
export function copy(text) {
  try {
    navigator.clipboard.writeText(text);
  } catch {
    copyFallback(text);
  }
}

function copyFallback(text) {
  try {
    if (
      document.queryCommandSupported &&
      document.queryCommandSupported("copy")
    ) {
      const elText = document.createElement("textarea");
      elText.value = text;
      elText.style.top = "0";
      elText.style.left = "0";
      elText.style.position = "fixed";
      elText.style.opacity = "0";
      document.body.appendChild(elText);
      elText.focus();
      elText.select();
      try {
        document.execCommand("copy");
      } catch (e) {}
      elText.remove();
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
