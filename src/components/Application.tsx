import Select from "@exabyte-io/cove.js/dist/mui/components/select";
import type {
    ApplicationSchema,
    ExecutableSchema,
    ExecutionUnitSchema,
    FlavorSchema,
} from "@mat3ra/esse/dist/js/types";
import { ApplicationRegistry } from "@mat3ra/standata";
import type { SelectChangeEvent } from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import { uniqBy } from "lodash";
import getValue from "lodash/get";
import uniq from "lodash/uniq";
import React, { useCallback, useMemo, useState } from "react";

type SelectSelector = {
    id: string;
    name: string;
    value: string;
};

type SelectItem = {
    id: string;
    name: string;
    value: string;
};

/** Cove `Select` types `value` as `"" | string[]`; single selection uses a one-element array. */
function toCoveSelectValue(selected: string): "" | string[] {
    return selected ? [selected] : "";
}

function selectSingleValueFromCoveSelect(event: SelectChangeEvent<string | string[]>): string {
    const { value } = event.target;
    if (typeof value === "string") {
        return value;
    }
    if (Array.isArray(value) && typeof value[0] === "string") {
        return value[0];
    }
    return "";
}

function getStringSelectItems(options: readonly string[] | null | undefined): SelectItem[] {
    if (!options) return [];
    return options.map((option) => ({
        id: String(option),
        name: String(option),
        value: String(option),
    }));
}

function getEntitySelectItems<T extends object>(
    options: readonly T[] | null | undefined,
    selector: SelectSelector,
): SelectItem[] {
    if (!options) return [];
    return options.map((option, index) => ({
        id: `option-${getValue(option, selector.id, index)}`,
        name: String(getValue(option, selector.name, "") ?? ""),
        value: String(getValue(option, selector.value, "") ?? ""),
    }));
}

export type ApplicationProps = {
    onApplicationUpdate?: (application: ApplicationSchema) => void;
    onExecutableUpdate?: (executable: ExecutableSchema, flavor: FlavorSchema) => void;
    onFlavorUpdate?: (flavor: FlavorSchema) => void;
    showExec?: boolean;
    className?: string | null;
    application: ApplicationSchema;
    editable?: boolean;
    executable?: ExecutionUnitSchema["executable"];
    isExecEditable?: boolean;
    showFlavor?: boolean;
    flavor?: FlavorSchema | null;
    isFlavorEditable?: boolean;
};

const noop = (): void => undefined;

export function Application({
    onApplicationUpdate = noop,
    onExecutableUpdate = noop,
    onFlavorUpdate = noop,
    showExec,
    className: propsClassName = null,
    application,
    editable = true,
    executable,
    isExecEditable = true,
    showFlavor,
    flavor,
    isFlavorEditable = true,
}: ApplicationProps) {
    const [isVersionDeprecated, setIsVersionDeprecated] = useState(false);
    const colSpan = showExec ? 3 : 5;

    const registry = useMemo(() => new ApplicationRegistry(), []);

    const onNameSelect = (name: string) => {
        const applications = registry.getApplications();
        const newApplication = applications.find((app) => {
            return app.name === name && app.isDefault;
        });
        if (newApplication) {
            onApplicationUpdate(newApplication);
        }
    };

    const onVersionSelect = (version: string) => {
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

    const onBuildSelect = (build: string) => {
        const { name, version } = application;
        const applications = registry.getApplications();

        const newApplication = applications.find((app) => {
            return app.name === name && app.version === version && app.build === build;
        });
        if (newApplication) {
            onApplicationUpdate(newApplication);
        }
    };

    const onExecutableSelect = useCallback(
        (executableName: string) => {
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
        },
        [application.name, application.version, onExecutableUpdate, registry],
    );

    const onFlavorSelect = useCallback(
        (flavorName: string) => {
            if (!executable?.name) return;

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
        },
        [application.name, application.version, onFlavorUpdate, registry, executable?.name],
    );

    const versionOptions = (): SelectItem[] => {
        const { version: currentVersion } = application;
        const applications = registry.getApplications();

        const versions = uniq(
            applications.filter((app) => app.name === application.name).map((app) => app.version),
        );

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

    const flavorOptions = (): SelectItem[] => {
        if (!executable) return [];
        try {
            const flavors = registry.getFlavorsByApplicationExecutable(application, executable);

            return getStringSelectItems(flavors.map((f) => f.name));
        } catch {
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

    return (
        <Stack spacing={1} className={propsClassName ?? undefined} data-tid="application">
            <Typography variant="subtitle2" color="text.primary">
                Application
            </Typography>
            <Grid2 container columns={15} spacing={1}>
                <Grid2 xs={15} sm={5} lg={colSpan}>
                    <Select
                        id="select-application-name"
                        label="Name"
                        size="small"
                        value={toCoveSelectValue(application.name)}
                        items={selectApplicationOptions}
                        onChange={(e) => onNameSelect(selectSingleValueFromCoveSelect(e))}
                        formControlProps={{ disabled: !editable }}
                    />
                </Grid2>
                <Grid2 xs={15} sm={5} lg={colSpan}>
                    <Select
                        id="select-application-version"
                        label="Version"
                        value={toCoveSelectValue(application.version)}
                        items={versionOptions()}
                        onChange={(e) => onVersionSelect(selectSingleValueFromCoveSelect(e))}
                        size="small"
                        formControlProps={{
                            error: isVersionDeprecated,
                            disabled: !editable,
                        }}
                    />
                </Grid2>
                <Grid2 xs={15} sm={5} lg={colSpan}>
                    <Select
                        id="select-application-build"
                        label="Build"
                        value={toCoveSelectValue(application.build)}
                        items={getStringSelectItems(uniq(applicationBuilds))}
                        onChange={(e) => onBuildSelect(selectSingleValueFromCoveSelect(e))}
                        size="small"
                        formControlProps={{ disabled: !editable }}
                    />
                </Grid2>
                {!showExec ? null : (
                    <Grid2 xs={15} sm={5} lg={3}>
                        <Select
                            id="select-application-executable"
                            label="Executable"
                            value={toCoveSelectValue(executable?.name ?? "")}
                            items={getStringSelectItems(uniq(applicationExecutables))}
                            onChange={handleExecutableSelect}
                            size="small"
                            formControlProps={{ disabled: !isExecEditable }}
                        />
                    </Grid2>
                )}
                {!showFlavor ? null : (
                    <Grid2 xs={15} sm={5} lg={3}>
                        <Select
                            id="select-application-flavor"
                            label="Flavor"
                            value={toCoveSelectValue(flavor?.name ?? "")}
                            items={flavorOptions()}
                            onChange={(e) => onFlavorSelect(selectSingleValueFromCoveSelect(e))}
                            size="small"
                            formControlProps={{ disabled: !isFlavorEditable }}
                        />
                    </Grid2>
                )}
            </Grid2>
        </Stack>
    );
}
