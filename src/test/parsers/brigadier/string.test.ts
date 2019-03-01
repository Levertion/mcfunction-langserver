import { stringParser } from "../../../parsers/brigadier";
import { snapshot, testParser } from "../../assertions";

const stringTest = testParser(stringParser);

describe("String Argument Parser", () => {
    it("should work with a greedy string", () => {
        snapshot(
            stringTest({
                node_properties: { type: "greedy" }
            }),
            'test space :"-)(*'
        );
    });
    it("should work for a phrase string", () => {
        const tester = stringTest({ node_properties: { type: "phrase" } });
        snapshot(tester, 'test space :"-)(*', '"quote test" :"-)(*');
    });
    it("should work for a word string", () => {
        const tester = stringTest({ node_properties: { type: "word" } });
        snapshot(tester, 'test space :"-)(*', '"quote test" :"-)(*');
    });
});
