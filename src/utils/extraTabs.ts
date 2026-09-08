import type { TabItem } from "@mat3ra/cove/dist/mui/components/tabs/types";

/**
 * A tab contributed by whoever renders a unit viewer: what it means, not how it looks. Derived
 * from the `TabItem` the viewer actually builds, so the two cannot drift; structural, so it
 * matches `ExtraTab` from @mat3ra/jode without ave depending on the job domain.
 *
 * `id` must not be one of the viewer's own tabs — `input`, `output`, `charts` — because the
 * active tab is resolved by first match on id.
 */
export type ExtraTab = Required<Pick<TabItem, "id" | "itemName" | "href">>;

/**
 * Dresses caller-supplied tabs as viewer tabs. These leave the application rather than switching
 * an inner panel, which is the whole of what ave decides about them — the label and destination
 * are the caller's.
 */
export function buildExtraTabItems(extraTabs: readonly ExtraTab[] | undefined): TabItem[] {
    return (extraTabs ?? []).map((tab) => ({
        id: tab.id,
        className: "",
        itemName: tab.itemName,
        href: tab.href,
        target: "_blank",
        iconCls: "pages.externalLink",
    }));
}
