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
/**
 * Where a top-level context key comes from.
 *
 * wode builds the rendering context as `{ ...providerName → providerData, ...externalContext }`
 * (`ExecutionUnit.saveRenderingContext`), so anything **not** in this table arrived from a
 * context provider — which is what the Settings tab edits. That is why the fallback below is a
 * statement rather than a guess.
 */
const EXTERNAL_CONTEXT_ORIGINS = {
    material: "From the material",
    materials: "From the material",
    materialsSet: "From the material",
    input: "Derived from the material",
    application: "From the application",
    methodData: "From the method",
    subworkflowContext: "Set at job runtime",
    workflowHasRelaxation: "From the workflow",
    jobHasParent: "From the workflow",
};
const PROVIDER_ORIGIN = "Important settings";
export function describeOrigin(root, overrides) {
    var _a, _b;
    return (_b = (_a = overrides === null || overrides === void 0 ? void 0 : overrides[root]) !== null && _a !== void 0 ? _a : EXTERNAL_CONTEXT_ORIGINS[root]) !== null && _b !== void 0 ? _b : PROVIDER_ORIGIN;
}
/** Entity instances (Material, Application…) are opaque here: only plain data is walked. */
function isPlainObject(value) {
    if (typeof value !== "object" || value === null || Array.isArray(value))
        return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}
function previewValue(value) {
    if (value === null)
        return "null";
    if (value === undefined)
        return "undefined";
    if (Array.isArray(value))
        return `[${value.length} item${value.length === 1 ? "" : "s"}]`;
    if (typeof value === "object") {
        const keys = Object.keys(value);
        return keys.length
            ? `{ ${keys.slice(0, 3).join(", ")}${keys.length > 3 ? ", …" : ""} }`
            : "{ }";
    }
    const text = String(value);
    return text.length > 60 ? `${text.slice(0, 57)}…` : text;
}
/** Every path a template can write, in the order the context declares them. */
export function flattenRenderingContext(context, { maxDepth = 3, maxVariables = 400, originOverrides } = {}) {
    if (!context || typeof context !== "object")
        return [];
    const variables = [];
    const walk = (value, path, root, depth) => {
        if (variables.length >= maxVariables)
            return;
        const isLeaf = !isPlainObject(value) && !Array.isArray(value);
        variables.push({
            path,
            root,
            origin: describeOrigin(root, originOverrides),
            preview: previewValue(value),
            isLeaf,
        });
        if (isPlainObject(value) && depth < maxDepth) {
            Object.keys(value).forEach((key) => walk(value[key], `${path}.${key}`, root, depth + 1));
        }
    };
    Object.keys(context).forEach((key) => walk(context[key], key, key, 1));
    return variables;
}
// ---------------------------------------------------------------------------
// Template analysis
// ---------------------------------------------------------------------------
/** Names nunjucks provides itself, plus the operators that read like identifiers. */
const RESERVED = new Set([
    "loop",
    "range",
    "cycler",
    "joiner",
    "super",
    "self",
    "true",
    "false",
    "none",
    "null",
    "True",
    "False",
    "None",
    "if",
    "else",
    "elif",
    "not",
    "and",
    "or",
    "in",
    "is",
    "by",
]);
/**
 * Blanks out `{% raw %}` bodies, preserving offsets and line breaks.
 *
 * What is inside them is deliberately *not* rendered — job-runtime placeholders such as
 * `{{ JOB_WORK_DIR }}` — so checking them would report the template's whole point as a defect.
 */
