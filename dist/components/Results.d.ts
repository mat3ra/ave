import React from "react";
export type ResultsAllowedItem = {
    name: string;
};
export interface ResultsProps {
    allowed?: ResultsAllowedItem[];
    selected?: string[];
    onChange: (item: ResultsAllowedItem, enabled: boolean) => void;
    className?: string;
    data_tid?: string;
    children?: React.ReactNode;
}
export declare function Results({ className, data_tid, children, allowed, selected, onChange, }: ResultsProps): React.JSX.Element;
//# sourceMappingURL=Results.d.ts.map