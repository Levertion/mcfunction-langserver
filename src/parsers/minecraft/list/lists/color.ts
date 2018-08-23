import { COLORS } from "../../../../colors";
import { ListSupplier } from "../lists";

const supplier: ListSupplier = {
    get: () => COLORS,
    init: () => undefined
};

export = supplier;
