import type { ExecutionUnitInputItemSchema } from "@mat3ra/esse/dist/js/types";
import React from "react";
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
export declare function ExecutionUnitInputFilePanel({ index, input, isActive, activeInnerTabIndex, onInnerTabChange, onTemplateTabClick, onPreviewTabClick, onContentUpdate, onRenderedUpdate, renderedContent, lineWrapping, adjustable, isStandalone, }: ExecutionUnitInputFilePanelProps): React.JSX.Element;
export {};
//# sourceMappingURL=ExecutionUnitInputFilePanel.d.ts.map