/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from "node:assert";
import test from "node:test";

import { buildEndpointTabItems, type UnitEndpoint } from "../src/utils/unitEndpoints";

const notebookEndpoint: UnitEndpoint = {
    id: "notebook",
    label: "Notebook",
    url: "/jupyter/job1/unit1/tree/?token=tok123",
};

test("buildEndpointTabItems presents an endpoint as an outbound tab", () => {
    assert.deepStrictEqual(buildEndpointTabItems([notebookEndpoint]), [
        {
            id: "notebook",
            className: "",
            itemName: "Notebook",
            href: "/jupyter/job1/unit1/tree/?token=tok123",
            target: "_blank",
            iconCls: "pages.externalLink",
        },
    ]);
});

test("buildEndpointTabItems returns no tabs when the unit serves none", () => {
    assert.deepStrictEqual(buildEndpointTabItems(undefined), []);
    assert.deepStrictEqual(buildEndpointTabItems([]), []);
});
