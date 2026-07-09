import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

/**
 * Vite config for the ave standalone demo app.
 *
 * This is ONLY used for local development (`npm run dev`).
 * The library build (tsc) ignores this file entirely.
 */
export default defineConfig({
    base: "/ave/",
    plugins: [
        react({
            jsxImportSource: "@emotion/react",
            babel: {
                plugins: ["@emotion/babel-plugin"],
            },
        }),
        nodePolyfills(),
    ],
    define: {
        __dirname: JSON.stringify(__dirname),
    },
    resolve: {
        dedupe: ["@mat3ra/esse", "@mui/material", "@mui/styles", "@emotion/react", "@emotion/styled"],
        alias: [
            {
                find: /^vite-plugin-node-polyfills\/shims\/(.*)$/,
                replacement: path.resolve(__dirname, "node_modules/vite-plugin-node-polyfills/shims/$1"),
            },
            {
                find: /^@mat3ra\/ave$/,
                replacement: path.resolve(__dirname, "src/exports.ts"),
            },
            {
                find: /^@mat3ra\/ave\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "src/$1"),
            },
            {
                find: /^@mat3ra\/prode\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "node_modules/@mat3ra/prode/dist/$1"),
            },
            // MUI ESM fixes
            {
                find: /^@mui\/system\/(?!esm\/)(.*)$/,
                replacement: path.resolve(__dirname, "node_modules/@mui/system/esm/$1"),
            },
            {
                find: /^@mui\/icons-material\/(?!esm\/)(.*)$/,
                replacement: path.resolve(__dirname, "node_modules/@mui/icons-material/esm/$1"),
            },
            {
                find: /^lodash\/(?!es\/)(.*)$/,
                replacement: path.resolve(__dirname, "node_modules/lodash-es/$1.js"),
            },
        ],
    },
    build: {
        outDir: "build",
        rollupOptions: {
            output: {
                entryFileNames: "main.js",
                chunkFileNames: "[name]-[hash].js",
                assetFileNames: "[name]-[hash].[ext]",
            },
        },
    },
});
