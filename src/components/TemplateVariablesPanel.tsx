import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import React, { useMemo, useState } from "react";

import { type ContextVariable, flattenRenderingContext } from "../utils/templateVariables";

export interface TemplateVariablesPanelProps {
    renderingContext?: Record<string, unknown>;
    /** Host-supplied labels for top-level context keys; see `describeOrigin`. */
    originOverrides?: Record<string, string>;
}

/** "renders with: Si … · espresso", from the context itself rather than a separate prop. */
function describeRenderTarget(context?: Record<string, unknown>): string {
    const read = (key: string) => {
        const value = (context?.[key] ?? {}) as { name?: unknown };
        return typeof value?.name === "string" ? value.name : undefined;
    };
    return [read("material"), read("application")].filter(Boolean).join(" · ");
}

function groupByOrigin(variables: ContextVariable[]): [string, ContextVariable[]][] {
    const groups = new Map<string, ContextVariable[]>();
    variables.forEach((variable) => {
        const bucket = groups.get(variable.origin);
        if (bucket) bucket.push(variable);
        else groups.set(variable.origin, [variable]);
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
export function TemplateVariablesPanel({
    renderingContext,
    originOverrides,
}: TemplateVariablesPanelProps) {
    const [search, setSearch] = useState("");
    const [copied, setCopied] = useState<string | null>(null);

    const variables = useMemo(
        () => flattenRenderingContext(renderingContext, { originOverrides }),
        [renderingContext, originOverrides],
    );

    const needle = search.trim().toLowerCase();
    const visible = needle
        ? variables.filter(
              (variable) =>
                  variable.path.toLowerCase().includes(needle) ||
                  variable.preview.toLowerCase().includes(needle),
          )
        : variables;

    const copy = (path: string) => {
        const expression = `{{ ${path} }}`;
        navigator.clipboard?.writeText(expression).catch(() => undefined);
        setCopied(path);
        // Fire-and-forget; the panel only needs the label to settle back.
        setTimeout(() => setCopied((current) => (current === path ? null : current)), 1200);
    };

    const renderTarget = describeRenderTarget(renderingContext);

    return (
        <Stack spacing={1.5} sx={{ p: 1.5 }} data-tid="template-variables-panel">
            {renderTarget ? (
                <Typography variant="caption" color="text.secondary">
                    renders with: {renderTarget}
                </Typography>
            ) : null}

            <TextField
                size="small"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search variables"
                InputProps={{
                    startAdornment: <InputAdornment position="start">⌕</InputAdornment>,
                    inputProps: { "data-tid": "template-variables-search" },
                }}
            />

            {visible.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                    {variables.length === 0
                        ? "No context to render this template with yet."
                        : `Nothing matches “${search}”.`}
                </Typography>
            ) : (
                groupByOrigin(visible).map(([origin, rows]) => (
                    <Box key={origin}>
                        <Typography variant="overline" color="text.secondary">
                            {origin}
                        </Typography>
                        {rows.map((variable) => (
                            <Tooltip
                                key={variable.path}
                                title={
                                    copied === variable.path
                                        ? "Copied"
                                        : `Copy {{ ${variable.path} }}`
                                }
                            >
                                <Box
                                    onClick={() => copy(variable.path)}
                                    data-tid={`template-variable-${variable.path}`}
                                    sx={{
                                        display: "flex",
                                        gap: 1,
                                        alignItems: "baseline",
                                        px: 0.75,
                                        py: 0.25,
                                        borderRadius: 0.5,
                                        cursor: "pointer",
                                        "&:hover": { backgroundColor: "action.hover" },
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            fontFamily: "monospace",
                                            fontWeight: variable.isLeaf ? 400 : 600,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {variable.path}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        noWrap
                                        sx={{ minWidth: 0 }}
                                    >
                                        {variable.preview}
                                    </Typography>
                                </Box>
                            </Tooltip>
                        ))}
                    </Box>
                ))
            )}
        </Stack>
    );
}

export default TemplateVariablesPanel;
