// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"UbUk":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function resolvePaths(paths, argPath) {
  for (const path of paths) {
    if (stringArrayEqual(argPath, path.path)) {
      return path.data;
    }
  }

  return undefined;
}

exports.resolvePaths = resolvePaths;

function stringArrayEqual(arr1, arr2) {
  return arr1.length === arr2.length && arr1.every((v, i) => v === arr2[i]);
}

function startPaths(paths, argpath) {
  let best = [0, undefined];

  for (const option of paths) {
    if (option.path.length > best[0] && option.path.length <= argpath.length && option.path.every((v, i) => v === argpath[i])) {
      best = [option.path.length, option.data];
    }
  }

  return best[1];
}

exports.startPaths = startPaths;
},{}],"NmKP":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Build parser info from the data required
 */

function createParserInfo(node, data, path, context, suggesting) {
  const result = {
    context,
    data,
    node_properties: node.properties || {},
    path,
    suggesting
  };
  return result;
}

exports.createParserInfo = createParserInfo;
/**
 * Convert a string into CommandLines based on newline characters
 */

function splitLines(text) {
  return createCommandLines(text.split(/\r?\n/));
}

exports.splitLines = splitLines;
/**
 * Convert the given string array into a blank CommandLine Array
 */

function createCommandLines(lines) {
  const result = [];

  for (const line of lines) {
    result.push({
      text: line
    });
  }

  return result;
}

exports.createCommandLines = createCommandLines;
},{}],"xb+0":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.COMMENT_START = "#";
exports.SPACE = " "; // Namespaces

exports.DEFAULT_NAMESPACE = "minecraft";
exports.NAMESPACE = ":";
exports.DATAFOLDER = "data";
exports.SLASH = "/";
exports.SLASHREGEX = /\//g;
exports.SLASHREPLACEREGEX = /\\/g;
exports.MCMETAFILE = "pack.mcmeta"; // Blocks

exports.TAG_START = "#";
},{}],"CWtC":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const consts_1 = require("../consts");

function namespacesEqual(first, second) {
  return namesEqual(first, second) && first.path === second.path;
}

exports.namespacesEqual = namespacesEqual;

function namesEqual(first, second) {
  return first.namespace === second.namespace || isNamespaceDefault(first) && isNamespaceDefault(second);
}

exports.namesEqual = namesEqual;

function isNamespaceDefault(name) {
  return name.namespace === undefined || name.namespace === consts_1.DEFAULT_NAMESPACE;
}

exports.isNamespaceDefault = isNamespaceDefault;

function stringifyNamespace(namespace) {
  return (namespace.namespace ? namespace.namespace : consts_1.DEFAULT_NAMESPACE) + consts_1.NAMESPACE + namespace.path;
}

exports.stringifyNamespace = stringifyNamespace;

function convertToNamespace(input, splitChar = consts_1.NAMESPACE) {
  const index = input.indexOf(splitChar);

  if (index >= 0) {
    const pathContents = input.substring(index + splitChar.length, input.length); // Path contents should not have a : in the contents, however this is to be checked higher up.
    // This simplifies using the parsed result when parsing options
    // Related: https://bugs.mojang.com/browse/MC-91245 (Fixed)

    if (index >= 1) {
      return {
        namespace: input.substring(0, index),
        path: pathContents
      };
    } else {
      return {
        path: pathContents
      };
    }
  } else {
    return {
      path: input
    };
  }
}

exports.convertToNamespace = convertToNamespace;
},{"../consts":"xb+0"}],"23cw":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const namespace_1 = require("./namespace");

function getResourcesofType(resources, type) {
  return getResourcesSplit(type, resources.globalData, resources.localData);
}

exports.getResourcesofType = getResourcesofType;

function getResourcesSplit(type, globalData, packsInfo) {
  const results = [];
  const globalResources = globalData.resources[type];

  if (!!globalResources) {
    results.push(...globalResources);
  }

  if (packsInfo) {
    for (const packId in packsInfo.packs) {
      if (packsInfo.packs.hasOwnProperty(packId)) {
        const pack = packsInfo.packs[packId];

        if (pack.data.hasOwnProperty(type)) {
          const data = pack.data[type];

          if (!!data) {
            results.push(...data);
          }
        }
      }
    }
  }

  return results;
}

exports.getResourcesSplit = getResourcesSplit;

function getMatching(resources, value) {
  const results = [];

  for (const resource of resources) {
    if (namespace_1.namespacesEqual(resource, value)) {
      results.push(resource);
    }
  }

  return results;
}

exports.getMatching = getMatching;
},{"./namespace":"CWtC"}],"cNAA":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function createExtensionFileError(filePath, expected, actual) {
  return {
    filePath,
    group: "extension",
    kind: "FileError",
    message: `File has incorrect extension: Expected ${expected}, got ${actual}.`
  };
}

exports.createExtensionFileError = createExtensionFileError;

function createJSONFileError(filePath, error) {
  return {
    filePath,
    group: "json",
    kind: "FileError",
    message: `JSON parsing failed: '${error}'`
  };
}

exports.createJSONFileError = createJSONFileError;

function createFileClear(filePath, group) {
  return {
    kind: "ClearError",
    filePath,
    group
  };
}

exports.createFileClear = createFileClear;
},{}],"aP4V":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const main_1 = require("vscode-languageserver/lib/main");

const misc_functions_1 = require("../misc-functions");
/**
 * Helper class to create command errors
 */


class CommandErrorBuilder {
  constructor(code, explanation, severity = main_1.DiagnosticSeverity.Error) {
    this.code = code;
    this.default = explanation;
    this.severity = severity;
  }

  create(start, end, ...substitutions) {
    const diagnosis = Object.assign(this.createBlank(...substitutions), {
      range: {
        start,
        end
      }
    });
    return diagnosis;
  }

  createBlank(...substitutions) {
    return {
      code: this.code,
      severity: this.severity,
      substitutions,
      text: misc_functions_1.MCFormat(this.default, ...substitutions)
    };
  }

}

exports.CommandErrorBuilder = CommandErrorBuilder;
/**
 * Transform `err` into a real command error.
 * MODIFIES `err`
 * @param err The error to transform
 * @param start The starting location in the line of the error
 * @param end The end position
 */

function fillBlankError(err, start, end) {
  return Object.assign({}, err, {
    range: {
      start,
      end
    }
  });
}

exports.fillBlankError = fillBlankError;
},{"../misc-functions":"KBGm"}],"UL96":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.success = true;
exports.failure = false;
},{}],"p3gl":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const errors_1 = require("../brigadier/errors");

const types_1 = require("../types");
/**
 * Create an instance of the common return type
 */


function createReturn() {
  return {
    actions: [],
    errors: [],
    suggestions: [],
    misc: []
  };
}
/**
 * Test if `input` is successful
 * @param input The info to test
 */


function isSuccessful(input) {
  return input.kind === types_1.success;
}

exports.isSuccessful = isSuccessful;

function fillBlanks(data, start, end) {
  const errors = [];

  for (const err of data.errors) {
    errors.push(errors_1.fillBlankError(err, start, end));
  }

  return Object.assign({}, data, {
    errors
  });
}

exports.fillBlanks = fillBlanks;

class ReturnHelper {
  constructor(suggesting) {
    this.data = createReturn();

    if (typeof suggesting !== "undefined") {
      if (typeof suggesting === "boolean") {
        this.suggesting = suggesting;
        return;
      }

      this.suggesting = suggesting.suggesting;
    }
  }

  addActions(...actions) {
    if (this.suggesting === undefined || !this.suggesting) {
      this.data.actions.push(...actions);
    }

    return this;
  }

  addErrors(...errs) {
    if (this.suggesting === undefined || !this.suggesting) {
      this.data.errors.push(...errs);
    }

    return this;
  }

  addFileErrorIfFalse(option, filePath, group, message) {
    if (!option) {
      this.addMisc({
        group,
        message,
        filePath,
        kind: "FileError"
      });
    } else {
      this.addMisc({
        group,
        filePath,
        kind: "ClearError"
      });
    }

    return option;
  }

  addMisc(...others) {
    if (this.suggesting === undefined || !this.suggesting) {
      this.data.misc.push(...others);
    }

    return this;
  }

  addSuggestion(start, text, kind, description) {
    if (this.suggesting === undefined || this.suggesting) {
      this.addSuggestions({
        description,
        kind,
        start,
        text
      });
    }

    return this;
  }

  addSuggestions(...suggestions) {
    if (this.suggesting === undefined || this.suggesting) {
      this.data.suggestions.push(...suggestions);
    }

    return this;
  }

  fail(err) {
    if (!!err && !this.suggesting) {
      this.addErrors(err);
    }

    return Object.assign({}, this.getShared(), {
      kind: types_1.failure
    });
  }

  failWithData(data) {
    return Object.assign({}, this.getShared(), {
      data,
      kind: types_1.failure
    });
  }

  getShared() {
    return this.data;
  }

  merge(merge, suggestOverride) {
    this.mergeChain(merge, suggestOverride);
    return isSuccessful(merge);
  }

  mergeChain(merge, suggestOverride) {
    let suggest;

    if (suggestOverride !== undefined) {
      suggest = suggestOverride;
    } else {
      if (this.suggesting !== undefined) {
        suggest = this.suggesting;
      }
    }

    switch (suggest) {
      case true:
        this.mergeSuggestions(merge);
        break;

      case false:
        this.mergeSafe(merge);
        break;

      default:
        this.mergeSuggestions(merge);
        this.mergeSafe(merge);
    }

    return this;
  }

  return(other) {
    if (this.merge(other)) {
      return this.succeed(other.data);
    } else {
      return this.failWithData(other.data);
    }
  }

  succeed(data) {
    return Object.assign({}, this.getShared(), {
      data,
      kind: types_1.success
    });
  }

  mergeSafe(merge) {
    this.addActions(...merge.actions);
    this.addErrors(...merge.errors);
    this.addMisc(...merge.misc);
  }

  mergeSuggestions(merge) {
    this.addSuggestions(...merge.suggestions);
  }

}

exports.ReturnHelper = ReturnHelper;

function prepareForParser(info, suggesting) {
  const helper = new ReturnHelper(suggesting);

  if (helper.merge(info)) {
    return helper.succeed();
  } else {
    return helper.fail();
  }
}

exports.prepareForParser = prepareForParser;
},{"../brigadier/errors":"aP4V","../types":"UL96"}],"tSk9":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const tslib_1 = require("tslib");

const fs = tslib_1.__importStar(require("fs"));

const path = tslib_1.__importStar(require("path"));

const util_promisify_1 = require("util.promisify");

util_promisify_1.shim();

const util_1 = require("util");

const file_errors_1 = require("./file-errors");

const return_helper_1 = require("./return-helper");

exports.readFileAsync = util_1.promisify(fs.readFile);
exports.saveFileAsync = util_1.promisify(fs.writeFile);
exports.mkdirAsync = util_1.promisify(fs.mkdir);
exports.readDirAsync = util_1.promisify(fs.readdir);
exports.statAsync = util_1.promisify(fs.stat);

async function readJSONRaw(filePath) {
  const buffer = await exports.readFileAsync(filePath);
  return JSON.parse(buffer.toString());
}

exports.readJSONRaw = readJSONRaw;

async function writeJSON(filepath, o) {
  await exports.saveFileAsync(filepath, JSON.stringify(o, undefined, 4));
}

exports.writeJSON = writeJSON;

async function readJSON(filePath) {
  const helper = new return_helper_1.ReturnHelper();
  let buffer;

  try {
    buffer = await exports.readFileAsync(filePath);
  } catch (error) {
    mcLangLog(`File at '${filePath}' not available: ${error}`);
    return helper.fail();
  }

  try {
    const result = JSON.parse(buffer.toString());
    return helper.succeed(result);
  } catch (e) {
    return helper.addMisc(file_errors_1.createJSONFileError(filePath, e)).fail();
  }
}

exports.readJSON = readJSON;

async function walkDir(currentPath) {
  const subFolders = [];

  try {
    subFolders.push(...(await exports.readDirAsync(currentPath)));
  } catch (error) {
    return [];
  }

  const promises = subFolders.map(async sub => {
    try {
      const files = [];
      const subFile = path.join(currentPath, sub);

      if ((await exports.statAsync(subFile)).isDirectory()) {
        files.push(...(await walkDir(subFile)));
      } else {
        files.push(subFile);
      }

      return files;
    } catch (error) {
      return [];
    }
  });
  const results = await Promise.all(promises);
  return [].concat(...results);
}

exports.walkDir = walkDir;
},{"./file-errors":"cNAA","./return-helper":"p3gl"}],"kca+":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Get the keys of the object in a way friendly to
 * the typescript compiler.
 * Taken from https://github.com/Microsoft/TypeScript/pull/12253#issuecomment-353494273
 * @param o The object to get the keys of.
 */

function typed_keys(o) {
  return Object.keys(o);
}

exports.typed_keys = typed_keys;
},{}],"MG6C":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const tslib_1 = require("tslib");

const defaultPath = tslib_1.__importStar(require("path"));

const consts_1 = require("../consts");

const group_resources_1 = require("./group-resources");

const namespace_1 = require("./namespace");

const promisified_fs_1 = require("./promisified-fs");

const return_helper_1 = require("./return-helper");

const typed_keys_1 = require("./third_party/typed-keys");
/**
 * Find the datapacks folder a file is in.
 * @param fileLocation The URI of the file
 * @param path The path module to use (allows for testing).
 */


function parseDataPath(fileLocation, path = defaultPath) {
  const parsed = path.parse(path.normalize(fileLocation));
  const dirs = parsed.dir.split(path.sep);
  const packsFolderIndex = dirs.indexOf("datapacks");

  if (packsFolderIndex !== -1) {
    const remainder = dirs.slice(packsFolderIndex + 1);

    if (remainder.length >= 1) {
      let packsFolder = path.join(...dirs.slice(0, packsFolderIndex + 1)); // Ugly hack because path.join ignores a leading empty dir, leading to the result of
      // `/home/datapacks` going to `home/datapacks`

      if (path.sep === "/" && !path.isAbsolute(packsFolder)) {
        packsFolder = path.sep + packsFolder;
      }

      packsFolder = path.format({
        dir: packsFolder
      });
      const rest = path.join(...remainder.slice(1), parsed.base);
      return {
        packsFolder,
        pack: remainder[0],
        rest
      };
    }
  }

  return undefined;
}

exports.parseDataPath = parseDataPath;
exports.resourceTypes = {
  advancements: {
    extension: ".json",
    path: ["advancements"]
  },
  block_tags: {
    extension: ".json",
    mapFunction: async (v, packroot, globalData, packsInfo) => readTag(v, packroot, "block_tags", group_resources_1.getResourcesSplit("block_tags", globalData, packsInfo), s => globalData.blocks.hasOwnProperty(s)),
    path: ["tags", "blocks"]
  },
  function_tags: {
    extension: ".json",
    mapFunction: async (v, packroot, globalData, packsInfo) => {
      const functions = group_resources_1.getResourcesSplit("functions", globalData, packsInfo);
      return readTag(v, packroot, "function_tags", group_resources_1.getResourcesSplit("function_tags", globalData, packsInfo), s => group_resources_1.getMatching(functions, namespace_1.convertToNamespace(s)).length > 0);
    },
    path: ["tags", "functions"]
  },
  functions: {
    extension: ".mcfunction",
    path: ["functions"]
  },
  item_tags: {
    extension: ".json",
    mapFunction: async (v, packroot, globalData, packsInfo) => readTag(v, packroot, "item_tags", group_resources_1.getResourcesSplit("item_tags", globalData, packsInfo), s => globalData.items.indexOf(s) !== -1),
    path: ["tags", "items"]
  },
  loot_tables: {
    extension: ".json",
    path: ["loot_tables"]
  },
  recipes: {
    extension: ".json",
    path: ["recipes"]
  },
  structures: {
    extension: ".nbt",
    path: ["structures"]
  }
};

function getKindAndNamespace(rest, path = defaultPath) {
  const sections = path.normalize(rest).split(path.sep);

  if (sections[0] === consts_1.DATAFOLDER && sections.length > 2) {
    // Namespace,data,
    const remainder = sections.splice(2);

    for (const kind of typed_keys_1.typed_keys(exports.resourceTypes)) {
      const typeInfo = exports.resourceTypes[kind];

      if (typeInfo.path.every((v, i) => remainder[i] === v)) {
        const namespace = sections[1];
        const further = remainder.slice(typeInfo.path.length);

        if (further.length > 0) {
          const last = further[further.length - 1];

          if (path.extname(last) === typeInfo.extension) {
            const pth = path.join(...further.slice(0, -1), last.slice(0, -typeInfo.extension.length)).replace(consts_1.SLASHREPLACEREGEX, consts_1.SLASH);
            return {
              kind,
              location: {
                namespace,
                path: pth
              }
            };
          }
        }
      }
    }
  }

  return undefined;
}

exports.getKindAndNamespace = getKindAndNamespace;

function getPath(resource, packroot, kind, path = defaultPath) {
  return path.join(packroot, consts_1.DATAFOLDER, resource.namespace, ...exports.resourceTypes[kind].path, resource.path.replace(consts_1.SLASHREGEX, path.sep).concat(exports.resourceTypes[kind].extension));
}

exports.getPath = getPath;

function buildPath(resource, packs, kind, path = defaultPath) {
  if (resource.pack !== undefined) {
    const pack = packs.packs[resource.pack];
    return getPath(resource, path.join(packs.location, pack.name), kind, path);
  } else {
    return undefined;
  }
}

exports.buildPath = buildPath;

async function readTag(resource, packRoot, type, options, isKnown) {
  const helper = new return_helper_1.ReturnHelper();
  const filePath = getPath(resource, packRoot, type);
  const tag = await promisified_fs_1.readJSON(filePath);

  if (helper.merge(tag)) {
    if (helper.addFileErrorIfFalse(!!tag.data.values, filePath, "InvalidTagNoValues", `tag does not have a values key: ${JSON.stringify(tag.data)}`)) {
      if (helper.addFileErrorIfFalse(Array.isArray(tag.data.values), filePath, "InvalidTagValuesNotArray", `tag values is not an array: ${JSON.stringify(tag.data.values)}`)) {
        if (helper.addFileErrorIfFalse( // tslint:disable-next-line:strict-type-predicates
        tag.data.values.every(v => typeof v === "string"), filePath, "InvalidTagValuesNotString", `tag values contains a non string value: ${JSON.stringify(tag.data.values)}`)) {
          const seen = new Set();
          const duplicates = new Set();
          const unknowns = new Set();

          for (const value of tag.data.values) {
            if (seen.has(value)) {
              duplicates.add(value);
            }

            seen.add(value);

            if (value.startsWith(consts_1.TAG_START)) {
              const result = group_resources_1.getMatching(options, namespace_1.convertToNamespace(value));

              if (result.length === 0) {
                unknowns.add(value);
              }
            } else if (!isKnown(value)) {
              unknowns.add(value);
            }
          }

          helper.addFileErrorIfFalse(duplicates.size === 0, filePath, "InvalidTagValuesDuplicates", `Tag contains duplicate values: "${[...duplicates].join('", "')}"`);
          helper.addFileErrorIfFalse(unknowns.size === 0, filePath, "InvalidTagValuesUnknown", `Tag contains unknown values: "${[...unknowns].join('", "')}"`);
          return helper.succeed(Object.assign({}, resource, {
            data: tag.data
          }));
        }
      }
    }
  }

  return helper.succeed(resource);
}
},{"../consts":"xb+0","./group-resources":"23cw","./namespace":"CWtC","./promisified-fs":"tSk9","./return-helper":"p3gl","./third_party/typed-keys":"kca+"}],"4xli":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const sprintf_js_1 = require("sprintf-js");

