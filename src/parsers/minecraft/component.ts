import { TextDocument } from "vscode-json-languageservice";
import { DiagnosticSeverity } from "vscode-languageserver";
import { CommandError } from "../../brigadier/errors";
import { ReturnHelper } from "../../misc-functions";
import { Parser } from "../../types";

export const jsonParser: Parser = {
    parse: (reader, info) => {
        const helper = new ReturnHelper();
        const remaining = reader.getRemaining();
        const start = reader.cursor;
        reader.cursor = reader.string.length;
        const text: TextDocument = {
            getText: () => remaining,
            languageId: "json",
            lineCount: 1,
            offsetAt: pos => pos.character,
            positionAt: offset => ({ line: 0, character: offset }),
            uri: "file://text-component.json",
            version: 0
        };
        const service = info.data.globalData.jsonService;
        const json = service.parseJSONDocument(text);
        service.doValidation(text, json).then(diagnostics => {
            /* Because we use SynchronousPromise this is called before the next statement runs*/
            helper.addErrors(
                ...diagnostics.map<CommandError>(diag => ({
                    code: typeof diag.code === "string" ? diag.code : "json",
                    range: {
                        end: start + diag.range.end.character,
                        start: start + diag.range.start.character
                    },
                    severity: diag.severity || DiagnosticSeverity.Error,
                    text: diag.message
                }))
            );
        });
        service
            .doComplete(text, { line: 0, character: remaining.length }, json)
            .then(completionList => {
                if (completionList) {
                    completionList.items.forEach(item => {
                        if (item.textEdit) {
                            helper.addSuggestions({
                                description: item.documentation,
                                kind: item.kind,
                                start:
                                    start + item.textEdit.range.start.character,
                                text: item.textEdit.newText
                            });
                        } else {
                            helper.addSuggestions({
                                description: item.documentation,
                                kind: item.kind,
                                start: reader.cursor,
                                text: item.label
                            });
                        }
                    });
                }
            });
        helper.addActions({
            data: {
                json,
                text
            },
            high: reader.cursor,
            low: start,
            type: "json"
        });
        return helper.succeed();
    }
};
