/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from "node:assert";
import test from "node:test";

import { isJupyterExecutionUnit, JUPYTER_EXECUTABLE_NAME } from "../src/utils/jupyterExecutionUnit";

test("isJupyterExecutionUnit returns true when executable name is 'jupyter'", () => {
    assert.strictEqual(isJupyterExecutionUnit({ executable: { name: "jupyter" } }), true);
});

test("isJupyterExecutionUnit returns false when executable name is 'vasp'", () => {
    assert.strictEqual(isJupyterExecutionUnit({ executable: { name: "vasp" } }), false);
});

test("isJupyterExecutionUnit uses JUPYTER_EXECUTABLE_NAME constant", () => {
    assert.strictEqual(JUPYTER_EXECUTABLE_NAME, "jupyter");
    assert.strictEqual(
        isJupyterExecutionUnit({ executable: { name: JUPYTER_EXECUTABLE_NAME } }),
        true,
    );
});
