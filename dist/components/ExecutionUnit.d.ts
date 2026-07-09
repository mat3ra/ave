import type { ExecutionUnitSchema } from "@mat3ra/esse/dist/js/types";
import { type OrderedMaterial } from "@mat3ra/wode";
import type { AnySubworkflowUnit } from "@mat3ra/wode/dist/js/units/factory";
import React from "react";
export type ExecutionUnitProps = {
    unit: ExecutionUnitSchema;
    renderingContext?: Record<string, unknown>;
    onUpdate: (unit: ExecutionUnitSchema) => void;
    adjustable?: boolean;
    editable?: boolean;
    isStandalone?: boolean;
    materials?: OrderedMaterial[];
    materialsIndex?: number;
    onMaterialSwitch?: (index: number) => void;
    units?: AnySubworkflowUnit[];
};
export declare function ExecutionUnit({ unit, renderingContext, onUpdate, adjustable, editable, isStandalone, materials, materialsIndex, onMaterialSwitch, units, }: ExecutionUnitProps): React.JSX.Element;
//# sourceMappingURL=ExecutionUnit.d.ts.map