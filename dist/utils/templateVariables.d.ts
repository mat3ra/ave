/**
 * Reading an input template against the context it will render with.
 *
 * Two questions the editor could not answer before: what is available to write into a template,
 * and whether what is written actually resolves. The second matters more than it looks —
 * templates render through nunjucks, which substitutes an unknown variable with the **empty
 * string**. A typo does not fail loudly, or even leave `{{ }}` behind in the preview; it quietly
 * drops a value out of the input file a simulation then runs with.
 *
 * Kept free of React so the parsing rules are testable on their own.
 */
/** One entry of the rendering context, as the variables panel lists it. */
export interface ContextVariable {
    /** Dotted path to write into a template, e.g. `cutoffs.wavefunction`. */
    path: string;
    /** Top-level key the path hangs off, which is what determines its origin. */
    root: string;
    origin: string;
    /** Short rendering of the current value. */
    preview: string;
    /** False for objects and arrays, which are containers rather than values. */
    isLeaf: boolean;
}
/** A `{{ … }}` expression that will render to nothing. */
export interface TemplateIssue {
    /** 1-based, so it matches the editor's gutter. */
    line: number;
    /** The whole expression, for showing what was written. */
    expression: string;
    /** The longest prefix of the path that does not resolve. */
    name: string;
    /** Nearest available name, when one is close enough to be worth offering. */
    suggestion?: string;
}
export declare function describeOrigin(root: string, overrides?: Record<string, string>): string;
export interface FlattenOptions {
    /** How far to walk into nested plain objects. Deeper paths are still writable by hand. */
    maxDepth?: number;
    /** Backstop for a context that turns out to be far larger than expected. */
    maxVariables?: number;
    originOverrides?: Record<string, string>;
}
/** Every path a template can write, in the order the context declares them. */
export declare function flattenRenderingContext(context: Record<string, unknown> | undefined, { maxDepth, maxVariables, originOverrides }?: FlattenOptions): ContextVariable[];
/** Names the template binds itself, which are not expected to be in the context. */
export declare function collectLocalNames(template: string): Set<string>;
/**
 * Root-anchored dotted paths referenced by an expression.
 *
 * Skips string literals, filter names after `|`, property names after `.` whose root was already
 * skipped, and anything called as a function. Stops a path at `[`, so a dynamic index such as
 * `input.perMaterial[subworkflowContext.MATERIAL_INDEX]` contributes `input.perMaterial` and the
 * index expression separately, rather than one path that could never be resolved.
 */
export declare function extractPaths(expression: string): string[];
interface Resolution {
    resolved: boolean;
    /** Longest prefix that failed, when it did. */
    missing?: string;
    /** Keys available where it failed, for suggesting a near match. */
    available?: string[];
}
/**
 * Walks a dotted path through the context, stopping the moment it reaches something that is not
 * plain data — an entity instance's own properties cannot be enumerated reliably, and reporting
 * `material.name` as missing because `Material` is a class would be worse than saying nothing.
 */
export declare function resolvePath(context: Record<string, unknown>, path: string): Resolution;
/** Nearest candidate, when one is near enough that offering it is help rather than noise. */
export declare function suggestName(name: string, candidates: string[]): string | undefined;
/**
 * Expressions in `template` that will not resolve against `context`.
 *
 * Only `{{ … }}` output is checked, never `{% if … %}` conditions: testing whether an optional
 * value is present is idiomatic — the templates here open with
 * `{% if subworkflowContext.MATERIAL_INDEX %}` — while an unresolved `{{ … }}` silently writes an
 * empty string into the file the simulation runs on.
 */
export declare function findUnresolvedVariables(template: string | undefined, context: Record<string, unknown> | undefined): TemplateIssue[];
export {};
