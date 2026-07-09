import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Accordion from "@exabyte-io/cove.js/dist/mui/components/accordion";
const AccordionComponent = Accordion;
import { refreshCodeMirror } from "@mat3ra/code/dist/js/utils";
import { renderTextWithSubstitutes } from "@mat3ra/code/dist/js/utils/str";
import { safeMakeObject } from "@mat3ra/code/dist/js/utils/object";
import { ExecutionUnit as ExecutionUnitEntity } from "@mat3ra/wode";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Radio from "@mui/material/Radio";
import Stack from "@mui/material/Stack";
import { useCallback, useEffect, useState } from "react";
import { Application } from "./Application";
import { ExecutionUnitInputFilePanel, } from "./ExecutionUnitInputFilePanel";
import { DrawerContainer, DrawerContent, DrawerControl, DrawerControlPanel, MainContent, SideDrawer, } from "./SideDrawer";
import TabsMenu from "@exabyte-io/cove.js/dist/mui/components/tabs/TabsMenu";
const unitPointerKeys = ["next"];
function runtimeItemToNameResult(item) {
    return typeof item === "string" ? safeMakeObject(item) : item;
}
export function ExecutionUnit({ unit, renderingContext, onUpdate, adjustable, editable = true, isStandalone, materials = [], materialsIndex, onMaterialSwitch, units = [], UnitPointerFieldComponent, UnitDetailsComponent, }) {
    const [drawerContent, setDrawerContent] = useState("context");
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [lineWrapping] = useState(true);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [executionFileActiveTabIndex, setExecutionFileActiveTabIndex] = useState(0);
    const availableUnits = useCallback(() => {
        return units.filter((u) => u.flowchartId !== unit.flowchartId);
    }, [units, unit]);
    const onExecutableUpdate = useCallback((executable, flavor) => {
        const unitInstance = new ExecutionUnitEntity(unit);
        unitInstance.setExecutable({
            executableName: executable.name,
            flavorName: flavor.name,
        });
        onUpdate(unitInstance.toJSON());
    }, [unit, onUpdate]);
    const onFlavorUpdate = useCallback((flavor) => {
        const unitInstance = new ExecutionUnitEntity(unit);
        unitInstance.setFlavor(flavor.name);
        onUpdate(unitInstance.toJSON());
    }, [unit, onUpdate]);
    const onUnitInputContentUpdate = useCallback((index, content) => {
        onUpdate({
            ...unit,
            input: unit.input.map((row, i) => i === index
                ? {
                    ...row,
                    template: { ...row.template, content },
                    isManuallyChanged: true,
                }
                : row),
        });
    }, [unit, onUpdate]);
    const onUnitInputNameUpdate = useCallback((index, name) => {
        onUpdate({
            ...unit,
            input: unit.input.map((row, i) => i === index
                ? {
                    ...row,
                    template: { ...row.template, name },
                }
                : row),
        });
    }, [unit, onUpdate]);
    const onUnitInputRenderedUpdate = useCallback((index, content) => {
        onUpdate({
            ...unit,
            input: unit.input.map((row, i) => i === index
                ? {
                    ...row,
                    rendered: content,
                    isManuallyChanged: true,
                }
                : row),
        });
    }, [unit, onUpdate]);
    const onUnitIsDraftChanged = useCallback((isDraft) => {
        onUpdate({ ...unit, isDraft });
    }, [unit, onUpdate]);
    const onUnitResultsChanged = useCallback((results) => {
        const unitInstance = new ExecutionUnitEntity(unit);
        unitInstance.results = results.map(safeMakeObject);
        onUpdate(unitInstance.toJSON());
    }, [unit, onUpdate]);
    const onUnitMonitorChanged = useCallback((monitor, enabled) => {
        const unitInstance = new ExecutionUnitEntity(unit);
        unitInstance.toggleMonitor(runtimeItemToNameResult(monitor), enabled);
        onUpdate(unitInstance.toJSON());
    }, [unit, onUpdate]);
    const onUnitPostProcessorChanged = useCallback((postProcessor, enabled) => {
        const unitInstance = new ExecutionUnitEntity(unit);
        unitInstance.togglePostProcessor(runtimeItemToNameResult(postProcessor), enabled);
        onUpdate(unitInstance.toJSON());
    }, [unit, onUpdate]);
    const onPreviewClick = useCallback((tabId, inputIndex) => {
        refreshCodeMirror(tabId);
        if (!renderingContext)
            return;
        const inputRow = unit.input[inputIndex];
        if (!inputRow)
            return;
        try {
            const rendered = renderTextWithSubstitutes(inputRow.template.content, renderingContext);
            onUnitInputRenderedUpdate(inputIndex, rendered);
        }
        catch (error) {
            console.warn("Template render error:", error);
        }
    }, [renderingContext, unit, onUnitInputRenderedUpdate]);
    // Re-render all input templates whenever the rendering context changes
    useEffect(() => {
        if (!renderingContext)
            return;
        unit.input.forEach((inputRow, index) => {
            try {
                const rendered = renderTextWithSubstitutes(inputRow.template.content, renderingContext);
                onUnitInputRenderedUpdate(index, rendered);
            }
            catch (error) {
                console.warn(`Template render error for input[${index}]:`, error);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [renderingContext]);
    const onTemplateClick = useCallback((tabId) => {
        refreshCodeMirror(tabId);
    }, []);
    const setActiveTab = useCallback((next) => {
        setExecutionFileActiveTabIndex(0);
        setActiveTabIndex(next);
    }, []);
    const handleUnitKeyUpdate = useCallback((key, value) => {
        const unitInstance = new ExecutionUnitEntity(unit);
        unitInstance.setProp(key, value);
        onUpdate(unitInstance.toJSON());
    }, [unit, onUpdate]);
    const tabs = unit.input.map((inputRow, index) => {
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
            onLabelChange: (newLabel) => {
                onUnitInputNameUpdate(index, newLabel);
            },
        };
    });
    return (_jsxs(Stack, { spacing: 2, className: "ExecutionUnit", sx: { py: 2 }, children: [_jsx(Stack, { className: "ExecutionUnit-Stack", direction: "column", spacing: 2, children: UnitPointerFieldComponent && unitPointerKeys.map((key) => {
                    var _a;
                    return (_jsx(UnitPointerFieldComponent, { label: key, selectedValue: (_a = unit[key]) !== null && _a !== void 0 ? _a : "", availableUnits: availableUnits(), onChange: (value) => handleUnitKeyUpdate(key, value) }, key));
                }) }), _jsx(AccordionComponent, { className: "ExecutionUnit-Accordion", id: "execution-unit-details-accordion", header: "Details", disableGutters: true, children: _jsxs(Stack, { spacing: 1, children: [_jsx(Application, { editable: false, application: unit.application, executable: unit.executable, flavor: unit.flavor, showExec: true, showFlavor: true, onExecutableUpdate: onExecutableUpdate, onFlavorUpdate: onFlavorUpdate, isExecEditable: editable, isFlavorEditable: editable }), UnitDetailsComponent && (_jsx(UnitDetailsComponent, { unit: unit, editable: editable, onUnitResultsChanged: onUnitResultsChanged, onUnitIsDraftChanged: onUnitIsDraftChanged, onUnitMonitorChanged: onUnitMonitorChanged, onUnitPostProcessorChanged: onUnitPostProcessorChanged }))] }) }), _jsx(AccordionComponent, { isExpanded: true, header: "Input", disableGutters: true, className: "ExecutionUnit-Accordion unit-input-editor", children: _jsxs(DrawerContainer, { children: [_jsxs(MainContent, { children: [_jsx(TabsMenu, { tabs: tabs, activeTabIndex: activeTabIndex }), unit.input.map((inputRow, index) => (_jsx(ExecutionUnitInputFilePanel, { index: index, input: inputRow, isActive: index === activeTabIndex, activeInnerTabIndex: executionFileActiveTabIndex, onInnerTabChange: setExecutionFileActiveTabIndex, onTemplateTabClick: onTemplateClick, onPreviewTabClick: onPreviewClick, onContentUpdate: (content) => onUnitInputContentUpdate(index, content), onRenderedUpdate: (content) => onUnitInputRenderedUpdate(index, content), renderedContent: inputRow.rendered, lineWrapping: lineWrapping, adjustable: adjustable, isStandalone: isStandalone }, `${unit.flowchartId}-input-${inputRow.template.name}`)))] }), _jsxs(SideDrawer, { open: isDrawerVisible, children: [_jsxs(DrawerControlPanel, { children: [_jsx(DrawerControl, { isToggleAnchor: true, onClick: () => setIsDrawerVisible((v) => !v), icon: isDrawerVisible ? "shapes.arrow.right" : "shapes.arrow.left" }), _jsx(Divider, {}), _jsx(DrawerControl, { active: drawerContent === "context", onClick: () => setDrawerContent("context"), icon: "pages.context" }), _jsx(DrawerControl, { active: drawerContent === "materialList", onClick: () => setDrawerContent("materialList"), icon: "entities.material" })] }), _jsxs(DrawerContent, { open: isDrawerVisible, title: drawerContent === "context" ? "Context" : "Material", children: [drawerContent === "context" && (_jsx("pre", { className: "visible-rendering-context", style: {
                                                whiteSpace: "pre-wrap",
                                                margin: 0,
                                                padding: 10,
                                                minHeight: "100%",
                                                border: "none",
                                            }, children: JSON.stringify(renderingContext !== null && renderingContext !== void 0 ? renderingContext : {}, null, "    ") })), drawerContent === "materialList" && (_jsx(List, { children: materials.map((material, index) => (_jsx(ListItem, { children: _jsx(FormControlLabel, { control: _jsx(Radio, { name: "material-options", id: material.id, value: material.id, checked: materialsIndex === index, onChange: () => {
                                                            onMaterialSwitch === null || onMaterialSwitch === void 0 ? void 0 : onMaterialSwitch(index);
                                                        } }), label: _jsxs(Box, { children: [material.name, " (formula:", " ", _jsx("strong", { children: material.formula }), ", lattice:", " ", _jsxs("strong", { children: [material.lattice.type, ")"] })] }) }) }, `material-label-li-${material.id}`))) }, "material-label-ul"))] })] })] }) })] }));
}
