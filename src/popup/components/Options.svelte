<script>
  import {
    Checkbox,
    ExpansionPanel,
    ExpansionPanels,
    Icon,
    TextField,
    MaterialApp
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

  function setFlag({ target: elText, key }) {
    if (key !== "Enter") {
      return;
    }
    chrome.storage.sync.set({ flag });
    elText.style.transition = "";
    elText.style.background = "lime";
    setTimeout(() => {
      elText.style.transition = "0.3s background";
      elText.style.background = "";
    }, 500);
  }
</script>

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
      on:keypress={setFlag}
      hint="(immunity number:)Flag letter(s)"
      placeholder="Optional. Press Enter to confirm"
      bind:value={flag}
      outlined>
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
            title="Always generated">Generated for selected ID{idsSelected.length === 1 ? '' : 's'}</abbr>&gt;
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

<style>
  :global(body) {
    width: 425px;
    font-size: 1rem;
    padding: 15px;
  }

  .flag__template {
    color: red;
  }

  abbr {
    text-decoration: none;
    border-bottom: 1px dotted;
  }
</style>
