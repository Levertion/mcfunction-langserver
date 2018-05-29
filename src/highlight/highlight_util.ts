import { SubAction } from "../types";

export interface HighlightScope {
    start: number;
    end: number;
    scopes: string[];
}

export function actionFromScopes(scopes: HighlightScope[]): SubAction[] {
    return scopes.map<SubAction>(
        (v) => actionFromScope(v),
    ) as SubAction[];
}

export function actionFromScope(scope: HighlightScope): SubAction {
    return { data: scope, high: scope.end, low: scope.start, type: "highlight" };
}
