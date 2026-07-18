import CodeMirror from "@mat3ra/cove.js/dist/other/codemirror";
import { getProgrammingLanguageFromFileExtension } from "@mat3ra/code/dist/js/utils";
import type { ExecutionUnitInputItemSchema } from "@mat3ra/esse/dist/js/types";
import Stack from "@mui/material/Stack";
import React from "react";

import TabsMenu from "@mat3ra/cove.js/dist/mui/components/tabs/TabsMenu";
import type { TabItem } from "@mat3ra/cove.js/dist/mui/components/tabs/types";

/** `input[]` row for an execution unit; optional `name` is set by `setInputItemNameByIndex` for tab labels. */
export type ExecutionUnitInput = ExecutionUnitInputItemSchema & {
    name?: string;
};

type ExecutionUnitInputFilePanelProps = {
    index: number;
    input: ExecutionUnitInput;
    isActive: boolean;
    activeInnerTabIndex: number;
    onInnerTabChange: (tabIndex: number) => void;
    onTemplateTabClick: (tabId: string) => void;
    onPreviewTabClick: (tabId: string, inputIndex: number) => void;
    onContentUpdate: (content: string) => void;
    onRenderedUpdate: (content: string) => void;
    renderedContent: string;
    lineWrapping: boolean;
    adjustable?: boolean;
    isStandalone?: boolean;
};

const codeMirrorDefaults: Record<string, unknown> = {
    lineNumbers: true,
    mode: "jinja2",
    autofocus: false,
    viewportMargin: Infinity,
    minHeight: 70,
};

export function ExecutionUnitInputFilePanel({
    index,
    input,
    isActive,
    activeInnerTabIndex,
    onInnerTabChange,
    onTemplateTabClick,
    onPreviewTabClick,
    onContentUpdate,
    onRenderedUpdate,
    renderedContent,
    lineWrapping,
    adjustable,
    isStandalone,
}: ExecutionUnitInputFilePanelProps) {
    const contentTabIdString = `template-${index}`;
    const previewTabIdString = `preview-${index}`;

    const fileTabs: TabItem[] = [
        {
            className: "",
            itemName: "template",
            iconCls: "",
            onClick: () => {
                onInnerTabChange(0);
                onTemplateTabClick(contentTabIdString);
            },
            dataName: contentTabIdString,
        },
        {
            className: "",
            itemName: "preview",
            iconCls: input.isManuallyChanged ? "actions.edit" : "",
            onClick: () => {
                onInnerTabChange(1);
                onPreviewTabClick(previewTabIdString, index);
            },
            dataName: previewTabIdString,
        },
    ];

    return (
        <Stack
            display={isActive ? undefined : "none"}
            spacing={2}
            id={String(index)}
            className={`ExecutionFile ${isActive ? "active" : ""}`}>
            <TabsMenu tabs={fileTabs} activeTabIndex={activeInnerTabIndex} sx={{ fontSize: 12 }} />
            <Stack
                display={activeInnerTabIndex === 0 ? undefined : "none"}
                spacing={2}
                id={contentTabIdString}
                key={contentTabIdString}
                className={`ContentTabPane ${activeInnerTabIndex === 0 ? "active" : ""}`}>
                <CodeMirror
                    content={input.template.content}
                    updateContent={onContentUpdate}
                    language={getProgrammingLanguageFromFileExtension(
                        input.template.name,
                        "jinja2",
                    )}
                    options={{
                        ...codeMirrorDefaults,
                        autoSave: true,
                        lineWrapping,
                    } as any}
                />
            </Stack>
            <Stack
                display={activeInnerTabIndex === 1 ? undefined : "none"}
                spacing={2}
                key={previewTabIdString}
                id={previewTabIdString}
                className={`PreviewTabPane ${activeInnerTabIndex === 1 ? "active" : ""}`}>
                <CodeMirror
                    content={renderedContent}
                    updateContent={onRenderedUpdate}
                    language={getProgrammingLanguageFromFileExtension(
                        input.template.name,
                        "jinja2",
                    )}
                    options={{
                        ...codeMirrorDefaults,
                        readOnly: !adjustable || isStandalone,
                        lineWrapping,
                    } as any}
                />
            </Stack>
        </Stack>
    );
}
