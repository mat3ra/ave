/**
 * Pure helpers replacing the old `JupyterExecutionUnitMixin`.
 * Property matching uses {@link PropertyName.jupyter_notebook_endpoint} (same string as
 * `allowedMonitors.jupyterNotebookEndpoint` from `@mat3ra/ade` where that export exists).
 */
/** Matches legacy `JupyterExecutionUnitMixin`: `this.executable.name === "jupyter"`. */
export declare const JUPYTER_EXECUTABLE_NAME = "jupyter";
export declare function isJupyterExecutionUnit(unit: {
    executable: {
        name: string;
    };
}): boolean;
/**
 * Shape of a job-bound property row as used when locating the Jupyter notebook endpoint monitor
 * (legacy `_getPropertiesClient([monitors.jupyterNotebookEndpoint])[0]`).
 */
export type JupyterNotebookEndpointJobProperty = {
    source: {
        info: {
            jobId: string;
            unitId: string;
        };
    };
    repetition: number;
    data: {
        name: string;
        token?: string;
    };
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
export declare function findJupyterNotebookEndpointProperty<P extends JupyterNotebookEndpointJobProperty>(jobProperties: readonly P[] | null | undefined, ctx: JupyterNotebookEndpointLocateContext): P | undefined;
/** Legacy `getJupyterNotebookEndpointURL()` path (tree UI). */
export declare function buildJupyterNotebookTreeUrl(jobId: string, unitFlowchartId: string, token: string): string;
/** Legacy `getJupyterLabEndpointURL()` path. */
export declare function buildJupyterLabUrl(jobId: string, unitFlowchartId: string, token: string): string;
export declare function getJupyterNotebookEndpointURL(jobId: string, unitFlowchartId: string, monitor: JupyterNotebookEndpointJobProperty | undefined): string | undefined;
export declare function getJupyterLabEndpointURL(jobId: string, unitFlowchartId: string, monitor: JupyterNotebookEndpointJobProperty | undefined): string | undefined;
/**
 * Resolves both frontend URLs when the endpoint property exists with a token.
 * Replaces calling `getJupyterNotebookEndpointURL` / `getJupyterLabEndpointURL` on the mixin.
 */
export declare function resolveJupyterNotebookAndLabUrls(jobId: string, unitFlowchartId: string, repetition: number, jobProperties: readonly JupyterNotebookEndpointJobProperty[] | null | undefined): {
    notebookTreeUrl: string;
    labUrl: string;
} | undefined;
//# sourceMappingURL=jupyterExecutionUnit.d.ts.map