"use strict";

import { IDs } from "../types/steam-user-ids.model";

export const initial = {
  flag: "",
  idsSourceMod: [
    {
      idType: IDs.id,
      isGenerate: true
    },
    {
      idType: IDs.id32bit,
      isGenerate: false
    },
    {
      idType: IDs.id64bit,
      isGenerate: false
    }
  ]
};
