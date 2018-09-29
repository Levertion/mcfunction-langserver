import * as Lint from "tslint";
import * as ts from "typescript";

export class Rule extends Lint.Rules.TypedRule {
    public static FAILURE_STRING =
        "return in function returning info without using helper";

    public applyWithProgram(
        sourceFile: ts.SourceFile,
        program: ts.Program
    ): Lint.RuleFailure[] {
        return this.applyWithWalker(
            new HelperReturnWalker(sourceFile, this.getOptions(), program)
        );
    }
}

const keys = ["actions", "errors", "misc", "suggestions"];
// The walker takes care of all the work.
// tslint:disable-next-line:max-classes-per-file
class HelperReturnWalker extends Lint.RuleWalker {
    private program: ts.Program;
    public constructor(
        source: ts.SourceFile,
        options: Lint.IOptions,
        program: ts.Program
    ) {
        super(source, options);
        this.program = program;
    }

    public visitReturnStatement(node: ts.ReturnStatement): void {
        const passes =
            node.expression && node.expression.getText().startsWith("helper");
        if (!passes) {
            if (node.expression) {
                const type = this.program
                    .getTypeChecker()
                    .getContextualType(node.expression);
                if (type) {
                    const props = type.getApparentProperties().map(v => v.name);
                    const matches = keys.every(
                        prop => props.indexOf(prop) !== -1
                    );
                    if (matches) {
                        const fix = node.expression
                            ? new Lint.Replacement(
                                  node.expression.getStart(),
                                  node.expression.getWidth(),
                                  `helper.return(${node.expression.getText()})`
                              )
                            : undefined;
                        this.addFailureAtNode(node, Rule.FAILURE_STRING, fix);
                    }
                }
            }
        }
        super.visitReturnStatement(node);
    }
}
