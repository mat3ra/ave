import type { ApplicationSchema } from "@mat3ra/esse/dist/js/types";

export function getDefaultApplicationByName(
    applications: readonly ApplicationSchema[],
    name: string,
): ApplicationSchema | undefined {
    const matchingApps = applications.filter((app) => app.name === name);
    if (!matchingApps.length) return undefined;

    return (
        // default version + default build present
        matchingApps.find((app) => app.isDefaultVersion && app.isDefault) ||
        // default version present, isDefault missing/false
        matchingApps.find((app) => app.isDefaultVersion) ||
        // isDefault present, isDefaultVersion missing/false
        matchingApps.find((app) => app.isDefault) ||
        // fallback to first application entry
        matchingApps[0]
    );
}

export function getApplicationByVersion(
    applications: readonly ApplicationSchema[],
    name: string,
    version: string,
): ApplicationSchema | undefined {
    const versionApps = applications.filter((app) => app.name === name && app.version === version);
    if (!versionApps.length) return undefined;
    // prefer the default build, fallback to the first build
    return versionApps.find((app) => app.isDefault) || versionApps[0];
}

export function getApplicationByBuild(
    applications: readonly ApplicationSchema[],
    name: string,
    version: string,
    build: string,
): ApplicationSchema | undefined {
    return applications.find(
        (app) => app.name === name && app.version === version && app.build === build,
    );
}
