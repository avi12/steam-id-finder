<script>
  import {
    Checkbox,
    ExpansionPanel,
    ExpansionPanels,
    Icon,
    MaterialApp,
    TextField
  } from "svelte-materialify";
  import { mdiFlag } from "@mdi/js";

  import { initial, mapIdTypesToNames } from "../../scripts/utilities";

  export let flag = initial.flag;
  export let idsSourceMod = initial.idsSourceMod;

  const idExamples = {
    id: "STEAM_X:Y:ZZZZ",
    "id-32-bit": "[U:1:YYYYYYY]",
    "id-64-bit": "7656119XXXXXXXXXX"
  };

  let idsSelected = idsSourceMod
    .filter(({ isGenerate }) => isGenerate)
    .map(({ idType }) => idType);

  $: {
    chrome.storage.sync.set({
      idsSourceMod: idsSourceMod.map(({ idType }) => ({
        idType,
        isGenerate: idsSelected.includes(idType)
      }))
    });
  }

  const rulesFlag = [
    flag =>
      flag === "" ||
      Boolean(flag.match(/^(\d+:)?[abcdefghijklmnzopqrst]+$/i)) ||
      ""
  ];

  function setFlag({ target: elText, key }) {
    if (key !== "Enter" || !isFlagValid) {
      return;
    }
    chrome.storage.sync.set({ flag: flag.toLowerCase() });
    elText.style.transition = "";
    elText.style.background = "lime";
    setTimeout(() => {
      elText.style.transition = "0.3s background";
      elText.style.background = "";
    }, 500);
  }

  $: isFlagValid = rulesFlag.every(rule => rule(flag) === true);

  const browser = (() => {
    const extensionBaseUrl = chrome.runtime.getURL("");
    if (extensionBaseUrl.startsWith("moz-extension://")) {
      return "firefox";
    }
    return "chrome";
  })();
</script>

<div class:firefox={browser === 'firefox'}>
  <MaterialApp>
    <h2 class="text-h5 text-center">Steam ID Finder</h2>
    <div class="h6">
      Generate a
      <a
        href="https://wiki.alliedmods.net/Adding_Admins_(SourceMod)"
        target="_blank">SourceMod-compatible</a>
      line for copied IDs
    </div>

    <div class="mt-4 mb-3">
      <TextField
        autofocus
        bind:value={flag}
        class="flag__input"
        hint="(immunity number:)Flag letter(s)"
        on:keypress={setFlag}
        outlined
        placeholder="Optional. Press Enter to confirm"
        rules={rulesFlag}>
        <span slot="prepend"><Icon path={mdiFlag} /></span>
        The flag(s)
      </TextField>
    </div>

    <ExpansionPanels>
      <ExpansionPanel>
        <span slot="header">The template that will be copied</span>

        <div class="flex-column">
          <div class="flag__template">
            &lt;ID&gt;
            {(flag && flag.toLowerCase()) || '[Flag]'}
            // &lt;Steam name&gt; &lt;Profile link&gt;
          </div>

          <div>
            Legend: [<abbr title="Not generated if blank">Optional</abbr>] &lt;<abbr
              title="Always generated">Generated for selected ID{idsSelected.length > 1 ? 's' : ''}</abbr>&gt;
          </div>
        </div>
      </ExpansionPanel>
    </ExpansionPanels>

    <div class="mt-3">When copying, attach the template to the IDs:</div>

    {#each idsSourceMod as { idType }}
      <Checkbox bind:group={idsSelected} value={idType}>
        {mapIdTypesToNames[idType]}
        e.g.
        {idExamples[idType]}
      </Checkbox>
    {/each}
  </MaterialApp>
</div>

<style>
  :global(body) {
    width: 425px;
    font-size: 1rem;
    padding: 15px;
  }

  .firefox {
    height: 400px !important;
  }

  :global(.flag__input input:not(:placeholder-shown)) {
    text-transform: lowercase;
  }

  .flag__template {
    color: red;
  }

  abbr[title] {
    text-decoration: none;
    border-bottom: 1px dotted;
  }

  :global(.s-text-field__wrapper.outlined:focus-within::before) {
    border-width: 1px !important;
  }

  @media (prefers-reduced-motion: reduce) {
    :global(*),
    :global(::before),
    :global(::after) {
      animation-delay: -1ms !important;
      animation-duration: 1ms !important;
      scroll-behavior: auto !important;
      transition: 0s !important;
    }
  }
</style>
