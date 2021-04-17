import resolve from "@rollup/plugin-node-resolve";
import svelte from "rollup-plugin-svelte";
import { terser } from "rollup-plugin-terser";
import css from "rollup-plugin-css-only";
import postcss from "rollup-plugin-postcss";
import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";
import preprocess from "svelte-preprocess";

const isProduction = !process.env.ROLLUP_WATCH;

function createConfig(filename, useSvelte = false) {
  return {
    input: `src/${filename}.js`,
    output: {
      format: "esm",
      file: `dist/build/${filename}.js`
    },
    plugins: [
      useSvelte && css({ output: "bundle.css" }),
      useSvelte &&
        svelte({
          // enable run-time checks when not in production
          compilerOptions: {
            dev: !isProduction
          },
          preprocess: preprocess()
          // we'll extract any component CSS out into
          // a separate file - better for performance
        }),

      json(),

      // If you have external dependencies installed from
      // npm, you'll most likely need these plugins. In
      // some cases you'll need additional configuration -
      // consult the documentation for details:
      // https://github.com/rollup/plugins/tree/master/packages/commonjs
      commonjs(),
      resolve({
        browser: true,
        dedupe: ["svelte"]
      }),

      // If we're building for production (npm run build
      // instead of npm run dev), minify
      isProduction && terser()
    ]
  };
}

function createConfigCss(filename) {
  return {
    input: `src/styles-injected/${filename}.css`,
    output: {
      file: `dist/build/styles-injected/${filename}.css`
    },
    plugins: [
      postcss({
        extract: true
      })
    ],
    watch: {
      clearScreen: false
    }
  };
}

export default [
  createConfig("popup/popup", true),
  createConfig("scripts/background"),
  createConfig("scripts/content-script-steam-friends-manager"),
  createConfig("scripts/content-script-steam-initialize"),
  createConfig("scripts/content-script-steam-user"),
  createConfig("scripts/utilities"),
  createConfigCss("main")
];
