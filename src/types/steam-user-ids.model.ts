"use strict";

export const IDs = {
  id: "id",
  id32bit: "id-32-bit",
  id64bit: "id-64-bit"
} as const;

export const IDsToLabels = {
  [IDs.id]: "ID",
  [IDs.id32bit]: "32-bit ID",
  [IDs.id64bit]: "64-bit ID"
} as const;

export interface IDToValue {
  [IDs.id]: string;
  [IDs.id32bit]: string;
  [IDs.id64bit]: string;
}

export const IDExamples = {
  [IDs.id]: "STEAM_X:Y:ZZZZ",
  [IDs.id32bit]: "[U:1:YYYYYYY]",
  [IDs.id64bit]: "7656119XXXXXXXXXX"
} as const;

export type IDTypes = keyof typeof IDsToLabels;
