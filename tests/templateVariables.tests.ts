/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from "node:assert";
import test from "node:test";

import {
    collectLocalNames,
    describeOrigin,
    extractPaths,
    findUnresolvedVariables,
    flattenRenderingContext,
    resolvePath,
    suggestName,
} from "../src/utils/templateVariables";

/** Shaped like a real execution unit's context: provider data, then the external context. */
const CONTEXT = {
    cutoffs: { wavefunction: 40, density: 200 },
    kgrid: { dimensions: [2, 2, 2], shifts: [0, 0, 0] },
    input: { IBRAV: 0, NAT: 2, RESTART_MODE: "from_scratch" },
    material: Object.assign(Object.create({ name: "Si" }), { _json: {} }),
    materials: [{}],
    application: { name: "espresso", version: "6.3" },
    subworkflowContext: {},
};

test("origins name where a variable came from", () => {
    assert.strictEqual(describeOrigin("material"), "From the material");
    assert.strictEqual(describeOrigin("subworkflowContext"), "Set at job runtime");
    // Not in the external-context table, so wode put it there from a context provider.
    assert.strictEqual(describeOrigin("cutoffs"), "Important settings");
    assert.strictEqual(describeOrigin("kgrid"), "Important settings");
    assert.strictEqual(describeOrigin("cutoffs", { cutoffs: "Custom" }), "Custom");
    // The external context carries more than the material: these came through the subworkflow,
    // not through a provider, and mislabelling them sends people to the wrong tab.
    assert.strictEqual(describeOrigin("materialsSet"), "From the material");
    assert.strictEqual(describeOrigin("jobHasParent"), "From the workflow");
});

test("the context flattens to writable dotted paths", () => {
    const variables = flattenRenderingContext(CONTEXT);
    const paths = variables.map((variable) => variable.path);
    assert.ok(paths.includes("cutoffs"));
    assert.ok(paths.includes("cutoffs.wavefunction"));
    assert.ok(paths.includes("input.RESTART_MODE"));
    const wavefunction = variables.find((variable) => variable.path === "cutoffs.wavefunction");
    assert.strictEqual(wavefunction?.preview, "40");
    assert.strictEqual(wavefunction?.origin, "Important settings");
    assert.strictEqual(wavefunction?.isLeaf, true);
});

test("containers are listed but marked, and arrays report their size", () => {
    const variables = flattenRenderingContext(CONTEXT);
    const cutoffs = variables.find((variable) => variable.path === "cutoffs");
    assert.strictEqual(cutoffs?.isLeaf, false);
    const dimensions = variables.find((variable) => variable.path === "kgrid.dimensions");
    assert.strictEqual(dimensions?.preview, "[3 items]");
});

test("entity instances are one row, not walked", () => {
    const paths = flattenRenderingContext(CONTEXT).map((variable) => variable.path);
    assert.ok(paths.includes("material"));
    assert.ok(!paths.some((path) => path.startsWith("material.")));
});

test("flattening is bounded by depth and count", () => {
    const deep = { a: { b: { c: { d: { e: 1 } } } } };
    const paths = flattenRenderingContext(deep, { maxDepth: 2 }).map((v) => v.path);
    assert.deepStrictEqual(paths, ["a", "a.b"]);
    const wide = Object.fromEntries(Array.from({ length: 50 }, (_v, i) => [`k${i}`, i]));
    assert.strictEqual(flattenRenderingContext(wide, { maxVariables: 10 }).length, 10);
});

test("an absent context yields nothing rather than throwing", () => {
    assert.deepStrictEqual(flattenRenderingContext(undefined), []);
});

test("paths are extracted from an expression, skipping literals and filters", () => {
    assert.deepStrictEqual(extractPaths(" input.RESTART_MODE "), ["input.RESTART_MODE"]);
    assert.deepStrictEqual(extractPaths(" cutoffs.wavefunction | round "), [
        "cutoffs.wavefunction",
    ]);
    assert.deepStrictEqual(extractPaths(' "a literal" '), []);
    assert.deepStrictEqual(extractPaths(" a + b "), ["a", "b"]);
});

test("a dynamic index contributes the container and the index separately", () => {
    assert.deepStrictEqual(extractPaths("input.perMaterial[subworkflowContext.MATERIAL_INDEX]"), [
        "input.perMaterial",
        "subworkflowContext.MATERIAL_INDEX",
    ]);
});

test("a called name is not a context path, but the receiver still is", () => {
    assert.deepStrictEqual(extractPaths(" range(3) "), []);
    // `material` has to resolve for the call to work; `getName` is a method, not context data.
    assert.deepStrictEqual(extractPaths(" material.getName() "), ["material"]);
    assert.deepStrictEqual(extractPaths(" loop.index "), []);
});

