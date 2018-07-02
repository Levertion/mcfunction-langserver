# Needing tests

Contributions are welcome to remove from this list.

# Probably unneeded tests

Things which can be tested, but it might not be necessary to test.

Contributions are welcome to remove from this list.

-   [Security](../misc_functions/security.ts) - Very precise output of what is
    returned. Might change depending on settings.
-   [Return Helper](../misc_functions/returnhelper.ts) - Not very complex, but
    some assurances could be useful
-   [Translation](../misc_functions/translation.ts) - Not yet implemented. Might
    need to ensure that replacing is done correctly if %s parser is changed

# Untested sections

These sections of the language server are untested, either through infeasibility
or it not being needed.

-   [Setup logging](../misc_functions/setup.ts) - Cannot be easily tested as
    global `mclanglog` is already defined for Mocha through
    [logging_setup.ts](./logging_setup.ts)
