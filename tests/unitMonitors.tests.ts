/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from "node:assert";
import test from "node:test";

import { getMonitorsFromProperties } from "../src/components/ExecutionUnitViewer";

const unit = { flowchartId: "unit1", repetition: 0, monitorNames: ["convergence_electronic"] };

const property = {
    source: { type: "exabyte", info: { jobId: "job1", unitId: "unit1" } },
    repetition: 0,
    data: { name: "convergence_electronic" },
} as any;

test("resolves monitors when no jobId is supplied", () => {
    assert.deepStrictEqual(getMonitorsFromProperties(unit, [property], undefined), [property.data]);
});

test("still filters by jobId when one is supplied", () => {
    assert.deepStrictEqual(getMonitorsFromProperties(unit, [property], "job1"), [property.data]);
    assert.deepStrictEqual(getMonitorsFromProperties(unit, [property], "other"), []);
});

test("ignores properties of other units, repetitions and names", () => {
    const otherUnit = {
        ...property,
        source: { ...property.source, info: { jobId: "job1", unitId: "unit2" } },
    };
    const otherRep = { ...property, repetition: 1 };
    const notAMonitor = { ...property, data: { name: "band_gaps" } };
    assert.deepStrictEqual(
        getMonitorsFromProperties(unit, [otherUnit, otherRep, notAMonitor], undefined),
        [],
    );
});
