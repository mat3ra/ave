/* eslint-disable @typescript-eslint/no-floating-promises */
import assert from "node:assert";
import test from "node:test";

import { buildExtraTabItems, type ExtraTab } from "../src/utils/extraTabs";

const notebookTab: ExtraTab = {
    id: "notebook",
    itemName: "Notebook",
    href: "/jupyter/job1/unit1/tree/?token=tok123",
};

test("buildExtraTabItems keeps the caller's id, label and destination", () => {
    assert.deepStrictEqual(buildExtraTabItems([notebookTab]), [
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

test("buildExtraTabItems returns no tabs when the unit publishes none", () => {
    assert.deepStrictEqual(buildExtraTabItems(undefined), []);
    assert.deepStrictEqual(buildExtraTabItems([]), []);
});
