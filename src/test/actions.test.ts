import * as assert from "assert";
import { SignatureInformation } from "vscode-languageserver";

import { signatureHelpProvider } from "../actions";
import { DataManager } from "../data/manager";
import { CommandTree } from "../data/types";
import { assertMembers, unwrap } from "./assertions";
import { emptyGlobal } from "./blanks";

const tree: CommandTree = {
    children: {
        redirect: { type: "literal", redirect: ["segment1", "segment2"] },
        run: { type: "literal" },
        segment1: {
            children: { segment2: { type: "literal", executable: true } },
            type: "literal"
        },
        simple: { type: "literal", executable: true }
    },
    type: "root"
};
const manager = DataManager.newWithData({
    ...emptyGlobal,
    commands: tree
});
describe("signatureHelpProvider()", () => {
    it("should give results for every command when no text is specified", () => {
        const result = unwrap(
            signatureHelpProvider(
                {
                    parseInfo: { nodes: [], actions: [], errors: [] },
                    text: ""
                },
                { line: 0, character: 0 },
                {} as any,
                manager
            )
        );
        const expected = {
            activeParameter: 0,
            activeSignature: 0
        };
        assertMembers<SignatureInformation, string>(
            result.signatures,
            [
                "redirect",
                "run redirect|run|segment1|simple", // Root redirect
                "segment1 segment2",
                "simple"
            ],
            (a, e) => a.label === e
        );
        delete result.signatures;
        assert.deepEqual(result, expected);
    });
});
