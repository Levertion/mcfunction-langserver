## Update README 
### Add implementing section
 - Client must implement a handler for the `"mcfunction/shutdown"` notification, as there is no way that I can see to stop the server gracefully from the server side.  
 This notification should make the client send the server a shutdown and exit request.

## To be implemented protocol commands
 - `mcfunction/shutdown` (c <- s) (required): Client should call `shutdown` and `exit`. The argument is the error message to be shown.
 - `mcfunction/highlightRange`: See `./notes/highlight request.md`
