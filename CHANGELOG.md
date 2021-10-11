# Before reading
Please read the following first.
* This document has been translated from Japanese to English using DeepL Translate

# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog][Keep a Changelog] and this project adheres to [Semantic Versioning][Semantic Versioning].

## [Unreleased]

---

## [Released]

## [1.1.0] - 2021-xx-xx
### Added
* Add command `operate-from-autohotkey.copy.context.is.debugging`

### Changed
* The [library](https://github.com/zero-plusplus/vscode-operate-from-autohotkey/blob/main/demo/lib/ExecuteVsCodeCommand.ahk2) for v2 is now compatible with v2.0.beta.1

### Fixed
* In the command to retrieve json, the structure of the following property was incorrect. It has been fixed as follows
    * json.caret.position.line -> json.caret.line
    * json.caret.position.column-> json.caret.column

## [1.0.0] - 2021-01-08
First released

---

<!-- Links -->
[Keep a Changelog]: https://keepachangelog.com/
[Semantic Versioning]: https://semver.org/

<!-- Versions -->
[1.1.0]: https://github.com/zero-plusplus/vscode-operate-from-autohotkey/compare/v1.0.0..v1.1.0
[1.0.0]: https://github.com/zero-plusplus/vscode-operate-from-autohotkey/tree/v1.0.0