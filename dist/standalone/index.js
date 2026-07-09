var _a;
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ThemeProvider from "@exabyte-io/cove.js/dist/theme/provider/ThemeProvider";
import JSONSchemasInterface from "@mat3ra/esse/dist/js/esse/JSONSchemasInterface";
import esseSchemas from "@mat3ra/esse/dist/js/schemas.json";
import { ApplicationDriver } from "@mat3ra/standata/dist/js/ApplicationDriver";
import { ApplicationRegistry } from "@mat3ra/standata";
import { MaterialStandata } from "@mat3ra/standata/dist/js/material";
import { ExecutionUnit as WodeExecutionUnit } from "@mat3ra/wode";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { ExecutionUnit } from "../components/ExecutionUnit";
// Register all ESSE schemas before anything renders
JSONSchemasInterface.setSchemas(esseSchemas);
// Bootstrap the standata application registry once
const applicationDriver = new ApplicationDriver();
ApplicationRegistry.setDriver(applicationDriver);
const registry = new ApplicationRegistry();
// Load default material (Silicon FCC) for the rendering context
const materialStandata = new MaterialStandata();
const allMaterials = materialStandata.getAll();
const defaultMaterial = (_a = allMaterials.find((m) => { var _a; return (_a = m.name) === null || _a === void 0 ? void 0 : _a.includes("Silicon"); })) !== null && _a !== void 0 ? _a : allMaterials[0];
const defaultMaterials = [defaultMaterial];
const defaultRenderingContext = { MATERIAL: defaultMaterial };
function buildDefaultUnit(application, executable, flavor) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const input = registry.getInput(application, flavor);
    const unitInstance = new WodeExecutionUnit({
        type: "execution",
        name: `${application.name} ${flavor.name}`,
        application: {
            name: application.name,
            shortName: application.shortName,
            version: application.version,
            build: application.build,
            summary: (_a = application.summary) !== null && _a !== void 0 ? _a : "",
            isDefault: (_b = application.isDefault) !== null && _b !== void 0 ? _b : false,
            isDefaultVersion: (_c = application.isDefaultVersion) !== null && _c !== void 0 ? _c : false,
            isLicensed: (_d = application.isLicensed) !== null && _d !== void 0 ? _d : false,
            isUsingMaterial: (_e = application.isUsingMaterial) !== null && _e !== void 0 ? _e : false,
            hasAdvancedComputeOptions: (_f = application.hasAdvancedComputeOptions) !== null && _f !== void 0 ? _f : false,
        },
        executable: { name: executable.name },
        flavor: { name: flavor.name },
        input: input.map((file) => {
            var _a, _b, _c, _d;
            return ({
                template: {
                    name: file.name,
                    content: (_b = (_a = file.template) === null || _a === void 0 ? void 0 : _a.content) !== null && _b !== void 0 ? _b : "",
                },
                rendered: (_d = (_c = file.template) === null || _c === void 0 ? void 0 : _c.content) !== null && _d !== void 0 ? _d : "",
                isManuallyChanged: false,
            });
        }),
        monitors: (_g = flavor.monitors) !== null && _g !== void 0 ? _g : [],
        results: (_h = flavor.results) !== null && _h !== void 0 ? _h : [],
        postProcessors: (_j = flavor.postProcessors) !== null && _j !== void 0 ? _j : [],
        preProcessors: (_k = flavor.preProcessors) !== null && _k !== void 0 ? _k : [],
    });
    return unitInstance.toJSON();
}
function AveStandalone() {
    var _a, _b, _c;
    const allApps = useMemo(() => registry.getApplications(), []);
    const defaultAppNames = useMemo(() => [...new Set(allApps.filter((a) => a.isDefault).map((a) => a.name))], [allApps]);
    const [selectedAppName, setSelectedAppName] = useState((_a = defaultAppNames[0]) !== null && _a !== void 0 ? _a : "vasp");
    const availableApps = useMemo(() => allApps.filter((a) => a.name === selectedAppName), [allApps, selectedAppName]);
    const selectedApp = useMemo(() => { var _a; return (_a = availableApps.find((a) => a.isDefault)) !== null && _a !== void 0 ? _a : availableApps[0]; }, [availableApps]);
    const availableExecutables = useMemo(() => (selectedApp ? registry.getExecutablesByApplication(selectedApp) : []), [selectedApp]);
    const [selectedExecName, setSelectedExecName] = useState("");
    const selectedExecutable = useMemo(() => {
        var _a, _b;
        return (_b = (_a = availableExecutables.find((e) => e.name === selectedExecName)) !== null && _a !== void 0 ? _a : availableExecutables.find((e) => e.isDefault)) !== null && _b !== void 0 ? _b : availableExecutables[0];
    }, [availableExecutables, selectedExecName]);
    const availableFlavors = useMemo(() => selectedApp && selectedExecutable
        ? registry.getFlavorsByApplicationExecutable(selectedApp, selectedExecutable)
        : [], [selectedApp, selectedExecutable]);
    const [selectedFlavorName, setSelectedFlavorName] = useState("");
    const selectedFlavor = useMemo(() => {
        var _a, _b;
        return (_b = (_a = availableFlavors.find((f) => f.name === selectedFlavorName)) !== null && _a !== void 0 ? _a : availableFlavors.find((f) => f.isDefault)) !== null && _b !== void 0 ? _b : availableFlavors[0];
    }, [availableFlavors, selectedFlavorName]);
    // Reset exec/flavor when app changes
    useEffect(() => {
        setSelectedExecName("");
        setSelectedFlavorName("");
    }, [selectedAppName]);
    useEffect(() => {
        setSelectedFlavorName("");
    }, [selectedExecName]);
    const [unit, setUnit] = useState(null);
    const [jsonInput, setJsonInput] = useState("");
    const [jsonError, setJsonError] = useState("");
    const loadFromStandata = useCallback(() => {
        if (!selectedApp || !selectedExecutable || !selectedFlavor)
            return;
        setUnit(buildDefaultUnit(selectedApp, selectedExecutable, selectedFlavor));
        setJsonInput("");
        setJsonError("");
    }, [selectedApp, selectedExecutable, selectedFlavor]);
    // Auto-load when selection changes
    useEffect(() => {
        if (selectedApp && selectedExecutable && selectedFlavor) {
            loadFromStandata();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedApp === null || selectedApp === void 0 ? void 0 : selectedApp.name, selectedExecutable === null || selectedExecutable === void 0 ? void 0 : selectedExecutable.name, selectedFlavor === null || selectedFlavor === void 0 ? void 0 : selectedFlavor.name]);
    const loadFromJson = useCallback(() => {
        try {
            const parsed = JSON.parse(jsonInput);
            setUnit(parsed);
            setJsonError("");
        }
        catch (_a) {
            setJsonError("Invalid JSON — please check the format.");
        }
    }, [jsonInput]);
    const onUnitUpdate = useCallback((updated) => {
        setUnit(updated);
    }, []);
    return (_jsxs(Stack, { height: "100vh", overflow: "hidden", children: [_jsxs(Box, { sx: {
                    px: 2,
                    py: 1,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "background.paper",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                }, children: [_jsx(Typography, { variant: "subtitle1", fontWeight: "bold", sx: { mr: 1 }, children: "AVE \u2014 Application Viewer/Editor" }), _jsxs(FormControl, { size: "small", sx: { minWidth: 120 }, children: [_jsx(InputLabel, { children: "Application" }), _jsx(Select, { value: selectedAppName, label: "Application", onChange: (e) => setSelectedAppName(e.target.value), children: defaultAppNames.map((name) => (_jsx(MenuItem, { value: name, children: name }, name))) })] }), _jsxs(FormControl, { size: "small", sx: { minWidth: 120 }, children: [_jsx(InputLabel, { children: "Executable" }), _jsx(Select, { value: (_b = selectedExecutable === null || selectedExecutable === void 0 ? void 0 : selectedExecutable.name) !== null && _b !== void 0 ? _b : "", label: "Executable", onChange: (e) => setSelectedExecName(e.target.value), children: availableExecutables.map((e) => (_jsx(MenuItem, { value: e.name, children: e.name }, e.name))) })] }), _jsxs(FormControl, { size: "small", sx: { minWidth: 160 }, children: [_jsx(InputLabel, { children: "Flavor" }), _jsx(Select, { value: (_c = selectedFlavor === null || selectedFlavor === void 0 ? void 0 : selectedFlavor.name) !== null && _c !== void 0 ? _c : "", label: "Flavor", onChange: (e) => setSelectedFlavorName(e.target.value), children: availableFlavors.map((f) => (_jsx(MenuItem, { value: f.name, children: f.name }, f.name))) })] }), _jsx(Divider, { orientation: "vertical", flexItem: true }), _jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 280 }, children: [_jsx(Box, { component: "textarea", placeholder: 'Or paste a unit JSON and click "Load JSON"\u2026', value: jsonInput, onChange: (e) => setJsonInput(e.target.value), rows: 1, sx: {
                                    flex: 1,
                                    fontFamily: "monospace",
                                    fontSize: 12,
                                    resize: "none",
                                    border: "1px solid",
                                    borderColor: jsonError ? "error.main" : "divider",
                                    borderRadius: 1,
                                    p: 0.5,
                                    backgroundColor: "background.default",
                                    color: "text.primary",
                                } }), _jsx(Button, { size: "small", variant: "outlined", onClick: loadFromJson, children: "Load JSON" })] }), jsonError && (_jsx(Typography, { variant: "caption", color: "error", children: jsonError }))] }), _jsx(Box, { flex: 1, overflow: "auto", sx: { p: 2 }, children: unit ? (_jsx(ExecutionUnit, { unit: unit, onUpdate: onUnitUpdate, editable: true, adjustable: true, isStandalone: true, renderingContext: defaultRenderingContext, materials: defaultMaterials, materialsIndex: 0 })) : (_jsx(Typography, { color: "text.secondary", sx: { mt: 4, textAlign: "center" }, children: "Select an application above to load a unit." })) })] }));
}
async function init() {
    var _a;
    // Dynamic import ensures we get the SAME JSONSchemasInterface instance
    // that @mat3ra/wode's pre-bundled chunk already loaded — avoids the Vite
    // singleton split where static imports resolve a separate pre-built copy.
    const { default: JSONSchemasInterface } = await import("@mat3ra/esse/dist/js/esse/JSONSchemasInterface");
    const { default: esseSchemas } = await import("@mat3ra/esse/dist/js/schemas.json");
    JSONSchemasInterface.setSchemas(esseSchemas);
    console.log("AVE standalone: mounting React app, schemas registered:", (_a = JSONSchemasInterface.schemasCache) === null || _a === void 0 ? void 0 : _a.size);
    ReactDOM.render(_jsx(ThemeProvider, { children: _jsx(AveStandalone, {}) }), document.getElementById("root"));
}
init();
