import { PropertyName } from "@mat3ra/prode";

/**
 * Pure helpers replacing the old `JupyterExecutionUnitMixin`.
 * Property matching uses {@link PropertyName.jupyter_notebook_endpoint} (same string as
 * `allowedMonitors.jupyterNotebookEndpoint` from `@mat3ra/ade` where that export exists).
 */

/** Matches legacy `JupyterExecutionUnitMixin`: `this.executable.name === "jupyter"`. */
export const JUPYTER_EXECUTABLE_NAME = "jupyter";

export function isJupyterExecutionUnit(unit: { executable: { name: string } }): boolean {
    return unit.executable.name === JUPYTER_EXECUTABLE_NAME;
}

/**
 * Shape of a job-bound property row as used when locating the Jupyter notebook endpoint monitor
 * (legacy `_getPropertiesClient([monitors.jupyterNotebookEndpoint])[0]`).
 */
export type JupyterNotebookEndpointJobProperty = {
    source: { info: { jobId: string; unitId: string } };
    repetition: number;
    data: { name: string; token?: string };
};

export type JupyterNotebookEndpointLocateContext = {
    jobId: string;
    unitFlowchartId: string;
    repetition: number;
};

/**
 * Finds the `jupyter_notebook_endpoint` property for a given job + unit + repetition,
 * mirroring `getJupyterNotebookEndpointMonitorData()` on the old mixin.
 */
export function findJupyterNotebookEndpointProperty<P extends JupyterNotebookEndpointJobProperty>(
    jobProperties: readonly P[] | null | undefined,
    ctx: JupyterNotebookEndpointLocateContext,
): P | undefined {
    if (!jobProperties?.length) {
        return undefined;
    }
    return jobProperties.find((p) => {
        return (
            p.source.info.jobId === ctx.jobId &&
            p.source.info.unitId === ctx.unitFlowchartId &&
            p.repetition === ctx.repetition &&
            p.data.name === PropertyName.jupyter_notebook_endpoint
        );
    });
}

/** Legacy `getJupyterNotebookEndpointURL()` path (tree UI). */
export function buildJupyterNotebookTreeUrl(
    jobId: string,
    unitFlowchartId: string,
    token: string,
): string {
    return `/jupyter/${jobId}/${unitFlowchartId}/tree/?token=${token}`;
}

/** Legacy `getJupyterLabEndpointURL()` path. */
export function buildJupyterLabUrl(jobId: string, unitFlowchartId: string, token: string): string {
    return `/jupyter/${jobId}/${unitFlowchartId}/lab/?token=${token}`;
}

export function getJupyterNotebookEndpointURL(
    jobId: string,
    unitFlowchartId: string,
    monitor: JupyterNotebookEndpointJobProperty | undefined,
): string | undefined {
    const token = monitor?.data.token;
    if (typeof token !== "string" || !token) {
        return undefined;
    }
    return buildJupyterNotebookTreeUrl(jobId, unitFlowchartId, token);
}

export function getJupyterLabEndpointURL(
    jobId: string,
    unitFlowchartId: string,
    monitor: JupyterNotebookEndpointJobProperty | undefined,
): string | undefined {
    const token = monitor?.data.token;
    if (typeof token !== "string" || !token) {
        return undefined;
    }
    return buildJupyterLabUrl(jobId, unitFlowchartId, token);
}

/**
 * Resolves both frontend URLs when the endpoint property exists with a token.
 * Replaces calling `getJupyterNotebookEndpointURL` / `getJupyterLabEndpointURL` on the mixin.
 */
export function resolveJupyterNotebookAndLabUrls(
    jobId: string,
    unitFlowchartId: string,
    repetition: number,
    jobProperties: readonly JupyterNotebookEndpointJobProperty[] | null | undefined,
): { notebookTreeUrl: string; labUrl: string } | undefined {
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
