import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import CodeMirror from "@exabyte-io/cove.js/dist/other/codemirror";
import { getProgrammingLanguageFromFileExtension } from "@mat3ra/code/dist/js/utils";
import Stack from "@mui/material/Stack";
import TabsMenu from "@exabyte-io/cove.js/dist/mui/components/tabs/TabsMenu";
const codeMirrorDefaults = {
    lineNumbers: true,
    mode: "jinja2",
    autofocus: false,
    viewportMargin: Infinity,
    minHeight: 70,
};
export function ExecutionUnitInputFilePanel({ index, input, isActive, activeInnerTabIndex, onInnerTabChange, onTemplateTabClick, onPreviewTabClick, onContentUpdate, onRenderedUpdate, renderedContent, lineWrapping, adjustable, isStandalone, }) {
    const contentTabIdString = `template-${index}`;
    const previewTabIdString = `preview-${index}`;
    const fileTabs = [
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
    return (_jsxs(Stack, { display: isActive ? undefined : "none", spacing: 2, id: String(index), className: `ExecutionFile ${isActive ? "active" : ""}`, children: [_jsx(TabsMenu, { tabs: fileTabs, activeTabIndex: activeInnerTabIndex, sx: { fontSize: 12 } }), _jsx(Stack, { display: activeInnerTabIndex === 0 ? undefined : "none", spacing: 2, id: contentTabIdString, className: `ContentTabPane ${activeInnerTabIndex === 0 ? "active" : ""}`, children: _jsx(CodeMirror, { content: input.template.content, updateContent: onContentUpdate, language: getProgrammingLanguageFromFileExtension(input.template.name, "jinja2"), options: {
                        ...codeMirrorDefaults,
                        autoSave: true,
                        lineWrapping,
                    } }) }, contentTabIdString), _jsx(Stack, { display: activeInnerTabIndex === 1 ? undefined : "none", spacing: 2, id: previewTabIdString, className: `PreviewTabPane ${activeInnerTabIndex === 1 ? "active" : ""}`, children: _jsx(CodeMirror, { content: renderedContent, updateContent: onRenderedUpdate, language: getProgrammingLanguageFromFileExtension(input.template.name, "jinja2"), options: {
                        ...codeMirrorDefaults,
                        readOnly: !adjustable || isStandalone,
                        lineWrapping,
                    } }) }, previewTabIdString)] }));
}
