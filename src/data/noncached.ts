import { nbtDocs, NBTNode, ValueList } from "mc-nbt-paths";
import { SynchronousPromise } from "synchronous-promise";
import {
    getLanguageService,
    SchemaRequestService
} from "vscode-json-languageservice";

import { NBTDocs, NonCacheable } from "./types";

export function loadNBTDocs(): NBTDocs {
    const nbtData = new Map<string, NBTNode | ValueList>();
    Object.keys(nbtDocs).forEach(k => nbtData.set(k, nbtDocs[k]));
    return nbtData;
}
const textComponentSchema =
    "https://raw.githubusercontent.com/Levertion/minecraft-json-schema/master/java/shared/text_component.json";

export async function loadNonCached(): Promise<NonCacheable> {
    const schemas: { [key: string]: string } = {
        [textComponentSchema]: JSON.stringify(
            // FIXME: prettier breaks require.resolve so we need to use plain require to get the correct path
            // tslint:disable-next-line:no-require-imports
            require("minecraft-json-schemas/java/shared/text_component")
        )
    };
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
    jsonService.configure({
        allowComments: false,
        schemas: [
            {
                fileMatch: ["text-component.json"],
                uri: textComponentSchema
            }
        ],
        validate: true
    });

    return {
        jsonService,
        nbt_docs: loadNBTDocs()
    };
}
