
When getting a highlight from a parser, the end & start should be relative to the start and end of the segment. It **should not** be absolute

* Arguments should have the surrounding scope `["argument", "parser name"]`.
    * Example: `summon ~ ~ ~ zombie`
```ts
{
    end: 7,
    scopes: ["argument", "minecraft:block_pos"],
    start: 12
}
```
* Scopes of multiple names should be separated by `-`
    * Example: in `@e[name="foo",tag=bar]` there should be
```ts
{
    end: 14,
    scopes: ["kvpair-seperator"],
    start: 13
}
```

Various scopes:  
  
`"kvpair"`: A key-value pair, like `foo:bar` or `foo=bar`  
`"*x*-seperator"`: A seperator between same scopes, like `"kvpair-seperator"` would be `,` for NBT  
`"*x*-*y*-seperator"`: A seperator between different scopes, like `"key-value-seperator"` would be `:` for NBT  
`"argument"`: A command argument. This shouldn't be used anywhere else  
`"key"`: A key, like foo in `foo:bar` and `foo=bar`  
`"value"`: A value, like bar in `foor:bar` and `foo=bar`  
`"start"`: Start of a closable symbol, like `{` or `[`  
`"end"`: End of a closeable symbol, like `}` or `]`  
`"quote"`: A quote character, IE `"`  
