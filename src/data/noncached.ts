import { Lists } from "../parsers/minecraft/list/lists";
import { NonCacheable } from "./types";

export async function loadNonCached(): Promise<NonCacheable> {
    const lists: Lists = new Lists();
    lists.registerLists();

    return {
        static_lists: lists
    };
}