function shouldTranslate() {
  return mcLangSettings.translation.lang.toLowerCase() !== "en-us";
}

exports.shouldTranslate = shouldTranslate;

function MCFormat(base, ...substitutions) {
  return sprintf_js_1.vsprintf(base, substitutions);
}

exports.MCFormat = MCFormat;
},{}],"BiFC":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const main_1 = require("vscode-languageserver/lib/main");

const creators_1 = require("./creators");

const translation_1 = require("./translation");
/**
 * Turn a command error into a language server diagnostic
 */


function commandErrorToDiagnostic(error, line) {
  const range = {
    end: {
      line,
      character: error.range.end
    },
    start: {
      line,
      character: error.range.start
    }
  }; // Run Translation stuff on the error?

  const text = translation_1.shouldTranslate() ? `'${error.text}': Translation is not yet supported` // Translate(error.code)
  : error.text;
  return main_1.Diagnostic.create(range, text, error.severity, error.code, "mcfunction");
}

exports.commandErrorToDiagnostic = commandErrorToDiagnostic;

function runChanges(changes, functionInfo) {
  const changed = [];

  for (const change of changes.contentChanges) {
    if (!!change.range) {
      // Appease the compiler, as the change interface seems to have range optional
      const {
        start,
        end
      } = change.range;
      const newLineContent = functionInfo.lines[start.line].text.substring(0, start.character).concat(change.text, functionInfo.lines[end.line].text.substring(end.character));
      const difference = end.line - start.line + 1;
      const newLines = creators_1.splitLines(newLineContent);
      functionInfo.lines.splice(start.line, difference, ...newLines);
      changed.forEach((v, i) => {
        if (v > start.line) {
          changed[i] = v - difference + newLines.length;
        }
      });
      changed.push(...Array.from(new Array(newLines.length), (_, i) => start.line + i));
    }
  }

  const unique = changed.filter((value, index, self) => self.indexOf(value) === index);
  unique.sort((a, b) => a - b);
  return unique;
}

exports.runChanges = runChanges;
},{"./creators":"NmKP","./translation":"4xli"}],"H7Mf":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function followPath(tree, path) {
  // There are no protections here, because if a path is given it should be correct.
  let current = tree;

  for (const section of path) {
    if (!!current.children && !!current.children[section]) {
      current = current.children[section];
    }
  }

  return current;
}

exports.followPath = followPath;

function getNextNode(node, // Allow use of node.redirect without a tsignore
nodePath, tree) {
  const redirect = node.redirect;

  if (!!redirect) {
    return {
      node: followPath(tree, redirect),
      path: redirect
    };
  } else {
    if (!node.children && !node.executable) {
      // In this case either tree is malformed or in `execute run`
      // So we just return the entire tree
      return {
        node: tree,
        path: []
      };
    }

    return {
      node,
      path: nodePath
    };
  }
}

exports.getNextNode = getNextNode;
},{}],"tgUj":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const tslib_1 = require("tslib");

const path = tslib_1.__importStar(require("path"));

const promisified_fs_1 = require("../misc-functions/promisified-fs");

const typed_keys_1 = require("../misc-functions/third_party/typed-keys");

if (!process.env.MCFUNCTION_CACHE_DIR) {
  throw new Error("Environment variable MCFUNCTION_CACHE_DIR must be set");
}

const cacheFolder = process.env.MCFUNCTION_CACHE_DIR;
const cacheFileNames = {
  blocks: "blocks.json",
  commands: "commands.json",
  items: "items.json",
  meta_info: "meta_info.json",
  resources: "resources.json"
};

async function readCache() {
  const data = {};
  const keys = typed_keys_1.typed_keys(cacheFileNames);
  await Promise.all(keys.map(async key => {
    data[key] = await promisified_fs_1.readJSONRaw(path.join(cacheFolder, cacheFileNames[key]));
  }));
  return data;
}

exports.readCache = readCache;

async function cacheData(data) {
  try {
    await promisified_fs_1.mkdirAsync(cacheFolder, "777");
  } catch (_) {// Don't use the error, which is normally thrown if the folder doesn't exist
  }

  const keys = typed_keys_1.typed_keys(cacheFileNames);
  await Promise.all(keys.map(async key => promisified_fs_1.writeJSON(path.join(cacheFolder, cacheFileNames[key]), data[key])));
  return;
}

exports.cacheData = cacheData;

async function storeSecurity(security) {
  await promisified_fs_1.saveFileAsync(path.join(cacheFolder, "security.json"), JSON.stringify(security));
}

exports.storeSecurity = storeSecurity;

async function readSecurity() {
  try {
    return await promisified_fs_1.readJSONRaw(path.join(cacheFolder, "security.json"));
  } catch (error) {
    return {};
  }
}

exports.readSecurity = readSecurity;
},{"../misc-functions/promisified-fs":"tSk9","../misc-functions/third_party/typed-keys":"kca+"}],"tvqu":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const cache_1 = require("../data/cache");
/**
 * Check if the given change requires security confirmation
 */


function securityIssues(settings, security) {
  const results = [];

  if (!!settings.data) {
    if (!!settings.data.customJar && security.JarPath !== true) {
      results.push("JarPath");
    }

    if (!!settings.data.javaPath && security.JavaPath !== true) {
      results.push("JavaPath");
    }
  }

  if (!!settings.parsers
  /* && security.CustomParsers !== true */
  ) {
      /* const names = Object.keys(settings.parsers);
      if (names.length > 0) {
          results.push("CustomParsers");
      } */
      throw new Error(`Custom parsers are not supported for client implementations.
To request this feature be enabled, open an issue at https://github.com/Levertion/mcfunction-langserver`);
    }

  return results;
}

exports.securityIssues = securityIssues;

async function actOnSecurity(issues, connection, security) {
  let securityChanged = false;

  const resave = async () => {
    if (securityChanged) {
      await cache_1.storeSecurity(security);
    }
  };

  for (const issue of issues) {
    const response = await Promise.resolve(connection.window.showErrorMessage(`[MCFUNCTION] You have the potentially insecure setting '${issue}' set, but no confirmation has been recieved.`, {
      title: "Yes"
    }, {
      title: "No (Stops server)"
    }));

    if (!!response && response.title === "Yes") {
      security[issue] = true;
      securityChanged = true;
    } else {
      return false;
    }
  }

  await resave();
  return true;
}

exports.actOnSecurity = actOnSecurity;
},{"../data/cache":"tgUj"}],"8ePp":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function setup_logging(connection) {
  const log = message => {
    connection.console.log(message);
  }; // tslint:disable-next-line:prefer-object-spread


  global.mcLangLog = Object.assign(log, {
    internal: m => {
      if (mcLangSettings.trace.internalLogging) {
        log(`[McFunctionInternal] ${m}`);
      }
    }
  });
}

exports.setup_logging = setup_logging;
},{}],"AgEN":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const __1 = require("..");

const errors_1 = require("../../brigadier/errors");

const namespace_1 = require("../namespace");

const NAMESPACEEXCEPTIONS = {
  invalid_id: new errors_1.CommandErrorBuilder("argument.id.invalid", "Invalid character '%s' in location %s")
};
const disallowedPath = /[^0-9a-z_/\.-]/g;

function stringArrayToNamespaces(strings) {
  // tslint:disable-next-line:no-unnecessary-callback-wrapper this is a false positive - see https://github.com/palantir/tslint/issues/2430
  return strings.map(v => __1.convertToNamespace(v));
}

exports.stringArrayToNamespaces = stringArrayToNamespaces;

function readNamespaceText(reader) {
  const namespaceChars = /^[0-9a-z_:/\.-]$/;
  return reader.readWhileRegexp(namespaceChars);
}

exports.readNamespaceText = readNamespaceText;
/**
 * Does `base`(eg minecraft:stone) start with `test` (e.g. sto) [Y]
 */

function namespaceStart(base, test) {
  if (test.namespace === undefined) {
    return namespace_1.isNamespaceDefault(base) && base.path.startsWith(test.path) || !!base.namespace && base.namespace.startsWith(test.path);
  } else {
    return namespace_1.namesEqual(base, test) && base.path.startsWith(test.path);
  }
}

exports.namespaceStart = namespaceStart;

function namespaceSuggestions(options, value, start) {
  const result = [];

  for (const option of options) {
    if (namespaceStart(option, value)) {
      result.push({
        text: __1.stringifyNamespace(option),
        start
      });
    }
  }

  return result;
}

exports.namespaceSuggestions = namespaceSuggestions;

function namespaceSuggestionString(options, value, start) {
  return namespaceSuggestions(stringArrayToNamespaces(options), value, start);
}

exports.namespaceSuggestionString = namespaceSuggestionString;

function parseNamespace(reader) {
  const helper = new __1.ReturnHelper();
  const start = reader.cursor;
  const text = readNamespaceText(reader);

  const namespace = __1.convertToNamespace(text);

  let next;
  let failed = false; // Give an error for each invalid character

  do {
    next = disallowedPath.exec(namespace.path);

    if (next) {
      // Relies on the fact that convertToNamespace splits on the first
      const i = text.indexOf(":") + 1 + next.index + start;
      failed = true;
      helper.addErrors(NAMESPACEEXCEPTIONS.invalid_id.create(i, i + 1, next[0], text));
    }
  } while (next);

  if (failed) {
    return helper.fail();
  } else {
    return helper.succeed(namespace);
  }
}

exports.parseNamespace = parseNamespace;

function parseNamespaceOption(reader, options, completionKind) {
  const helper = new __1.ReturnHelper();
  const start = reader.cursor;
  const namespace = parseNamespace(reader);

  if (helper.merge(namespace)) {
    const results = processParsedNamespaceOption(namespace.data, options, !reader.canRead(), start, completionKind);
    helper.merge(results);

    if (results.data.length > 0) {
      return helper.succeed({
        literal: namespace.data,
        values: results.data
      });
    } else {
      return helper.failWithData(namespace.data);
    }
  } else {
    return helper.failWithData(undefined);
  }
}

exports.parseNamespaceOption = parseNamespaceOption;

function processParsedNamespaceOption(namespace, options, suggest, start, completionKind) {
  const results = [];
  const helper = new __1.ReturnHelper();

  for (const val of options) {
    if (__1.namespacesEqual(val, namespace)) {
      results.push(val);
    }

    if (suggest && namespaceStart(val, namespace)) {
      helper.addSuggestion(start, __1.stringifyNamespace(val), completionKind);
    }
  }

  return helper.succeed(results);
}

exports.processParsedNamespaceOption = processParsedNamespaceOption;
},{"..":"KBGm","../../brigadier/errors":"aP4V","../namespace":"CWtC"}],"lcVC":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const main_1 = require("vscode-languageserver/lib/main");

const __1 = require("..");

const consts_1 = require("../../consts");

const namespace_1 = require("./namespace");
/**
 * Parse a namespace or tag.
 * Returned:
 *  - values are the resources which are the exact matches
 *  - resolved are the lowest level tag members
 *  - parsed is the literal tag. If parsed exists, but not resolved/values, then it was a non-tag
 *  - if not successful, if data undefined then parsing failed.
 *  - if data is a value, then a tag parsed but was unknown
 */


function parseNamespaceOrTag(reader, info, taghandling) {
  const helper = new __1.ReturnHelper(info);
  const start = reader.cursor;

  if (reader.peek() === consts_1.TAG_START) {
    reader.skip();

    if (typeof taghandling === "string") {
      const tags = __1.getResourcesofType(info.data, taghandling);

      const parsed = namespace_1.parseNamespaceOption(reader, tags, main_1.CompletionItemKind.Folder);

      if (helper.merge(parsed)) {
        const values = parsed.data.values;
        const resolved = [];

        for (const value of values) {
          resolved.push(...getLowestForTag(value, tags));
        }

        return helper.succeed({
          parsed: parsed.data.literal,
          resolved,
          values
        });
      } else {
        return helper.failWithData(parsed.data);
      }
    } else {
      namespace_1.readNamespaceText(reader);
      return helper.fail(taghandling.create(start, reader.cursor));
    }
  } else {
    if (!reader.canRead() && typeof taghandling === "string") {
      helper.addSuggestion(reader.cursor, consts_1.TAG_START, main_1.CompletionItemKind.Operator);
    }

    const parsed = namespace_1.parseNamespace(reader);

    if (helper.merge(parsed)) {
      return helper.succeed({
        parsed: parsed.data
      });
    } else {
      return helper.fail();
    }
  }
}

exports.parseNamespaceOrTag = parseNamespaceOrTag;

function getLowestForTag(tag, options) {
  if (!tag.data) {
    return [];
  }

  const results = [];

  for (const tagMember of tag.data.values) {
    if (tagMember[0] === consts_1.TAG_START) {
      const namespace = __1.convertToNamespace(tagMember.substring(1));

      for (const option of options) {
        if (__1.namespacesEqual(namespace, option)) {
          results.push(...getLowestForTag(option, options));
        }
      }
    } else {
      results.push(__1.convertToNamespace(tagMember));
    }
  }

  return results;
}

function buildTagActions(tags, low, high, type, localData) {
  const helper = new __1.ReturnHelper();

  for (const resource of tags) {
    if (resource.data) {
      helper.addActions({
        data: `\`\`\`json
${JSON.stringify(resource.data, undefined, 4)}
\`\`\``,
        high,
        low,
        type: "hover"
      });
    }

    if (localData) {
      const location = __1.buildPath(resource, localData, type);

      if (location) {
        helper.addActions({
          data: location,
          high,
          low,
          type: "source"
        });
      }
    }
  }

  return helper.succeed();
}

exports.buildTagActions = buildTagActions;
},{"..":"KBGm","../../consts":"xb+0","./namespace":"AgEN"}],"KBGm":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const tslib_1 = require("tslib");

tslib_1.__exportStar(require("./context"), exports);

tslib_1.__exportStar(require("./creators"), exports);

tslib_1.__exportStar(require("./datapack-folder"), exports);

tslib_1.__exportStar(require("./file-errors"), exports);

tslib_1.__exportStar(require("./group-resources"), exports);

tslib_1.__exportStar(require("./lsp-conversions"), exports);

tslib_1.__exportStar(require("./namespace"), exports);

tslib_1.__exportStar(require("./node-tree"), exports);

tslib_1.__exportStar(require("./promisified-fs"), exports);

tslib_1.__exportStar(require("./return-helper"), exports);

tslib_1.__exportStar(require("./security"), exports);

tslib_1.__exportStar(require("./setup"), exports);

tslib_1.__exportStar(require("./translation"), exports);

tslib_1.__exportStar(require("./parsing/namespace"), exports);

tslib_1.__exportStar(require("./parsing/nmsp-tag"), exports);
},{"./context":"UbUk","./creators":"NmKP","./datapack-folder":"MG6C","./file-errors":"cNAA","./group-resources":"23cw","./lsp-conversions":"BiFC","./namespace":"CWtC","./node-tree":"H7Mf","./promisified-fs":"tSk9","./return-helper":"p3gl","./security":"tvqu","./setup":"8ePp","./translation":"4xli","./parsing/namespace":"AgEN","./parsing/nmsp-tag":"lcVC"}],"iLhI":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const misc_functions_1 = require("../misc-functions");

const typed_keys_1 = require("../misc-functions/third_party/typed-keys");

const errors_1 = require("./errors");

const EXCEPTIONS = {
  EXPECTED_BOOL: new errors_1.CommandErrorBuilder("parsing.bool.expected", "Expected bool"),
  EXPECTED_END_OF_QUOTE: new errors_1.CommandErrorBuilder("parsing.quote.expected.end", "Unclosed quoted string"),
  EXPECTED_FLOAT: new errors_1.CommandErrorBuilder("parsing.float.expected", "Expected float"),
  EXPECTED_INT: new errors_1.CommandErrorBuilder("parsing.int.expected", "Expected integer"),
  EXPECTED_START_OF_QUOTE: new errors_1.CommandErrorBuilder("parsing.quote.expected.start", "Expected quote to start a string"),
  EXPECTED_STRING_FROM: new errors_1.CommandErrorBuilder("parsing.expected.option", "Expected string from %s, got '%s'"),
  EXPECTED_SYMBOL: new errors_1.CommandErrorBuilder("parsing.expected", "Expected '%s'"),
  INVALID_BOOL: new errors_1.CommandErrorBuilder("parsing.bool.invalid", "Invalid bool, expected true or false but found '%s'"),
  INVALID_ESCAPE: new errors_1.CommandErrorBuilder("parsing.quote.escape", "Invalid escape sequence '\\%s' in quoted string)"),
  INVALID_FLOAT: new errors_1.CommandErrorBuilder("parsing.float.invalid", "Invalid float '%s'"),
  INVALID_INT: new errors_1.CommandErrorBuilder("parsing.int.invalid", "Invalid integer '%s'")
};
const QUOTE = '"';
const ESCAPE = "\\";

class StringReader {
  constructor(stringToRead) {
    this.cursor = 0;
    this.string = stringToRead;
  }

  canRead(length = 1) {
    return this.cursor + length <= this.string.length;
  }
  /**
   * Require that a specific string follows
   * @param str The string which should come next
   */


  expect(str) {
    const helper = new misc_functions_1.ReturnHelper();

    if (str.startsWith(this.getRemaining())) {
      helper.addSuggestions({
        text: str,
        start: this.cursor
      });
    }

    const sub = this.string.substr(this.cursor, str.length);

    if (sub !== str) {
      return helper.fail(EXCEPTIONS.EXPECTED_SYMBOL.create(this.cursor, Math.min(this.string.length, this.cursor + str.length), sub, str));
    }

    this.cursor += str.length;
    return helper.succeed();
  }

  getRead() {
    return this.string.substring(0, this.cursor);
  }

  getRemaining() {
    return this.string.substring(this.cursor);
  }

