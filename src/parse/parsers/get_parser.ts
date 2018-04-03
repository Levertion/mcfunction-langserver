import { CommandNode } from "../../data/types";
import { Parser } from "../../types";

const implementedParsers: { [id: string]: Parser } = {

};

// Used for testing, but should be kept in
export function putParser(id: string, parser: Parser) {
    implementedParsers[id] = parser;
}

export function getParser(node: CommandNode): Parser | undefined {
    switch (node.type) {
        case "literal":
            return require("../parsers/literal");
        case "argument":
            if (!!node.parser) {
                return implementedParsers[node.parser];
            }
            break;
        default:
            mcLangLog(`Invalid node type: ${node.type} in ${
                JSON.stringify(node)}`);
            break;
    }
    return;
}
