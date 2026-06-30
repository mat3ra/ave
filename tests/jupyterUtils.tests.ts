/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from "node:assert";
import test from "node:test";

import {
    buildJupyterLabUrl,
    buildJupyterNotebookTreeUrl,
    findJupyterNotebookEndpointProperty,
    getJupyterNotebookEndpointURL,
    isJupyterExecutionUnit,
    JUPYTER_EXECUTABLE_NAME,
    JupyterNotebookEndpointJobProperty,
    resolveJupyterNotebookAndLabUrls,
} from "../src/utils/jupyterExecutionUnit";

// The PropertyName.jupyter_notebook_endpoint enum value resolves to this string.
// We use the string directly because @mat3ra/prode is not installed in ave's node_modules.
const JUPYTER_PROPERTY_NAME = "jupyter_notebook_endpoint";

// ---------------------------------------------------------------------------
// isJupyterExecutionUnit
// ---------------------------------------------------------------------------

test("isJupyterExecutionUnit returns true when executable name is 'jupyter'", () => {
    assert.strictEqual(isJupyterExecutionUnit({ executable: { name: "jupyter" } }), true);
});

test("isJupyterExecutionUnit returns false when executable name is 'vasp'", () => {
    assert.strictEqual(isJupyterExecutionUnit({ executable: { name: "vasp" } }), false);
});

test("isJupyterExecutionUnit uses JUPYTER_EXECUTABLE_NAME constant", () => {
    assert.strictEqual(JUPYTER_EXECUTABLE_NAME, "jupyter");
    assert.strictEqual(isJupyterExecutionUnit({ executable: { name: JUPYTER_EXECUTABLE_NAME } }), true);
});

// ---------------------------------------------------------------------------
// buildJupyterNotebookTreeUrl
// ---------------------------------------------------------------------------

test("buildJupyterNotebookTreeUrl returns correct tree URL", () => {
    const url = buildJupyterNotebookTreeUrl("job1", "unit1", "tok123");
    assert.strictEqual(url, "/jupyter/job1/unit1/tree/?token=tok123");
});

test("buildJupyterNotebookTreeUrl interpolates all arguments", () => {
    const url = buildJupyterNotebookTreeUrl("my-job", "flowchart-abc", "secret-token");
    assert.strictEqual(url, "/jupyter/my-job/flowchart-abc/tree/?token=secret-token");
});

// ---------------------------------------------------------------------------
// buildJupyterLabUrl
// ---------------------------------------------------------------------------

test("buildJupyterLabUrl returns correct lab URL", () => {
    const url = buildJupyterLabUrl("job1", "unit1", "tok123");
    assert.strictEqual(url, "/jupyter/job1/unit1/lab/?token=tok123");
});

test("buildJupyterLabUrl interpolates all arguments", () => {
    const url = buildJupyterLabUrl("my-job", "flowchart-abc", "secret-token");
    assert.strictEqual(url, "/jupyter/my-job/flowchart-abc/lab/?token=secret-token");
});

// ---------------------------------------------------------------------------
// findJupyterNotebookEndpointProperty
// ---------------------------------------------------------------------------

function makeJobProperty(
    jobId: string,
    unitId: string,
    repetition: number,
    token?: string,
): JupyterNotebookEndpointJobProperty {
    return {
        source: { info: { jobId, unitId } },
        repetition,
        data: { name: JUPYTER_PROPERTY_NAME, token },
    };
}

test("findJupyterNotebookEndpointProperty finds matching property", () => {
    const property = makeJobProperty("job1", "unit1", 0, "my-token");
    const result = findJupyterNotebookEndpointProperty([property], {
        jobId: "job1",
        unitFlowchartId: "unit1",
        repetition: 0,
    });
    assert.strictEqual(result, property);
});

test("findJupyterNotebookEndpointProperty returns undefined for non-matching jobId", () => {
    const property = makeJobProperty("job1", "unit1", 0, "my-token");
    const result = findJupyterNotebookEndpointProperty([property], {
        jobId: "job-other",
        unitFlowchartId: "unit1",
        repetition: 0,
    });
    assert.strictEqual(result, undefined);
});