  getRemainingLength() {
    return this.string.length - this.cursor;
  }

  getTotalLength() {
    return this.string.length;
  }

  peek(offset = 0) {
    return this.string.charAt(this.cursor + offset);
  }

  read() {
    return this.string.charAt(this.cursor++);
  }
  /**
   * Read a boolean value from the string
   */


  readBoolean() {
    const helper = new misc_functions_1.ReturnHelper();
    const start = this.cursor;
    const value = this.readOption(typed_keys_1.typed_keys(StringReader.bools), false);

    if (!helper.merge(value)) {
      if (value.data !== false) {
        return helper.fail(EXCEPTIONS.INVALID_BOOL.create(start, this.cursor, value.data));
      } else {
        return helper.fail();
      }
    }

    return helper.succeed(StringReader.bools[value.data]);
  }
  /**
   * Read a float from the string
   */


  readFloat() {
    const helper = new misc_functions_1.ReturnHelper();
    const start = this.cursor;
    const readToTest = this.readWhileRegexp(StringReader.charAllowedNumber);

    if (readToTest.length === 0) {
      return helper.fail(EXCEPTIONS.EXPECTED_FLOAT.create(start, this.string.length));
    } // The Java readInt throws upon multiple `.`s, but Javascript's doesn't


    if ((readToTest.match(/\./g) || []).length > 1) {
      return helper.fail(EXCEPTIONS.INVALID_FLOAT.create(start, this.cursor, this.string.substring(start, this.cursor)));
    }

    try {
      return helper.succeed(parseFloat(readToTest));
    } catch (error) {
      return helper.fail(EXCEPTIONS.INVALID_FLOAT.create(start, this.cursor, readToTest));
    }
  }
  /**
   * Read an integer from the string
   */


  readInt() {
    const helper = new misc_functions_1.ReturnHelper();
    const start = this.cursor;
    const readToTest = this.readWhileRegexp(StringReader.charAllowedNumber);

    if (readToTest.length === 0) {
      return helper.fail(EXCEPTIONS.EXPECTED_INT.create(start, this.string.length));
    } // The Java readInt throws upon a `.`, but the regex includes one in brigadier
    // This handles this case


    if (readToTest.indexOf(".") !== -1) {
      return helper.fail(EXCEPTIONS.INVALID_INT.create(start, this.cursor, this.string.substring(start, this.cursor)));
    }

    try {
      return helper.succeed(Number.parseInt(readToTest, 10));
    } catch (error) {
      return helper.fail(EXCEPTIONS.INVALID_INT.create(start, this.cursor, readToTest));
    }
  }
  /**
   * Expect a string from a selection
   */


  readOption(options, addError = true, completion, quoted = "both") {
    const start = this.cursor;
    const helper = new misc_functions_1.ReturnHelper();
    const isquoted = this.peek() === QUOTE && (quoted === "yes" || quoted === "both");
    let resultaux;

    switch (quoted) {
      case "both":
        resultaux = this.readString();
        break;

      case "yes":
        resultaux = this.readQuotedString();
        break;

      default:
        resultaux = new misc_functions_1.ReturnHelper().succeed(this.readWhileRegexp(quoted));
    }

    const result = resultaux;

    if (!helper.merge(result, false)) {
      if (isquoted && !this.canRead()) {
        const remaining = this.string.substring(start + 1); // Note that if there are quotes and backslashes, this will fail

        helper.addSuggestions(...options.filter(v => v.startsWith(remaining)).map(v => ({
          kind: completion,
          start,
          text: `${QUOTE}${v}${QUOTE}`
        })));
      }

      return helper.failWithData(false);
    }

    let valid;

    for (const option of options) {
      if (option === result.data) {
        valid = option;
      }
    }

    if (!this.canRead()) {
      helper.addSuggestions(...options.filter(v => v.startsWith(result.data)).map(v => ({
        kind: completion,
        start,
        text: isquoted || v.includes('"') || v.includes("\\") ? QUOTE + v.replace("\\", "\\\\").replace('"', '\\"') + QUOTE : v
      })));
    }

    if (valid) {
      return helper.succeed(valid);
    } else {
      if (addError) {
        helper.addErrors(EXCEPTIONS.EXPECTED_STRING_FROM.create(start, this.cursor, JSON.stringify(options), result.data));
      }

      return helper.failWithData(result.data);
    }
  }
  /**
   * Read from the string, returning a string, which, in the original had been surrounded by quotes
   */


  readQuotedString() {
    const helper = new misc_functions_1.ReturnHelper();
    const start = this.cursor;

    if (!this.canRead()) {
      return helper.succeed("");
    }

    if (this.peek() !== QUOTE) {
      return helper.fail(EXCEPTIONS.EXPECTED_START_OF_QUOTE.create(this.cursor, this.string.length));
    }

    let result = "";
    let escaped = false;

    while (this.canRead()) {
      this.skip();
      const c = this.peek();

      if (escaped) {
        if (c === QUOTE || c === ESCAPE) {
          result += c;
          escaped = false;
        } else {
          return helper.fail(EXCEPTIONS.INVALID_ESCAPE.create(this.cursor - 1, this.cursor + 1, c)); // Includes backslash
        }
      } else if (c === ESCAPE) {
        escaped = true;
      } else if (c === QUOTE) {
        this.skip();
        return helper.succeed(result);
      } else {
        result += c;
      }
    }

    helper.addSuggestion(this.cursor, QUOTE); // Always cannot read at this point

    return helper.fail(EXCEPTIONS.EXPECTED_END_OF_QUOTE.create(start, this.string.length));
  }
  /**
   * Read a string from the string. If it surrounded by quotes, the quotes are ignored.
   * The cursor ends on the last character in the string.
   */


  readString() {
    if (this.canRead() && this.peek() === QUOTE) {
      return this.readQuotedString();
    } else {
      const helper = new misc_functions_1.ReturnHelper();

      if (!this.canRead()) {
        helper.addSuggestions({
          start: this.cursor,
          text: QUOTE
        });
      }

      return helper.succeed(this.readUnquotedString());
    }
  }
  /**
   * Read a string which is not surrounded by quotes.
   * Can only contain alphanumerical characters, _,+,. and -
   */


  readUnquotedString() {
    return this.readWhileRegexp(StringReader.charAllowedInUnquotedString);
  }
  /**
   * Read the string until a certain regular expression matches the
   * character under the cursor.
   * @param exp The Regular expression to test against.
   */


  readUntilRegexp(exp) {
    return this.readWhileFunction(s => !exp.test(s));
  }
  /**
   * Read while a certain function returns true on each consecutive character starting with the one under the cursor.
   * In most cases, it is better to use readWhileRegexp.
   * @param callback The function to use.
   */


  readWhileFunction(callback) {
    const begin = this.cursor;

    while (callback(this.peek())) {
      if (this.canRead()) {
        this.skip();
      } else {
        return this.string.substring(begin);
      }
    }

    return this.string.substring(begin, this.cursor);
  }
  /**
   * Read the string while a certain regular expression matches the character under the cursor.
   * The cursor ends on the first character which doesn't match
   * @param exp The Regular Expression to test against
   */


  readWhileRegexp(exp) {
    return this.readWhileFunction(s => exp.test(s));
  }

  skip() {
    this.cursor++;
  }

  skipWhitespace() {
    this.readWhileRegexp(/\s/); // Whitespace
  }

}

StringReader.charAllowedInUnquotedString = /^[0-9A-Za-z_\-\.+]$/;
StringReader.charAllowedNumber = /^[0-9\-\.]$/;
StringReader.bools = {
  true: true,
  false: false
};
exports.StringReader = StringReader;
},{"../misc-functions":"KBGm","../misc-functions/third_party/typed-keys":"kca+","./errors":"aP4V"}],"Q/Gg":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const main_1 = require("vscode-languageserver/lib/main");

const misc_functions_1 = require("../../misc-functions");

exports.boolParser = {
  kind: main_1.CompletionItemKind.Keyword,
  parse: (reader, props) => misc_functions_1.prepareForParser(reader.readBoolean(), props)
};
},{"../../misc-functions":"KBGm"}],"oM/0":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const misc_functions_1 = require("../../misc-functions");

exports.stringParser = {
  parse: (reader, properties) => {
    const helper = new misc_functions_1.ReturnHelper(properties);

    switch (properties.node_properties.type) {
      case "greedy":
        reader.cursor = reader.string.length;
        return helper.succeed();

      case "word":
        reader.readUnquotedString();
        return helper.succeed();

      default:
        if (helper.merge(reader.readString())) {
          return helper.succeed();
        } else {
          return helper.fail();
        }

    }
  }
};
},{"../../misc-functions":"KBGm"}],"IAMg":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const errors_1 = require("../../brigadier/errors");

const misc_functions_1 = require("../../misc-functions");

const JAVAMAXINT = 2147483647;
const JAVAMININT = -2147483648;
const INTEGEREXCEPTIONS = {
  TOOBIG: new errors_1.CommandErrorBuilder("argument.integer.big", "Integer must not be more than %s, found %s"),
  TOOSMALL: new errors_1.CommandErrorBuilder("argument.integer.low", "Integer must not be less than %s, found %s")
};
exports.intParser = {
  parse: (reader, properties) => {
    const helper = new misc_functions_1.ReturnHelper(properties);
    const start = reader.cursor;
    const result = reader.readInt();

    if (!helper.merge(result)) {
      return helper.fail();
    }

    const maxVal = properties.node_properties.max;
    const minVal = properties.node_properties.min; // See https://stackoverflow.com/a/12957445

    const max = Math.min(typeof maxVal === "number" ? maxVal : JAVAMAXINT, JAVAMAXINT);
    const min = Math.max(typeof minVal === "number" ? minVal : JAVAMININT, JAVAMININT);

    if (result.data > max) {
      helper.addErrors(INTEGEREXCEPTIONS.TOOBIG.create(start, reader.cursor, max.toString(), result.data.toString()));
    }

    if (result.data < min) {
      helper.addErrors(INTEGEREXCEPTIONS.TOOSMALL.create(start, reader.cursor, min.toString(), result.data.toString()));
    }

    return helper.succeed();
  }
};
},{"../../brigadier/errors":"aP4V","../../misc-functions":"KBGm"}],"2AVt":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const errors_1 = require("../../brigadier/errors");

const misc_functions_1 = require("../../misc-functions");

const JAVAMINFLOAT = -2139095039;
const JAVAMAXFLOAT = 2139095039;
const FLOATEXCEPTIONS = {
  TOOBIG: new errors_1.CommandErrorBuilder("argument.float.big", "Float must not be more than %s, found %s"),
  TOOSMALL: new errors_1.CommandErrorBuilder("argument.float.low", "Float must not be less than %s, found %s")
};
exports.floatParser = {
  parse: (reader, properties) => {
    const helper = new misc_functions_1.ReturnHelper(properties);
    const start = reader.cursor;
    const result = reader.readFloat();

    if (!helper.merge(result)) {
      return helper.fail();
    }

    const maxVal = properties.node_properties.max;
    const minVal = properties.node_properties.min; // See https://stackoverflow.com/a/12957445

    const max = Math.min(typeof maxVal === "number" ? maxVal : JAVAMAXFLOAT, JAVAMAXFLOAT);
    const min = Math.max(typeof minVal === "number" ? minVal : JAVAMINFLOAT, JAVAMINFLOAT);

    if (result.data > max) {
      helper.addErrors(FLOATEXCEPTIONS.TOOBIG.create(start, reader.cursor, max.toString(), result.data.toString()));
    }

    if (result.data < min) {
      helper.addErrors(FLOATEXCEPTIONS.TOOSMALL.create(start, reader.cursor, min.toString(), result.data.toString()));
    }

    return helper.succeed();
  }
};
},{"../../brigadier/errors":"aP4V","../../misc-functions":"KBGm"}],"GcLj":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const tslib_1 = require("tslib");

tslib_1.__exportStar(require("./bool"), exports);

tslib_1.__exportStar(require("./string"), exports);

tslib_1.__exportStar(require("./integer"), exports);

tslib_1.__exportStar(require("./float"), exports);
},{"./bool":"Q/Gg","./string":"oM/0","./integer":"IAMg","./float":"2AVt"}],"38DR":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const main_1 = require("vscode-languageserver/lib/main");

const misc_functions_1 = require("../misc-functions");

exports.literalParser = {
  kind: main_1.CompletionItemKind.Method,
  parse: (reader, properties) => {
    const helper = new misc_functions_1.ReturnHelper(properties);
    const begin = reader.cursor;
    const literal = properties.path[properties.path.length - 1];

    if (properties.suggesting && literal.startsWith(reader.getRemaining())) {
      helper.addSuggestions(literal);
    }

    if (reader.canRead(literal.length)) {
      const end = begin + literal.length;

      if (reader.string.substring(begin, end) === literal) {
        reader.cursor = end;

        if (reader.peek() === " " || !reader.canRead()) {
          return helper.succeed();
        }
      }
    }

    return helper.fail();
  }
};
},{"../misc-functions":"KBGm"}],"wRSu":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const main_1 = require("vscode-languageserver/lib/main");

const errors_1 = require("../../brigadier/errors");

const misc_functions_1 = require("../../misc-functions");

const nmsp_tag_1 = require("../../misc-functions/parsing/nmsp-tag");

exports.predicateParser = {
  parse: (reader, info) => parseBlockArgument(reader, info, true)
};
exports.stateParser = {
  parse: (reader, info) => parseBlockArgument(reader, info, false)
};
const exceptions = {
  block_properties: {
    duplicate: new errors_1.CommandErrorBuilder("argument.block.property.duplicate", "Property '%s' can only be set once for block %s"),
    invalid: new errors_1.CommandErrorBuilder("argument.block.property.invalid", "Block %s does not accept '%s' for %s property"),
    novalue: new errors_1.CommandErrorBuilder("argument.block.property.novalue", "Expected value for property '%s' on block %s"),
    unknown: new errors_1.CommandErrorBuilder("argument.block.property.unknown", "Block %s does not have property '%s'")
  },
  invalid_block: new errors_1.CommandErrorBuilder("argument.block.id.invalid", "Unknown block type '%s'"),
  no_tags: new errors_1.CommandErrorBuilder("argument.block.tag.disallowed", "Tags aren't allowed here, only actual blocks"),
  tag_properties: {
    duplicate: new errors_1.CommandErrorBuilder("argument.block_tag.property.duplicate", "Property '%s' can only be set once for block tag %s"),
    invalid: new errors_1.CommandErrorBuilder("argument.block_tag.property.invalid", "Block tag %s does not accept '%s' for %s property"),
    novalue: new errors_1.CommandErrorBuilder("argument.block_tag.property.novalue", "Expected value for property '%s' on block tag %s"),
    unknown: new errors_1.CommandErrorBuilder("argument.block_tag.property.unknown", "Block tag %s does not have property '%s'")
  },
  unknown_properties: {
    duplicate: new errors_1.CommandErrorBuilder("argument.unknown_block_tag.property.duplicate", "Property '%s' can only be set once for unknown block tag %s"),
    invalid: new errors_1.CommandErrorBuilder("argument.unknown_block_tag.property.invalid", "Unknown block tag %s might not accept '%s' for %s property", main_1.DiagnosticSeverity.Warning),
    novalue: new errors_1.CommandErrorBuilder("argument.unknown_block_tag.property.novalue", "Expected value for property '%s' on unknown block tag %s"),
    unknown: new errors_1.CommandErrorBuilder("argument.unknown_block_tag.property.unknown", "Unknown block tag %s might not have property '%s'", main_1.DiagnosticSeverity.Warning)
  },
  unclosed_props: new errors_1.CommandErrorBuilder("argument.block.property.unclosed", "Expected closing ] for block state properties"),
  unknown_tag: new errors_1.CommandErrorBuilder("arguments.block.tag.unknown", // Argument_s_ [sic]
  "Unknown block tag '%s'")
};

function parseBlockArgument(reader, info, tags) {
  const helper = new misc_functions_1.ReturnHelper(info);
  const start = reader.cursor;
  const tagHandling = tags ? "block_tags" : exceptions.no_tags;
  const parsed = nmsp_tag_1.parseNamespaceOrTag(reader, info, tagHandling);
  let stringifiedName;

  if (helper.merge(parsed)) {
    const parsedResult = parsed.data;

    if (parsedResult.resolved && parsedResult.values) {
      stringifiedName = `#${misc_functions_1.stringifyNamespace(parsedResult.parsed)}`;
      helper.merge(nmsp_tag_1.buildTagActions(parsedResult.values, start + 1, reader.cursor, "block_tags", info.data.localData));
      const props = constructProperties(parsedResult.resolved, info.data.globalData.blocks);
      const propsResult = parseProperties(reader, props || {}, exceptions.tag_properties, stringifiedName);

      if (!helper.merge(propsResult)) {
        return helper.fail();
      }
    } else {
      stringifiedName = misc_functions_1.stringifyNamespace(parsed.data.parsed);

      if (info.suggesting && !reader.canRead()) {
        helper.addSuggestions(...misc_functions_1.namespaceSuggestionString(Object.keys(info.data.globalData.blocks), parsed.data.parsed, start));
      }

      const props = info.data.globalData.blocks[stringifiedName];

      if (!props) {
        helper.addErrors(exceptions.invalid_block.create(start, reader.cursor));
      }

      const result = parseProperties(reader, props || {}, exceptions.block_properties, stringifiedName);

      if (!helper.merge(result)) {
        return helper.fail();
      }
    }
  } else {
    if (parsed.data) {
      helper.addErrors(exceptions.unknown_tag.create(start, reader.cursor, misc_functions_1.stringifyNamespace(parsed.data)));
      stringifiedName = `#${misc_functions_1.stringifyNamespace(parsed.data)}`;
      const propsResult = parseProperties(reader, {}, exceptions.unknown_properties, stringifiedName);

      if (!helper.merge(propsResult)) {
        return helper.fail();
      }
    } else {
      // Parsing of the namespace failed
      return helper.fail();
    }
  }

  return helper.succeed();
}

exports.parseBlockArgument = parseBlockArgument; // Ugly call signature. Need to see how upstream handles tag properties.
// At the moment, it is very broken

