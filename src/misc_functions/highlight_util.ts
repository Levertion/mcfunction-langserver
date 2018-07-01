import { HighlightScope, SubAction } from "../types";

export function actionFromScopes(scopes: HighlightScope[]): SubAction[] {
    return scopes.map<SubAction>(actionFromScope);
}

export function actionFromScope(scope: HighlightScope): SubAction {
    return {
        data: scope.scopes,
        high: scope.end,
        low: scope.start,
        type: "highlight"
    };
}
