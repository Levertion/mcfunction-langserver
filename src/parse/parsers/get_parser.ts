import * as path from "path";
import { CommandNode } from "../../data/types";
import { Parser } from "../../types";

/**
 * Incomplete:
 * https://github.com/Levertion/mcfunction-langserver/issues/11
 */
const implementedParsers: { [id: string]: string } = {
    "brigadier:bool": "./brigadier/bool",
    "brigadier:float": "./brigadier/float",
    "brigadier:integer": "./brigadier/integer",
    "brigadier:string": "./brigadier/string",
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
    if (!!global.mcLangSettings && // Protection for tests when settings are undefined
        !!global.mcLangSettings.parsers && global.mcLangSettings.parsers.hasOwnProperty(id)) {
        return global.mcLangSettings.parsers[id];
    } else if (implementedParsers.hasOwnProperty(id)) {
        return path.join(__dirname, implementedParsers[id]);
    } else {
        mcLangLog(`Argument with parser id ${id} has no associated parser.
Please consider reporting this at https://github.com/Levertion/mcfunction-language-server/issues`);
        return "";
    }
}
