import type { ApplicationSchema, ExecutableSchema, ExecutionUnitSchema, FlavorSchema } from "@mat3ra/esse/dist/js/types";
import React from "react";
export type ApplicationProps = {
    onApplicationUpdate?: (application: ApplicationSchema) => void;
    onExecutableUpdate?: (executable: ExecutableSchema, flavor: FlavorSchema) => void;
    onFlavorUpdate?: (flavor: FlavorSchema) => void;
    showExec?: boolean;
    className?: string | null;
    application: ApplicationSchema;
    editable?: boolean;
    executable?: ExecutionUnitSchema["executable"];
    isExecEditable?: boolean;
    showFlavor?: boolean;
    flavor?: FlavorSchema | null;
    isFlavorEditable?: boolean;
};
export declare function Application({ onApplicationUpdate, onExecutableUpdate, onFlavorUpdate, showExec, className: propsClassName, application, editable, executable, isExecEditable, showFlavor, flavor, isFlavorEditable, }: ApplicationProps): React.JSX.Element;
//# sourceMappingURL=Application.d.ts.map