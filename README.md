# Steam ID Finder

A browser extension that calculates the IDs of Steam users, and allows to easily copy them.  
You can get such IDs from one of the following:

* A user profile (https://steamcommunity.com/id/customURL or http://steamcommunity.com/profiles/64-bit_ID)
* Your Friends page (https://steamcommunity.com/id/customURL/friends
  or https://steamcommunity.com/profiles/64-bit_ID/friends)
* Context menu

You can also generate SourceMod lines for the IDs that you copy.  
Configure your preferences in the pop-up page.

Available for:
- [Google Chrome](https://chrome.google.com/webstore/detail/iaeodlelphecgkpneeifmgcjgeoobjah) ![Chrome Web Store](https://img.shields.io/chrome-web-store/users/iaeodlelphecgkpneeifmgcjgeoobjah?color=white&label=users&style=flat-square)
- [Mozilla Firefox](https://addons.mozilla.org/addon/steam-id-finder) ![Mozilla Add-on](https://img.shields.io/amo/users/steam-id-finder?color=white&label=users&style=flat-square)
- [Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/ahaecgaddckjclinfblgjlejhcpgeebk) ![users count](https://img.shields.io/badge/dynamic/json?label=users&query=activeInstallCount&style=flat-square&color=white&url=https://microsoftedge.microsoft.com/addons/getproductdetailsbycrxid/ahaecgaddckjclinfblgjlejhcpgeebk)
- [Opera](https://addons.opera.com/en/extensions/details/steam-id-finder)

<details>
<summary>Screenshots</summary>
<br>
  <img src="https://avi12.com/assets/img/screenshots/steam-id-finder/steam-id-finder_1_content-script.png" alt="ID links show in the user page">
  <img src="https://avi12.com/assets/img/screenshots/steam-id-finder/steam-id-finder_2_context-menu_chrome.png" alt="Context menu">
  <img src="https://avi12.com/assets/img/screenshots/steam-id-finder/steam-id-finder_3_content-script.png" alt="Copy a batch of IDs in the Your Friends page" width="640" height="400">
  <img src="https://avi12.com/assets/img/screenshots/steam-id-finder/steam-id-finder_4_popup_chrome.png" alt="Popup page">
</details>

## Requirements for setting up

1. Install [Node.js](https://nodejs.org) and [PNPM](https://pnpm.js.org/en/installation).
1. Register a [Steam Web API Key](https://steamcommunity.com/dev/apikey).
1. Create in `dist/data` a file `api-key.json`, and simply put it as a string, e.g.

```json
"Your API key"
```

## Install dependencies

```shell script
pnpm i
```

## Start Rollup for development

```shell script
pnpm dev
```

## Running

### Chromium/Chrome

```shell script
pnpm run-chromium
```

### Edge on Windows 10/11
```shell
pnpm run-edge-windows
```

### Browsers that don't support Manifest v3

1. Build the extension for Firefox/Opera (see below).
2. Open the extensions page in your browser.
3. Enable the developer mode (top-right corner usually).
4. Either drag-drop the browser-compatible ZIP onto the browser or click "Load unpacked extension" and choose it.

## Build & pack
```shell
pnpm build-pack
```

### Build for Firefox (run `pnpm build-pack` first)
```shell
pnpm build-for-firefox
```

### Build for Opera (run `pnpm build-pack` first)
```shell
pnpm build-for-opera
```

## Do you want to contribute?

Feel free to! Make sure to comply with the license, [GPL v3](https://github.com/avi12/steam-id-finder/blob/main/LICENSE).
