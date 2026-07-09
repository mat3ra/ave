import { PropertyFactory } from "@mat3ra/prode";

let convergencePropertyNamesCache: ReadonlySet<string> | undefined;

function getConvergencePropertyNameSet(): ReadonlySet<string> {
    if (!convergencePropertyNamesCache) {
        convergencePropertyNamesCache = new Set(
            PropertyFactory.getConvergencePropertyNames().map((name) => String(name)),
        );
    }
    return convergencePropertyNamesCache;
}

/**
 * Whether the execution unit has at least one monitor whose name is a convergence property
 * (legacy `hasConvergenceMonitor` getter using `PropertyFactory.getConvergencePropertyNames()`).
 */
export function executionUnitHasConvergenceMonitor(unit: {
    monitors: readonly { name?: string | null }[];
}): boolean {
    const convergenceNames = getConvergencePropertyNameSet();
    const monitors = Array.isArray(unit.monitors) ? unit.monitors : [];
    return monitors.some(({ name }) => {
        return name != null && name !== "" && convergenceNames.has(name);
    });
}