function parseProperties(reader, options, errors, name) {
  const helper = new misc_functions_1.ReturnHelper();
  const result = new Map();

  if (reader.peek() === "[") {
    const start = reader.cursor;
    reader.skip();
    const props = Object.keys(options);
    reader.skipWhitespace();

    while (reader.canRead() && reader.peek() !== "]") {
      reader.skipWhitespace();
      const propStart = reader.cursor;
      const propParse = reader.readOption(props, false, main_1.CompletionItemKind.Property);
      const propKey = propParse.data;
      const propSuccessful = helper.merge(propParse);

      if (propKey === false) {
        // Strange order allows better type checker reasoning
        // Parsing failed
        return helper.fail();
      }

      if (!propSuccessful) {
        helper.addErrors(errors.unknown.create(propStart, reader.cursor, name, propKey));
      }

      if (result.has(propKey)) {
        helper.addErrors(errors.duplicate.create(propStart, reader.cursor, propKey, name));
      }

      reader.skipWhitespace();

      if (!reader.canRead() || reader.peek() !== "=") {
        return helper.fail(errors.novalue.create(propStart, reader.cursor, propKey, name));
      }

      reader.skip();
      reader.skipWhitespace();
      const valueStart = reader.cursor;
      const valueParse = reader.readOption(options[propKey] || [], false, main_1.CompletionItemKind.EnumMember);
      const valueSuccessful = helper.merge(valueParse);
      const value = valueParse.data;

      if (value === false) {
        return helper.fail();
      }

      const error = errors.invalid.create(valueStart, reader.cursor, name, value, propKey);

      const adderrorIf = b => b && propSuccessful && !valueSuccessful ? helper.addErrors(error) : undefined;

      adderrorIf(value.length > 0);
      result.set(propKey, value);
      reader.skipWhitespace();

      if (reader.canRead()) {
        if (reader.peek() === ",") {
          adderrorIf(value.length === 0);
          reader.skip();
          continue;
        }

        if (reader.peek() === "]") {
          adderrorIf(value.length === 0);
          break;
        }
      }

      return helper.fail(exceptions.unclosed_props.create(start, reader.cursor));
    }

    if (!reader.canRead()) {
      helper.addSuggestions(...props.map(prop => ({
        kind: main_1.CompletionItemKind.Property,
        start: reader.cursor,
        text: prop
      })));
      return helper.fail(exceptions.unclosed_props.create(start, reader.cursor));
    }

    reader.expect("]"); // Sanity check
  }

  return helper.succeed(result);
}

function constructProperties(options, blocks) {
  const result = {};

  for (const blockName of options) {
    const stringified = misc_functions_1.stringifyNamespace(blockName);
    const block = blocks[stringified];

    if (block) {
      for (const prop in block) {
        if (block.hasOwnProperty(prop)) {
          result[prop] = Array.from(new Set((result[prop] || []).concat(block[prop])));
        }
      }
    }
  }

  return result;
}
},{"../../brigadier/errors":"aP4V","../../misc-functions":"KBGm","../../misc-functions/parsing/nmsp-tag":"lcVC"}],"5Pa8":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const errors_1 = require("../../brigadier/errors");

const misc_functions_1 = require("../../misc-functions");

const MIXED = new errors_1.CommandErrorBuilder("argument.pos.mixed", "Cannot mix world & local coordinates (everything must either use ^ or not)");
const INCOMPLETE = new errors_1.CommandErrorBuilder("argument.pos.incomplete", "Incomplete position argument. Only %s coords are present, when %s should be");
const NO_LOCAL = new errors_1.CommandErrorBuilder("argument.pos.nolocal", "Local coords are not allowed");
const LOCAL = "^";
const RELATIVE = "~";

const fail = (reader, helper, count, hasWorld, hasLocal, start, i) => {
  if (!hasWorld) {
    helper.addSuggestions({
      start: reader.cursor,
      text: LOCAL
    });
  }

  if (!hasLocal) {
    helper.addSuggestions({
      start: reader.cursor,
      text: RELATIVE
    });
  }

  return helper.fail(INCOMPLETE.create(start, reader.cursor, (i + 1).toString(), count.toString()));
};

class CoordParser {
  constructor(rules) {
    this.rules = rules;
  }

  parse(reader, info) {
    const helper = new misc_functions_1.ReturnHelper(info);
    let hasLocal = false;
    let hasWorld = false;
    const start = reader.cursor;

    for (let i = 0; i < this.rules.count; i++) {
      if (!reader.canRead()) {
        return fail(reader, helper, this.rules.count, hasWorld, hasLocal, start, 0);
      }

      const cstart = reader.cursor;

      switch (reader.peek()) {
        case RELATIVE:
          hasWorld = true;
          reader.skip();

          if (!helper.merge(this.parseNumber(reader))) {
            return helper.fail();
          }

          if (hasLocal) {
            helper.addErrors(MIXED.create(cstart, reader.cursor));
          }

          break;

        case LOCAL:
          if (!this.rules.local) {
            helper.addErrors(NO_LOCAL.create(reader.cursor, reader.cursor + 1));
          }

          hasLocal = true;
          reader.skip();

          if (!helper.merge(this.parseNumber(reader))) {
            return helper.fail();
          }

          if (hasWorld) {
            helper.addErrors(MIXED.create(cstart, reader.cursor));
          }

          break;

        default:
          hasWorld = true;

          if (!helper.merge(this.parseNumber(reader, false))) {
            return helper.fail();
          }

          if (hasLocal) {
            helper.addErrors(MIXED.create(cstart, reader.cursor));
          }

      }

      if (i < this.rules.count - 1 && (!reader.canRead() || !helper.merge(reader.expect(" ")))) {
        return fail(reader, helper, this.rules.count, hasWorld, hasLocal, start, i);
      }
    }

    return helper.succeed();
  }

  parseNumber(reader, allowBlank = true) {
    if ((!reader.canRead() || reader.peek().match(/\s/)) && allowBlank) {
      return new misc_functions_1.ReturnHelper().succeed(0);
    }

    return this.rules.float ? reader.readFloat() : reader.readInt();
  }

}

exports.CoordParser = CoordParser;
exports.rotation = new CoordParser({
  count: 2,
  float: true,
  local: false
});
exports.vec2 = new CoordParser({
  count: 2,
  float: true,
  local: true
});
exports.vec3 = new CoordParser({
  count: 3,
  float: true,
  local: true
});
exports.blockPos = new CoordParser({
  count: 3,
  float: false,
  local: true
});
},{"../../brigadier/errors":"aP4V","../../misc-functions":"KBGm"}],"LoiV":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const errors_1 = require("../../brigadier/errors");

const misc_functions_1 = require("../../misc-functions");

const NOTAG = new errors_1.CommandErrorBuilder("argument.item.tag.disallowed", "Tags aren't allowed here, only actual items");
const UNKNOWNTAG = new errors_1.CommandErrorBuilder("arguments.item.tag.unknown", "Unknown item tag '%s'");
const UNKNOWNITEM = new errors_1.CommandErrorBuilder("argument.item.id.invalid", "Unknown item '%s'");

class ItemParser {
  constructor(useTags) {
    this.useTags = useTags;
  }

  parse(reader, properties) {
    const helper = new misc_functions_1.ReturnHelper(properties);
    const start = reader.cursor;
    const parsed = misc_functions_1.parseNamespaceOrTag(reader, properties, this.useTags ? "item_tags" : NOTAG);

    if (helper.merge(parsed)) {
      const items = [];

      if (parsed.data.resolved && parsed.data.values) {
        helper.merge(misc_functions_1.buildTagActions(parsed.data.values, start + 1, reader.cursor, "item_tags", properties.data.localData));
        parsed.data.values.forEach(v => {
          items.push(...(v.data || {
            values: []
          }).values);
        });
      } else {
        if (properties.suggesting && !reader.canRead()) {
          helper.addSuggestions(...misc_functions_1.namespaceSuggestionString(properties.data.globalData.items, parsed.data.parsed, start));
        }

        const name = misc_functions_1.stringifyNamespace(parsed.data.parsed);

        if (properties.data.globalData.items.indexOf(name) < 0) {
          helper.addErrors(UNKNOWNITEM.create(start, reader.cursor, name));
        }

        items.push(name);
      }
    } else {
      if (parsed.data) {
        helper.addErrors(UNKNOWNTAG.create(start, reader.cursor, misc_functions_1.stringifyNamespace(parsed.data)));
      } else {
        return helper.fail();
      }
    }

    return helper.succeed();
  }

}

exports.ItemParser = ItemParser;
exports.stack = new ItemParser(false);
exports.predicate = new ItemParser(true);
},{"../../brigadier/errors":"aP4V","../../misc-functions":"KBGm"}],"fc+U":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const vscode_languageserver_1 = require("vscode-languageserver");

const misc_functions_1 = require("../../misc-functions");

exports.jsonParser = {
  parse: (reader, info) => {
    const helper = new misc_functions_1.ReturnHelper();
    const remaining = reader.getRemaining();
    const start = reader.cursor;
    reader.cursor = reader.string.length;
    const schema = info.data.globalData.textComponentSchema;
    const document = {
      getText: () => remaining,
      languageId: "json",
      lineCount: 1,
      offsetAt: pos => pos.character,
      positionAt: offset => ({
        line: 0,
        character: offset
      }),
      uri: "/tmp/notreal",
      version: 0
    };
    const service = info.data.globalData.jsonService;
    const jsonDocument = service.parseJSONDocument(document);
    service.doValidation(document, jsonDocument, undefined, schema).then(diagnostics => {
      /* Because we use SynchronousPromise this is called before the next statement runs*/
      helper.addErrors(...diagnostics.map(diag => ({
        code: typeof diag.code === "string" ? diag.code : "json",
        range: {
          end: start + diag.range.end.character,
          start: start + diag.range.start.character
        },
        severity: diag.severity || vscode_languageserver_1.DiagnosticSeverity.Error,
        text: diag.message
      })));
    });
    service.doComplete(document, {
      line: 0,
      character: remaining.length
    }, jsonDocument).then(completionList => {
      if (completionList) {
        completionList.items.forEach(item => {
          if (item.textEdit) {
            helper.addSuggestions({
              description: item.documentation,
              kind: item.kind,
              start: start + item.textEdit.range.start.character,
              text: item.textEdit.newText
            });
          } else {
            helper.addSuggestions({
              description: item.documentation,
              kind: item.kind,
              start: reader.cursor,
              text: item.label
            });
          }
        });
      }
    });
    return helper.succeed();
  }
};
},{"../../misc-functions":"KBGm"}],"Td8d":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.COLORS = ["black", "dark_blue", "dark_green", "dark_aqua", "dark_red", "dark_purple", "gold", "gray", "dark_gray", "blue", "green", "aqua", "red", "light_purple", "yellow", "white", "reset"];
},{}],"TytA":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.itemSlots = slotsBuilder();

function slotsBuilder() {
  const slots = [];
  slots.push("armor.chest", "armor.feet", "armor.head", "armor.legs");

  for (let i = 0; i < 54; i++) {
    slots.push(`container.${i}`);
  }

  for (let i = 0; i < 27; i++) {
    slots.push(`enderchest.${i}`);
  }

  for (let i = 0; i < 25; i++) {
    slots.push(`horse.${i}`);
  }

  slots.push("horse.armor", "horse.chest", "horse.saddle");

  for (let i = 0; i < 9; i++) {
    slots.push(`hotbar.${i}`);
  }

  for (let i = 0; i < 27; i++) {
    slots.push(`inventory.${i}`);
  }

  for (let i = 0; i < 8; i++) {
    slots.push(`villager.${i}`);
  }

  slots.push("weapon", "weapon.mainhand", "weapon.offhand");
  return slots;
}
},{}],"TZ8Y":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const colors_1 = require("../../colors");

exports.scoreboardSlots = createSlots();

function createSlots() {
  const slots = [];
  slots.push("list", "sidebar", "belowName");

  for (const s of colors_1.COLORS) {
    slots.push(`sidebar.team.${s}`);
  }

  return slots;
}
},{"../../colors":"Td8d"}],"e3ir":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const colors_1 = require("../../colors");

exports.anchors = ["feet", "eyes"];
exports.operations = ["+=", "-=", "*=", "/=", "%=", "=", ">", "<", "><"];
exports.colors = colors_1.COLORS;
exports.effects = ["minecraft:speed", "minecraft:slowness", "minecraft:haste", "minecraft:mining_fatigue", "minecraft:strength", "minecraft:instant_health", "minecraft:instant_damage", "minecraft:jump_boost", "minecraft:nausea", "minecraft:regeneration", "minecraft:resistance", "minecraft:fire_resistance", "minecraft:water_breathing", "minecraft:invisibility", "minecraft:blindness", "minecraft:night_vision", "minecraft:hunger", "minecraft:weakness", "minecraft:poison", "minecraft:wither", "minecraft:health_boost", "minecraft:absorption", "minecraft:saturation", "minecraft:glowing", "minecraft:levitation", "minecraft:luck", "minecraft:unluck", "minecraft:slow_falling", "minecraft:conduit_power", "minecraft:dolphins_grace"];
exports.enchantments = ["minecraft:protection", "minecraft:fire_protection", "minecraft:feather_falling", "minecraft:blast_protection", "minecraft:projectile_protection", "minecraft:respiration", "minecraft:aqua_affinity", "minecraft:thorns", "minecraft:depth_strider", "minecraft:frost_walker", "minecraft:binding_curse", "minecraft:sharpness", "minecraft:smite", "minecraft:bane_of_arthropods", "minecraft:knockback", "minecraft:fire_aspect", "minecraft:looting", "minecraft:sweeping", "minecraft:efficiency", "minecraft:silk_touch", "minecraft:unbreaking", "minecraft:fortune", "minecraft:power", "minecraft:punch", "minecraft:flame", "minecraft:infinity", "minecraft:luck_of_the_sea", "minecraft:lure", "minecraft:loyalty", "minecraft:impaling", "minecraft:riptide", "minecraft:channeling", "minecraft:mending", "minecraft:vanishing_curse"];
exports.particles = ["minecraft:ambient_entity_effect", "minecraft:angry_villager", "minecraft:barrier", "minecraft:block", "minecraft:bubble", "minecraft:cloud", "minecraft:crit", "minecraft:damage_indicator", "minecraft:dragon_breath", "minecraft:dripping_lava", "minecraft:dripping_water", "minecraft:dust", "minecraft:effect", "minecraft:elder_guardian", "minecraft:enchanted_hit", "minecraft:enchant", "minecraft:end_rod", "minecraft:entity_effect", "minecraft:explosion_emitter", "minecraft:explosion", "minecraft:falling_dust", "minecraft:firework", "minecraft:fishing", "minecraft:flame", "minecraft:happy_villager", "minecraft:heart", "minecraft:instant_effect", "minecraft:item", "minecraft:item_slime", "minecraft:item_snowball", "minecraft:large_smoke", "minecraft:lava", "minecraft:mycelium", "minecraft:note", "minecraft:poof", "minecraft:portal", "minecraft:rain", "minecraft:smoke", "minecraft:spit", "minecraft:squid_ink", "minecraft:sweep_attack", "minecraft:totem_of_undying", "minecraft:underwater", "minecraft:splash", "minecraft:witch", "minecraft:bubble_pop", "minecraft:current_down", "minecraft:bubble_column_up", "minecraft:nautilus"];
exports.entities = ["area_effect_cloud", "armor_stand", "arrow", "bat", "blaze", "boat", "cave_spider", "chicken", "cod", "cow", "creeper", "donkey", "dolphin", "dragon_fireball", "drowned", "elder_guardian", "end_crystal", "ender_dragon", "enderman", "endermite", "evoker_fangs", "evoker", "experience_orb", "eye_of_ender", "falling_block", "firework_rocket", "ghast", "giant", "guardian", "horse", "husk", "illusioner", "item", "item_frame", "fireball", "leash_knot", "llama", "llama_spit", "magma_cube", "minecart", "chest_minecart", "command_block_minecart", "furnace_minecart", "hopper_minecart", "spawner_minecart", "tnt_minecart", "mule", "mooshroom", "ocelot", "painting", "parrot", "pig", "pufferfish", "zombie_pigman", "polar_bear", "tnt", "rabbit", "salmon", "sheep", "shulker", "shulker_bullet", "silverfish", "skeleton", "skeleton_horse", "slime", "small_fireball", "snow_golem", "snowball", "spectral_arrow", "spider", "squid", "stray", "tropical_fish", "turtle", "egg", "ender_pearl", "experience_bottle", "potion", "vex", "villager", "iron_golem", "vindicator", "witch", "wither", "wither_skeleton", "wither_skull", "wolf", "zombie", "zombie_horse", "zombie_villager", "phantom", "lightning_bolt", "trident"];
exports.dimensions = ["overworld", "the_nether", "the_end"];
},{"../../colors":"Td8d"}],"kr6k":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const vscode_languageserver_1 = require("vscode-languageserver");

const errors_1 = require("../../brigadier/errors");

const string_reader_1 = require("../../brigadier/string-reader");

const colors_1 = require("../../colors");

const item_slot_1 = require("../../data/lists/item-slot");

const scoreboard_slot_1 = require("../../data/lists/scoreboard-slot");

const statics_1 = require("../../data/lists/statics");

const misc_functions_1 = require("../../misc-functions");

class ListParser {
  constructor(options, err) {
    this.options = options;
    this.error = err;
  }

  parse(reader, info) {
    const start = reader.cursor;
    const helper = new misc_functions_1.ReturnHelper(info);
    const optResult = reader.readOption(this.options, false, vscode_languageserver_1.CompletionItemKind.EnumMember, string_reader_1.StringReader.charAllowedInUnquotedString);

    if (helper.merge(optResult)) {
      return helper.succeed();
    } else {
      return helper.fail(this.error.create(start, reader.cursor, optResult.data.toString()));
    }
  }

}

exports.ListParser = ListParser;
const colorError = new errors_1.CommandErrorBuilder("argument.color.invalid", "Unknown color '%s'");
exports.colorParser = new ListParser(colors_1.COLORS, colorError);
const entityAnchorError = new errors_1.CommandErrorBuilder("argument.anchor.invalid", "Invalid entity anchor position %s");
exports.entityAnchorParser = new ListParser(statics_1.anchors, entityAnchorError);
const slotError = new errors_1.CommandErrorBuilder("slot.unknown", "Unknown slot '%s'");
exports.itemSlotParser = new ListParser(item_slot_1.itemSlots, slotError);
const operationError = new errors_1.CommandErrorBuilder("arguments.operation.invalid", "Invalid operation");
exports.operationParser = new ListParser(statics_1.operations, operationError);
const scoreboardSlotError = new errors_1.CommandErrorBuilder("argument.scoreboardDisplaySlot.invalid", "Unknown display slot '%s'");
exports.scoreBoardSlotParser = new ListParser(scoreboard_slot_1.scoreboardSlots, scoreboardSlotError);
},{"../../brigadier/errors":"aP4V","../../brigadier/string-reader":"iLhI","../../colors":"Td8d","../../data/lists/item-slot":"TytA","../../data/lists/scoreboard-slot":"TZ8Y","../../data/lists/statics":"e3ir","../../misc-functions":"KBGm"}],"VDDC":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const misc_functions_1 = require("../../misc-functions");

