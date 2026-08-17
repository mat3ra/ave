import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { flattenRenderingContext } from "../utils/templateVariables";
/** "renders with: Si … · espresso", from the context itself rather than a separate prop. */
function describeRenderTarget(context) {
    const read = (key) => {
        var _a;
        const value = ((_a = context === null || context === void 0 ? void 0 : context[key]) !== null && _a !== void 0 ? _a : {});
        return typeof (value === null || value === void 0 ? void 0 : value.name) === "string" ? value.name : undefined;
    };
    return [read("material"), read("application")].filter(Boolean).join(" · ");
}
function groupByOrigin(variables) {
    const groups = new Map();
    variables.forEach((variable) => {
        const bucket = groups.get(variable.origin);
        if (bucket)
            bucket.push(variable);
        else
            groups.set(variable.origin, [variable]);
    });
    return [...groups.entries()];
}
/**
 * What a template can write, and where each value came from.
 *
 * Replaces a `<pre>` of the whole rendering context as JSON — everything available, in the shape
 * it happened to be stored in, with no indication of which parts came from the Settings tab and
 * which arrive at job runtime. Clicking a row copies the `{{ … }}` expression: inserting at the
 * cursor needs the editor's `EditorView`, which cove's CodeMirror wrapper does not expose.
 *
 * Unresolved variables are reported by {@link ExecutionUnitInputFilePanel}, directly above the
 * template they are in, rather than here as well.
 */
export function TemplateVariablesPanel({ renderingContext, originOverrides, }) {
    const [search, setSearch] = useState("");
    const [copied, setCopied] = useState(null);
    const variables = useMemo(() => flattenRenderingContext(renderingContext, { originOverrides }), [renderingContext, originOverrides]);
    const needle = search.trim().toLowerCase();
    const visible = needle
        ? variables.filter((variable) => variable.path.toLowerCase().includes(needle) ||
            variable.preview.toLowerCase().includes(needle))
        : variables;
    const copy = (path) => {
        var _a;
        const expression = `{{ ${path} }}`;
        (_a = navigator.clipboard) === null || _a === void 0 ? void 0 : _a.writeText(expression).catch(() => undefined);
        setCopied(path);
        // Fire-and-forget; the panel only needs the label to settle back.
        setTimeout(() => setCopied((current) => (current === path ? null : current)), 1200);
    };
    const renderTarget = describeRenderTarget(renderingContext);
    return (_jsxs(Stack, { spacing: 1.5, sx: { p: 1.5 }, "data-tid": "template-variables-panel", children: [renderTarget ? (_jsxs(Typography, { variant: "caption", color: "text.secondary", children: ["renders with: ", renderTarget] })) : null, _jsx(TextField, { size: "small", value: search, onChange: (event) => setSearch(event.target.value), placeholder: "Search variables", InputProps: {
                    startAdornment: _jsx(InputAdornment, { position: "start", children: "\u2315" }),
                    inputProps: { "data-tid": "template-variables-search" },
                } }), visible.length === 0 ? (_jsx(Typography, { variant: "body2", color: "text.secondary", children: variables.length === 0
                    ? "No context to render this template with yet."
                    : `Nothing matches “${search}”.` })) : (groupByOrigin(visible).map(([origin, rows]) => (_jsxs(Box, { children: [_jsx(Typography, { variant: "overline", color: "text.secondary", children: origin }), rows.map((variable) => (_jsx(Tooltip, { title: copied === variable.path
                            ? "Copied"
                            : `Copy {{ ${variable.path} }}`, children: _jsxs(Box, { onClick: () => copy(variable.path), "data-tid": `template-variable-${variable.path}`, sx: {
                                display: "flex",
                                gap: 1,
                                alignItems: "baseline",
                                px: 0.75,
                                py: 0.25,
                                borderRadius: 0.5,
                                cursor: "pointer",
                                "&:hover": { backgroundColor: "action.hover" },
                            }, children: [_jsx(Typography, { variant: "caption", sx: {
                                        fontFamily: "monospace",
                                        fontWeight: variable.isLeaf ? 400 : 600,
                                        whiteSpace: "nowrap",
                                    }, children: variable.path }), _jsx(Typography, { variant: "caption", color: "text.secondary", noWrap: true, sx: { minWidth: 0 }, children: variable.preview })] }) }, variable.path)))] }, origin))))] }));
}
export default TemplateVariablesPanel;
