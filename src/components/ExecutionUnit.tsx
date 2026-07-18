import Accordion from "@mat3ra/cove/dist/mui/components/accordion";
const AccordionComponent = Accordion as any;
import { refreshCodeMirror } from "@mat3ra/code/dist/js/utils";
import { renderTextWithSubstitutes } from "@mat3ra/code/dist/js/utils/str";
import { type NameResultSchema, safeMakeObject } from "@mat3ra/code/dist/js/utils/object";
import type { ExecutionUnitSchema, RuntimeItemSchema } from "@mat3ra/esse/dist/js/types";
import { type OrderedMaterial, ExecutionUnit as ExecutionUnitEntity } from "@mat3ra/wode";
import type { AnySubworkflowUnit } from "@mat3ra/wode/dist/js/units/factory";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Radio from "@mui/material/Radio";
import Stack from "@mui/material/Stack";
import React, { useCallback, useEffect, useState } from "react";

import { Application } from "./Application";
import {
    type ExecutionUnitInput,
    ExecutionUnitInputFilePanel,
} from "./ExecutionUnitInputFilePanel";
import {
    DrawerContainer,
    DrawerContent,
    DrawerControl,
    DrawerControlPanel,
    MainContent,
    SideDrawer,
} from "./SideDrawer";

import TabsMenu from "@mat3ra/cove/dist/mui/components/tabs/TabsMenu";
import type { ExecutableSchema, FlavorSchema } from "@mat3ra/esse/dist/js/types";


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

const unitPointerKeys = ["next"] as const;

function runtimeItemToNameResult(item: RuntimeItemSchema): NameResultSchema {
    return typeof item === "string" ? safeMakeObject(item) : (item as NameResultSchema);
}

