import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Select from "@mat3ra/cove.js/dist/mui/components/select";
import { ApplicationRegistry } from "@mat3ra/standata";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import { uniqBy } from "lodash";
import getValue from "lodash/get";
import uniq from "lodash/uniq";
import { useCallback, useMemo, useState } from "react";
/** Cove `Select` types `value` as `"" | string[]`; single selection uses a one-element array. */
function toCoveSelectValue(selected) {
    return selected ? [selected] : "";
}
function selectSingleValueFromCoveSelect(event) {
    const { value } = event.target;
    if (typeof value === "string") {
        return value;
    }
    if (Array.isArray(value) && typeof value[0] === "string") {
        return value[0];
    }
    return "";
}
function getStringSelectItems(options) {
    if (!options)
        return [];
    return options.map((option) => ({
        id: String(option),
        name: String(option),
        value: String(option),
    }));
}
function getEntitySelectItems(options, selector) {
    if (!options)
        return [];
    return options.map((option, index) => {
        var _a, _b;
        return ({
            id: `option-${getValue(option, selector.id, index)}`,
            name: String((_a = getValue(option, selector.name, "")) !== null && _a !== void 0 ? _a : ""),
            value: String((_b = getValue(option, selector.value, "")) !== null && _b !== void 0 ? _b : ""),
        });
    });
}
const noop = () => undefined;
export function Application({ onApplicationUpdate = noop, onExecutableUpdate = noop, onFlavorUpdate = noop, showExec, className: propsClassName = null, application, editable = true, executable, isExecEditable = true, showFlavor, flavor, isFlavorEditable = true, }) {
    var _a, _b;
    const [isVersionDeprecated, setIsVersionDeprecated] = useState(false);
    const colSpan = showExec ? 3 : 5;
    const registry = useMemo(() => new ApplicationRegistry(), []);
    const onNameSelect = (name) => {
        const applications = registry.getApplications();
        const newApplication = applications.find((app) => {
            return app.name === name && app.isDefault;
        });
        if (newApplication) {
            onApplicationUpdate(newApplication);
        }
    };
    const onVersionSelect = (version) => {
        if (version) {
            setIsVersionDeprecated(false);
        }
        const { name } = application;
        const applications = registry.getApplications();
        const newApplication = applications.find((app) => {
            return app.name === name && (version ? app.version === version : app.isDefault);
        });
        if (newApplication) {
            onApplicationUpdate(newApplication);
        }
    };
    const onBuildSelect = (build) => {
        const { name, version } = application;
        const applications = registry.getApplications();
        const newApplication = applications.find((app) => {
            return app.name === name && app.version === version && app.build === build;
        });
        if (newApplication) {
            onApplicationUpdate(newApplication);
        }
    };
    const onExecutableSelect = useCallback((executableName) => {
        const appFilter = {
            name: application.name,
            version: application.version,
        };
        const newExecutable = registry
            .getExecutablesByApplication(appFilter)
            .find((executable) => executable.name === executableName);
        if (!newExecutable) {
            console.error(`Executable ${executableName} not found`);
            return;
        }
        const newFlavor = registry.getDefaultFlavor(appFilter, newExecutable);
        if (!newFlavor) {
            console.error(`Flavor not found for executable ${executableName}`);
            return;
        }
        onExecutableUpdate(newExecutable, newFlavor);
    }, [application.name, application.version, onExecutableUpdate, registry]);
    const onFlavorSelect = useCallback((flavorName) => {
        if (!(executable === null || executable === void 0 ? void 0 : executable.name))
            return;
        const appFilter = {
            name: application.name,
            version: application.version,
        };
        const flavor = registry
            .getFlavorsByApplicationExecutable(appFilter, { name: executable.name })
            .find((flavor) => flavor.name === flavorName);
        if (!flavor) {
            console.error(`Flavor ${flavorName} not found for executable ${executable.name}`);
            return;
        }
        onFlavorUpdate(flavor);
    }, [application.name, application.version, onFlavorUpdate, registry, executable === null || executable === void 0 ? void 0 : executable.name]);
    const versionOptions = () => {
        const { version: currentVersion } = application;
        const applications = registry.getApplications();
        const versions = uniq(applications.filter((app) => app.name === application.name).map((app) => app.version));
        const items = getStringSelectItems(versions);
        if (!versions.includes(currentVersion)) {
            if (!isVersionDeprecated) {
                setIsVersionDeprecated(true);
            }
            items.unshift({
                id: `${currentVersion}-deprecated`,
                name: `${currentVersion} - DEPRECATED`,
                value: currentVersion,
            });
        }
        return items;
    };
    const flavorOptions = () => {
        if (!executable)
            return [];
        try {
            const flavors = registry.getFlavorsByApplicationExecutable(application, executable);
            return getStringSelectItems(flavors.map((f) => f.name));
        }
        catch (_a) {
            return [];
        }
    };
    const handleExecutableSelect = (e) => {
        onExecutableSelect(selectSingleValueFromCoveSelect(e));
    };
    const applicationBuilds = registry
        .getApplications()
        .filter((app) => app.name === application.name && app.version === application.version)
        .map((app) => app.build);
    const applicationExecutables = registry
        .getExecutablesByApplication(application)
        .map((executable) => executable.name);
    const selectApplicationOptions = useMemo(() => {
        const applications = registry.getApplications();
        return getEntitySelectItems(uniqBy(applications, "name"), {
            id: "name",
            value: "name",
            name: "summary",
        });
    }, [registry]);
    return (_jsxs(Stack, { spacing: 1, className: propsClassName !== null && propsClassName !== void 0 ? propsClassName : undefined, "data-tid": "application", children: [_jsx(Typography, { variant: "subtitle2", color: "text.primary", children: "Application" }), _jsxs(Grid2, { container: true, columns: 15, spacing: 1, children: [_jsx(Grid2, { xs: 15, sm: 5, lg: colSpan, children: _jsx(Select, { id: "select-application-name", label: "Name", size: "small", value: toCoveSelectValue(application.name), items: selectApplicationOptions, onChange: (e) => onNameSelect(selectSingleValueFromCoveSelect(e)), formControlProps: { disabled: !editable } }) }), _jsx(Grid2, { xs: 15, sm: 5, lg: colSpan, children: _jsx(Select, { id: "select-application-version", label: "Version", value: toCoveSelectValue(application.version), items: versionOptions(), onChange: (e) => onVersionSelect(selectSingleValueFromCoveSelect(e)), size: "small", formControlProps: {
                                error: isVersionDeprecated,
                                disabled: !editable,
                            } }) }), _jsx(Grid2, { xs: 15, sm: 5, lg: colSpan, children: _jsx(Select, { id: "select-application-build", label: "Build", value: toCoveSelectValue(application.build), items: getStringSelectItems(uniq(applicationBuilds)), onChange: (e) => onBuildSelect(selectSingleValueFromCoveSelect(e)), size: "small", formControlProps: { disabled: !editable } }) }), !showExec ? null : (_jsx(Grid2, { xs: 15, sm: 5, lg: 3, children: _jsx(Select, { id: "select-application-executable", label: "Executable", value: toCoveSelectValue((_a = executable === null || executable === void 0 ? void 0 : executable.name) !== null && _a !== void 0 ? _a : ""), items: getStringSelectItems(uniq(applicationExecutables)), onChange: handleExecutableSelect, size: "small", formControlProps: { disabled: !isExecEditable } }) })), !showFlavor ? null : (_jsx(Grid2, { xs: 15, sm: 5, lg: 3, children: _jsx(Select, { id: "select-application-flavor", label: "Flavor", value: toCoveSelectValue((_b = flavor === null || flavor === void 0 ? void 0 : flavor.name) !== null && _b !== void 0 ? _b : ""), items: flavorOptions(), onChange: (e) => onFlavorSelect(selectSingleValueFromCoveSelect(e)), size: "small", formControlProps: { disabled: !isFlavorEditable } }) }))] })] }));
}
