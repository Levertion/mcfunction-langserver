import { SynchronousPromise } from "synchronous-promise";
import {
    getLanguageService,
    SchemaRequestService
} from "vscode-json-languageservice";
import { NonCacheable } from "./types";

export async function loadNonCached(): Promise<NonCacheable> {
    // tslint:disable-next-line:no-require-imports prettier breaks require.resolve so we need to use
    const textComponentSchema = require("minecraft-json-schemas/java/shared/text_component");

    const schemas: { [key: string]: string } = {};
    const schemaRequestService: SchemaRequestService = url =>
        schemas.hasOwnProperty(url)
            ? SynchronousPromise.resolve(schemas[url])
            : SynchronousPromise.reject<string>(
                  `Schema at url ${url} not supported`
              );

    const jsonService = getLanguageService({
        promiseConstructor: SynchronousPromise,
        schemaRequestService
    });
    return {
        jsonService,
        textComponentSchema
    };
}
