## Minecraft Function Language Server

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Build Status](https://travis-ci.org/Levertion/mcfunction-langserver.svg?branch=master&style=flat-square)](https://travis-ci.org/Levertion/mcfunction-langserver)
[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg?style=flat-square)](https://renovateapp.com/)

This is a language server which provides support for Minecraft function
(`.mcfunction`) files.

## Contributing

To contribute to the repository, feel free to make a fork on GitHub, and open a
pull request. The recommended editor is Visual Studio Code - The required
settings are set in [the settings file](.vscode/settings.json)  
To install dependencies, run `npm install`.  
To compile, run `npm run compile`.  
To test, either run the launch task Mocha Tests in vscode, or run `npm test`.
Note that the Launch Task automatically compiles first.

## License

Copyright (c) 2018 Levertion

Licensed under the [MIT](LICENSE) License.
