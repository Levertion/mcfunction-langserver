import { ReturnHelper } from "../../../misc_functions";
import { Parser } from "../../../types";

/**
 * Used for testing.
 * Do not attempt to use an actual command tree using this.
 */
const parser: Parser = {
    parse: (reader, node) => {
        const helper = new ReturnHelper();
        const num: number = (node.node_properties.number as number) || 3;
        helper.addSuggestions("hello");
        helper.addSuggestion(
            Math.min(Math.floor(num / 2), reader.string.length),
            "welcome"
        );
        if (reader.canRead(num)) {
            reader.cursor += num;
            return helper.succeed();
        } else {
            return helper.fail();
        }
    }
};

export = parser;
