import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable jsx-a11y/label-has-associated-control */
import Checkbox from "@mat3ra/cove.js/dist/mui/components/checkbox/Checkbox";
const CheckboxComponent = Checkbox;
import Grid from "@mui/material/Grid";
export function Results({ className = "", data_tid, children, allowed = [], selected = [], onChange, }) {
    return (_jsxs(Grid, { container: true, spacing: 1, className: className, "data-tid": data_tid, children: [children && (_jsx(Grid, { item: true, xs: 12, container: true, spacing: 2, children: children })), _jsx(Grid, { item: true, xs: 12, container: true, columnSpacing: 1, children: allowed.map((result) => {
                    return (_jsx(Grid, { item: true, id: result.name, xs: 12, sm: 6, md: 4, lg: 3, children: _jsx(CheckboxComponent, { label: result.name, checked: selected.includes(result.name), onChange: (checked) => {
                                onChange(result, checked);
                            } }) }, result.name));
                }) })] }));
}