exports.messageParser = {
  parse: reader => {
    reader.cursor = reader.getTotalLength();
    return new misc_functions_1.ReturnHelper().succeed();
  }
};
},{"../../misc-functions":"KBGm"}],"suMb":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const errors_1 = require("../../brigadier/errors");

const statics_1 = require("../../data/lists/statics");

const misc_functions_1 = require("../../misc-functions");

class NamespaceListParser {
  constructor(options, errorBuilder) {
    this.options = options;
    this.error = errorBuilder;
  }

  parse(reader, info) {
    const helper = new misc_functions_1.ReturnHelper(info);
    const start = reader.cursor;
    const result = misc_functions_1.parseNamespaceOption(reader, misc_functions_1.stringArrayToNamespaces(this.options));

    if (helper.merge(result)) {
      return helper.succeed();
    } else {
      if (result.data) {
        return helper.addErrors(this.error.create(start, reader.cursor, misc_functions_1.stringifyNamespace(result.data))).succeed();
      } else {
        return helper.fail();
      }
    }
  }

}

exports.NamespaceListParser = NamespaceListParser;
const summonError = new errors_1.CommandErrorBuilder("entity.notFound", "Unknown entity: %s");
exports.summonParser = new NamespaceListParser(statics_1.entities, summonError);
const enchantmentError = new errors_1.CommandErrorBuilder("enchantment.unknown", "Unknown enchantment: %s");
exports.enchantmentParser = new NamespaceListParser(statics_1.enchantments, enchantmentError);
const mobEffectError = new errors_1.CommandErrorBuilder("effect.effectNotFound", "Unknown effect: %s");
exports.mobEffectParser = new NamespaceListParser(statics_1.effects, mobEffectError);
const particleError = new errors_1.CommandErrorBuilder("particle.notFound", "Unknown particle: %s");
exports.particleParser = new NamespaceListParser(statics_1.particles, particleError);
const dimensionError = new errors_1.CommandErrorBuilder("argument.dimension.invalid", "Unknown dimension: '%s'");
exports.dimensionParser = new NamespaceListParser(statics_1.dimensions, dimensionError);
},{"../../brigadier/errors":"aP4V","../../data/lists/statics":"e3ir","../../misc-functions":"KBGm"}],"ELUu":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const vscode_languageserver_1 = require("vscode-languageserver");

const errors_1 = require("../../brigadier/errors");

const misc_functions_1 = require("../../misc-functions");

const exceptions = {
  advancement_notfound: new errors_1.CommandErrorBuilder("advancement.advancementNotFound", "Unknown advancement: %s"),
  nobossbar: new errors_1.CommandErrorBuilder("commands.bossbar.unknown", "No bossbar exists with the ID '%s'"),
  recipe_notfound: new errors_1.CommandErrorBuilder("recipe.notFound", "Unkown recipe: %s"),
  unknown_function: new errors_1.CommandErrorBuilder("arguments.function.unknown", "Unknown function '%s'"),
  unknown_resource: new errors_1.CommandErrorBuilder("argument.id.unknown", "Unknown resource '%s'"),
  unknown_tag: new errors_1.CommandErrorBuilder("arguments.function.tag.unknown", "Unknown function tag '#%s'")
};
exports.functionParser = {
  parse: (reader, info) => {
    const helper = new misc_functions_1.ReturnHelper(info);
    const start = reader.cursor;
    const parsed = misc_functions_1.parseNamespaceOrTag(reader, info, "function_tags");
    const localData = info.data.localData;

    if (helper.merge(parsed)) {
      const data = parsed.data;

      if (data.resolved && data.values) {
        helper.merge(misc_functions_1.buildTagActions(data.values, start, reader.cursor, "function_tags", localData));
        return helper.succeed();
      } else {
        const options = misc_functions_1.getResourcesofType(info.data, "functions");
        const postProcess = misc_functions_1.processParsedNamespaceOption(data.parsed, options, info.suggesting && !reader.canRead(), start, vscode_languageserver_1.CompletionItemKind.Method);

        if (postProcess.data.length === 0) {
          helper.addErrors(exceptions.unknown_function.create(start, reader.cursor, misc_functions_1.stringifyNamespace(data.parsed)));
        }

        if (localData) {
          for (const func of postProcess.data) {
            const location = misc_functions_1.buildPath(func, localData, "functions");

            if (location) {
              helper.addActions({
                data: location,
                high: reader.cursor,
                low: start,
                type: "source"
              });
            }
          }
        }

        return helper.mergeChain(postProcess).succeed();
      }
    } else {
      if (!parsed.data) {
        return helper.fail();
      } else {
        return helper.addErrors(exceptions.unknown_tag.create(start, reader.cursor, misc_functions_1.stringifyNamespace(parsed.data))).succeed();
      }
    }
  }
};
const idParser = {
  parse: misc_functions_1.parseNamespace
};
const bossbarParser = {
  parse: (reader, info) => {
    const helper = new misc_functions_1.ReturnHelper(info);

    if (info.data.localData && info.data.localData.nbt.level) {
      const start = reader.cursor;
      const bars = info.data.localData.nbt.level.Data.CustomBossEvents;
      const options = misc_functions_1.stringArrayToNamespaces(Object.keys(bars));
      const result = misc_functions_1.parseNamespaceOption(reader, options);

      if (helper.merge(result)) {
        return helper.succeed();
      } else {
        if (result.data) {
          return helper.addErrors(exceptions.nobossbar.create(start, reader.cursor, misc_functions_1.stringifyNamespace(result.data))).succeed();
        } else {
          return helper.fail();
        }
      }
    } else {
      return helper.return(misc_functions_1.parseNamespace(reader));
    }
  }
};
const resourceKinds = [{
  data: {
    issue: exceptions.advancement_notfound,
    resource: "advancements"
  },
  path: ["advancement"]
}, {
  data: {
    resource: idParser
  },
  path: ["bossbar", "add"]
}, {
  data: {
    resource: bossbarParser
  },
  path: ["bossbar"]
}, {
  data: {
    resource: bossbarParser
  },
  path: ["execute", "store", "result"]
}, // Worrying about sounds is not in scope for initial release
{
  data: {
    resource: idParser
  },
  path: ["playsound"]
}, {
  data: {
    resource: idParser
  },
  path: ["stopsound"]
}, {
  data: {
    resource: "recipes",
    issue: exceptions.advancement_notfound
  },
  path: ["recipe"]
}];
exports.resourceParser = {
  parse: (reader, info) => {
    const start = reader.cursor;
    const helper = new misc_functions_1.ReturnHelper(info);
    const kind = misc_functions_1.startPaths(resourceKinds, info.path);

    if (kind) {
      if (typeof kind.resource === "object") {
        return helper.return(kind.resource.parse(reader, info));
      } else {
        const result = misc_functions_1.parseNamespaceOption(reader, misc_functions_1.getResourcesofType(info.data, kind.resource));

        if (helper.merge(result)) {
          return helper.succeed();
        } else {
          if (result.data) {
            return helper.addErrors( // @ts-ignore type inference failure
            kind.issue.create(start, reader.cursor, misc_functions_1.stringifyNamespace(result.data))).succeed();
          } else {
            return helper.fail();
          }
        }
      }
    } else {
      throw new Error(`Resource at path ${info.path} does not have a supported resource`);
    }
  }
};
},{"../../brigadier/errors":"aP4V","../../misc-functions":"KBGm"}],"heCz":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verbatimCriteria = ["air", "armor", "deathCount", "dummy", "food", "health", "level", "playerKillCount", "totalKillCount", "trigger", "xp", "minecraft.custom:minecraft.animals_bred", "minecraft.custom:minecraft.aviate_one_cm", "minecraft.custom:minecraft.boat_one_cm", "minecraft.custom:minecraft.clean_armor", "minecraft.custom:minecraft.clean_banner", "minecraft.custom:minecraft.clean_shulker_box", "minecraft.custom:minecraft.climb_one_cm", "minecraft.custom:minecraft.crouch_one_cm", "minecraft.custom:minecraft.damage_absorbed", "minecraft.custom:minecraft.damage_blocked_by_shield", "minecraft.custom:minecraft.damage_dealt", "minecraft.custom:minecraft.damage_dealt_absorbed", "minecraft.custom:minecraft.damage_dealt_resisted", "minecraft.custom:minecraft.damage_resisted", "minecraft.custom:minecraft.damage_taken", "minecraft.custom:minecraft.deaths", "minecraft.custom:minecraft.drop", "minecraft.custom:minecraft.eat_cake_slice", "minecraft.custom:minecraft.enchant_item", "minecraft.custom:minecraft.fall_one_cm", "minecraft.custom:minecraft.fill_cauldron", "minecraft.custom:minecraft.fish_caught", "minecraft.custom:minecraft.fly_one_cm", "minecraft.custom:minecraft.horse_one_cm", "minecraft.custom:minecraft.inspect_dispenser", "minecraft.custom:minecraft.inspect_dropper", "minecraft.custom:minecraft.inspect_hopper", "minecraft.custom:minecraft.interact_with_beacon", "minecraft.custom:minecraft.interact_with_brewingstand", "minecraft.custom:minecraft.interact_with_crafting_table", "minecraft.custom:minecraft.interact_with_furnace", "minecraft.custom:minecraft.jump", "minecraft.custom:minecraft.leave_game", "minecraft.custom:minecraft.minecart_one_cm", "minecraft.custom:minecraft.mob_kills", "minecraft.custom:minecraft.open_chest", "minecraft.custom:minecraft.open_enderchest", "minecraft.custom:minecraft.open_shulker_box", "minecraft.custom:minecraft.pig_one_cm", "minecraft.custom:minecraft.play_noteblock", "minecraft.custom:minecraft.play_one_minute", "minecraft.custom:minecraft.play_record", "minecraft.custom:minecraft.player_kills", "minecraft.custom:minecraft.pot_flower", "minecraft.custom:minecraft.sleep_in_bed", "minecraft.custom:minecraft.sneak_time", "minecraft.custom:minecraft.sprint_one_cm", "minecraft.custom:minecraft.swim_one_cm", "minecraft.custom:minecraft.talked_to_villager", "minecraft.custom:minecraft.time_since_death", "minecraft.custom:minecraft.time_since_rest", "minecraft.custom:minecraft.traded_with_villager", "minecraft.custom:minecraft.trigger_trapped_chest", "minecraft.custom:minecraft.tune_noteblock", "minecraft.custom:minecraft.use_cauldron", "minecraft.custom:minecraft.walk_on_water_one_cm", "minecraft.custom:minecraft.walk_one_cm", "minecraft.custom:minecraft.walk_under_water_one_cm"];
exports.colorCriteria = ["teamkill.", "killedByTeam."];
exports.itemCriteria = ["minecraft.broken:", "minecraft.crafted:", "minecraft.dropped:", "minecraft.picked_up:", "minecraft.used:"];
exports.blockCriteria = ["minecraft.mined:"];
exports.entityCriteria = ["minecraft.killed_by:", "minecraft.killed:"];
},{}],"tZ+1":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const vscode_languageserver_1 = require("vscode-languageserver");

const errors_1 = require("../../brigadier/errors");

const string_reader_1 = require("../../brigadier/string-reader");

const colors_1 = require("../../colors");

const criteria_1 = require("../../data/lists/criteria");

const statics_1 = require("../../data/lists/statics");

const misc_functions_1 = require("../../misc-functions");

const typed_keys_1 = require("../../misc-functions/third_party/typed-keys");

const exceptions = {
  unknown_objective: new errors_1.CommandErrorBuilder("arguments.objective.notFound", "Unknown scoreboard objective '%s'"),
  unknown_team: new errors_1.CommandErrorBuilder("team.notFound", "Unknown team '%s'")
};
const slotPurposes = {
  slot_0: "list",
  slot_1: "sidebar",
  slot_10: "sidebar.team.gray",
  slot_11: "sidebar.team.dark_gray",
  slot_12: "sidebar.team.blue",
  slot_13: "sidebar.team.green",
  slot_14: "sidebar.team.aqua",
  slot_15: "sidebar.team.red",
  slot_16: "sidebar.team.light_purple",
  slot_17: "sidebar.team.yellow",
  slot_18: "sidebar.team.white",
  slot_2: "belowName",
  slot_3: "sidebar.team.black",
  slot_4: "sidebar.team.dark_blue",
  slot_5: "sidebar.team.dark_green",
  slot_6: "sidebar.team.dark_aqua",
  slot_7: "sidebar.team.dark_red",
  slot_8: "sidebar.team.dark_purple",
  slot_9: "sidebar.team.gold"
};
exports.objectiveParser = {
  parse: (reader, info) => {
    const helper = new misc_functions_1.ReturnHelper(info);
    const start = reader.cursor;

    if (info.data.localData) {
      const scoreboardData = info.data.localData.nbt.scoreboard;

      if (scoreboardData) {
        const options = scoreboardData.data.Objectives.map(v => v.Name);
        const result = reader.readOption(options, false, undefined, string_reader_1.StringReader.charAllowedInUnquotedString);

        if (helper.merge(result)) {
          if (!info.suggesting) {
            for (const objective of scoreboardData.data.Objectives) {
              if (objective.Name === result.data) {
                helper.addActions({
                  data: `Displayed as: ${objective.DisplayName}

Criteria: ${objective.CriteriaName}`,
                  high: reader.cursor,
                  low: start,
                  type: "hover"
                });
                break;
              }
            }

            if (scoreboardData.data.DisplaySlots) {
              for (const slot of typed_keys_1.typed_keys(scoreboardData.data.DisplaySlots)) {
                if (scoreboardData.data.DisplaySlots[slot] === result.data) {
                  helper.addActions({
                    data: `Displayed in ${slotPurposes[slot]}`,
                    high: reader.cursor,
                    low: start,
                    type: "hover"
                  });
                }
              }
            }
          }
        } else {
          if (result.data) {
            helper.addErrors(exceptions.unknown_objective.create(start, reader.cursor, result.data));
          } else {
            return helper.fail();
          }
        }

        return helper.succeed();
      }
    }

    reader.readUnquotedString();
    return helper.succeed();
  }
};
exports.teamParser = {
  parse: (reader, info) => {
    const helper = new misc_functions_1.ReturnHelper();
    const start = reader.cursor;

    if (info.data.localData) {
      const scoreboardData = info.data.localData.nbt.scoreboard;

      if (scoreboardData) {
        const options = scoreboardData.data.Teams;
        const result = reader.readOption(options.map(v => v.Name), false, undefined, string_reader_1.StringReader.charAllowedInUnquotedString);

        if (helper.merge(result)) {
          for (const team of options) {
            if (team.Name === result.data) {
              helper.addActions({
                data: `\`\`\`json
${JSON.stringify(team, undefined, 4)}
\`\`\``,
                high: reader.cursor,
                low: start,
                type: "hover"
              });
              break;
            }
          }
        } else {
          if (result.data) {
            helper.addErrors(exceptions.unknown_objective.create(start, reader.cursor, result.data));
          } else {
            return helper.fail();
          }
        }
      }
    } else {
      reader.readUnquotedString();
    }

    return helper.succeed();
  }
};
const UNKNOWN_CRITERIA = new errors_1.CommandErrorBuilder("argument.criteria.invalid", "Unknown criteria '%s'");
const NONWHITESPACE = /\S/;
exports.criteriaParser = {
  parse: (reader, info) => {
    const start = reader.cursor;
    const helper = new misc_functions_1.ReturnHelper(info);
    const optionResult = reader.readOption([...criteria_1.verbatimCriteria, ...criteria_1.blockCriteria, ...criteria_1.colorCriteria, ...criteria_1.entityCriteria, ...criteria_1.itemCriteria], false, vscode_languageserver_1.CompletionItemKind.EnumMember, NONWHITESPACE);
    const text = optionResult.data;

    if (helper.merge(optionResult)) {
      if (criteria_1.verbatimCriteria.indexOf(optionResult.data) !== -1) {
        return helper.succeed();
      }
    }

    if (!text) {
      return helper.fail(); // `unreachable!()`
    }

    const end = reader.cursor;

    for (const choice of criteria_1.colorCriteria) {
      if (text.startsWith(choice)) {
        reader.cursor = start + choice.length;
        const result = reader.readOption(colors_1.COLORS, false, vscode_languageserver_1.CompletionItemKind.Color, NONWHITESPACE);

        if (helper.merge(result)) {
          return helper.succeed();
        }
      }
    }

    for (const choice of criteria_1.entityCriteria) {
      if (text.startsWith(choice)) {
        reader.cursor = start + choice.length;
        const result = reader.readOption(statics_1.entities.map(mapFunction), false, vscode_languageserver_1.CompletionItemKind.Reference, NONWHITESPACE);

        if (helper.merge(result)) {
          return helper.succeed();
        }
      }
    }

    for (const choice of criteria_1.blockCriteria) {
      if (text.startsWith(choice)) {
        reader.cursor = start + choice.length;
        const result = reader.readOption(Object.keys(info.data.globalData.blocks).map(mapFunction), false, vscode_languageserver_1.CompletionItemKind.Constant, NONWHITESPACE);

        if (helper.merge(result)) {
          return helper.succeed();
        }
      }
    }

    for (const choice of criteria_1.itemCriteria) {
      if (text.startsWith(choice)) {
        reader.cursor = start + choice.length;
        const result = reader.readOption(info.data.globalData.items.map(mapFunction), false, vscode_languageserver_1.CompletionItemKind.Keyword, NONWHITESPACE);

        if (helper.merge(result)) {
          return helper.succeed();
        }
      }
    }

    helper.addErrors(UNKNOWN_CRITERIA.create(start, end, text));
    return helper.succeed();
  }
};

function mapFunction(value) {
  return misc_functions_1.stringifyNamespace(misc_functions_1.convertToNamespace(value)).replace(":", ".");
}
},{"../../brigadier/errors":"aP4V","../../brigadier/string-reader":"iLhI","../../colors":"Td8d","../../data/lists/criteria":"heCz","../../data/lists/statics":"e3ir","../../misc-functions":"KBGm","../../misc-functions/third_party/typed-keys":"kca+"}],"0nBp":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const tslib_1 = require("tslib");

const brigadierParsers = tslib_1.__importStar(require("./brigadier"));

const literal_1 = require("./literal");

const blockParsers = tslib_1.__importStar(require("./minecraft/block"));

const coordParsers = tslib_1.__importStar(require("./minecraft/coordinates"));

const itemParsers = tslib_1.__importStar(require("./minecraft/item"));

const json_1 = require("./minecraft/json");

const listParsers = tslib_1.__importStar(require("./minecraft/lists"));

const message_1 = require("./minecraft/message");

const namespaceParsers = tslib_1.__importStar(require("./minecraft/namespace-list"));

const resources_1 = require("./minecraft/resources");

const scoreboard_1 = require("./minecraft/scoreboard");
/**
 * Incomplete:
 * https://github.com/Levertion/mcfunction-langserver/projects/1
 */


