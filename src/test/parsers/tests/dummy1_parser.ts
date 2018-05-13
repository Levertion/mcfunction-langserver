import { ReturnHelper } from "../../../misc_functions";
import { Parser } from "../../../types";

/**
 * Used for testing.
 * Do not attempt to use an actual command tree using this.
 */
const parser: Parser = {
    parse: (reader, node) => {
        const helper = new ReturnHelper();
        helper.addSuggestion(0, "hello");
        helper.addSuggestion(reader.cursor, "welcome");
        const num: number = node.node_properties.number || 3;
        if (reader.canRead(num)) {
            reader.cursor += num;
            return helper.succeed();
        } else {
            return helper.fail();
        }
    },
};

export = parser;
