/** Matches legacy `JupyterExecutionUnitMixin`: `this.executable.name === "jupyter"`. */
export const JUPYTER_EXECUTABLE_NAME = "jupyter";

export function isJupyterExecutionUnit(unit: { executable: { name: string } }): boolean {
    return unit.executable.name === JUPYTER_EXECUTABLE_NAME;
}
