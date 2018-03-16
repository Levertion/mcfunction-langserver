
## Some notes

Make sure that the begin and end are relative to the start of the line
  
You *generally* should not have multiple of the same scopes inside one another (directly)

## Rules

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
    * Example: in `say @e[name="foo",tag=bar]` there should be
```ts
{
    end: 18,
    scopes: ["kvpair-separator", "separator"],
    start: 17
}
```

## Various scopes
  
`"kvpair"`: A key-value pair, like `foo:bar` or `foo=bar`  
`"*x*-separator"`: A separator between same scopes, like `"kvpair-separator"` would be `,` for NBT  
`"*x*-*y*-separator"`: A separator between different scopes, like `"key-value-separator"` would be `:` for NBT  
`"argument"`: A command argument. This shouldn't be used anywhere else  
`"key"`: A key, like foo in `foo:bar` and `foo=bar`  
`"value"`: A value, like bar in `foor:bar` and `foo=bar` 
`"quote"`: A quote character, IE `"`  
`"separator"`: Should accompany `*x*-separator` and `*x*-*y*-separator*`  
`"*x*-start"`: Start of a value with characters as start and end markers (like `{` and `[`). An accompanying `"start"` should also exist  
`"*x*-end"`: Same as `"*x*-start"`  
`"punctuation"`: Should exist on all characters used as a separator or start/end
