import CodeMirror from "@exabyte-io/cove.js/dist/other/codemirror";
import {
    getProgrammingLanguageFromFileExtension,
    getUUID,
    refreshCodeMirror,
} from "@mat3ra/code/dist/js/utils";

import { ExecutionUnit } from "@mat3ra/wode";
import { UnitStatus } from "@mat3ra/wode/dist/js/enums";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import setClass from "classnames";
import React, { useMemo, useState } from "react";

import { executionUnitHasConvergenceMonitor } from "../utils/executionUnitMonitors";
import {
    type JupyterNotebookEndpointJobProperty,
    isJupyterExecutionUnit,
    resolveJupyterNotebookAndLabUrls,
} from "../utils/jupyterExecutionUnit";
import { UnitOutput } from "./UnitOutput";

import TabsMenu from "@exabyte-io/cove.js/dist/mui/components/tabs/TabsMenu";
import type { TabItem } from "@exabyte-io/cove.js/dist/mui/components/tabs/types";

type ExecutionUnitInstance = InstanceType<typeof ExecutionUnit>;

type ExecutionUnitInputRow = ExecutionUnitInstance["input"][number];

/** Job-bound property rows (convergence + Jupyter endpoint share this envelope). */
type JobPropertyForMonitors = JupyterNotebookEndpointJobProperty;

type UnitOutputModule = typeof UnitOutput & {
    connectTracker?: () => React.ComponentType<UnitOutputTrackedProps>;
};

type UnitOutputTrackedProps = {
    id: string;
    unit: ExecutionUnitInstance;
    onOutputUpdateRequest: (flowchartId: string, skip: number, limit: number) => void;
};

function getMonitorsFromProperties(
    unit: any,
    jobProperties: readonly JobPropertyForMonitors[] | null | undefined,
    jobId: string | undefined,
): { name: string }[] {
    if (!jobProperties || !Array.isArray(jobProperties) || !jobId) {
        return [];
    }
    const properties = jobProperties.filter((p) => {
        return (
            p.source.info.jobId === jobId &&
            p.source.info.unitId === unit.flowchartId &&
            p.repetition === unit.repetition &&
            unit.monitorNames.includes(p.data.name)
        );
    });
    return properties.map((p) => p.data);
}

export type ExecutionUnitViewerProps = {
    unit: any;
    onOutputUpdateRequest: (flowchartId: string, skip: number, limit: number) => void;
    jobProperties: readonly JobPropertyForMonitors[];
    /** Current job ID; used for Jupyter URL resolution and monitor filtering. Pass from route context in webapp; omit in standalone. */
    jobId?: string;
    /** Injected component for rendering convergence charts. */
    ConvergencesListComponent?: React.ComponentType<{
        monitors: { name: string }[];
        idPrefix: string;
        idGenerator: () => string;
    }>;
};

function inputFileDisplayName(file: ExecutionUnitInputRow): string {
    return file.template.name;
}

function renderExecutionFile(
    tabId: string | number,
    file: ExecutionUnitInputRow,
    isActive: boolean,
) {
    const displayName = inputFileDisplayName(file);
    const language = getProgrammingLanguageFromFileExtension(displayName);
    const options = {
        lineNumbers: true,
        mode: language,
        autofocus: false,
        viewportMargin: Infinity,
        minHeight: 70,
    };

    return (
        <Box
            key={String(tabId)}
            id={String(tabId)}
            className={setClass(isActive ? "active" : "hidden")}>
            <CodeMirror content={file.rendered} language={language} options={options} readOnly />
        </Box>
    );
}

export function ExecutionUnitViewer(props: ExecutionUnitViewerProps) {
    const { unit, onOutputUpdateRequest, jobProperties, jobId, ConvergencesListComponent } = props;
    const [activeTabId, setActiveTabId] = useState("output");
    const [activeFileTabIndex, setActiveFileTabIndex] = useState(0);

    const UnitOutputComponent = useMemo(() => {
        const UO = UnitOutput as UnitOutputModule;
        return UO.connectTracker ? UO.connectTracker() : UnitOutput;
    }, []);

    const isTabActive = (tab: string) => tab === activeTabId;
    const getActiveClassByTab = (tab: string) => (isTabActive(tab) ? "active" : "");

    const monitors = getMonitorsFromProperties(unit, jobProperties, jobId);

    const fileTabs: TabItem[] = [];
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

    let jupyterLabHref: string | undefined;
    let jupyterNotebookHref: string | undefined;

    if (isJupyter && unit.status === UnitStatus.active) {
        const jupyterUrls = jobId
            ? resolveJupyterNotebookAndLabUrls(
                  jobId,
                  unit.flowchartId,
                  unit.repetition,
                  jobProperties,
              )
            : undefined;
        jupyterNotebookHref = jupyterUrls?.notebookTreeUrl;
        jupyterLabHref = jupyterUrls?.labUrl;
    }

    const tabs: TabItem[] = [
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

    return (
        <Stack overflow="hidden" className="ExecutionUnitViewer fc-alt">
            <TabsMenu tabs={tabs} activeTabIndex={activeTabIndex} variant="fullWidth" />
            <Stack
                overflow="hidden"
                display={activeTabIndex !== 0 ? "none" : undefined}
                className={getActiveClassByTab("input")}
                id={`${unit.flowchartId}-input`}>
                <TabsMenu tabs={fileTabs} activeTabIndex={activeFileTabIndex} />
                <Box overflow="auto" flex={1}>
                    {unit.input.map((file, index) => {
                        const isActive = index === activeFileTabIndex;
                        return renderExecutionFile(index, file, isActive);
                    })}
                </Box>
            </Stack>

            {activeTabIndex === 1 ? (
                <Stack
                    overflow="hidden"
                    className={getActiveClassByTab("output")}
                    id={`${unit.flowchartId}-output`}>
                    <TabsMenu
                        tabs={[
                            {
                                className: "",
                                itemName: "Stdout",
                                href: `#${unit.flowchartId}-output-stdout`,
                            },
                        ]}
                        variant="fullWidth"
                        activeTabIndex={0}
                        centered
                    />

                    <UnitOutputComponent
                        id={`${unit.flowchartId}-output-stdout`}
                        unit={unit}
                        onOutputUpdateRequest={onOutputUpdateRequest}
                    />
                </Stack>
            ) : null}

            {hasConvergenceMonitor && ConvergencesListComponent && activeTabIndex === 2 ? (
                <Stack
                    overflow="hidden"
                    className={getActiveClassByTab("charts")}
                    id={`${unit.flowchartId}-charts`}>
                    <ConvergencesListComponent
                        monitors={monitors}
                        idPrefix={unit.flowchartId}
                        idGenerator={getUUID}
                    />
                </Stack>
            ) : null}
        </Stack>
    );
}
