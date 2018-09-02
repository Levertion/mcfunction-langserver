import { ListSupplier } from "../lists";

const anchors = ["feet", "eyes"];

export const entityAnchorSupplier: ListSupplier = {
    get: () => anchors,
    init: () => undefined
};