test("findJupyterNotebookEndpointProperty returns undefined for non-matching unitId", () => {
    const property = makeJobProperty("job1", "unit1", 0, "my-token");
    const result = findJupyterNotebookEndpointProperty([property], {
        jobId: "job1",
        unitFlowchartId: "unit-other",
        repetition: 0,
    });
    assert.strictEqual(result, undefined);
});

test("findJupyterNotebookEndpointProperty returns undefined for non-matching repetition", () => {
    const property = makeJobProperty("job1", "unit1", 0, "my-token");
    const result = findJupyterNotebookEndpointProperty([property], {
        jobId: "job1",
        unitFlowchartId: "unit1",
        repetition: 99,
    });
    assert.strictEqual(result, undefined);
});

test("findJupyterNotebookEndpointProperty returns undefined for null input", () => {
    const result = findJupyterNotebookEndpointProperty(null, {
        jobId: "job1",
        unitFlowchartId: "unit1",
        repetition: 0,
    });
    assert.strictEqual(result, undefined);
});

test("findJupyterNotebookEndpointProperty returns undefined for empty array", () => {
    const result = findJupyterNotebookEndpointProperty([], {
        jobId: "job1",
        unitFlowchartId: "unit1",
        repetition: 0,
    });
    assert.strictEqual(result, undefined);
});

// ---------------------------------------------------------------------------
// getJupyterNotebookEndpointURL
// ---------------------------------------------------------------------------

test("getJupyterNotebookEndpointURL returns undefined when monitor is undefined", () => {
    const result = getJupyterNotebookEndpointURL("job1", "unit1", undefined);
    assert.strictEqual(result, undefined);
});

test("getJupyterNotebookEndpointURL returns undefined when monitor has no token", () => {
    const monitor = makeJobProperty("job1", "unit1", 0);
    const result = getJupyterNotebookEndpointURL("job1", "unit1", monitor);
    assert.strictEqual(result, undefined);
});

test("getJupyterNotebookEndpointURL returns tree URL when monitor has token", () => {
    const monitor = makeJobProperty("job1", "unit1", 0, "tok123");
    const result = getJupyterNotebookEndpointURL("job1", "unit1", monitor);
    assert.strictEqual(result, "/jupyter/job1/unit1/tree/?token=tok123");
});

// ---------------------------------------------------------------------------
// resolveJupyterNotebookAndLabUrls
// ---------------------------------------------------------------------------

test("resolveJupyterNotebookAndLabUrls returns undefined when no properties provided", () => {
    const result = resolveJupyterNotebookAndLabUrls("job1", "unit1", 0, null);
    assert.strictEqual(result, undefined);
});

test("resolveJupyterNotebookAndLabUrls returns undefined when no matching property", () => {
    const property = makeJobProperty("job2", "unit2", 0, "tok");
    const result = resolveJupyterNotebookAndLabUrls("job1", "unit1", 0, [property]);
    assert.strictEqual(result, undefined);
});

test("resolveJupyterNotebookAndLabUrls returns both URLs when property with token exists", () => {
    const property = makeJobProperty("job1", "unit1", 0, "tok123");
    const result = resolveJupyterNotebookAndLabUrls("job1", "unit1", 0, [property]);
    assert.ok(result, "result should not be undefined");
    assert.strictEqual(result.notebookTreeUrl, "/jupyter/job1/unit1/tree/?token=tok123");
    assert.strictEqual(result.labUrl, "/jupyter/job1/unit1/lab/?token=tok123");
});

test("resolveJupyterNotebookAndLabUrls returns undefined when property exists but has no token", () => {
    const property = makeJobProperty("job1", "unit1", 0);
    const result = resolveJupyterNotebookAndLabUrls("job1", "unit1", 0, [property]);
    assert.strictEqual(result, undefined);
});
