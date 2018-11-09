//@ts-check
const { readFileSync, writeFileSync } = require("fs");
const { join } = require("path");
/**
 * @param {import("../src/data/types").CommandNode} node
 * @param {string[]} path
 * @returns {string[][]}
 */
function getPaths(node, path) {
    const result = [];
    if (node.parser === "minecraft:nbt_path") {
        result.push(path);
    }
    if (node.children) {
        for (const child of Object.keys(node.children)) {
            result.push(...getPaths(node.children[child], [...path, child]));
        }
    }
    return result;
}

writeFileSync(
    join(__dirname, "nbt_path_output.json"),
    JSON.stringify(
        simplify(
            getPaths(
                JSON.parse(
                    readFileSync(join(__dirname, "commands.json")).toString()
                ),
                []
            )
        ),
        undefined,
        4
    )
);

/**
 * Get the minimum paths which start with a given value
 * @param {string[][]} param
 * @returns {string[][]}
 */
function simplify(param) {
    const result = [];
    outer: for (const option of param) {
        const internal = [];
        for (const part of option) {
            internal.push(part);
            if (
                param.filter(v => internal.every((a, i) => a === v[i]))
                    .length === 1
            ) {
                result.push(internal);
                continue outer;
            }
        }
        result.push(internal);
    }
    return result;
}
