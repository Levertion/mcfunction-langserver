import { CommandNode } from "../../data/types";
import { Parser } from "../../types";

const implementedParsers: { [id: string]: string } = {
    "langserver:dummy1": "./tests/dummy1",
};

export function getParser(node: CommandNode): Parser | undefined {
    let parserPath: string = "";
    switch (node.type) {
        case "literal":
            parserPath = "./literal";
            break;
        case "argument":
            if (!!node.parser) {
                parserPath = getArgParserPath(node.parser);
            }
            break;
        default:
            mcLangLog(`Invalid node type: ${node.type} in ${
                JSON.stringify(node)}`);
            break;
    }
    if (parserPath.length > 0) {
        try {
            return require(parserPath);
        } catch (error) {
            mcLangLog(`No parser was found at ${parserPath
                }. Please consider reporting this at https://github.com/Levertion/mcfunction-language-server/issues,\
along with: '${JSON.stringify(error)}'.`);
        }
    }
    return;
}

function getArgParserPath(id: string): string {
    if (implementedParsers.hasOwnProperty(id)) {
        return implementedParsers[id];
    } else {
        mcLangLog(`Argument with parser id ${id} has no associated parser.
Please consider reporting this at https://github.com/Levertion/mcfunction-language-server/issues`);
        return "";
    }
}
