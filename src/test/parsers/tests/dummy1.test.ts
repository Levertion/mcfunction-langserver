import { testParser, snapshot } from "../../assertions";

import { dummyParser } from "./dummy1";

const dummyParserTester = testParser(dummyParser);

describe("dummyParser1", () => {
    it("should read the specified number of characters", () => {
        snapshot(
            dummyParserTester({
                node_properties: { number: 4 }
            })("test hello")
        );
    });

    it("should default to 3 when not given any properties", () => {
        snapshot(dummyParserTester()("test hello"));
    });

    it("should not succeed if there is not enough room", () => {
        snapshot(dummyParserTester()("te"));
    });
});
