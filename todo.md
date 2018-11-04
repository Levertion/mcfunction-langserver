## Update README

### Add implementing section

-   Client must implement a handler for the `"mcfunction/shutdown"`
    notification, to stop the server gracefully from the server side.  
    This notification should make the client send the server a shutdown and exit
    request.

### Custom protocol commands

-   `mcfunction/shutdown` (c <- s) (required): Client should call `shutdown` and
    `exit`. The single string argument is the error message to be shown.

## Highlighting

Work out how the API for highlighting should look.

This has been postponed until
[microsoft/language-server-protocol#18](https://github.com/microsoft/language-server-protocol/issues/18)
is resolved
