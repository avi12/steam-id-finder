"use strict";

const gInitialValues = {
  flag: "",
  generateSourceModLine: [
    {
      idType: "id-2",
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

/**
 * Get from the storage. If "key" isn't provided, it will retrieve all the keys from that storage area.
 * @param {"sync"|"local"} storageArea Where to retrieve the value from.
 * @param {string?} key The storage name.
 * @returns {Promise<object?>} The value.
 */
async function getStorage(storageArea, key) {
  return new Promise((resolve) => {
    chrome.storage[storageArea].get(key, (result) => {
      resolve(key ? result[key] : result);
    });
  });
}

/**
 * Answers whether we're on the page that's matching the parameter.
 * @param {"user"|"friendsManager"} type
 * @returns {boolean}
 */
function isPage(type) {
  const pages = {
    user: ".playerAvatarAutoSizeInner",
    friendsManager: ".friends_content"
  };

  return Boolean(document.querySelector(pages[type]));
}

/**
 * Extracts the ID from the Steam URL.
 * @param {string} url
 * @returns {string} The ID.
 */
function getUserId(url) {
  const urlMatch = url.match(/(?:profiles|id|u)\/(?<id>[^\/?]+)/);
  return urlMatch.groups.id;
}

/**
 * Converts to another ID.
 * @param {object} data The user's data object.
 * @param {"id-2"|"id-32-bit"|"id-64-bit"} idDest What the output ID will be,
 * @returns {string}
 */
function convertId({ data, idDest }) {
  // https://developer.valvesoftware.com/wiki/SteamID
  const steam64bitIdentifier = new BigNumber("0110000100000000", 16);
  const { steamid: id64Bit, communityvisibilitystate } = data;
  switch (idDest) {
  case "id-2": {
    const id = new BigNumber(id64Bit);
    const X = communityvisibilitystate === 3 ? 0 : 1;
    const Y = id.mod(2);
    const Z = id.minus(steam64bitIdentifier).dividedToIntegerBy(2);
    return `STEAM_${X}:${Y}:${Z}`;
  }
  case "id-32-bit": {
    const id = new BigNumber(id64Bit);
    const Y = id.minus(steam64bitIdentifier);
    return `[U:1:${Y}]`;
  }
  case "id-64-bit":
    return data.steamid;
  }
}

/**
 * @param {string} text
 */
function copy(text) {
  const elTextarea = document.createElement("textarea");
  elTextarea.style.position = "fixed";
  elTextarea.value = text;
  document.body.append(elTextarea);
  elTextarea.focus();
  elTextarea.select();
  document.execCommand("Copy");
  elTextarea.remove();
}

/**
 * @param {object} user
 * @returns {string} Some more data: // {visible user name} ( {profile URL} )
 */
function getExtendedData(user) {
  return `// ${user.personaname} ( https://steamcommunity.com/profiles/${user.steamid} )`;
}

/**
 * @param {object[]} usersData
 * @param {"id-2"|"id-32-bit"|"id-64-bit"} idType
 * @returns {Promise<string>} The text.
 */
async function getTextForUsers({ usersData, idType }) {
  const text = await Promise.all(
    usersData.map((user) => getTextForSingleUser(user, idType))
  );
  return text.join("\n");
}

/**
 * @param {object} userData
 * @param {"id-2"|"id-32-bit"|"id-64-bit"} idType
 * @returns {Promise<string>} The text.
 */
async function getTextForSingleUser(userData, idType) {
  const {
    generateSourceModLine = gInitialValues.generateSourceModLine,
    flag = gInitialValues.flag
  } = await getStorage("sync");

  const textArray = [userData[idType]];

  if (flag !== "") {
    textArray.push(flag);
  }

  const isSourceModLine = (() => {
    const { isGenerate } = generateSourceModLine.find(
      (sourceMod) => sourceMod.idType === idType
    );
    return isGenerate;
  })();
  if (isSourceModLine) {
    textArray.push(getExtendedData(userData));
  }
  return textArray.join(" ");
}