export function ExecutionUnit({
    unit,
    renderingContext,
    onUpdate,
    adjustable,
    editable = true,
    isStandalone,
    materials = [],
    materialsIndex,
    onMaterialSwitch,
    units = [],
    UnitPointerFieldComponent,
    UnitDetailsComponent,
}: ExecutionUnitProps) {
    const [drawerContent, setDrawerContent] = useState<"context" | "materialList">("context");
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [lineWrapping] = useState(true);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [executionFileActiveTabIndex, setExecutionFileActiveTabIndex] = useState(0);

    const availableUnits = useCallback(() => {
        return units.filter((u) => u.flowchartId !== unit.flowchartId);
    }, [units, unit]);

    const onExecutableUpdate = useCallback(
        (executable: ExecutableSchema, flavor: FlavorSchema) => {
            const unitInstance = new ExecutionUnitEntity(unit);
            unitInstance.setExecutable({
                executableName: executable.name,
                flavorName: flavor.name,
            });
            onUpdate(unitInstance.toJSON());
        },
        [unit, onUpdate],
    );

    const onFlavorUpdate = useCallback(
        (flavor: FlavorSchema) => {
            const unitInstance = new ExecutionUnitEntity(unit);
            unitInstance.setFlavor(flavor.name);
            onUpdate(unitInstance.toJSON());
        },
        [unit, onUpdate],
    );

    const onUnitInputContentUpdate = useCallback(
        (index: number, content: string) => {
            onUpdate({
                ...unit,
                input: unit.input.map((row, i) =>
                    i === index
                        ? {
                              ...row,
                              template: { ...row.template, content },
                              isManuallyChanged: true,
                          }
                        : row,
                ),
            });
        },
        [unit, onUpdate],
    );

    const onUnitInputNameUpdate = useCallback(
        (index: number, name: string) => {
            onUpdate({
                ...unit,
                input: unit.input.map((row, i) =>
                    i === index
                        ? {
                              ...row,
                              template: { ...row.template, name },
                          }
                        : row,
                ),
            });
        },
        [unit, onUpdate],
    );

    const onUnitInputRenderedUpdate = useCallback(
        (index: number, content: string) => {
            onUpdate({
                ...unit,
                input: unit.input.map((row, i) =>
                    i === index
                        ? {
                              ...row,
                              rendered: content,
                              isManuallyChanged: true,
                          }
                        : row,
                ),
            });
        },
        [unit, onUpdate],
    );

    const onUnitIsDraftChanged = useCallback(
        (isDraft: boolean) => {
            onUpdate({ ...unit, isDraft });
        },
        [unit, onUpdate],
    );

    const onUnitResultsChanged = useCallback(
        (results: NameResultSchema[]) => {
            const unitInstance = new ExecutionUnitEntity(unit);
            unitInstance.results = results.map(safeMakeObject);
            onUpdate(unitInstance.toJSON());
        },
        [unit, onUpdate],
    );

    const onUnitMonitorChanged = useCallback(
        (monitor: string, enabled: boolean) => {
            const unitInstance = new ExecutionUnitEntity(unit);
            unitInstance.toggleMonitor(runtimeItemToNameResult(monitor), enabled);
            onUpdate(unitInstance.toJSON());
        },
        [unit, onUpdate],
    );

    const onUnitPostProcessorChanged = useCallback(
        (postProcessor: string, enabled: boolean) => {
            const unitInstance = new ExecutionUnitEntity(unit);
            unitInstance.togglePostProcessor(runtimeItemToNameResult(postProcessor), enabled);
            onUpdate(unitInstance.toJSON());
        },
        [unit, onUpdate],
    );

    const onPreviewClick = useCallback(
        (tabId: string, inputIndex: number) => {
            refreshCodeMirror(tabId);
            if (!renderingContext) return;
            const inputRow = unit.input[inputIndex];
            if (!inputRow) return;
            try {
                const rendered = renderTextWithSubstitutes(
                    inputRow.template.content,
                    renderingContext,
                );
                onUnitInputRenderedUpdate(inputIndex, rendered);
            } catch (error) {
                console.warn("Template render error:", error);
            }
        },
        [renderingContext, unit, onUnitInputRenderedUpdate],
    );
    // Re-render all input templates whenever the rendering context changes
    useEffect(() => {
        if (!renderingContext) return;
        unit.input.forEach((inputRow: ExecutionUnitInput, index: number) => {
            try {
                const rendered = renderTextWithSubstitutes(
                    inputRow.template.content,
                    renderingContext,
                );
                onUnitInputRenderedUpdate(index, rendered);
            } catch (error) {
                console.warn(`Template render error for input[${index}]:`, error);
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [renderingContext]);

    const onTemplateClick = useCallback((tabId: string) => {
        refreshCodeMirror(tabId);
    }, []);


    const setActiveTab = useCallback((next: number) => {
        setExecutionFileActiveTabIndex(0);
        setActiveTabIndex(next);
    }, []);

    const handleUnitKeyUpdate = useCallback(
        (key: string, value: unknown) => {
            const unitInstance = new ExecutionUnitEntity(unit);
            unitInstance.setProp(key, value);
            onUpdate(unitInstance.toJSON());
        },
        [unit, onUpdate],
    );

    const tabs = unit.input.map((inputRow: ExecutionUnitInput, index: number) => {
        const label = inputRow.template.name;
        return {
            className: "",
            itemName: label,
            onClick: () => {
                setActiveTab(index);
                refreshCodeMirror(String(index));
            },
            iconCls: inputRow.isManuallyChanged ? "actions.edit" : "",
            labelIsEditable: true,
            onLabelChange: (newLabel: string) => {
                onUnitInputNameUpdate(index, newLabel);
            },
        };
    });

    return (
        <Stack spacing={2} className="ExecutionUnit" sx={{ py: 2 }}>
            <Stack className="ExecutionUnit-Stack" direction="column" spacing={2}>
                {UnitPointerFieldComponent && unitPointerKeys.map((key) => (
                    <UnitPointerFieldComponent
                        key={key}
                        label={key}
                        selectedValue={unit[key] ?? ""}
                        availableUnits={availableUnits()}
                        onChange={(value) => handleUnitKeyUpdate(key, value)}
                    />
                ))}
            </Stack>
            <AccordionComponent
                className="ExecutionUnit-Accordion"
                id="execution-unit-details-accordion"
                header="Details"
                disableGutters>
                <Stack spacing={1}>
                    <Application
                        editable={false}
                        application={unit.application}
                        executable={unit.executable}
                        flavor={unit.flavor}
                        showExec
                        showFlavor
                        onExecutableUpdate={onExecutableUpdate}
                        onFlavorUpdate={onFlavorUpdate}
                        isExecEditable={editable}
                        isFlavorEditable={editable}
                    />
                    {UnitDetailsComponent && (
                        <UnitDetailsComponent
                            unit={unit}
                            editable={editable}
                            onUnitResultsChanged={onUnitResultsChanged}
                            onUnitIsDraftChanged={onUnitIsDraftChanged}
                            onUnitMonitorChanged={onUnitMonitorChanged}
                            onUnitPostProcessorChanged={onUnitPostProcessorChanged}
                        />
                    )}
                </Stack>
            </AccordionComponent>
            <AccordionComponent
                isExpanded
                header="Input"
                disableGutters
                className="ExecutionUnit-Accordion unit-input-editor">
                <DrawerContainer>
                    <MainContent>
                        <TabsMenu tabs={tabs} activeTabIndex={activeTabIndex} />

                        {unit.input.map((inputRow: ExecutionUnitInput, index: number) => (
                            <ExecutionUnitInputFilePanel
                                key={`${unit.flowchartId}-input-${inputRow.template.name}`}
                                index={index}
                                input={inputRow}
                                isActive={index === activeTabIndex}
                                activeInnerTabIndex={executionFileActiveTabIndex}
                                onInnerTabChange={setExecutionFileActiveTabIndex}
                                onTemplateTabClick={onTemplateClick}
                                onPreviewTabClick={onPreviewClick}
                                onContentUpdate={(content) =>
                                    onUnitInputContentUpdate(index, content)
                                }
                                onRenderedUpdate={(content) =>
                                    onUnitInputRenderedUpdate(index, content)
                                }
                                renderedContent={inputRow.rendered ?? ""}
                                lineWrapping={lineWrapping}
                                adjustable={adjustable}
                                isStandalone={isStandalone}
                            />
                        ))}
                    </MainContent>
                    <SideDrawer open={isDrawerVisible}>
                        <DrawerControlPanel>
                            <DrawerControl
                                isToggleAnchor
                                onClick={() => setIsDrawerVisible((v) => !v)}
                                icon={isDrawerVisible ? "shapes.arrow.right" : "shapes.arrow.left"}
                            />
                            <Divider />
                            <DrawerControl
                                active={drawerContent === "context"}
                                onClick={() => setDrawerContent("context")}
                                icon="pages.context"
                            />
                            <DrawerControl
                                active={drawerContent === "materialList"}
                                onClick={() => setDrawerContent("materialList")}
                                icon="entities.material"
                            />
                        </DrawerControlPanel>
                        <DrawerContent
                            open={isDrawerVisible}
                            title={drawerContent === "context" ? "Context" : "Material"}>
                            {drawerContent === "context" && (
                                <pre
                                    className="visible-rendering-context"
                                    style={{
                                        whiteSpace: "pre-wrap",
                                        margin: 0,
                                        padding: 10,
                                        minHeight: "100%",
                                        border: "none",
                                    }}>
                                    {JSON.stringify(renderingContext ?? {}, null, "    ")}
                                </pre>
                            )}
                            {drawerContent === "materialList" && (
                                <List key="material-label-ul">
                                    {materials.map((material, index) => (
                                        <ListItem key={`material-label-li-${material.id}`}>
                                            <FormControlLabel
                                                control={
                                                    <Radio
                                                        name="material-options"
                                                        id={material.id}
                                                        value={material.id}
                                                        checked={materialsIndex === index}
                                                        onChange={() => {
                                                            onMaterialSwitch?.(index);
                                                        }}
                                                    />
                                                }
                                                label={
                                                    <Box>
                                                        {material.name} (formula:{" "}
                                                        <strong>{material.formula}</strong>,
                                                        lattice:{" "}
                                                        <strong>{material.lattice.type})</strong>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </DrawerContent>
                    </SideDrawer>
                </DrawerContainer>
            </AccordionComponent>
        </Stack>
    );
}
