import ThemeProvider from "@exabyte-io/cove.js/dist/theme/provider/ThemeProvider";
import JSONSchemasInterface from "@mat3ra/esse/dist/js/esse/JSONSchemasInterface";
import esseSchemas from "@mat3ra/esse/dist/js/schemas.json";
import type { JSONSchema7 } from "json-schema";
import type { ExecutionUnitSchema } from "@mat3ra/esse/dist/js/types";
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
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";

import { ExecutionUnit } from "../components/ExecutionUnit";

// Register all ESSE schemas before anything renders
JSONSchemasInterface.setSchemas(esseSchemas as unknown as JSONSchema7[]);

// Bootstrap the standata application registry once
const applicationDriver = new ApplicationDriver();
ApplicationRegistry.setDriver(applicationDriver);
const registry = new ApplicationRegistry();

// Load default material (Silicon FCC) for the rendering context
const materialStandata = new MaterialStandata();
const allMaterials = materialStandata.getAll();
const defaultMaterial = allMaterials.find((m: any) => m.name?.includes("Silicon")) ?? allMaterials[0];
const defaultMaterials = [defaultMaterial] as any[];
const defaultRenderingContext: Record<string, unknown> = { MATERIAL: defaultMaterial };

type AppOption = ReturnType<ApplicationRegistry["getApplications"]>[number];
type ExecOption = ReturnType<ApplicationRegistry["getExecutablesByApplication"]>[number];
type FlavorOption = ReturnType<ApplicationRegistry["getFlavors"]>[number];

function buildDefaultUnit(
    application: AppOption,
    executable: ExecOption,
    flavor: FlavorOption,
): ExecutionUnitSchema {
    const input = registry.getInput(application, flavor);
    const unitInstance = new WodeExecutionUnit({
        type: "execution",
        name: `${application.name} ${flavor.name}`,
        application: {
            name: application.name,
            shortName: application.shortName,
            version: application.version,
            build: application.build,
            summary: application.summary ?? "",
            isDefault: application.isDefault ?? false,
            isDefaultVersion: application.isDefaultVersion ?? false,
            isLicensed: application.isLicensed ?? false,
            isUsingMaterial: application.isUsingMaterial ?? false,
            hasAdvancedComputeOptions: application.hasAdvancedComputeOptions ?? false,
        },
        executable: { name: executable.name },
        flavor: { name: flavor.name },
        input: input.map((file: any) => ({
            template: {
                name: file.name,
                content: file.template?.content ?? "",
            },
            rendered: file.template?.content ?? "",
            isManuallyChanged: false,
        })),
        monitors: flavor.monitors ?? [],
        results: flavor.results ?? [],
        postProcessors: flavor.postProcessors ?? [],
        preProcessors: flavor.preProcessors ?? [],
    });
    return unitInstance.toJSON() as ExecutionUnitSchema;
}

