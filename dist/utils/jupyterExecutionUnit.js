import { PropertyName } from "@mat3ra/prode";
/**
 * Pure helpers replacing the old `JupyterExecutionUnitMixin`.
 * Property matching uses {@link PropertyName.jupyter_notebook_endpoint} (same string as
 * `allowedMonitors.jupyterNotebookEndpoint` from `@mat3ra/ade` where that export exists).
 */
/** Matches legacy `JupyterExecutionUnitMixin`: `this.executable.name === "jupyter"`. */
export const JUPYTER_EXECUTABLE_NAME = "jupyter";
export function isJupyterExecutionUnit(unit) {
    return unit.executable.name === JUPYTER_EXECUTABLE_NAME;
}
/**
 * Finds the `jupyter_notebook_endpoint` property for a given job + unit + repetition,
 * mirroring `getJupyterNotebookEndpointMonitorData()` on the old mixin.
 */
export function findJupyterNotebookEndpointProperty(jobProperties, ctx) {
    if (!(jobProperties === null || jobProperties === void 0 ? void 0 : jobProperties.length)) {
        return undefined;
    }
    return jobProperties.find((p) => {
        return (p.source.info.jobId === ctx.jobId &&
            p.source.info.unitId === ctx.unitFlowchartId &&
            p.repetition === ctx.repetition &&
            p.data.name === PropertyName.jupyter_notebook_endpoint);
    });
}
/** Legacy `getJupyterNotebookEndpointURL()` path (tree UI). */
export function buildJupyterNotebookTreeUrl(jobId, unitFlowchartId, token) {
    return `/jupyter/${jobId}/${unitFlowchartId}/tree/?token=${token}`;
}
/** Legacy `getJupyterLabEndpointURL()` path. */
export function buildJupyterLabUrl(jobId, unitFlowchartId, token) {
    return `/jupyter/${jobId}/${unitFlowchartId}/lab/?token=${token}`;
}
export function getJupyterNotebookEndpointURL(jobId, unitFlowchartId, monitor) {
    const token = monitor === null || monitor === void 0 ? void 0 : monitor.data.token;
    if (typeof token !== "string" || !token) {
        return undefined;
    }
    return buildJupyterNotebookTreeUrl(jobId, unitFlowchartId, token);
}
export function getJupyterLabEndpointURL(jobId, unitFlowchartId, monitor) {
    const token = monitor === null || monitor === void 0 ? void 0 : monitor.data.token;
    if (typeof token !== "string" || !token) {
        return undefined;
    }
    return buildJupyterLabUrl(jobId, unitFlowchartId, token);
}
/**
 * Resolves both frontend URLs when the endpoint property exists with a token.
 * Replaces calling `getJupyterNotebookEndpointURL` / `getJupyterLabEndpointURL` on the mixin.
 */
export function resolveJupyterNotebookAndLabUrls(jobId, unitFlowchartId, repetition, jobProperties) {
    const monitor = findJupyterNotebookEndpointProperty(jobProperties, {
        jobId,
        unitFlowchartId,
        repetition,
    });
    const notebookTreeUrl = getJupyterNotebookEndpointURL(jobId, unitFlowchartId, monitor);
    const labUrl = getJupyterLabEndpointURL(jobId, unitFlowchartId, monitor);
    if (!notebookTreeUrl || !labUrl) {
        return undefined;
    }
    return { notebookTreeUrl, labUrl };
}
