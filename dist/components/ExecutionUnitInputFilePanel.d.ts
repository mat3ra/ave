import type { ExecutionUnitInputItemSchema } from "@mat3ra/esse/dist/js/types";
import React from "react";
import type { TemplateIssue } from "../utils/templateVariables";
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
    /** Variables in this template that will render to nothing. */
    issues?: TemplateIssue[];
};
export declare function ExecutionUnitInputFilePanel({ index, input, isActive, activeInnerTabIndex, onInnerTabChange, onTemplateTabClick, onPreviewTabClick, onContentUpdate, onRenderedUpdate, renderedContent, lineWrapping, adjustable, isStandalone, issues, }: ExecutionUnitInputFilePanelProps): React.JSX.Element;
export {};
