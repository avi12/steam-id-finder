"use strict";

// language=RegExp
export const RegexPageTypes = {
  user: "(?:profiles|id)/([^/]+)/?$",
  friendsManager: "(?:profiles|id)/[^/]+/friends/?$"
} as const;

export type RegexPages = typeof RegexPageTypes[keyof typeof RegexPageTypes];
