import type { ButtonProps } from "@mui/material/Button";
import type { DrawerProps } from "@mui/material/Drawer";
import React from "react";
type ClassnameProps = {
    className?: string;
};
export type MainContentProps = React.ComponentPropsWithoutRef<"div"> & ClassnameProps;
export declare function MainContent({ className, style, ...rest }: MainContentProps): React.JSX.Element;
export type DrawerContainerProps = React.ComponentPropsWithoutRef<"div"> & ClassnameProps;
export declare function DrawerContainer({ className, style, ...rest }: DrawerContainerProps): React.JSX.Element;
export type SideDrawerProps = DrawerProps;
export declare function SideDrawer(props: SideDrawerProps): React.JSX.Element;
export type DrawerControlPanelProps = React.ComponentPropsWithoutRef<"div"> & ClassnameProps;
export declare function DrawerControlPanel({ className, style, ...rest }: DrawerControlPanelProps): React.JSX.Element;
export type DrawerControlProps = Omit<ButtonProps, "children"> & {
    active?: boolean;
    reverse?: boolean;
    icon: string;
    isToggleAnchor?: boolean;
};
export declare function DrawerControl({ active, reverse, icon, isToggleAnchor, className, ...buttonProps }: DrawerControlProps): React.JSX.Element;
export type DrawerContentProps = {
    open?: boolean;
    title?: string;
} & React.ComponentPropsWithoutRef<"div"> & ClassnameProps;
export declare function DrawerContent({ open, title, className, children, ...rest }: DrawerContentProps): React.JSX.Element | null;
export type SideDrawerIconProps = React.ComponentPropsWithoutRef<"div"> & ClassnameProps;
export declare function Icon({ className, style, ...rest }: SideDrawerIconProps): React.JSX.Element;
export {};
