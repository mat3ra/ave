import type { TabItem } from "@mat3ra/cove/dist/mui/components/tabs/types";

/**
 * An endpoint a unit serves while it runs, as the job domain states it: a name and a location.
 * Structural, so it matches `UnitEndpoint` from @mat3ra/jode without ave depending on the job
 * domain — and deliberately free of view vocabulary, because deciding what an endpoint *looks*
 * like is this package's job, not the producer's.
 */
export type UnitEndpoint = {
    /** Stable identifier, unique within a unit. */
    id: string;
    /** Human-readable name of the endpoint. */
    label: string;
    /** Where it lives, relative to the platform origin. */
    url: string;
};

/**
 * Turns unit endpoints into viewer tabs. This is the whole of what ave decides about them: that
 * an endpoint is shown as a tab, that it leaves the application, and how it is marked. The
 * identifier must not collide with the viewer's own tabs — `input`, `output`, `charts` — because
 * the active tab is resolved by first match on id.
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
