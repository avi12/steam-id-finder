import { IDs, IDTypes } from "../types/steam-user-ids.model";
import API_KEY from "../data/api-key.json";
import SteamID from "steamid";
import type { Player, PlayerResponse, VanityURL } from "../types/steam-user.model";
import { RegexPageTypes } from "../types/steam-page.model";
import { initial } from "./setup";

export async function getStorage(storageArea: "local" | "sync", key = null): Promise<any> {
  return new Promise(resolve => {
    chrome.storage[storageArea].get(key, result => {
      resolve(key !== null ? result[key] : result);
    });
  });
}

export async function copy(text: string): Promise<void> {
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
        // eslint-disable-next-line no-empty
      } catch {}
      elTextarea.remove();
    }
    // eslint-disable-next-line no-empty
  } catch {}
}

function getUserId(pathname: string): string {
  return pathname.match(RegexPageTypes.user)?.[1];
}

async function get64BitId(url: string): Promise<string> {
  const { pathname } = new URL(url);
  let id64Bit: string;
  if (pathname.startsWith("/id/")) {
    const {
      response: { steamid }
    } = await get64BitIdByCustomUrl(getUserId(pathname));

    id64Bit = steamid;
  } else {
    id64Bit = getUserId(pathname);
  }

  return id64Bit;
}

export async function getUser(url: string): Promise<Player> {
  const user: PlayerResponse = await getPlayerOrPlayersResponse(await get64BitId(url));
  return user.response.players[0];
}

async function getUsers(urls: string[]): Promise<Player[]> {
  const usersIds: string[] = await Promise.all(urls.map(get64BitId));
  const idsString = usersIds.join(",");
  const { response } = await getPlayerOrPlayersResponse(idsString);
  return response.players;
}

async function getPlayerOrPlayersResponse(id64bit: string): Promise<PlayerResponse> {
  // https://steamcommunity.com/dev/apikey
  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2?key=${API_KEY}&steamids=${id64bit}`;
  const response = await fetch(url);
  return response.json();
}

async function get64BitIdByCustomUrl(customUrl: string): Promise<VanityURL> {
  // https://steamcommunity.com/dev/apikey
  const url = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1?key=${API_KEY}&vanityurl=${customUrl}`;
  const response = await fetch(url);
  return response.json();
}

export function convertId(id64Bit: string, idDest: IDTypes): string {
  const steamId = new SteamID(id64Bit);
  switch (idDest) {
    case IDs.id:
      return steamId.getSteam2RenderedID();

    case IDs.id32bit:
      return steamId.getSteam3RenderedID();

    case IDs.id64bit:
      return steamId.getSteamID64();
  }
}

function getExtendedData(user: Player): string {
  return `// ${user.personaname} ( https://steamcommunity.com/profiles/${user.steamid} )`;
}

export async function getTextForSingleUser(
  user: Player,
  idType: IDTypes,
  idToCopy: string
): Promise<string> {
  const { idsSourceMod = initial.idsSourceMod, flag = initial.flag } = await getStorage("sync");
  const textArray = [idToCopy];
  const { isGenerate } = idsSourceMod.find(sourceMod => sourceMod.idType === idType);
  if (isGenerate) {
    if (flag !== "") {
      textArray.push(flag);
    }
    textArray.push(getExtendedData(user));
  }
  return textArray.join(" ");
}

export function getLastElement(selector: string): HTMLElement {
  const elements = [...document.querySelectorAll(selector)];
  return elements[elements.length - 1] as HTMLElement;
}

export async function idsToMultiUserData(ids: string[], idType: IDTypes): Promise<string[]> {
  const users: Player[] = await getUsers(ids);
  return Promise.all(
    users.map(user => getTextForSingleUser(user, idType, convertId(user.steamid, idType)))
  );
}
