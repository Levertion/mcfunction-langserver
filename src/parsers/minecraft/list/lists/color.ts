import { COLORS } from "../../../../colors";
import { ListSupplier } from "../lists";

export const colorSupplier: ListSupplier = {
    get: () => COLORS,
    init: () => undefined
};
