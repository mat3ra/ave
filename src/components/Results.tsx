/* eslint-disable jsx-a11y/label-has-associated-control */
import Checkbox from "@mat3ra/cove.js/dist/mui/components/checkbox/Checkbox";
const CheckboxComponent = Checkbox as any;
import Grid from "@mui/material/Grid";
import React from "react";

export type ResultsAllowedItem = { name: string };

export interface ResultsProps {
    allowed?: ResultsAllowedItem[];
    selected?: string[];
    onChange: (item: ResultsAllowedItem, enabled: boolean) => void;
    className?: string;
    data_tid?: string;
    children?: React.ReactNode;
}

export function Results({
    className = "",
    data_tid,
    children,
    allowed = [],
    selected = [],
    onChange,
}: ResultsProps) {
    return (
        <Grid container spacing={1} className={className} data-tid={data_tid}>
            {children && (
                <Grid item xs={12} container spacing={2}>
                    {children}
                </Grid>
            )}
            <Grid item xs={12} container columnSpacing={1}>
                {allowed.map((result) => {
                    return (
                        <Grid item key={result.name} id={result.name} xs={12} sm={6} md={4} lg={3}>
                            <CheckboxComponent
                                label={result.name}
                                checked={selected.includes(result.name)}
                                onChange={(checked: boolean) => {
                                    onChange(result, checked);
                                }}
                            />
                        </Grid>
                    );
                })}
            </Grid>
        </Grid>
    );
}