function AveStandalone() {
    const allApps = useMemo(() => registry.getApplications(), []);
    const defaultAppNames = useMemo(
        () => [...new Set(allApps.filter((a) => a.isDefault).map((a) => a.name))],
        [allApps],
    );

    const [selectedAppName, setSelectedAppName] = useState<string>(defaultAppNames[0] ?? "vasp");

    const availableApps = useMemo(
        () => allApps.filter((a) => a.name === selectedAppName),
        [allApps, selectedAppName],
    );
    const selectedApp = useMemo(
        () => availableApps.find((a) => a.isDefault) ?? availableApps[0],
        [availableApps],
    );

    const availableExecutables = useMemo(
        () => (selectedApp ? registry.getExecutablesByApplication(selectedApp) : []),
        [selectedApp],
    );
    const [selectedExecName, setSelectedExecName] = useState<string>("");

    const selectedExecutable = useMemo(
        () =>
            availableExecutables.find((e) => e.name === selectedExecName) ??
            availableExecutables.find((e) => e.isDefault) ??
            availableExecutables[0],
        [availableExecutables, selectedExecName],
    );

    const availableFlavors = useMemo(
        () =>
            selectedApp && selectedExecutable
                ? registry.getFlavorsByApplicationExecutable(selectedApp, selectedExecutable)
                : [],
        [selectedApp, selectedExecutable],
    );
    const [selectedFlavorName, setSelectedFlavorName] = useState<string>("");

    const selectedFlavor = useMemo(
        () =>
            availableFlavors.find((f) => f.name === selectedFlavorName) ??
            availableFlavors.find((f) => f.isDefault) ??
            availableFlavors[0],
        [availableFlavors, selectedFlavorName],
    );

    // Reset exec/flavor when app changes
    useEffect(() => {
        setSelectedExecName("");
        setSelectedFlavorName("");
    }, [selectedAppName]);

    useEffect(() => {
        setSelectedFlavorName("");
    }, [selectedExecName]);

    const [unit, setUnit] = useState<ExecutionUnitSchema | null>(null);
    const [jsonInput, setJsonInput] = useState<string>("");
    const [jsonError, setJsonError] = useState<string>("");

    const loadFromStandata = useCallback(() => {
        if (!selectedApp || !selectedExecutable || !selectedFlavor) return;
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
    }, [selectedApp?.name, selectedExecutable?.name, selectedFlavor?.name]);

    const loadFromJson = useCallback(() => {
        try {
            const parsed = JSON.parse(jsonInput) as ExecutionUnitSchema;
            setUnit(parsed);
            setJsonError("");
        } catch {
            setJsonError("Invalid JSON — please check the format.");
        }
    }, [jsonInput]);

    const onUnitUpdate = useCallback((updated: ExecutionUnitSchema) => {
        setUnit(updated);
    }, []);

    return (
        <Stack height="100vh" overflow="hidden">
            {/* Toolbar */}
            <Box
                sx={{
                    px: 2,
                    py: 1,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "background.paper",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 1 }}>
                    AVE — Application Viewer/Editor
                </Typography>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Application</InputLabel>
                    <Select
                        value={selectedAppName}
                        label="Application"
                        onChange={(e) => setSelectedAppName(e.target.value)}>
                        {defaultAppNames.map((name) => (
                            <MenuItem key={name} value={name}>
                                {name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Executable</InputLabel>
                    <Select
                        value={selectedExecutable?.name ?? ""}
                        label="Executable"
                        onChange={(e) => setSelectedExecName(e.target.value)}>
                        {availableExecutables.map((e) => (
                            <MenuItem key={e.name} value={e.name}>
                                {e.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>Flavor</InputLabel>
                    <Select
                        value={selectedFlavor?.name ?? ""}
                        label="Flavor"
                        onChange={(e) => setSelectedFlavorName(e.target.value)}>
                        {availableFlavors.map((f) => (
                            <MenuItem key={f.name} value={f.name}>
                                {f.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Divider orientation="vertical" flexItem />

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 280 }}>
                    <Box
                        component="textarea"
                        placeholder='Or paste a unit JSON and click "Load JSON"…'
                        value={jsonInput}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            setJsonInput(e.target.value)
                        }
                        rows={1}
                        sx={{
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
                        }}
                    />
                    <Button size="small" variant="outlined" onClick={loadFromJson}>
                        Load JSON
                    </Button>
                </Box>

                {jsonError && (
                    <Typography variant="caption" color="error">
                        {jsonError}
                    </Typography>
                )}
            </Box>

            {/* Main content */}
            <Box flex={1} overflow="auto" sx={{ p: 2 }}>
                {unit ? (
                    <ExecutionUnit
                        unit={unit as any}
                        onUpdate={onUnitUpdate as any}
                        editable
                        adjustable
                        isStandalone
                        renderingContext={defaultRenderingContext}
                        materials={defaultMaterials}
                        materialsIndex={0}
                    />
                ) : (
                    <Typography color="text.secondary" sx={{ mt: 4, textAlign: "center" }}>
                        Select an application above to load a unit.
                    </Typography>
                )}
            </Box>
        </Stack>
    );
}

async function init() {
    // Dynamic import ensures we get the SAME JSONSchemasInterface instance
    // that @mat3ra/wode's pre-bundled chunk already loaded — avoids the Vite
    // singleton split where static imports resolve a separate pre-built copy.
    const { default: JSONSchemasInterface } = await import(
        "@mat3ra/esse/dist/js/esse/JSONSchemasInterface"
    );
    const { default: esseSchemas } = await import("@mat3ra/esse/dist/js/schemas.json");
    JSONSchemasInterface.setSchemas(esseSchemas as unknown as JSONSchema7[]);

    console.log("AVE standalone: mounting React app, schemas registered:", JSONSchemasInterface.schemasCache?.size);

    ReactDOM.render(
        <ThemeProvider>
            <AveStandalone />
        </ThemeProvider>,
        document.getElementById("root"),
    );
}

init();
