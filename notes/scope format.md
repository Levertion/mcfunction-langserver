
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
    * Example: in `@e[name="foo",tag=bar]` there should be
```ts
{
    end: 14,
    scopes: ["kvpair-seperator", "seperator"],
    start: 13
}
```

## Various scopes
  
`"kvpair"`: A key-value pair, like `foo:bar` or `foo=bar`  
`"*x*-seperator"`: A seperator between same scopes, like `"kvpair-seperator"` would be `,` for NBT  
`"*x*-*y*-seperator"`: A seperator between different scopes, like `"key-value-seperator"` would be `:` for NBT  
`"argument"`: A command argument. This shouldn't be used anywhere else  
`"key"`: A key, like foo in `foo:bar` and `foo=bar`  
`"value"`: A value, like bar in `foor:bar` and `foo=bar` 
`"quote"`: A quote character, IE `"`  
`"seperator"`: Should accompany `*x*-seperator` and `*x*-*y*-seperator*`
`"*x*-start"`: Start of a value. An accompanying `"start"` should also exist
`"*x*-end"`: Same as `"*x*-start"`
