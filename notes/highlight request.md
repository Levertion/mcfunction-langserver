
# Highlight Range Request

request command: `mcfunction/highlightRange`  
  
request flow: Client -> Server -> Client  
  
Request data:
```ts
{
    document: //Document: I forget what the TS type is
    startLine: number,
    endLine: number
}
```
Response data:
```ts
{
    scopes: [
        {
            line: number,
            scopes: string[]
        }
    ]
}
```

# Highlight Text Request

request command: `mfunction/highlightText`  
  
request flow: Client -> Server -> Client  
  
Request data:
```ts
{
    text: string[] //Split lines
}
```
Response data:
```ts
{
    scopes: [
        {
            line: number,
            scopes: string[]
        }
    ]
}
```
