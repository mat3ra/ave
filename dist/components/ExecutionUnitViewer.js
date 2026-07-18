import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import CodeMirror from "@mat3ra/cove/dist/other/codemirror";
import { getProgrammingLanguageFromFileExtension, getUUID, refreshCodeMirror, } from "@mat3ra/code/dist/js/utils";
import { UnitStatus } from "@mat3ra/wode/dist/js/enums";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import setClass from "classnames";
import { useMemo, useState } from "react";
import { executionUnitHasConvergenceMonitor } from "../utils/executionUnitMonitors";
import { isJupyterExecutionUnit, resolveJupyterNotebookAndLabUrls, } from "../utils/jupyterExecutionUnit";
import { UnitOutput } from "./UnitOutput";
import TabsMenu from "@mat3ra/cove/dist/mui/components/tabs/TabsMenu";
function getMonitorsFromProperties(unit, jobProperties, jobId) {
    if (!jobProperties || !Array.isArray(jobProperties) || !jobId) {
        return [];
    }
    const properties = jobProperties.filter((p) => {
        return (p.source.info.jobId === jobId &&
            p.source.info.unitId === unit.flowchartId &&
            p.repetition === unit.repetition &&
            unit.monitorNames.includes(p.data.name));
    });
    return properties.map((p) => p.data);
}
function inputFileDisplayName(file) {
    return file.template.name;
}
function renderExecutionFile(tabId, file, isActive) {
    const displayName = inputFileDisplayName(file);
    const language = getProgrammingLanguageFromFileExtension(displayName);
    const options = {
        lineNumbers: true,
        mode: language,
        autofocus: false,
        viewportMargin: Infinity,
        minHeight: 70,
    };
    return (_jsx(Box, { id: String(tabId), className: setClass(isActive ? "active" : "hidden"), children: _jsx(CodeMirror, { content: file.rendered, language: language, options: options, readOnly: true }) }, String(tabId)));
}
export function ExecutionUnitViewer(props) {
    const { unit, onOutputUpdateRequest, jobProperties, jobId, ConvergencesListComponent } = props;
    const [activeTabId, setActiveTabId] = useState("output");
    const [activeFileTabIndex, setActiveFileTabIndex] = useState(0);
    const UnitOutputComponent = useMemo(() => {
        const UO = UnitOutput;
        return UO.connectTracker ? UO.connectTracker() : UnitOutput;
    }, []);
    const isTabActive = (tab) => tab === activeTabId;
    const getActiveClassByTab = (tab) => (isTabActive(tab) ? "active" : "");
    const monitors = getMonitorsFromProperties(unit, jobProperties, jobId);
    const fileTabs = [];
    unit.input.forEach((file, index) => {
        const tabId = `preview-${index}`;
        fileTabs.push({
            id: "input",
            className: "",
            itemName: inputFileDisplayName(file),
            onClick: () => {
                setActiveFileTabIndex(index);
                refreshCodeMirror(tabId);
            },
        });
    });
    const isJupyter = isJupyterExecutionUnit(unit);
    const hasConvergenceMonitor = executionUnitHasConvergenceMonitor(unit);
    let jupyterLabHref;
    let jupyterNotebookHref;
    if (isJupyter && unit.status === UnitStatus.active) {
        const jupyterUrls = jobId
            ? resolveJupyterNotebookAndLabUrls(jobId, unit.flowchartId, unit.repetition, jobProperties)
            : undefined;
        jupyterNotebookHref = jupyterUrls === null || jupyterUrls === void 0 ? void 0 : jupyterUrls.notebookTreeUrl;
        jupyterLabHref = jupyterUrls === null || jupyterUrls === void 0 ? void 0 : jupyterUrls.labUrl;
    }
    const tabs = [
        {
            id: "input",
            className: "",
            itemName: "Input",
            onClick: () => {
                setActiveTabId("input");
                refreshCodeMirror(`${unit.flowchartId}-input`);
            },
        },
        {
            id: "output",
            className: "",
            itemName: "Output",
            onClick: () => {
                setActiveTabId("output");
            },
        },
    ];
    if (isJupyter) {
        tabs.push({
            id: "notebook",
            className: "",
            itemName: "Notebook",
            href: jupyterNotebookHref,
            target: "_blank",
            iconCls: "pages.externalLink",
        });
        tabs.push({
            id: "lab",
            className: "",
            itemName: "Lab",
            href: jupyterLabHref,
            target: "_blank",
            iconCls: "pages.externalLink",
        });
    }
    if (hasConvergenceMonitor) {
        tabs.push({
            id: "charts",
            className: "",
            itemName: "Charts",
            onClick: () => {
                setActiveTabId("charts");
                window.dispatchEvent(new Event("resize"));
            },
        });
    }
    const activeTabIndex = tabs.findIndex((item) => item.id === activeTabId);
    return (_jsxs(Stack, { overflow: "hidden", className: "ExecutionUnitViewer fc-alt", children: [_jsx(TabsMenu, { tabs: tabs, activeTabIndex: activeTabIndex, variant: "fullWidth" }), _jsxs(Stack, { overflow: "hidden", display: activeTabIndex !== 0 ? "none" : undefined, className: getActiveClassByTab("input"), id: `${unit.flowchartId}-input`, children: [_jsx(TabsMenu, { tabs: fileTabs, activeTabIndex: activeFileTabIndex }), _jsx(Box, { overflow: "auto", flex: 1, children: unit.input.map((file, index) => {
                            const isActive = index === activeFileTabIndex;
                            return renderExecutionFile(index, file, isActive);
                        }) })] }), activeTabIndex === 1 ? (_jsxs(Stack, { overflow: "hidden", className: getActiveClassByTab("output"), id: `${unit.flowchartId}-output`, children: [_jsx(TabsMenu, { tabs: [
                            {
                                className: "",
                                itemName: "Stdout",
                                href: `#${unit.flowchartId}-output-stdout`,
                            },
                        ], variant: "fullWidth", activeTabIndex: 0, centered: true }), _jsx(UnitOutputComponent, { id: `${unit.flowchartId}-output-stdout`, unit: unit, onOutputUpdateRequest: onOutputUpdateRequest })] })) : null, hasConvergenceMonitor && ConvergencesListComponent && activeTabIndex === 2 ? (_jsx(Stack, { overflow: "hidden", className: getActiveClassByTab("charts"), id: `${unit.flowchartId}-charts`, children: _jsx(ConvergencesListComponent, { monitors: monitors, idPrefix: unit.flowchartId, idGenerator: getUUID }) })) : null] }));
}
