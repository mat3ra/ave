import React from "react";
import { type JupyterNotebookEndpointJobProperty } from "../utils/jupyterExecutionUnit";
/** Job-bound property rows (convergence + Jupyter endpoint share this envelope). */
type JobPropertyForMonitors = JupyterNotebookEndpointJobProperty;
export type ExecutionUnitViewerProps = {
    unit: any;
    onOutputUpdateRequest: (flowchartId: string, skip: number, limit: number) => void;
    jobProperties: readonly JobPropertyForMonitors[];
    /** Current job ID; used for Jupyter URL resolution and monitor filtering. Pass from route context in webapp; omit in standalone. */
    jobId?: string;
    /** Injected component for rendering convergence charts. */
    ConvergencesListComponent?: React.ComponentType<{
        monitors: {
            name: string;
        }[];
        idPrefix: string;
        idGenerator: () => string;
    }>;
};
export declare function ExecutionUnitViewer(props: ExecutionUnitViewerProps): React.JSX.Element;
export {};
//# sourceMappingURL=ExecutionUnitViewer.d.ts.map