const implementedParsers = {
  "brigadier:bool": brigadierParsers.boolParser,
  "brigadier:float": brigadierParsers.floatParser,
  "brigadier:integer": brigadierParsers.intParser,
  "brigadier:string": brigadierParsers.stringParser,
  "minecraft:block_pos": coordParsers.blockPos,
  "minecraft:block_predicate": blockParsers.predicateParser,
  "minecraft:block_state": blockParsers.stateParser,
  "minecraft:color": listParsers.colorParser,
  "minecraft:dimension": namespaceParsers.dimensionParser,
  "minecraft:entity_anchor": listParsers.entityAnchorParser,
  "minecraft:entity_summon": namespaceParsers.summonParser,
  "minecraft:function": resources_1.functionParser,
  "minecraft:item_enchantment": namespaceParsers.enchantmentParser,
  "minecraft:item_predicate": itemParsers.predicate,
  "minecraft:item_slot": listParsers.itemSlotParser,
  "minecraft:item_stack": itemParsers.stack,
  "minecraft:message": message_1.messageParser,
  "minecraft:mob_effect": namespaceParsers.mobEffectParser,
  "minecraft:objective": scoreboard_1.objectiveParser,
  "minecraft:objective_criteria": scoreboard_1.criteriaParser,
  "minecraft:operation": listParsers.operationParser,
  "minecraft:particle": namespaceParsers.particleParser,
  "minecraft:resource_location": resources_1.resourceParser,
  "minecraft:rotation": coordParsers.rotation,
  "minecraft:scoreboard_slot": listParsers.scoreBoardSlotParser,
  "minecraft:team": scoreboard_1.teamParser,
  "minecraft:text_component": json_1.jsonParser,
  "minecraft:vec2": coordParsers.vec2,
  "minecraft:vec3": coordParsers.vec3
};

function getParser(node) {
  switch (node.type) {
    case "literal":
      return literal_1.literalParser;

    case "argument":
      if (!!node.parser) {
        return getArgParser(node.parser);
      }

      break;

    default:
  }

  return undefined;
}

exports.getParser = getParser;

function getArgParser(id) {
  if (!!global.mcLangSettings && !!global.mcLangSettings.parsers && global.mcLangSettings.parsers.hasOwnProperty(id)) {
    try {
      return global.mcLangSettings.parsers[id];
    } catch (_) {
      mcLangLog(`${global.mcLangSettings.parsers[id]} could not be loaded`);
    }
  }

  if (implementedParsers.hasOwnProperty(id)) {
    return implementedParsers[id];
  }

  mcLangLog(`Argument with parser id ${id} has no associated parser.
Please consider reporting this at https://github.com/Levertion/mcfunction-language-server/issues`);
  return undefined;
}
},{"./brigadier":"GcLj","./literal":"38DR","./minecraft/block":"wRSu","./minecraft/coordinates":"5Pa8","./minecraft/item":"LoiV","./minecraft/json":"fc+U","./minecraft/lists":"kr6k","./minecraft/message":"VDDC","./minecraft/namespace-list":"suMb","./minecraft/resources":"ELUu","./minecraft/scoreboard":"tZ+1"}],"aDYY":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const main_1 = require("vscode-languageserver/lib/main");

const string_reader_1 = require("./brigadier/string-reader");

const consts_1 = require("./consts");

const creators_1 = require("./misc-functions/creators");

const node_tree_1 = require("./misc-functions/node-tree");

const get_parser_1 = require("./parsers/get-parser");

function computeCompletions(linenum, character, document, data) {
  const line = document.lines[linenum];

  if (line.parseInfo === undefined || line.text.startsWith(consts_1.COMMENT_START)) {
    return main_1.CompletionList.create([], true);
  }

  const commandData = {
    globalData: data.globalData,
    localData: data.getPackFolderData(document.pack_segments)
  };
  const nodes = line.parseInfo ? line.parseInfo.nodes : [];

  if (nodes.length === 0) {
    return main_1.CompletionList.create(getCompletionsFromNode(linenum, 0, character, line.text, [], commandData, {}), true);
  }

  const {
    finals,
    internals
  } = getAllNodes(nodes, character);
  const completions = [];

  for (const finalNode of finals) {
    completions.push(...getCompletionsFromNode(linenum, finalNode.high + 1, character, line.text, finalNode.path, commandData, finalNode.context));
  }

  for (const insideNode of internals) {
    const newPath = insideNode.path.slice();
    const parentPath = newPath.slice(0, -1);
    completions.push(...getCompletionsFromNode(linenum, insideNode.low, character, line.text, parentPath, commandData, insideNode.context));
  }

  return main_1.CompletionList.create(completions, true);
}

exports.computeCompletions = computeCompletions;

function getAllNodes(nodes, character) {
  const finals = [];
  const internals = [];

  for (const node of nodes) {
    if (node.high < character) {
      if (node.final) {
        finals.push(node);
      }
    } else {
      if (node.low <= character) {
        internals.push(node);
      }
    }
  }

  return {
    finals,
    internals
  };
}

exports.getAllNodes = getAllNodes;

function getCompletionsFromNode(line, start, end, text, nodepath, data, context) {
  const parent = node_tree_1.getNextNode(node_tree_1.followPath(data.globalData.commands, nodepath), nodepath, data.globalData.commands).node;
  const result = [];

  if (!!parent.children) {
    for (const childKey in parent.children) {
      if (parent.children.hasOwnProperty(childKey)) {
        const child = parent.children[childKey];
        const childPath = [...nodepath, childKey];
        const info = creators_1.createParserInfo(child, data, childPath, context, true);
        const parser = get_parser_1.getParser(child);

        if (!!parser) {
          const reader = new string_reader_1.StringReader(text.substring(start, end));
          const parseResult = parser.parse(reader, info);

          if (!!parseResult) {
            result.push(...suggestionsToCompletions(parseResult.suggestions, line, start, end, parser.kind));
          }
        }
      }
    }
  }

  return result;
}

function suggestionsToCompletions(suggestions, line, start, end, defaultKind = main_1.CompletionItemKind.Keyword) {
  const result = [];

  for (const suggestion of suggestions) {
    if (typeof suggestion === "string") {
      result.push({
        kind: defaultKind,
        label: suggestion,
        textEdit: {
          newText: suggestion,
          range: {
            end: {
              character: end,
              line
            },
            start: {
              character: start,
              line
            }
          }
        }
      });
    } else {
      const completion = {
        kind: suggestion.kind || defaultKind,
        label: suggestion.text,
        textEdit: {
          newText: suggestion.text,
          range: {
            end: {
              character: end,
              line
            },
            start: {
              character: start + suggestion.start,
              line
            }
          }
        }
      };

      if (!!suggestion.description) {
        completion.documentation = suggestion.description;
      }

      result.push(completion);
    }
  }

  return result;
}
},{"./brigadier/string-reader":"iLhI","./consts":"xb+0","./misc-functions/creators":"NmKP","./misc-functions/node-tree":"H7Mf","./parsers/get-parser":"0nBp"}],"7iV1":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Blank items for testing
 */
// tslint:disable-next-line:variable-name This allows for the property declaration shorthand

exports.pack_segments = {
  pack: "",
  packsFolder: "",
  rest: ""
};
exports.succeeds = {
  succeeds: true
};
exports.blankproperties = {
  context: {},
  data: {},
  node_properties: {},
  path: ["test"]
};
exports.emptyGlobal = {
  blocks: {},
  commands: {
    type: "root"
  },
  items: [],
  jsonService: undefined,
  meta_info: {
    version: ""
  },
  resources: {},
  textComponentSchema: {}
};
exports.blankRange = {
  end: {
    line: 0,
    character: 0
  },
  start: {
    line: 0,
    character: 0
  }
};
},{}],"0A+1":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const tslib_1 = require("tslib");

const node_interval_tree_1 = require("node-interval-tree");

const vscode_languageserver_1 = require("vscode-languageserver");

const vscode_uri_1 = tslib_1.__importDefault(require("vscode-uri"));

const completions_1 = require("./completions");

const consts_1 = require("./consts");

const misc_functions_1 = require("./misc-functions");

const typed_keys_1 = require("./misc-functions/third_party/typed-keys");

const blanks_1 = require("./test/blanks");

