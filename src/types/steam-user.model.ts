"use strict";

const enum ResponseStatus {
  SUCCESS = 1,
  ERROR = 42
}

export interface VanityURL {
  response: {
    success: ResponseStatus.SUCCESS | ResponseStatus.ERROR;
    steamid?: string;
    message?: "No match";
  };
}

const enum CommunityVisibilityState {
  Private = 1,
  FriendsOnly = 2,
  Public = 3
}

const enum PersonaState {
  Offline = 0,
  Online = 1,
  Busy = 2,
  Away = 3,
  Snooze = 4,
  LookingToTrade = 5,
  LookingToPlay = 6
}

// https://developer.valvesoftware.com/wiki/Steam_Web_API#GetPlayerSummaries_.28v0002.29
export interface Player {
  // Public data
  steamid: string;
  communityvisibilitystate:
    | CommunityVisibilityState.Private
    | CommunityVisibilityState.FriendsOnly
    | CommunityVisibilityState.Public;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  personastate:
    | PersonaState.Offline
    | PersonaState.Online
    | PersonaState.Busy
    | PersonaState.Away
    | PersonaState.Snooze
    | PersonaState.LookingToTrade
    | PersonaState.LookingToPlay;
  profilestate?: 1;
  lastlogoff: number;
  commentpermission?: 1;
  // Private data
  realname?: string;
  primaryclanid?: string;
  timecreated: number;
  gameid?: number;
  gameserverip?: string;
  gameextrainfo?: string;
  cityid?: number;
  loccountrycode?: string;
  locstatecode?: string;
}

export interface PlayerResponse {
  response: {
    players: Player[];
  };
}
