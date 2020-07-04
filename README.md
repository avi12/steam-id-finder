## Steam ID Finder
A browser extension that calculates the IDs of Steam users, and allows to easily copy them.  
You can get such IDs either from:
* A user profile (https://steamcommunity.com/id/customURL or http://steamcommunity.com/profiles/64-bit_ID)
* Your Friends page (https://steamcommunity.com/id/customURL/friends or https://steamcommunity.com/profiles/64-bit_ID/friends)
* Context menu

You can also generate SourceMod lines for the IDs that you copy.  
Configure your preferences in the pop-up page.

Officially published for [Chrome Web Store](https://chrome.google.com/webstore/detail/steam-id-finder/iaeodlelphecgkpneeifmgcjgeoobjah) & [Firefox Add-ons Store](https://addons.mozilla.org/addon/steam-id-finder/).

Made by [avi12](https://avi12.com).

### How to run
1. Register a [Steam Web API Key](https://steamcommunity.com/dev/apikey).  
2. Create in `src/data` a file `api-key.json`, and simply put it as a string, e.g.
```json
"Your API key"
```

### Do you want to contribute?
Feel free to!  
If you want to fork, just make sure to credit me and link this repository and [my website](https://avi12.com).


### How to build

Install dependencies
```
yarn
```
Build
```
yarn run build-minify
```
Pack
```
yarn run pack && yarn run pack-self
```
Shorthand for build & pack
```
yarn run build-pack
```