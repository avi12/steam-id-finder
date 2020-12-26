"use strict";

import Options from "./components/Options.svelte";
import { getStorage } from "../scripts/utilities";

async function init() {
  const { flag, idsSourceMod } = await getStorage("sync");

  new Options({
    target: document.body,
    props: {
      flag,
      idsSourceMod
    }
  });
}

init();
