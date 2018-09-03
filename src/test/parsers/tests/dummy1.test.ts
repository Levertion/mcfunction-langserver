import * as assert from "assert";
import { testParser } from "../../assertions";
import { dummyParser } from "./dummy1";

const dummyParserTester = testParser(dummyParser);

describe("dummyParser1", () => {
    describe("parse", () => {
        it("should read the specified number of characters", () => {
            const result = dummyParserTester({
                node_properties: { number: 4 }
            })("test hello", {
                succeeds: true,
                suggestions: ["hello", { text: "welcome", start: 2 }]
            });
            assert.strictEqual(result[1].cursor, 4);
        });

        it("should default to 3 when not given any properties", () => {
            const result = dummyParserTester()("test hello", {
                succeeds: true,
                suggestions: ["hello", { text: "welcome", start: 1 }]
            });
            assert.strictEqual(result[1].cursor, 3);
        });

        it("should not succeed if there is not enough room", () => {
            dummyParserTester()("te", {
                succeeds: false,
                suggestions: ["hello", { text: "welcome", start: 1 }]
            });
        });
    });
});