function hoverProvider(docLine, pos, _, manager) {
  function computeIntervalHovers(intervals, commandLine, line, map) {
    const end = {
      character: intervals.reduce((acc, v) => Math.max(acc, v.high), 0),
      line
    };
    const start = {
      character: intervals.reduce((acc, v) => Math.min(acc, v.low), commandLine.text.length),
      line
    };
    return {
      contents: map(intervals),
      range: {
        start,
        end
      }
    };
  }

  const hovers = getActionsOfKind(docLine, pos, "hover");

  if (hovers.length > 0) {
    return computeIntervalHovers(hovers, docLine, pos.line, i => i.map(v => v.data));
  } else {
    const tree = getNodeTree(docLine);

    if (tree) {
      const matching = tree.search(pos.character, pos.character);

      if (matching.length > 0) {
        return computeIntervalHovers(matching, docLine, pos.line, i => i.map(node => {
          const data = misc_functions_1.followPath(manager.globalData.commands, node.path);
          return `${data.type === "literal" ? "literal" : `\`${data.parser}\` parser`} on path '${node.path.join(", ")}'`;
        }));
      }
    }
  }

  return undefined;
}

exports.hoverProvider = hoverProvider;

function definitionProvider(docLine, pos) {
  if (docLine) {
    const actions = getActionsOfKind(docLine, pos, "source");
    const start = {
      line: 0,
      character: 0
    };
    return actions.map(a => ({
      range: {
        start,
        end: start
      },
      uri: vscode_uri_1.default.file(a.data).toString()
    }));
  }

  return [];
}

exports.definitionProvider = definitionProvider;

function signatureHelpProvider(line, pos, _, manager) {
  if (line.parseInfo === undefined || line.text.startsWith(consts_1.COMMENT_START)) {
    return undefined;
  }

  const nodes = line.parseInfo ? line.parseInfo.nodes : [];

  if (nodes.length === 0) {
    const sigs = getSignatureHelp([], manager);

    if (sigs) {
      const activeSignature = line.text.length > 0 ? Math.max(sigs.findIndex(v => v.label.startsWith(line.text)), 0) : 0;
      return {
        activeParameter: 0,
        activeSignature,
        signatures: sigs
      };
    } else {
      return undefined;
    }
  }

  let text = "";
  const {
    finals,
    internals
  } = completions_1.getAllNodes(nodes, pos.character);
  const signatures = [];

  for (const finalNode of finals) {
    const result = getSignatureHelp(finalNode.path, manager);

    if (result) {
      signatures.push(...result);
    }

    const currentText = line.text.slice(finalNode.high + 1);

    if (currentText.length > text.length) {
      text = currentText;
    }
  }

  for (const internalNode of internals) {
    const pth = internalNode.path.slice();

    if (pth.length > 0) {
      pth.splice(pth.length - 1);
      const result = getSignatureHelp(pth, manager);

      if (result) {
        signatures.push(...result);
      }

      const currentText = line.text.slice(internalNode.low, internalNode.high);

      if (currentText.length > text.length) {
        text = currentText;
      }
    }
  }

  if (signatures.length > 0) {
    const activeSignature = text.length > 0 ? Math.max(signatures.findIndex(v => v.label.startsWith(text)), 0) : 0;
    return {
      signatures,
      activeParameter: 0,
      activeSignature
    };
  }

  return undefined;
}

exports.signatureHelpProvider = signatureHelpProvider;

function buildSignatureHelpForChildren(node, path, commands, depth) {
  if (node.children) {
    const result = [];

    for (const childName of Object.keys(node.children)) {
      const child = node.children[childName];
      const childPath = [...path, childName];
      const childNode = misc_functions_1.getNextNode(child, childPath, commands);
      const parameterInfo = buildParameterInfoForNode(childNode.node.type === "root" // Handle automatic root redirect
      ? child : childNode.node, childName);

      if (depth > 0) {
        const next = buildSignatureHelpForChildren(childNode.node, childNode.path, commands, node.executable ? depth - 1 : 0);

        if (next.length > 0) {
          if (parameterInfo) {
            result.push([parameterInfo, ...next.map(v => node.executable ? `[${v}]` : v)].join(" "));
          } else {
            result.push(next.map(v => node.executable ? `[${v}]` : v).join(" "));
          }

          continue;
        }
      }

      if (parameterInfo) {
        result.push(parameterInfo);
      }
    }

    if (depth === 0) {
      return [result.join("|")];
    }

    return result;
  }

  return [];
}

function buildParameterInfoForNode(node, name) {
  return node.type === "literal" ? name : node.type === "argument" ? `<${name}: ${node.parser}>` : undefined;
} // Arbritrary number used to calculate the max length of the line


const SIZE = 50;

function getSignatureHelp(path, manager) {
  const commands = manager.globalData.commands;
  const next = misc_functions_1.getNextNode(misc_functions_1.followPath(commands, path), path, commands);
  const options = buildSignatureHelpForChildren(next.node, next.path, commands, 2);
  const result = [];

  for (const option of options) {
    result.push(buildSignature(option, path));
  }

  return result;
}

function buildSignature(option, path) {
  if (option.length > SIZE) {
    let index = option.lastIndexOf("|", SIZE);

    if (index === -1) {
      index = SIZE;
    }

    return {
      documentation: `${option.slice(index).replace("|", "\t(pipe) ").replace(/\|/g, "\n\t| ").replace("(pipe)", "|")}\n\nCommand at path ${path.join()}`,
      label: `${option.slice(0, SIZE)}...`
    };
  } else {
    return {
      documentation: `Command at path '${path.join()}'`,
      label: option
    };
  }
}

function getActionsOfKind(line, position, kind) {
  if (line.parseInfo) {
    if (!line.actions) {
      line.actions = new node_interval_tree_1.IntervalTree();

      for (const action of line.parseInfo.actions) {
        line.actions.insert(action);
      }
    }

    const tree = line.actions;
    return tree.search(position.character, position.character).filter(v => v.type === kind);
  }

  return [];
}

function getNodeTree(line) {
  if (line.nodes) {
    return line.nodes;
  }

  if (line.parseInfo) {
    const tree = new node_interval_tree_1.IntervalTree();

    for (const node of line.parseInfo.nodes) {
      tree.insert(node);
    }

    return tree;
  }

  return undefined;
}

function getWorkspaceSymbols(manager, query) {
  const result = [];
  const worlds = manager.packData;
  const namespace = misc_functions_1.convertToNamespace(query);

  for (const worldPath of Object.keys(worlds)) {
    const world = worlds[worldPath];

    for (const packID in world.packs) {
      if (world.packs.hasOwnProperty(packID)) {
        const pack = world.packs[packID];

        for (const type of typed_keys_1.typed_keys(pack.data)) {
          const val = pack.data[type];

          if (val) {
            for (const item of val) {
              if (misc_functions_1.namespaceStart(item, namespace)) {
                result.push({
                  kind: symbolKindForResource(type),
                  location: {
                    range: blanks_1.blankRange,
                    uri: vscode_uri_1.default.file(misc_functions_1.buildPath(item, world, type)).toString()
                  },
                  name: misc_functions_1.stringifyNamespace(item)
                });
              }
            }
          }
        }
      }
    }
  }

  return result;
}

exports.getWorkspaceSymbols = getWorkspaceSymbols;

function symbolKindForResource(resource) {
  switch (resource) {
    case "block_tags":
    case "function_tags":
    case "item_tags":
      return vscode_languageserver_1.SymbolKind.Namespace;

    case "advancements":
    case "functions":
    case "loot_tables":
    case "recipes":
    case "structures":
      break;

    default:
  }

  return vscode_languageserver_1.SymbolKind.Variable;
}

exports.symbolKindForResource = symbolKindForResource;
},{"./completions":"aDYY","./consts":"xb+0","./misc-functions":"KBGm","./misc-functions/third_party/typed-keys":"kca+","./test/blanks":"7iV1"}],"hLCE":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const misc_functions_1 = require("../../misc-functions");

const typed_keys_1 = require("../../misc-functions/third_party/typed-keys");

const path_1 = require("path");

async function runMapFunctions(resources, globalData, packRoot, localData) {
  const result = {};
  const helper = new misc_functions_1.ReturnHelper();
  const promises = [];

  for (const type of typed_keys_1.typed_keys(resources)) {
    const val = result[type] = [];
    const data = resources[type]; // tslint:disable-next-line:no-unbound-method We control this function, so we know it won't use the this keyword.

    const mapFunction = misc_functions_1.resourceTypes[type].mapFunction;

    if (mapFunction) {
      promises.push(...data.map(async v => {
        const res = await mapFunction(v, packRoot, globalData, localData);
        helper.merge(res);
        val.push(res.data);
      }));
    } else {
      val.push(...data);
    }
  }

  await Promise.all(promises);
  return helper.succeed(result);
}

exports.runMapFunctions = runMapFunctions;

async function mapPacksInfo(packsInfo, global) {
  const helper = new misc_functions_1.ReturnHelper();
  const result = Object.assign({}, packsInfo, {
    packs: {}
  });
  const promises = typed_keys_1.typed_keys(packsInfo.packs).map(async packID => {
    const element = packsInfo.packs[packID];
    const subresult = await runMapFunctions(element.data, global, path_1.join(packsInfo.location, element.name), packsInfo);
    helper.merge(subresult);
    result.packs[packID] = Object.assign({}, element, {
      data: subresult.data
    });
  });
  await Promise.all(promises);
  return helper.succeed(result);
}

exports.mapPacksInfo = mapPacksInfo;
},{"../../misc-functions":"KBGm","../../misc-functions/third_party/typed-keys":"kca+"}],"1cH9":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const tslib_1 = require("tslib");

const Long = tslib_1.__importStar(require("long"));

class BufferStream {
  constructor(buffer) {
    this.index = 0;
    this.buf = buffer;
  }

  getByte() {
    const out = this.buf.readInt8(this.index);
    this.index++;
    return out;
  }

  getDouble() {
    const out = this.buf.readDoubleBE(this.index);
    this.index += 8;
    return out;
  }

  getFloat() {
    const out = this.buf.readFloatBE(this.index);
    this.index += 4;
    return out;
  }

  getInt() {
    const out = this.buf.readInt32BE(this.index);
    this.index += 4;
    return out;
  }

  getLong() {
    const arr = this.buf.subarray(this.index, this.index + 8);
    this.index += 8;
    return Long.fromBytesBE([...arr]);
  }

  getShort() {
    const out = this.buf.readInt16BE(this.index);
    this.index += 2;
    return out;
  }

  getUTF8() {
    const len = this.getShort();
    const out = this.buf.toString("utf8", this.index, this.index + len);
    this.index += len;
    return out;
  }

}

exports.BufferStream = BufferStream;
},{}],"xmc2":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const tslib_1 = require("tslib");

const util_1 = require("util");

const zlib = tslib_1.__importStar(require("zlib"));

const buffer_stream_1 = require("./buffer-stream");

const unzipAsync = util_1.promisify(zlib.unzip);
let tags;

const nbtbyte = buffer => buffer.getByte();

const nbtshort = buffer => buffer.getShort();

const nbtint = buffer => buffer.getInt();

const nbtlong = buffer => buffer.getLong();

const nbtfloat = buffer => buffer.getFloat();

const nbtdouble = buffer => buffer.getDouble();

const nbtbytearray = buffer => {
  const len = buffer.getInt();
  const out = [];

  for (let i = 0; i < len; i++) {
    out.push(buffer.getByte());
  }

  return out;
};

const nbtstring = buffer => buffer.getUTF8();

const nbtlist = buffer => {
  const id = buffer.getByte();
  const len = buffer.getInt();
  const parser = tags[id];
  const out = [];

  for (let i = 0; i < len; i++) {
    out.push(parser(buffer));
  }

  return out;
};

const nbtcompound = buffer => {
  let tag = buffer.getByte();
  const out = {};

  while (tag !== 0) {
    const name = buffer.getUTF8();
    const parser = tags[tag];
    out[name] = parser(buffer);
    tag = buffer.getByte();
  }

  return out;
};

const nbtintarray = buffer => {
  const len = buffer.getInt();
  const out = [];

  for (let i = 0; i < len; i++) {
    out.push(buffer.getInt());
  }

  return out;
};

const nbtlongarray = buffer => {
  const len = buffer.getInt();
  const out = [];

  for (let i = 0; i < len; i++) {
    out.push(buffer.getLong());
  }

  return out;
};

tags = {
  // Need to redeclare because of TSLint
  1: nbtbyte,
  2: nbtshort,
  3: nbtint,
  4: nbtlong,
  5: nbtfloat,
  6: nbtdouble,
  7: nbtbytearray,
  8: nbtstring,
  9: nbtlist,
  10: nbtcompound,
  11: nbtintarray,
  12: nbtlongarray
};

async function parse(buffer, named = true) {
  let unzipbuf;

  try {
    unzipbuf = await unzipAsync(buffer);
  } catch (e) {
    unzipbuf = buffer;
  }

  const stream = new buffer_stream_1.BufferStream(unzipbuf);
  const id = stream.getByte();

  if (named) {
    stream.getUTF8(); // Name
  }

  const parser = tags[id];
  return parser(stream);
}

exports.parse = parse;
},{"./buffer-stream":"1cH9"}],"6rms":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const tslib_1 = require("tslib");

const path = tslib_1.__importStar(require("path"));

const misc_functions_1 = require("../../misc-functions");

const parser_1 = require("./parser");

async function loadNBT(worldLoc) {
  const nbt = {};
  const levelpath = path.resolve(worldLoc, "./level.dat");

  try {
    const levelbuf = await misc_functions_1.readFileAsync(levelpath);
    nbt.level = await parser_1.parse(levelbuf);
  } catch (e) {// Level doesn't exist
  }

  const scpath = path.resolve(worldLoc, "./data/scoreboard.dat");

  try {
    const scoreboardbuf = await misc_functions_1.readFileAsync(scpath);
    nbt.scoreboard = await parser_1.parse(scoreboardbuf);
  } catch (e) {// Scoreboard file doesn't exist
  }

  return nbt;
}

exports.loadNBT = loadNBT;
},{"../../misc-functions":"KBGm","./parser":"xmc2"}],"SO8f":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const tslib_1 = require("tslib");

const path = tslib_1.__importStar(require("path"));

const consts_1 = require("../consts");

const misc_functions_1 = require("../misc-functions");

const file_errors_1 = require("../misc-functions/file-errors");

const promisified_fs_1 = require("../misc-functions/promisified-fs");

const typed_keys_1 = require("../misc-functions/third_party/typed-keys");

const mapfunctions_1 = require("./extractor/mapfunctions");

const nbt_cache_1 = require("./nbt/nbt-cache");

async function getNamespaceResources(namespace, dataFolder, id, result = {}) {
  const helper = new misc_functions_1.ReturnHelper();
  const namespaceFolder = path.join(dataFolder, namespace);
  const subDirs = await subDirectories(namespaceFolder);
  await Promise.all(typed_keys_1.typed_keys(misc_functions_1.resourceTypes).map(async type => {
    const resourceInfo = misc_functions_1.resourceTypes[type];

    if (subDirs.indexOf(resourceInfo.path[0]) === -1) {
      return;
    }

    const dataContents = path.join(namespaceFolder, ...resourceInfo.path);
    const files = await promisified_fs_1.walkDir(dataContents);

    if (files.length === 0) {
      return;
    }

    const nameSpaceContents = result[type] || [];
    await Promise.all(files.map(async file => {
      const realExtension = path.extname(file);

      if (realExtension !== resourceInfo.extension) {
        helper.addMisc(file_errors_1.createExtensionFileError(file, resourceInfo.extension, realExtension));
      }

      const internalUri = path.relative(dataContents, file);
      const newResource = {
        namespace,
        pack: id,
        path: internalUri.slice(0, -realExtension.length).replace(consts_1.SLASHREPLACEREGEX, consts_1.SLASH)
      };
      nameSpaceContents.push(newResource);
    }));
    result[type] = nameSpaceContents;
  }));
  return helper.succeed(result);
}

exports.getNamespaceResources = getNamespaceResources;

async function buildDataPack(packFolder, id, packName) {
  const helper = new misc_functions_1.ReturnHelper();
  const dataFolder = path.join(packFolder, consts_1.DATAFOLDER);
  const [mcmeta, packResources] = await Promise.all([promisified_fs_1.readJSON(path.join(packFolder, consts_1.MCMETAFILE)), getPackResources(dataFolder, id)]);
  const result = {
    id,
    data: packResources.data,
    name: packName
  };
  helper.merge(packResources);

  if (helper.merge(mcmeta)) {
    result.mcmeta = mcmeta.data;
  }

  return helper.succeed(result);
}

async function getPackResources(dataFolder, id) {
  const helper = new misc_functions_1.ReturnHelper();
  const namespaces = await subDirectories(dataFolder);
  const result = {};
  await Promise.all(namespaces.map(async namespace => {
    const resources = await getNamespaceResources(namespace, dataFolder, id, result);
    helper.merge(resources);
    return resources.data;
  }));
  return helper.succeed(result);
}

async function getPacksInfo(location, globalData) {
  const packNames = await subDirectories(location);
  const helper = new misc_functions_1.ReturnHelper();
  const packs = [...packNames.entries()];
  const nbt = await nbt_cache_1.loadNBT(path.resolve(location, "../"));
  const result = {
    location,
    packnamesmap: {},
    packs: {},
    nbt
  };
  const promises = packs.map(async ([packID, packName]) => {
    const loc = path.join(location, packName);
    const packData = await buildDataPack(loc, packID, packName);
    helper.merge(packData);
    result.packs[packID] = packData.data;
    result.packnamesmap[packName] = packID;
  });
  await Promise.all(promises);
  const otherResult = await mapfunctions_1.mapPacksInfo(result, globalData);
  return helper.mergeChain(otherResult).succeed(otherResult.data);
}

exports.getPacksInfo = getPacksInfo;

async function subDirectories(baseFolder) {
  let files = [];

  try {
    files = await promisified_fs_1.readDirAsync(baseFolder);
  } catch (_a) {
    return [];
  }

  const promises = files.map(async name => {
    try {
      return (await promisified_fs_1.statAsync(path.join(baseFolder, name))).isDirectory();
    } catch (_a) {
      return false;
    }
  });
  const results = await Promise.all(promises);
  return files.filter((_, i) => results[i]);
}
},{"../consts":"xb+0","../misc-functions":"KBGm","../misc-functions/file-errors":"cNAA","../misc-functions/promisified-fs":"tSk9","../misc-functions/third_party/typed-keys":"kca+","./extractor/mapfunctions":"hLCE","./nbt/nbt-cache":"6rms"}],"yWts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const tslib_1 = require("tslib");

const fs = tslib_1.__importStar(require("fs"));

const path = tslib_1.__importStar(require("path"));

const util_promisify_1 = require("util.promisify");

util_promisify_1.shim();

const util_1 = require("util");

const consts_1 = require("../../consts");

const misc_functions_1 = require("../../misc-functions");

const datapack_resources_1 = require("../datapack-resources");

const mapfunctions_1 = require("./mapfunctions");

const readFileAsync = util_1.promisify(fs.readFile);

async function collectData(version, dataDir) {
  const helper = new misc_functions_1.ReturnHelper();
  const result = {
    meta_info: {
      version
    }
  };
  const cleanups = await Promise.all([getBlocks(dataDir), getItems(dataDir), getCommands(dataDir), getResources(dataDir)]);

  for (const dataType of cleanups) {
    result[dataType[0]] = dataType[1];
  }

  const resources = await mapfunctions_1.runMapFunctions(result.resources, result, dataDir);
  return helper.mergeChain(resources).succeed(Object.assign({}, result, {
    resources: resources.data
  }));
}

exports.collectData = collectData; //#region Resources

async function getResources(dataDir) {
  const namespacePath = path.join(dataDir, consts_1.DATAFOLDER);
  const resources = await datapack_resources_1.getNamespaceResources("minecraft", namespacePath, undefined);
  return ["resources", resources.data];
} //#endregion
//#region Items


async function getItems(dataDir) {
  const itemsData = JSON.parse((await readFileAsync(path.join(dataDir, "reports", "items.json"))).toString());
  return ["items", Object.keys(itemsData)];
}

async function getCommands(dataDir) {
  const tree = JSON.parse((await readFileAsync(path.join(dataDir, "reports", "commands.json"))).toString());
  return ["commands", tree];
} //#endregion
//#region Blocks


async function getBlocks(dataDir) {
  const blocksData = JSON.parse((await readFileAsync(path.join(dataDir, "reports", "blocks.json"))).toString());
  return ["blocks", cleanBlocks(blocksData)];
}

function cleanBlocks(blocks) {
  const result = {};

  for (const blockName in blocks) {
    if (blocks.hasOwnProperty(blockName)) {
      const blockInfo = blocks[blockName];
      result[blockName] = {};

      if (!!blockInfo.properties) {
        Object.assign(result[blockName], blockInfo.properties);
      }
    }
  }

  return result;
} //#endregion
},{"../../consts":"xb+0","../../misc-functions":"KBGm","../datapack-resources":"SO8f","./mapfunctions":"hLCE"}],"S/g2":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const tslib_1 = require("tslib"); // tslint:disable:no-require-imports


const fs = tslib_1.__importStar(require("fs"));

const path = tslib_1.__importStar(require("path")); // @ts-ignore `import *` syntax is broken in this case as requestPromise would be a function


const request_promise_native_1 = tslib_1.__importDefault(require("request-promise-native"));

async function getPathToJar(tempdir, currentversion) {
  if (!!mcLangSettings.data.customJar) {
    return {
      jarPath: mcLangSettings.data.customJar,
      version: ""
    };
  } else {
    return downloadJar(currentversion, tempdir);
  }
}

exports.getPathToJar = getPathToJar;

async function downloadJar(currentversion, tmpDirName) {
  const versionInfo = await getLatestVersionInfo();

  if (versionInfo.id !== currentversion) {
    const singleVersion = await request_promise_native_1.default(versionInfo.url, {
      json: true
    }).promise();
    const jarPath = path.join(tmpDirName, `minecraft-function-${versionInfo.id}.jar`);
    const requestPromised = request_promise_native_1.default(singleVersion.downloads.server.url);
    requestPromised.pipe(fs.createWriteStream(jarPath));
    await Promise.resolve(requestPromised);
    return {
      jarPath,
      version: versionInfo.id
    };
  } else {
    throw new Error("Downloading new global data not needed as current version is the same as the latest version.");
  }
}

exports.downloadJar = downloadJar;

async function getLatestVersionInfo() {
  const manifest = await request_promise_native_1.default("https://launchermeta.mojang.com/mc/game/version_manifest.json", {
    json: true
  }).promise();
  const version = findVersion(getVersionId(manifest), manifest);
  return version;
}

function getVersionId(manifest) {
  if (mcLangSettings.data.snapshots) {
    return manifest.latest.snapshot;
  } else {
    return manifest.latest.release;
  }
}

function findVersion(version, manifest) {
  return manifest.versions.find(verInfo => verInfo.id === version);
} //#endregion
},{}],"w208":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const tslib_1 = require("tslib");

const child_process_1 = require("child_process");

const path = tslib_1.__importStar(require("path"));

const util_promisify_1 = require("util.promisify");

util_promisify_1.shim();

const util_1 = require("util");

const execFileAsync = util_1.promisify(child_process_1.execFile);
/**
 * Get the command used to execute a java version
 */

async function checkJavaPath() {
  const javaPath = mcLangSettings.data.javaPath || "java";

  try {
    await execFileAsync(javaPath, ["-version"], {
      env: process.env
    });
    return javaPath;
  } catch (error) {
    throw new Error(`Could not find Java executable. Got message: '${error}'`);
  }
}

exports.checkJavaPath = checkJavaPath;

async function runGenerator(javapath, tempdir, jarpath) {
  const resultFolder = path.join(tempdir, "generated");
  await execFileAsync(javapath, ["-cp", jarpath, "net.minecraft.data.Main", "--output", resultFolder, "--all"]);
  return resultFolder;
}

exports.runGenerator = runGenerator;
},{}],"Th+u":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const tslib_1 = require("tslib");

const fs = tslib_1.__importStar(require("fs"));

const os_1 = require("os");

const path = tslib_1.__importStar(require("path"));

const util_promisify_1 = require("util.promisify");

util_promisify_1.shim();

const util_1 = require("util");

const misc_functions_1 = require("../../misc-functions");

const cache_1 = require("../cache");

const collect_data_1 = require("./collect-data");

const download_1 = require("./download");

const extract_data_1 = require("./extract-data");

const mkdtmpAsync = util_1.promisify(fs.mkdtemp);
/**
 * Will throw an error if something goes wrong.
 * Steps:
 * - Check if enabled in settings. ✓
 * - Check versions manifest. Compare with cached if available ✓
 *  - At the same time, check if java is installed ✓
 * - Get single version information ✓
 * - Download the jar into a temporary folder ✓
 * - Run the exposed data generator. ✓
 * - Collect the data exposed
 *  - Blocks and states
 *  - Items
 *  - (Entities)?
 *  - Commands
 *  - Advancements, recipes, structures, tags, etc
 * - Cache that data
 * - Return the data
 */

async function collectGlobalData(currentversion = "") {
  if (mcLangSettings.data.enabled) {
    const javaPath = await extract_data_1.checkJavaPath();
    const dir = await mkdtmpAsync(path.join(os_1.tmpdir(), "mcfunction"));
    const jarInfo = await download_1.getPathToJar(dir, currentversion);
    const datadir = await extract_data_1.runGenerator(javaPath, dir, jarInfo.jarPath);
    mcLangLog("Generator Finished");
    const helper = new misc_functions_1.ReturnHelper();
    const data = await collect_data_1.collectData(jarInfo.version, datadir);
    await cache_1.cacheData(data.data);
    return helper.mergeChain(data).succeed(data.data);
  } else {
    throw new Error("Data Obtainer disabled in settings. To obtain data automatically, please enable it.");
  }
}

exports.collectGlobalData = collectGlobalData;
},{"../../misc-functions":"KBGm","../cache":"tgUj","./collect-data":"yWts","./download":"S/g2","./extract-data":"w208"}],"vz+j":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const synchronous_promise_1 = require("synchronous-promise");

const vscode_json_languageservice_1 = require("vscode-json-languageservice");

async function loadNonCached() {
  // tslint:disable-next-line:no-require-imports prettier breaks require.resolve so we need to use
  const textComponentSchema = require("minecraft-json-schemas/java/shared/text_component");

  const schemas = {};

  const schemaRequestService = url => schemas.hasOwnProperty(url) ? synchronous_promise_1.SynchronousPromise.resolve(schemas[url]) : synchronous_promise_1.SynchronousPromise.reject(`Schema at url ${url} not supported`);

  const jsonService = vscode_json_languageservice_1.getLanguageService({
    promiseConstructor: synchronous_promise_1.SynchronousPromise,
    schemaRequestService
  });
  return {
    jsonService,
    textComponentSchema
  };
}

exports.loadNonCached = loadNonCached;
},{}],"oucB":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const vscode_languageserver_1 = require("vscode-languageserver");

const path_1 = require("path");

const consts_1 = require("../consts");

const misc_functions_1 = require("../misc-functions");

const file_errors_1 = require("../misc-functions/file-errors");

const promisified_fs_1 = require("../misc-functions/promisified-fs");

const cache_1 = require("./cache");

const datapack_resources_1 = require("./datapack-resources");

const extractor_1 = require("./extractor");

const noncached_1 = require("./noncached");

class DataManager {
  constructor() {
    //#region Data Management
    this.globalDataInternal = {};
    this.packDataComplete = {};
    this.packDataPromises = {};
  }
  /**
   * Create a datamanager using Dummy Data for running tests.
   */


  static newWithData(dummyGlobal, dummyPacks) {
    const manager = new DataManager();
    manager.globalDataInternal = dummyGlobal || manager.globalDataInternal;
    Object.assign(manager.packDataComplete, dummyPacks);
    return manager;
  }

  get globalData() {
    return this.globalDataInternal;
  }

  get packData() {
    return this.packDataComplete;
  } //#endregion
  //#region Constructor
  //#endregion


  getPackFolderData(folder) {
    if (!!folder && this.packDataComplete.hasOwnProperty(folder.packsFolder)) {
      const info = this.packDataComplete[folder.packsFolder];
      return Object.assign({}, info, {
        current: info.packnamesmap[folder.pack]
      });
    }

    return undefined;
  }

  async handleChanges(event) {
    const helper = new misc_functions_1.ReturnHelper(false);
    const firsts = new Set();
    const promises = event.changes.map(async change => {
      try {
        const parsedPath = misc_functions_1.parseDataPath(change.uri);

        if (parsedPath) {
          const getData = async () => {
            const first = await this.readPackFolderData(parsedPath.packsFolder);

            if (first) {
              firsts.add(parsedPath.packsFolder);
            }

            const data = this.getPackFolderData(parsedPath);

            if (!data) {
              throw new Error("Could not load data from datapacks folder");
            }

            const packID = data.packnamesmap[parsedPath.pack];
            const pack = data.packs[packID];
            return {
              data,
              pack,
              packID
            };
          };

          if (parsedPath.rest === consts_1.MCMETAFILE) {
            const {
              pack
            } = await getData();

            if (!firsts.has(parsedPath.packsFolder)) {
              const res = await promisified_fs_1.readJSON(change.uri);
              pack.mcmeta = helper.merge(res) ? res.data : undefined;
            }
          } else {
            const namespace = misc_functions_1.getKindAndNamespace(parsedPath.rest);

            if (namespace) {
              const {
                pack,
                packID,
                data
              } = await getData();

              if (!firsts.has(parsedPath.packsFolder)) {
                const shouldUpdateContents = change.type === vscode_languageserver_1.FileChangeType.Changed && misc_functions_1.resourceTypes[namespace.kind].mapFunction;
                let contents = pack.data[namespace.kind];

                if ((change.type === vscode_languageserver_1.FileChangeType.Deleted || shouldUpdateContents) && !!contents) {
                  for (let i = 0; i < contents.length; i++) {
                    const element = contents[i];

                    if (misc_functions_1.namespacesEqual(element, namespace.location)) {
                      contents.splice(i, 1);
                      break;
                    }
                  }
                }

                if (change.type === vscode_languageserver_1.FileChangeType.Created || shouldUpdateContents) {
                  if (!contents) {
                    contents = pack.data[namespace.kind] = [];
                  }

                  const newResource = Object.assign({}, namespace.location, {
                    pack: packID
                  });
                  const actual = path_1.extname(change.uri);
                  const expected = misc_functions_1.resourceTypes[namespace.kind].extension;

                  if (actual === expected) {
                    const mapFunction = // tslint:disable-next-line:no-unbound-method We control this function, so we know it won't use the this keyword.
                    misc_functions_1.resourceTypes[namespace.kind].mapFunction;

                    if (mapFunction) {
                      const result = await mapFunction(newResource, path_1.join(parsedPath.packsFolder, parsedPath.pack), this.globalData, data);

                      if (helper.merge(result)) {
                        contents.push(result.data);
                      }
                    } else {
                      contents.push(newResource);
                    }
                  } else {
                    helper.addMisc(file_errors_1.createExtensionFileError(change.uri, expected, actual));
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        mcLangLog(`Change ${JSON.stringify(change)} could not be completed, due to '${JSON.stringify(error)}'`);
      }
    });
    await Promise.all(promises);
    return helper.succeed();
  }

  async loadGlobalData() {
    let version;

    if (!!this.globalData.meta_info) {
      version = this.globalData.meta_info.version;
    }

    try {
      const helper = new misc_functions_1.ReturnHelper();
      const data = await extractor_1.collectGlobalData(version);
      helper.merge(data);
      this.globalDataInternal = data.data;
      return true;
    } catch (error) {
      return `Error loading global data: ${error.stack || error.toString()}`;
    }
  }

  async readCache() {
    try {
      const cache = await cache_1.readCache();
      const noncache = await noncached_1.loadNonCached();
      this.globalDataInternal = Object.assign({}, cache, noncache);
      mcLangLog("Cache Successfully read");
      return true;
    } catch (error) {
      mcLangLog(`Reading cache failed with error ${JSON.stringify(error)}`);
      return false;
    }
  }
  /**
   * @returns Whether this is the first request for this folder
   */


  async readPackFolderData(folder) {
    const helper = new misc_functions_1.ReturnHelper();

    if (!this.packDataPromises.hasOwnProperty(folder)) {
      this.packDataPromises[folder] = datapack_resources_1.getPacksInfo(folder, this.globalData);
      const result = await this.packDataPromises[folder];
      this.packDataComplete[folder] = result.data;
      helper.merge(result);
      return helper.succeed();
    } else {
      await this.packDataPromises[folder];
      return helper.fail();
    }
  }

}

exports.DataManager = DataManager;
},{"../consts":"xb+0","../misc-functions":"KBGm","../misc-functions/file-errors":"cNAA","../misc-functions/promisified-fs":"tSk9","./cache":"tgUj","./datapack-resources":"SO8f","./extractor":"Th+u","./noncached":"vz+j"}],"6zjI":[function(require,module,exports) {
"use strict";
/**
 * merge_deep function adapted from:
 *
 * https://stackoverflow.com/a/34749873/8728461
 *
 * Originally, non-typescript code by: https://github.com/salakar
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Simple object check.
 */

function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}

exports.isObject = isObject;
/**
 * Deep merge two objects.
 */

function mergeDeep(target, ...sources) {
  if (!sources.length) {
    return target;
  }

  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, {
            [key]: {}
          });
        }

        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, {
          [key]: source[key]
        });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

exports.mergeDeep = mergeDeep;
},{}],"X+eG":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const main_1 = require("vscode-languageserver/lib/main");

const errors_1 = require("./brigadier/errors");

const string_reader_1 = require("./brigadier/string-reader");

const consts_1 = require("./consts");

const misc_functions_1 = require("./misc-functions");

const get_parser_1 = require("./parsers/get-parser");

const parseExceptions = {
  Ambiguity: new errors_1.CommandErrorBuilder("parsing.command.ambiguous", "Command text is possibly ambiguous", main_1.DiagnosticSeverity.Information),
  NoSuccesses: new errors_1.CommandErrorBuilder("command.parsing.matchless", "No nodes which matched '%s' found"),
  NotRunnable: new errors_1.CommandErrorBuilder("parsing.command.executable", "The command '%s' cannot be run.", main_1.DiagnosticSeverity.Warning)
};

function parseCommand(text, globalData, localData) {
  if (text.length === 0 || text.startsWith(consts_1.COMMENT_START)) {
    return undefined;
  }

  const reader = new string_reader_1.StringReader(text);
  const data = {
    globalData,
    localData
  };
  const startingcontext = {};
  const recurse = parsechildren(reader, globalData.commands, [], data, startingcontext);
  const nodes = [];

  if (misc_functions_1.isSuccessful(recurse)) {
    nodes.push(...recurse.data);
  }

  return {
    actions: recurse.actions,
    nodes,
    errors: recurse.errors
  };
}

exports.parseCommand = parseCommand;

function parsechildren(reader, node, path, data, context) {
  const parent = misc_functions_1.getNextNode(node, path, data.globalData.commands);
  const helper = new misc_functions_1.ReturnHelper();
  const children = parent.node.children;

  if (children) {
    const nodes = [];
    const start = reader.cursor;
    let successCount = 0;
    let min = reader.getTotalLength();

    for (const childKey of Object.keys(children)) {
      const child = children[childKey];
      const childpath = [...parent.path, childKey];
      const result = parseAgainstNode(reader, child, childpath, data, context);

      if (helper.merge(result)) {
        const newNode = {
          context,
          final: true,
          high: reader.cursor,
          low: start,
          path: childpath
        };
        const childdata = result.data;

        function checkRead() {
          if (reader.canRead()) {
            return true;
          } else {
            if (!childdata.node.executable) {
              helper.addErrors(parseExceptions.NotRunnable.create(0, reader.cursor, reader.string));
            }

            return false;
          }
        }

        if (checkRead()) {
          if (reader.peek() === consts_1.SPACE) {
            successCount++;
            reader.skip();

            if (checkRead()) {
              const newContext = childdata.newContext ? childdata.newContext : context;
              const recurse = parsechildren(reader, childdata.node, childpath, data, newContext);

              if (helper.merge(recurse)) {
                min = Math.min(min, reader.cursor);
                nodes.push(...recurse.data);
                newNode.final = false;
              }
            }

            nodes.push(newNode);
          }
        } else {
          successCount++;
          nodes.push(newNode);
        }
      }

      reader.cursor = start;
    }

    if (successCount === 0) {
      return helper.fail(parseExceptions.NoSuccesses.create(reader.cursor, reader.getTotalLength(), reader.getRemaining()));
    }

    if (successCount > 1) {
      helper.addErrors(parseExceptions.Ambiguity.create(start, min));
    }

    return helper.succeed(nodes);
  } else {
    if (!parent.node.executable) {
      mcLangLog(`Malformed tree at path ${JSON.stringify(path)}. No children and not executable`);
    }

    return helper.fail();
  }
}

function parseAgainstNode(reader, node, path, data, context) {
  const parser = get_parser_1.getParser(node);
  const helper = new misc_functions_1.ReturnHelper(false);

  if (!!parser) {
    const result = parser.parse(reader, misc_functions_1.createParserInfo(node, data, path, context, false));

    if (!!result) {
      if (helper.merge(result)) {
        const newContext = Object.assign({}, context, result.data);
        return helper.succeed({
          max: reader.cursor,
          newContext,
          node
        });
      } else {
        return helper.fail();
      }
    } else {
      return helper.succeed({
        max: reader.cursor,
        node
      });
    }
  } else {
    return helper.fail();
  }
}

function parseLines(document, data, emitter, documentUri, lines) {
  for (const lineNo of lines) {
    const line = document.lines[lineNo];
    const packsInfo = data.getPackFolderData(document.pack_segments);
    let localData;

    if (packsInfo && document.pack_segments) {
      localData = Object.assign({}, packsInfo, {
        current: packsInfo.packnamesmap[document.pack_segments.pack]
      });
    }

    const result = parseCommand(line.text, data.globalData, localData);
    line.parseInfo = result ? result : false;
    line.actions = undefined;
    line.nodes = undefined;
    emitter.emit(`${documentUri}:${lineNo}`);
  }
}

exports.parseLines = parseLines;

function parseDocument(document, data, emitter, documentUri) {
  const lines = document.lines.map((_, i) => i);
  parseLines(document, data, emitter, documentUri, lines);
}

exports.parseDocument = parseDocument;
},{"./brigadier/errors":"aP4V","./brigadier/string-reader":"iLhI","./consts":"xb+0","./misc-functions":"KBGm","./parsers/get-parser":"0nBp"}],"7QCb":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const tslib_1 = require("tslib");

const events_1 = require("events");

const util_1 = require("util");

const util_promisify_1 = require("util.promisify");

util_promisify_1.shim();

const main_1 = require("vscode-languageserver/lib/main");

const vscode_uri_1 = tslib_1.__importDefault(require("vscode-uri"));

const actions_1 = require("./actions");

const completions_1 = require("./completions");

const cache_1 = require("./data/cache");

const manager_1 = require("./data/manager");

const misc_functions_1 = require("./misc-functions");

const merge_deep_1 = require("./misc-functions/third_party/merge-deep");

const parse_1 = require("./parse");

const blanks_1 = require("./test/blanks");

const connection = main_1.createConnection(new main_1.IPCMessageReader(process), new main_1.IPCMessageWriter(process));
connection.listen(); //#region Data Storage

let manager;
const documents = new Map();
const fileErrors = new Map(); // Avoids race condition between parsing after change and getting completions

const parseCompletionEvents = new events_1.EventEmitter();
let security;
let started = false;
let starting = false; //#endregion
// For Server Startup logic, see: https://github.com/Microsoft/language-server-protocol/issues/246

connection.onInitialize(() => {
  misc_functions_1.setup_logging(connection);
  manager = new manager_1.DataManager();
  return {
    capabilities: {
      completionProvider: {
        resolveProvider: false
      },
      definitionProvider: true,
      hoverProvider: true,
      signatureHelpProvider: {
        triggerCharacters: [" "]
      },
      textDocumentSync: {
        change: main_1.TextDocumentSyncKind.Incremental,
        openClose: true
      },
      workspaceSymbolProvider: true
    }
  };
}); // Handles the starting of the server

connection.onDidChangeConfiguration(async params => {
  let startinglocal = false;

  if (!starting) {
    starting = true;
    startinglocal = true;
    global.mcLangSettings = {};
    security = cache_1.readSecurity();
  }

  await ensureSecure(params.settings);

  const reparseall = () => {
    for (const [uri, doc] of documents.entries()) {
      loadData(uri);
      parse_1.parseDocument(doc, manager, parseCompletionEvents, uri);
      sendDiagnostics(uri);
    }
  };

  if (startinglocal) {
    const cacheread = await manager.readCache();

    if (cacheread) {
      started = true;
      reparseall();
    }

    const getDataResult = await manager.loadGlobalData();

    if (getDataResult === true) {
      started = true;
      reparseall();
    } else if (!cacheread) {
      connection.sendNotification("mcfunction/shutdown", getDataResult);
      return;
    }
  }
});

async function ensureSecure(settings) {
  const secure = await security;
  const newsettings = merge_deep_1.mergeDeep({}, global.mcLangSettings, settings.mcfunction);

  try {
    const issues = misc_functions_1.securityIssues(newsettings, secure);

    if (issues.length > 0) {
      // Failed security checkup challenge
      const safeToContinue = await misc_functions_1.actOnSecurity(issues, connection, secure);

      if (!safeToContinue) {
        connection.sendNotification("mcfunction/shutdown", `Shutting down because of insecure settings: '${issues.join("', '")}'`);
        return;
      }
    }
  } catch (error) {
    connection.sendNotification("mcfunction/shutdown", `Shutting down because of insecure settings: '${error}'`);
    return;
  }

  global.mcLangSettings = newsettings;
}

function loadData(uri) {
  const doc = documents.get(uri);

  if (doc && doc.pack_segments) {
    const segments = doc.pack_segments;
    manager.readPackFolderData(segments.packsFolder).then(first => {
      if (misc_functions_1.isSuccessful(first)) {
        connection.client.register(main_1.DidChangeWatchedFilesNotification.type, {
          watchers: [{
            globPattern: `${segments.packsFolder}/**/*`
          }]
        });
      }

      parse_1.parseDocument(doc, manager, parseCompletionEvents, uri);
      sendDiagnostics(uri);
      handleMiscInfo(first.misc);
    }).catch(e => {
      mcLangLog(`Getting pack folder data failed for reason: '${e}'`);
    });
  }
}

connection.onDidOpenTextDocument(params => {
  const uri = params.textDocument.uri;
  const uriClass = vscode_uri_1.default.parse(uri);

  const parsethis = () => {
    // Sanity check
    if (started && documents.has(uri)) {
      parse_1.parseDocument(documents.get(uri), manager, parseCompletionEvents, uri);
      sendDiagnostics(uri);
    }
  };

  if (uriClass.scheme === "file") {
    const fsPath = uriClass.fsPath;
    const dataPackSegments = misc_functions_1.parseDataPath(fsPath);
    documents.set(uri, {
      lines: misc_functions_1.splitLines(params.textDocument.text),
      pack_segments: dataPackSegments
    });

    if (started) {
      loadData(uri);
    }

    parsethis();
  } else {
    documents.set(uri, {
      lines: misc_functions_1.splitLines(params.textDocument.text),
      pack_segments: undefined
    });
  }

  parsethis();
});
connection.onDidChangeTextDocument(params => {
  const uri = params.textDocument.uri;
  const document = documents.get(uri);
  const changedlines = misc_functions_1.runChanges(params, document);

  if (started) {
    parse_1.parseLines(document, manager, parseCompletionEvents, uri, changedlines);
    sendDiagnostics(uri);
  }
});

function sendDiagnostics(uri) {
  const doc = documents.get(uri);
  const diagnostics = [];

  for (let line = 0; line < doc.lines.length; line++) {
    const lineContent = doc.lines[line];

    if (!!lineContent.parseInfo && !!lineContent.parseInfo.errors) {
      diagnostics.push(...lineContent.parseInfo.errors.map(error => misc_functions_1.commandErrorToDiagnostic(error, line)));
    }
  }

  connection.sendDiagnostics({
    uri,
    diagnostics
  });
}

connection.onDidCloseTextDocument(params => {
  // Clear diagnostics - might not be needed
  connection.sendDiagnostics({
    diagnostics: [],
    uri: params.textDocument.uri
  });
  documents.delete(params.textDocument.uri);
});
connection.onDidChangeWatchedFiles(async e => {
  const result = await manager.handleChanges(e);
  handleMiscInfo(result.misc);
});

function handleMiscInfo(miscInfos) {
  const changedFileErrors = new Set();

  for (const misc of miscInfos) {
    if (misc.kind === "FileError") {
      changedFileErrors.add(misc.filePath);
      const value = fileErrors.get(misc.filePath);

      if (value) {
        fileErrors.set(misc.filePath, Object.assign({}, value, {
          [misc.group]: misc.message
        }));
      } else {
        fileErrors.set(misc.filePath, {
          group: misc.message
        });
      }
    }

    if (misc.kind === "ClearError") {
      changedFileErrors.add(misc.filePath);
      const group = misc.group;

      if (group) {
        const value = fileErrors.get(misc.filePath);

        if (value) {
          const _a = group,
                _ = value[_a],
                rest = tslib_1.__rest(value, [typeof _a === "symbol" ? _a : _a + ""]);

          fileErrors.set(misc.filePath, Object.assign({}, rest));
        }
      } else {
        fileErrors.delete(misc.filePath);
      }
    }
  }

  for (const uri of changedFileErrors) {
    const value = fileErrors.get(uri);

    if (value) {
      const diagnostics = [];

      for (const group of Object.keys(value)) {
        diagnostics.push({
          message: value[group],
          range: blanks_1.blankRange
        });
      }

      connection.sendDiagnostics({
        uri,
        diagnostics
      });
    }
  }
}

connection.onCompletion(params => {
  const doc = documents.get(params.textDocument.uri);
  const line = doc.lines[params.position.line];

  const computeCompletionsLocal = () => completions_1.computeCompletions(params.position.line, params.position.character, doc, manager);

  if (!started) {
    return [];
  }

  if (line.hasOwnProperty("parseInfo")) {
    return computeCompletionsLocal();
  } else {
    return util_1.promisify(cb => parseCompletionEvents.once(`${params.textDocument.uri}:${params.position.line}`, cb))().then(computeCompletionsLocal);
  }
}); // #connection.onCodeAction(); // Research what this means

connection.onDefinition(prepare(actions_1.definitionProvider, [])); // #connection.onDocumentHighlight();
// #connection.onDocumentSymbol(); // This is for sections - there are none in mcfunctions

connection.onWorkspaceSymbol(query => actions_1.getWorkspaceSymbols(manager, query.query));
connection.onHover(prepare(actions_1.hoverProvider, undefined));
connection.onSignatureHelp(prepare(actions_1.signatureHelpProvider));

function prepare(func, fallback) {
  return params => {
    if (started) {
      const doc = documents.get(params.textDocument.uri);

      if (doc) {
        const docLine = doc.lines[params.position.line];
        return func(docLine, params.position, doc, manager);
      }
    }

    return fallback;
  };
}
},{"./actions":"0A+1","./completions":"aDYY","./data/cache":"tgUj","./data/manager":"oucB","./misc-functions":"KBGm","./misc-functions/third_party/merge-deep":"6zjI","./parse":"X+eG","./test/blanks":"7iV1"}]},{},["7QCb"], null)
//# sourceMappingURL=/index.map