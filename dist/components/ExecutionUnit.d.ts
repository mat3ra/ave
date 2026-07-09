import { type NameResultSchema } from "@mat3ra/code/dist/js/utils/object";
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
    /** Injected component for unit flow pointer fields (e.g. "next" unit selector). */
    UnitPointerFieldComponent?: React.ComponentType<{
        label: string;
        selectedValue: string;
        availableUnits: AnySubworkflowUnit[];
        onChange: (value: string) => void;
    }>;
    /** Injected component for unit details (results, monitors, post-processors). */
    UnitDetailsComponent?: React.ComponentType<{
        unit: ExecutionUnitSchema;
        editable?: boolean;
        onUnitResultsChanged: (results: NameResultSchema[]) => void;
        onUnitIsDraftChanged: (isDraft: boolean) => void;
        onUnitMonitorChanged: (monitor: string, enabled: boolean) => void;
        onUnitPostProcessorChanged: (postProcessor: string, enabled: boolean) => void;
    }>;
};
export declare function ExecutionUnit({ unit, renderingContext, onUpdate, adjustable, editable, isStandalone, materials, materialsIndex, onMaterialSwitch, units, UnitPointerFieldComponent, UnitDetailsComponent, }: ExecutionUnitProps): React.JSX.Element;
//# sourceMappingURL=ExecutionUnit.d.ts.map