import React from "react";
export interface TemplateVariablesPanelProps {
    renderingContext?: Record<string, unknown>;
    /** Host-supplied labels for top-level context keys; see `describeOrigin`. */
    originOverrides?: Record<string, string>;
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
export declare function TemplateVariablesPanel({ renderingContext, originOverrides, }: TemplateVariablesPanelProps): React.JSX.Element;
export default TemplateVariablesPanel;
