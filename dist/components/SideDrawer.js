import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable react/jsx-props-no-spreading */
import IconByName from "@exabyte-io/cove.js/dist/mui/components/icon/IconByName";
import Button from "@mui/material/Button";
import DrawerBase from "@mui/material/Drawer";
const modalPaddingTopBottom = 16;
const drawerControlsSize = 52;
const headerDetailsHeight = 532 + 2 * modalPaddingTopBottom;
const contentSizeMinimum = 500;
const contentSize = `calc(100vh - ${headerDetailsHeight}px)`;
const drawerContentSize = `calc(100vh - ${headerDetailsHeight - drawerControlsSize}px)`;
export function MainContent({ className, style, ...rest }) {
    return (_jsx("div", { className: className, style: {
            flex: "1 0 50%",
            overflow: "hidden",
            ...style,
        }, ...rest }));
}
export function DrawerContainer({ className, style, ...rest }) {
    return (_jsx("div", { className: className, style: { display: "flex", ...style }, ...rest }));
}
export function SideDrawer(props) {
    const { open } = props;
    return (_jsx(DrawerBase, { variant: "permanent", sx: {
            width: open ? "50%" : `${drawerControlsSize}px`,
            flexShrink: 0,
            borderLeft: "1px solid rgba(0,0,0,0.12)",
            whiteSpace: "nowrap",
            transition: (theme) => theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: open
                    ? theme.transitions.duration.enteringScreen
                    : theme.transitions.duration.leavingScreen,
            }),
            overflowX: open ? undefined : "hidden",
            "& .MuiDrawer-paper": {
                position: "relative",
                display: "flex",
                alignItems: "stretch",
                flexDirection: "row",
                justifyContent: "flex-start",
            },
        }, ...props }));
}
export function DrawerControlPanel({ className, style, ...rest }) {
    return (_jsx("div", { className: className, style: {
            width: drawerControlsSize,
            minWidth: drawerControlsSize,
            display: "flex",
            flexDirection: "column",
            boxShadow: "0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px rgba(0,0,0,0.14),0px 1px 3px rgba(0,0,0,0.12)",
            ...style,
        }, ...rest }));
}
export function DrawerControl({ active, reverse, icon, isToggleAnchor, className, ...buttonProps }) {
    return (_jsx(Button, { color: isToggleAnchor ? "secondary" : "primary", className: className, sx: {
            border: "none",
            height: drawerControlsSize,
            width: drawerControlsSize,
            minWidth: drawerControlsSize,
            color: active ? undefined : "rgba(0,0,0,0.5)",
            bgcolor: active ? "action.selected" : undefined,
            marginBottom: reverse ? 0 : undefined,
            marginTop: reverse ? "auto" : undefined,
        }, ...buttonProps, children: _jsx(IconByName, { name: icon }) }));
}
export function DrawerContent({ open, title, className, children, ...rest }) {
    if (!open)
        return null;
    return (_jsxs("div", { className: className, style: { width: "100%" }, children: [_jsx("h4", { style: {
                    height: drawerControlsSize,
                    margin: 0,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    boxShadow: "inset 0 -2px 0 0 #eeeeee",
                }, children: title }), _jsx("div", { style: {
                    overflow: "auto",
                    height: drawerContentSize,
                    minHeight: contentSizeMinimum + drawerControlsSize,
                    whiteSpace: "pre-wrap",
                }, ...rest, children: children })] }));
}
export function Icon({ className, style, ...rest }) {
    return (_jsx("div", { className: className, style: {
            overflow: "auto",
            height: drawerContentSize,
            minHeight: contentSizeMinimum + drawerControlsSize,
            whiteSpace: "pre-wrap",
            ...style,
        }, ...rest }));
}
