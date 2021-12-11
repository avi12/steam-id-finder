import resolve from "@rollup/plugin-node-resolve";
import svelte from "rollup-plugin-svelte";
import { terser } from "rollup-plugin-terser";
import css from "rollup-plugin-css-only";
import postcss from "rollup-plugin-postcss";
import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";
import preprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";

const isProduction = !process.env.ROLLUP_WATCH;

function createConfig(filename, newDest = "") {
  return {
    input: `src/${filename}.ts`,
    output: {
      format: "cjs",
      file: `dist/${newDest}${filename}.js`,
      globals: ["steamid"]
    },
    plugins: [
      typescript(),
      json(),
      commonjs(),
      isProduction && terser()
    ],
    watch: {
      clearScreen: true
    }
  };
}

function createConfigSvelte(filename) {
  return {
    input: `src/${filename}.ts`,
    output: {
      format: "cjs",
      file: `dist/build/${filename}.js`
    },
    plugins: [
      typescript(),
      css({ output: "bundle.css" }),
      svelte({
        compilerOptions: {
          dev: !isProduction
        },
        preprocess: preprocess()
      }),
      json(),
      commonjs(),
      resolve({
        browser: true,
        dedupe: ["svelte"]
      }),
      isProduction && terser()
    ],
    watch: {
      clearScreen: true
    }
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
      clearScreen: true
    }
  };
}

export default [
  createConfigCss("main"),
  createConfig("scripts/steam-id-finder-content-script-initialize", "build/"),
  createConfig("background"),
  createConfigSvelte("popup/popup")
];
