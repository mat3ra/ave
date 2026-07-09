import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import fs from "fs";

const useLocalAliases = !process.env.CI && fs.existsSync(path.resolve(__dirname, "../wove"));

/**
 * Vite config for the ave standalone demo app.
 *
 * Resolves all peer dependencies and `/imports/*` Meteor paths that are not
 * available outside the webapp. The `transpile` build (tsc) is unaffected.
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
    optimizeDeps: {
        exclude: [
            "@mat3ra/ave",
            "@mat3ra/wove",
            "@mat3ra/ive",
            "@mat3ra/move",
            "@mat3ra/jove",
            "@mat3ra/jode",
            "@mat3ra/prove",
            "@mat3ra/workflow-designer",
            "moment-duration-format",
        ],
        include: [
            "react",
            "react-dom",
            "prop-types",
            "lodash",
            "underscore",
            "underscore.string",
            "mixwith",
            "flat",
            "simpl-schema",
            "@mui/material",
            "@mui/system",
            "@mui/lab",
            "@mui/icons-material",
            "@mui/styles",
            "@emotion/react",
            "@emotion/styled",
            "@emotion/cache",
            "react-is",
            "hoist-non-react-statics",
            "ajv",
            "@mat3ra/code/dist/js/utils",
            "@mat3ra/prode",
            "@mat3ra/ide",
            "@mat3ra/made",
            "@mat3ra/utils",
            "@mat3ra/standata",
            "@mat3ra/esse/dist/js/esse/JSONSchemasInterface",
            "@mat3ra/esse/dist/js/esse/schemaUtils",
            "@mat3ra/wode",
            "@mat3ra/mode",
            "@mat3ra/code",
            "@mat3ra/ade",
        ],
    },
    resolve: {
        dedupe: ["@mat3ra/esse", "@mui/material", "@mui/styles", "@emotion/react", "@emotion/styled"],
        alias: [
            // Resolve node-polyfills shims from local node_modules absolute path
            {
                find: /^vite-plugin-node-polyfills\/shims\/(.*)$/,
                replacement: path.resolve(__dirname, "node_modules/vite-plugin-node-polyfills/shims/$1"),
            },
            // Redirect local source packages to their src/ for live editing
            {
                find: /^@mat3ra\/ave$/,
                replacement: path.resolve(__dirname, "src/exports.ts"),
            },
            {
                find: /^@mat3ra\/ave\/dist\/(.*)$/,
                replacement: path.resolve(__dirname, "src/$1"),
            },
            ...(useLocalAliases ? [
                // Stub Meteor-only paths
                {
                    find: /^\/imports\/(.*)$/,
                    replacement: path.resolve(
                        __dirname,
                        "../workflow-designer/src/standalone/stubs/meteor.js",
                    ),
                },
                {
                    find: /^meteor\/(.*)$/,
                    replacement: path.resolve(
                        __dirname,
                        "../workflow-designer/src/standalone/stubs/meteor.js",
                    ),
                },
                // Stub moment-duration-format (side-effect-only import in ive)
                {
                    find: "moment-duration-format",
                    replacement: path.resolve(
                        __dirname,
                        "../workflow-designer/src/standalone/stubs/moment-duration-format.js",
                    ),
                },
                // d3-hierarchy: resolve from workflow-designer's own node_modules (wove/src imports it directly)
                {
                    find: "d3-hierarchy",
                    replacement: path.resolve(
                        __dirname,
                        "../workflow-designer/node_modules/d3-hierarchy/src/index.js",
                    ),
                },
                {
                    find: "simpl-schema",
                    replacement: path.resolve(
                        __dirname,
                        "../workflow-designer/node_modules/simpl-schema",
                    ),
                },
                {
                    find: /^@mat3ra\/prove$/,
                    replacement: path.resolve(__dirname, "../prove/src/exports.ts"),
                },
                {
                    find: /^@mat3ra\/prove\/dist\/(.*)$/,
                    replacement: path.resolve(__dirname, "../prove/src/$1"),
                },
                {
                    find: /^@mat3ra\/workflow-designer$/,
                    replacement: path.resolve(__dirname, "../workflow-designer/src/exports.ts"),
                },
                {
                    find: /^@mat3ra\/workflow-designer\/dist\/(.*)$/,
                    replacement: path.resolve(__dirname, "../workflow-designer/src/$1"),
                },
                // cove.js — point to local build
                {
                    find: /^@exabyte-io\/cove\.js\/dist\/(.*)$/,
                    replacement: path.resolve(__dirname, "../cove.js/dist/$1"),
                },
                {
                    find: /^@mat3ra\/move$/,
                    replacement: path.resolve(__dirname, "../move/src/exports.ts"),
                },
                {
                    find: /^@mat3ra\/move\/dist\/(.*)$/,
                    replacement: path.resolve(__dirname, "../move/src/$1"),
                },
                // Fallbacks to resolve package dependencies from local node_modules
                {
                    find: /^@mat3ra\/made$/,
                    replacement: path.resolve(__dirname, "node_modules/@mat3ra/made/dist/js/made.js"),
                },
                {
                    find: /^@mat3ra\/code$/,
                    replacement: path.resolve(__dirname, "node_modules/@mat3ra/code/dist/js/index.js"),
                },
                {
                    find: /^@mat3ra\/esse$/,
                    replacement: path.resolve(__dirname, "node_modules/@mat3ra/esse/dist/js/esse/index.js"),
                },
                {
                    find: /^@mat3ra\/ade$/,
                    replacement: path.resolve(__dirname, "node_modules/@mat3ra/ade/dist/js/index.js"),
                },
                {
                    find: /^@mat3ra\/wode$/,
                    replacement: path.resolve(__dirname, "node_modules/@mat3ra/wode/dist/js/index.js"),
                },
                {
                    find: /^@mat3ra\/mode$/,
                    replacement: path.resolve(__dirname, "node_modules/@mat3ra/mode/dist/js/index.js"),
                },
                {
                    find: /^@mat3ra\/prode$/,
                    replacement: path.resolve(__dirname, "node_modules/@mat3ra/prode/dist/js/index.js"),
                },
                {
                    find: /^@mat3ra\/standata$/,
                    replacement: path.resolve(__dirname, "node_modules/@mat3ra/standata/dist/js/index.js"),
                },
                {
                    find: /^@mat3ra\/prove$/,
                    replacement: path.resolve(__dirname, "node_modules/@mat3ra/prove/dist/exports.js"),
                },
            ] : [
                // Non-local stubs when building standalone (exclude /imports/ and meteor/ from wove)
                {
                    find: /^\/imports\/(.*)$/,
                    replacement: path.resolve(__dirname, "node_modules/@mat3ra/workflow-designer/dist/standalone/stubs/meteor.js"),
                },
                {
                    find: /^meteor\/(.*)$/,
                    replacement: path.resolve(__dirname, "node_modules/@mat3ra/workflow-designer/dist/standalone/stubs/meteor.js"),
                },
                {
                    find: "moment-duration-format",
                    replacement: path.resolve(__dirname, "node_modules/@mat3ra/workflow-designer/dist/standalone/stubs/moment-duration-format.js"),
                },
            ]),
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
