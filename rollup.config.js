import {
  chromeExtension,
  simpleReloader,
} from "rollup-plugin-chrome-extension";

import preprocess from "svelte-preprocess";
import svelte from "rollup-plugin-svelte";
import postcss from "rollup-plugin-postcss";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import zip from "rollup-plugin-zip";
import { emptyDir } from "rollup-plugin-empty-dir";
import { terser } from "rollup-plugin-terser";
import json from "@rollup/plugin-json";

const production = !process.env.ROLLUP_WATCH;
export default {
  input: "src/manifest.json",
  output: {
    dir: "dist",
    format: "esm",
  },
  plugins: [
    json(),
    chromeExtension(),
    !production && simpleReloader(),
    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
    commonjs(),
    resolve(),
    svelte({
      compilerOptions: {
        dev: !production,
      },
      preprocess: preprocess({
        scss: {
          includePaths: ["theme"],
        },
      }),
    }),
    postcss(),
    emptyDir(),
    production && terser(),
    production && zip({ dir: "dist_packed" }),
  ],
  watch: {
    clearScreen: false,
  },
};
