/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from "node:assert";
import test from "node:test";
import type { ApplicationSchema } from "@mat3ra/esse/dist/js/types";
import {
    getApplicationByBuild,
    getApplicationByVersion,
    getDefaultApplicationByName,
} from "../src/utils/applicationSelection";

test("getDefaultApplicationByName: picks default build of default version", () => {
    const mockApps = [
        { name: "espresso", version: "6.1", build: "GNU", isDefaultVersion: false, isDefault: false },
        { name: "espresso", version: "6.3", build: "Intel", isDefaultVersion: true, isDefault: false },
        { name: "espresso", version: "6.3", build: "GNU", isDefaultVersion: true, isDefault: true },
    ] as ApplicationSchema[];

    const result = getDefaultApplicationByName(mockApps, "espresso");
    assert.strictEqual(result?.version, "6.3");
    assert.strictEqual(result?.build, "GNU");
});

test("getApplicationByVersion: prioritizes default build for chosen version", () => {
    const mockApps = [
        { name: "espresso", version: "6.3", build: "Intel", isDefault: false },
        { name: "espresso", version: "6.3", build: "GNU", isDefault: true },
    ] as ApplicationSchema[];

    const result = getApplicationByVersion(mockApps, "espresso", "6.3");
    assert.strictEqual(result?.build, "GNU");
});

test("getApplicationByBuild: returns exact build match", () => {
    const mockApps = [
        { name: "espresso", version: "6.3", build: "Intel" },
        { name: "espresso", version: "6.3", build: "GNU" },
    ] as ApplicationSchema[];

    const result = getApplicationByBuild(mockApps, "espresso", "6.3", "GNU");
    assert.strictEqual(result?.build, "GNU");
});