function blankRawBlocks(template) {
    return template.replace(/\{%-?\s*raw\s*-?%\}[\s\S]*?\{%-?\s*endraw\s*-?%\}/g, (block) => block.replace(/[^\n]/g, " "));
}
/** Names the template binds itself, which are not expected to be in the context. */
export function collectLocalNames(template) {
    const names = new Set();
    const add = (name) => {
        const trimmed = name.trim();
        if (trimmed)
            names.add(trimmed);
    };
    Array.from(template.matchAll(/\{%-?\s*(?:set|with)\s+([A-Za-z_]\w*)/g)).forEach((match) => add(match[1]));
    Array.from(template.matchAll(/\{%-?\s*macro\s+([A-Za-z_]\w*)/g)).forEach((match) => add(match[1]));
    // `{% for a, b in items %}` binds both names.
    Array.from(template.matchAll(/\{%-?\s*for\s+([\s\S]*?)\s+in\s/g)).forEach((match) => match[1].split(",").forEach(add));
    return names;
}
/** The `{{ … }}` expressions, with the offset each starts at. */
function extractOutputExpressions(template) {
    return Array.from(template.matchAll(/\{\{([\s\S]*?)\}\}/g)).map((match) => {
        var _a;
        return ({
            expression: match[1],
            index: (_a = match.index) !== null && _a !== void 0 ? _a : 0,
        });
    });
}
/**
 * Root-anchored dotted paths referenced by an expression.
 *
 * Skips string literals, filter names after `|`, property names after `.` whose root was already
 * skipped, and anything called as a function. Stops a path at `[`, so a dynamic index such as
 * `input.perMaterial[subworkflowContext.MATERIAL_INDEX]` contributes `input.perMaterial` and the
 * index expression separately, rather than one path that could never be resolved.
 */
export function extractPaths(expression) {
    const paths = [];
    let index = 0;
    let previous = "";
    while (index < expression.length) {
        const char = expression[index];
        if (char === "'" || char === '"') {
            const quote = char;
            index += 1;
            while (index < expression.length && expression[index] !== quote) {
                index += expression[index] === "\\" ? 2 : 1;
            }
            index += 1;
            previous = "literal";
            continue;
        }
        if (/\s/.test(char)) {
            index += 1;
            continue;
        }
        if (!/[A-Za-z_]/.test(char)) {
            previous = char;
            index += 1;
            continue;
        }
        let end = index;
        while (end < expression.length && /\w/.test(expression[end]))
            end += 1;
        const identifier = expression.slice(index, end);
        let afterIdentifier = end;
        while (afterIdentifier < expression.length && /\s/.test(expression[afterIdentifier])) {
            afterIdentifier += 1;
        }
        const isCall = expression[afterIdentifier] === "(";
        const isSkipped = previous === "|" || previous === "." || isCall || RESERVED.has(identifier);
        if (isSkipped) {
            index = end;
            previous = "identifier";
            continue;
        }
        let path = identifier;
        let cursor = end;
        while (expression[cursor] === ".") {
            let segmentEnd = cursor + 1;
            while (segmentEnd < expression.length && /\w/.test(expression[segmentEnd])) {
                segmentEnd += 1;
            }
            if (segmentEnd === cursor + 1)
                break;
            let afterSegment = segmentEnd;
            while (afterSegment < expression.length && /\s/.test(expression[afterSegment])) {
                afterSegment += 1;
            }
            // A method call is not a context path.
            if (expression[afterSegment] === "(")
                break;
            path += `.${expression.slice(cursor + 1, segmentEnd)}`;
            cursor = segmentEnd;
        }
        paths.push(path);
        index = cursor;
        previous = "identifier";
    }
    return paths;
}
/**
 * Walks a dotted path through the context, stopping the moment it reaches something that is not
 * plain data — an entity instance's own properties cannot be enumerated reliably, and reporting
 * `material.name` as missing because `Material` is a class would be worse than saying nothing.
 */
export function resolvePath(context, path) {
    const segments = path.split(".");
    let current = context;
    for (let i = 0; i < segments.length; i += 1) {
        if (!isPlainObject(current)) {
            return { resolved: true };
        }
        if (!(segments[i] in current)) {
            return {
                resolved: false,
                missing: segments.slice(0, i + 1).join("."),
                available: Object.keys(current),
            };
        }
        current = current[segments[i]];
    }
    return { resolved: true };
}
function editDistance(left, right) {
    const previous = Array.from({ length: right.length + 1 }, (_value, i) => i);
    for (let i = 1; i <= left.length; i += 1) {
        let diagonal = previous[0];
        previous[0] = i;
        for (let j = 1; j <= right.length; j += 1) {
            const candidate = Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + (left[i - 1] === right[j - 1] ? 0 : 1));
            diagonal = previous[j];
            previous[j] = candidate;
        }
    }
    return previous[right.length];
}
/** Nearest candidate, when one is near enough that offering it is help rather than noise. */
export function suggestName(name, candidates) {
    let best;
    candidates.forEach((candidate) => {
        const distance = editDistance(name.toLowerCase(), candidate.toLowerCase());
        if (!best || distance < best.distance)
            best = { name: candidate, distance };
    });
    if (!best)
        return undefined;
    const limit = name.length <= 4 ? 1 : 2;
    return best.distance > 0 && best.distance <= limit ? best.name : undefined;
}
/**
 * Expressions in `template` that will not resolve against `context`.
 *
 * Only `{{ … }}` output is checked, never `{% if … %}` conditions: testing whether an optional
 * value is present is idiomatic — the templates here open with
 * `{% if subworkflowContext.MATERIAL_INDEX %}` — while an unresolved `{{ … }}` silently writes an
 * empty string into the file the simulation runs on.
 */
export function findUnresolvedVariables(template, context) {
    if (!template || !context)
        return [];
    const scanned = blankRawBlocks(template);
    const localNames = collectLocalNames(scanned);
    const issues = [];
    const seen = new Set();
    extractOutputExpressions(scanned).forEach(({ expression, index }) => {
        const line = scanned.slice(0, index).split("\n").length;
        extractPaths(expression).forEach((path) => {
            var _a, _b;
            const [root] = path.split(".");
            if (localNames.has(root))
                return;
            const resolution = resolvePath(context, path);
            if (resolution.resolved || !resolution.missing)
                return;
            const key = `${line}:${resolution.missing}`;
            if (seen.has(key))
                return;
            seen.add(key);
            const missingSegment = (_a = resolution.missing.split(".").pop()) !== null && _a !== void 0 ? _a : resolution.missing;
            const suggestedSegment = suggestName(missingSegment, (_b = resolution.available) !== null && _b !== void 0 ? _b : []);
            const prefix = resolution.missing.split(".").slice(0, -1).join(".");
            issues.push({
                line,
                expression: expression.trim(),
                name: resolution.missing,
                ...(suggestedSegment
                    ? { suggestion: prefix ? `${prefix}.${suggestedSegment}` : suggestedSegment }
                    : {}),
            });
        });
    });
    return issues;
}
