"use strict";

new Vue({
  el: "#app",
  data: {
    flag: "",
    idsTutorial: [
      {
        name: "ID 2",
        template: "STEAM_X:Y:ZZZZ"
      },
      {
        name: "32-bit ID",
        template: "[U:1:YYYYYYY]"
      },
      {
        name: "64-bit ID",
        template: "7656119XXXXXXXXXX"
      }
    ],
    generateSourceModLine: [
      {
        idType: "id-2",
        isGenerate: false
      },
      {
        idType: "id-32-bit",
        isGenerate: false
      },
      {
        idType: "id-64-bit",
        isGenerate: false
      }
    ]
  },
  watch: {
    generateSourceModLine: {
      handler(values) {
        this.updateStorage("generateSourceModLine", values);
      },
      deep: true
    }
  },
  computed: {
    idPlural() {
      const checkedIdsCount = this.generateSourceModLine.reduce(
        this.toIdsCount,
        0
      );
      return checkedIdsCount === 1 ? "" : "s";
    },
    browser() {
      const extensionOrigin = chrome.runtime
        .getURL("PATH/")
        .replace("/PATH/", "");

      if (extensionOrigin.startsWith("moz-extension://")) {
        return "firefox";
      }
      const { userAgent } = navigator;
      if (userAgent.includes("OPR")) {
        return "opera";
      }
      if (userAgent.includes("Edg")) {
        return "edge";
      }
      return "chrome";
    }
  },
  methods: {
    toLowerCase(text) {
      return text.toLowerCase();
    },
    updateFlag(e) {
      const flagLetters = "abcdefghijklmnopqrstz";
      const allowedChars = new RegExp("[\\d:" + flagLetters + "]", "i");
      if (!e.key.match(allowedChars)) {
        e.preventDefault();
        return;
      }

      const regexFlag = new RegExp("^(\\d+:)?[" + flagLetters + "]+$", "i");
      if (e.key === "Enter") {
        const isFlagValid = this.flag === "" || this.flag.match(regexFlag);
        if (!isFlagValid) {
          this.applyInputTransition(e.target, "error");
          return;
        }

        this.applyInputTransition(e.target, "success");

        this.updateStorage("flag", this.flag.toLowerCase());
      }
    },
    applyInputTransition(element, status) {
      const colors = {
        success: "lime",
        error: "#f85151"
      };

      element.style.transition = "";
      element.style.background = colors[status];

      setTimeout(() => {
        // For some reason, the transition works
        // properly only by transitioning the background-color
        element.style.transition = "background-color 0.25s";

        setTimeout(() => {
          // For some reason, the transition works
          // properly only by emptying out the background-color
          element.style.backgroundColor = "";
        }, 300);
      }, 500);
    },
    updateStorage(key, value) {
      const obj = {};
      obj[key] = value;
      chrome.storage.sync.set(obj);
    },
    toIdsCount(counter, item) {
      return counter + Number(item.isGenerate);
    },
    openUrl(e) {
      chrome.tabs.create({ url: e.target.href });
    }
  },
  async beforeMount() {
    let {
      flag = gInitialValues.flag,
      generateSourceModLine = gInitialValues.generateSourceModLine
    } = await getStorage("sync");

    this.flag = flag;
    this.generateSourceModLine = generateSourceModLine;
  },
  mounted() {
    document.querySelector("input").focus();
  }
});
