import { SubAction } from "../types";

export interface HighlightScope {
    end: number;
    scopes: string[];
    start: number;
}

export function actionFromScopes(scopes: HighlightScope[]): SubAction[] {
    return scopes.map<SubAction>(actionFromScope);
}

export function actionFromScope(scope: HighlightScope): SubAction {
    return {
        data: scope,
        high: scope.end,
        low: scope.start,
        type: "highlight"
    };
}
