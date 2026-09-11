import type { TabItem } from "@mat3ra/cove/dist/mui/components/tabs/types";

/** Structural match for `UnitEndpoint` from @mat3ra/jode, so ave need not depend on it. */
export type UnitEndpoint = {
    id: string;
    label: string;
    url: string;
};

/**
 * Presents endpoints as outbound tabs. Ids must not collide with the viewer's own tabs —
 * `input`, `output`, `charts` — since the active tab is resolved by first match on id.
 */
export function buildEndpointTabItems(endpoints: readonly UnitEndpoint[] | undefined): TabItem[] {
    return (endpoints ?? []).map((endpoint) => ({
        id: endpoint.id,
        className: "",
        itemName: endpoint.label,
        href: endpoint.url,
        target: "_blank",
        iconCls: "pages.externalLink",
    }));
}