test("names the template binds itself are collected", () => {
    const names = collectLocalNames(
        "{%- set input = input.perMaterial[0] -%}{% for name, value in items %}{% macro row(x) %}",
    );
    assert.ok(names.has("input"));
    assert.ok(names.has("name"));
    assert.ok(names.has("value"));
    assert.ok(names.has("row"));
});

test("resolution walks plain data and gives up at an entity instance", () => {
    assert.strictEqual(resolvePath(CONTEXT, "cutoffs.wavefunction").resolved, true);
    // `material` is a class instance: unverifiable, so not reported as missing.
    assert.strictEqual(resolvePath(CONTEXT, "material.name").resolved, true);
    const missing = resolvePath(CONTEXT, "cutoffs.wavefunctionn");
    assert.strictEqual(missing.resolved, false);
    assert.strictEqual(missing.missing, "cutoffs.wavefunctionn");
    assert.deepStrictEqual(missing.available, ["wavefunction", "density"]);
});

test("suggestions are offered only when a name is genuinely close", () => {
    assert.strictEqual(suggestName("wavefunctionn", ["wavefunction", "density"]), "wavefunction");
    assert.strictEqual(suggestName("cutofs", ["cutoffs", "kgrid"]), "cutoffs");
    assert.strictEqual(suggestName("totallyUnrelated", ["cutoffs", "kgrid"]), undefined);
    // Short names need an exact-ish match, or every three-letter typo suggests every other one.
    assert.strictEqual(suggestName("abc", ["xyz"]), undefined);
});

test("a typo'd variable is reported with its line and a suggestion", () => {
    const template = ["&SYSTEM", "  ecutwfc = {{ cutoffs.wavefunctionn }}", "/"].join("\n");
    const [issue, ...rest] = findUnresolvedVariables(template, CONTEXT);
    assert.strictEqual(rest.length, 0);
    assert.strictEqual(issue.line, 2);
    assert.strictEqual(issue.name, "cutoffs.wavefunctionn");
    assert.strictEqual(issue.suggestion, "cutoffs.wavefunction");
    assert.strictEqual(issue.expression, "cutoffs.wavefunctionn");
});

test("a valid template reports nothing", () => {
    const template = [
        "{% if subworkflowContext.MATERIAL_INDEX %}",
        "{%- set input = input.perMaterial[subworkflowContext.MATERIAL_INDEX] -%}",
        "{% endif -%}",
        "  ecutwfc = {{ cutoffs.wavefunction }}",
        "  ecutrho = {{ cutoffs.density }}",
        "  ibrav = {{ input.IBRAV }}",
        "  nat = {{ input.NAT }}",
    ].join("\n");
    assert.deepStrictEqual(findUnresolvedVariables(template, CONTEXT), []);
});

test("job-runtime placeholders inside raw blocks are left alone", () => {
    const template = "outdir = {% raw %}'{{ JOB_WORK_DIR }}/outdir'{% endraw %}";
    assert.deepStrictEqual(findUnresolvedVariables(template, CONTEXT), []);
});

test("raw blocks do not shift the line numbers of what follows", () => {
    const template = ["{% raw %}", "{{ JOB_WORK_DIR }}", "{% endraw %}", "{{ nowhere }}"].join(
        "\n",
    );
    const [issue] = findUnresolvedVariables(template, CONTEXT);
    assert.strictEqual(issue.line, 4);
    assert.strictEqual(issue.name, "nowhere");
});

test("an {% if %} test for an absent value is not an issue", () => {
    const template = "{% if subworkflowContext.NOT_SET %}x{% endif %}";
    assert.deepStrictEqual(findUnresolvedVariables(template, CONTEXT), []);
});

test("the same miss on one line is reported once", () => {
    const template = "{{ nope }} and {{ nope }}";
    assert.strictEqual(findUnresolvedVariables(template, CONTEXT).length, 1);
});

test("an unknown root is reported without inventing a suggestion", () => {
    const [issue] = findUnresolvedVariables("{{ somethingEntirelyElse.x }}", CONTEXT);
    assert.strictEqual(issue.name, "somethingEntirelyElse");
    assert.strictEqual(issue.suggestion, undefined);
});

test("no template or no context means no claims either way", () => {
    assert.deepStrictEqual(findUnresolvedVariables(undefined, CONTEXT), []);
    assert.deepStrictEqual(findUnresolvedVariables("{{ nope }}", undefined), []);
});
