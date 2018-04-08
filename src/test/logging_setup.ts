import * as path from "path";

export function setup_test() {
    global.mcLangSettings = {
        parsers: {
            "langserver:dummy1": path.join(__dirname, "parse", "parsers", "tests", "dummy1_parser"),
        },
    } as any as McFunctionSettings;
    const logger = (message: string) => {
        // tslint:disable-next-line:no-console
        console.log(message);
    };

    global.mcLangLog = Object.assign(logger,
        { internal: (message: string) => logger(`[McFunctionInternal] ${message}`) });
}
