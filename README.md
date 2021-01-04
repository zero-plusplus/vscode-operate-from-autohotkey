# TOC
* [Overview](#Overview)
* [Installation](#Installation)
* [Using](#Using)
* [Commands](#Commands)
* [Development support](#Development-support)


# Before reading
Please read the following first.

* This document has been translated from Japanese to English using [DeepL Translate](https://www.deepl.com/translator)
* **This extension is for AutoHotkey users who use VSCode**
* **Currently no pull requests are being accepted**
* Bug reports and feature requests are accepted [here](https://github.com/zero-plusplus/vscode-operate-from-autohotkey/issues). I'll respond to you immediately or by the next day, so please feel free to do so.

# News
## Update
* `1.0.0` - 2021-01-xx
    * First released

# Overview
This extension provides a way to execute VSCode's commands from AutoHotkey and commands to access VSCode's context information (e.g. Caret position, etc.).

The mechanism is simple: just execute the command with the same name as the string stored in the clipboard.
Therefore, it should be possible to use it not only with AutoHotkey, but also with other automation tools (such as AutoIt) that can handle the clipboard and keystrokes.

The biggest advantage of this extension would be the ability to directly execute commands that do not have a shortcut key set. Setting shortcut keys can be very tedious, as they must not conflict with other keys. Moreover, there are a surprisingly large number of commands for which no shortcuts have been set.

Note that only allowed commands (by default, only those provided by this extension) will be executed.


# Installation
1. Install [AutoHotkey](https://www.autohotkey.com/)
2. Press `Ctrl + P`, type `ext install zero-plusplus.vscode-operate-from-autohotkey`
3. Include [this library](https://github.com/zero-plusplus/vscode-operate-from-autohotkey/demo/lib/ExecuteVsCodeCommand.ahk) in your scripts. For v2, [here](https://github.com/zero-plusplus/vscode-operate-from-autohotkey/demo/lib/ExecuteVsCodeCommand.ahk2)


## About Acc.ahk
Acc.ahk is required when using some commands that retrieve information not provided by VSCode, such as caret coordinates. The original file already has a broken link and you can get a copy of it [here](https://autohotkey.com/board/topic/77303-acc-library-ahk-l-updated-09272012/page-2#post_id_528450).


# Using
The library described in [Installation](#Installation) defines the `ExecuteVsCodeCommand` function. The usage is the same for both AutoHotkey V1 and V2.

It is very easy to use, just pass the command name as shown in the following.
```ahk
ExecuteVsCodeCommand("cursorRight") ; Move the cursor to the right
```

If you want to execute multiple commands, separate them with `,(comma)`. The spaces before and after are optional.

**Note that if you execute a command that affects the clipboard, it will exit without executing any subsequent commands. This is because it uses the changes in the clipboard to detect the end of the command.**
```ahk
; Move the cursor to the right and down
ExecuteVsCodeCommand("cursorRight, cursorDown")
```

If you want to repeat the same command, do the following.
```ahk
; Move the cursor to the right five times
ExecuteVsCodeCommand("cursorRight:5")
```

These can be combined. The use of [continuation sections](https://www.autohotkey.com/docs/Scripts.htm#continuation-section) will make it easier to read.
```ahk
; Move the cursor to the right five times, then move down
ExecuteVsCodeCommand("
(Join,
    cursorRight:5
    cursorDown
)")
```

# Commands
The following commands will be added.

<table>
<tr>
    <td>name</td>
    <td>description</td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.executeCommand</code></td>
    <td>Executes a command with the contents of the clipboard. This is the core command of this extension. Only one shortcut key is provided: <code>Shift+Ctrl+Alt+F12</code></td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.caret.coordinates</code></td>
    <td><b>[Require Acc.ahk]</b> Copy the coordinates of the caret with respect to the screen in <code>"x,y"</code> format.</td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.caret.coordinates.x</code></td>
    <td><b>[Require Acc.ahk]</b> Copy the x-coordinates of the caret with respect to the screen.</td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.caret.coordinates.y</code></td>
    <td><b>[Require Acc.ahk]</b> Copy the y-coordinates of the caret with respect to the screen.</td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.caret.position</code></td>
    <td>Copy the position (1-base) of the current caret in <code>"lineNumber:columnNumber"</code> format.</td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.caret.position.line</code></td>
    <td>Copy the line number (1-base) of the current caret.</td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.caret.position.column</code></td>
    <td>Copy the column number (1-base) of the current caret.</td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.file</code></td>
    <td>Copy the currently opened file in <code>"filePath:lineNumber:columnNumber"</code> format.</td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.file.path</code></td>
    <td>Copy the currently opened file path.</td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.file.length</code></td>
    <td>Copy the currently opened file length.</td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.file.eol</code></td>
    <td>Copy the currently opened End Of Line (EOL) of the file. Value that can be gotten are <code>"`n"</code> or <code>"`r`n"</code>.</td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.json</code></td>
    <td>Copy context information in JSON format.</td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.json.pretty</code></td>
    <td>Copy context information in human-readable JSON format.</td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.flattenJson</code></td>
    <td>Copy context information in flatten JSON format.</td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.flattenJson.pretty</code></td>
    <td>Copy context information in flatten human-readable JSON format.</td>
</tr>
</table>


# Development support
Over the next few years, I will be developing a variety of extension to AutoHotkey.

If you like, [Github sponsor](https://github.com/sponsors/zero-plusplus) and support me. **Note that there is no reward**. This is because I believe that the biggest reward is to provide new versions faster by prioritizing development.


# Related My Extensions
* [vscode-autohotkey-debug](https://github.com/zero-plusplus/vscode-autohotkey-debug)
