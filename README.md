# TOC
* [Overview](#overview)
* [Installation](#installation)
* [Using](#using)
* [Commands](#commands)
* [Known issues](#known-issues)
* [Development support](#development-support)


# Before reading
Please read the following first.
* This document has been translated from Japanese to English using [DeepL Translate](https://www.deepl.com/translator)
* **This extension is for AutoHotkey users who use VSCode**
* **Currently no pull requests are being accepted**
* Bug reports and feature requests are accepted [here](https://github.com/zero-plusplus/vscode-operate-from-autohotkey/issues). I'll respond to you immediately or by the next day, so please feel free to do so. But look at the known issues first.


# News
## Update
* `1.0.1` - 2021-xx-xx
    * Added: Add command `operate-from-autohotkey.copy.context.is.debugging`
    * Changed: The [library](https://github.com/zero-plusplus/vscode-operate-from-autohotkey/blob/main/demo/lib/ExecuteVsCodeCommand.ahk2) for v2 is now compatible with v2.0.beta.1
    * Fixed: In the command to retrieve json, the structure of the following property was incorrect. It has been fixed as follows
        * json.caret.position.line -> json.caret.line
        * json.caret.position.column-> json.caret.column

* `1.0.0` - 2021-01-08
    * First released

# Overview
This extension provides a way to execute VSCode's commands from AutoHotkey and commands to access VSCode's context information (e.g. Caret position, etc.).

The mechanism is simple: just execute the command with the same name as the string stored in the clipboard.
Therefore, it should be possible to use it not only with AutoHotkey, but also with other automation tools (such as AutoIt) that can handle the clipboard and keystrokes.

The biggest advantage of this extension would be the ability to directly execute commands that do not have a shortcut key set. Setting shortcut keys can be very tedious, as they must not conflict with other keys. Moreover, there are a surprisingly large number of commands for which no shortcuts have been set.

It is very convenient but may require a little knowledge to use. If you have any questions, please ask them [here](https://github.com/zero-plusplus/vscode-operate-from-autohotkey/discussions/1). (Github account required).

By default, all commands can be executed, but if you are concerned about security, you may want to set [operate-from-autohotkey.allowCommands](#settings).


# Installation
**This extension works on VSCode 1.46.0 and above.**

1. Install [AutoHotkey](https://www.autohotkey.com/). Since some commands use AutoHotkey scripts (e.g. Acc.ahk) to get information, you will need to install it even if you are using other automation tools
2. Press `Ctrl + P`, type `ext install zero-plusplus.vscode-operate-from-autohotkey`
3. Include [this library](https://github.com/zero-plusplus/vscode-operate-from-autohotkey/blob/main/demo/lib/ExecuteVsCodeCommand.ahk) in your scripts. For v2, [here](https://github.com/zero-plusplus/vscode-operate-from-autohotkey/blob/main/demo/lib/ExecuteVsCodeCommand.ahk2)

## About Acc.ahk
`Acc.ahk` is required when using some commands that retrieve information not provided by VSCode, such as caret coordinates. The original file already has a broken link and you can get a copy of it [here](https://autohotkey.com/board/topic/77303-acc-library-ahk-l-updated-09272012/page-2#post_id_528450).

Then place it in the path set in [operate-from-autohotkey.externalLibrary.acc](#settings).

**Note: AutoHotkeyV1 is required to run Acc.ahk. I have explained this in the [Installation](#installation), but I will explain it again.**


# Using
The library described in the third of the [Installation](#installation) defines the `ExecuteVsCodeCommand` function to execute the command. The usage is the same for both AutoHotkey V1 and V2. However, V2 is written for the latest version, and is likely to not work with older versions. In addition, as explained [here](#known-issues), may encounter problems that do not occur in V1.

It is very easy to use, just pass the command name as shown in the following. To find out the name of the command, look [here](https://code.visualstudio.com/api/references/commands#simple-commands).
```ahk
; Move the cursor to the right
ExecuteVsCodeCommand("cursorRight")
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

The second parameter specifies the amount of time before the timeout (in milliseconds). `0` (or `false`) disables the timeout. Normally, you do not need to specify this parameter, but if you are using a command that requires user input, as in the following example, you should disable it.
```ahk
; git.commit prompts for a commit message. Disable the timeout in this case, since it will time out before you can enter it.
ExecuteVsCodeCommand("git.commit", false)
```

## How ExecuteVsCodeCommand works and how to modify it
Look at the source code for [ExecuteVsCodeCommand](https://github.com/zero-plusplus/vscode-operate-from-autohotkey/blob/main/demo/lib/ExecuteVsCodeCommand.ahk). I have written a detailed description of how it works in the comments.
It is useful to be able to maintain it yourself in case there are any problems.

The following is the answer to the modification example (for V1) in the comments.
```ahk
ExecuteVsCodeCommandEx(commandName, timeout_ms := 1000) {
  if (IsObject(commandName)) {
    return ExecuteVsCodeCommand(StrJoin(commandName, ","), timeout_ms)
  }
  return ExecuteVsCodeCommand(commandName, timeout_ms)
}
StrJoin(array, delimiter) {
  string := ""
  for i, value in array {
    string .= value . delimiter
  }
  return RTrim(string, delimiter)
}
```


# Settings
The following settings will be added in [settings.json](https://code.visualstudio.com/docs/getstarted/settings).

<table>
<tr>
    <td><i><b>Name</b></i></td>
    <td><i><b>Description</b></i></td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.allowCommands</code></td>
    <td>
        Allowed command names. Can be used as a wildcard by adding a trailing <code>*</code>. By default, all commands are allowed.<br /><br />
        Normally, you don't need to set this, but if you are using a script created by someone else, you can improve security by setting it.<br />
        <b>Default:</b> <code>[ "*" ]</code>
    </td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.hideError</code></td>
    <td>
        Whether to notify the user of an error when a command fails to execute.<br>
        <b>Default:</b> <code>false</code>
    </td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.externalLibrary.acc</code></td>
    <td>
        The absolute path of the AutoHotkey external library required by some commands. See details <a href="#about-accahk">here</a>.<br>
        <b>Default:</b> <code>"C:\Program Files\AutoHotkey\lib\Acc.ahk"</code>
    </td>
</tr>
</table>

# Commands
The following commands will be added.

<table>
<tr>
    <td><i><b>Name</b></i></td>
    <td><i><b>Description</b></i></td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.executeCommand</code></td>
    <td>Executes a command with the contents of the clipboard. This is the core command of this extension. Only one shortcut key is provided: <code>Shift+Ctrl+Alt+F12</code></td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.caret</code></td>
    <td>Copy the position (1-base) of the current caret in <code>"lineNumber:columnNumber"</code> format.</td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.caret.line</code></td>
    <td>Copy the line number (1-base) of the current caret.</td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.caret.column</code></td>
    <td>Copy the column number (1-base) of the current caret.</td>
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
    <td><code>operate-from-autohotkey.copy.context.selection</code></td>
    <td>Copy the range (1-base) of the current selection in <code>"startLineNumber:startColumnNumber:endLineNumber:endColumnNumber"</code> format.</td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.selection.start</code></td>
    <td>
        Copy the starting position (1-base) of the current selection in <code>"lineNumber:columnNumber"</code> format.<br /><br />
        Synonymous with <code>operate-from-autohotkey.copy.context.caret</code>
    </td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.selection.start.line</code></td>
    <td>
        Copy the starting line number (1-base) of the current selection.<br /><br />
        Synonymous with <code>operate-from-autohotkey.copy.context.caret.line</code>
    </td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.selection.start.column</code></td>
    <td>
        Copy the starting column number (1-base) of the current selection.<br /><br />
        Synonymous with <code>operate-from-autohotkey.copy.context.caret.column</code>
    </td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.selection.end</code></td>
    <td>Copy the ending position (1-base) of the current selection in <code>"lineNumber:columnNumber"</code> format.</td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.selection.end.line</code></td>
    <td>Copy the ending line number (1-base) of the current selection.</td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.selection.end.column</code></td>
    <td>Copy the ending column number (1-base) of the current selection.</td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.selection.text</code></td>
    <td>Copy the text of the current selection.</td>
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
    <td><code>operate-from-autohotkey.copy.context.is.debugging</code></td>
    <td>Copy the number indicating whether debugging is in progress (<code>1</code>) or not (<code>0</code>).</td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.json</code></td>
    <td>
        Copy context information in JSON format.<br /><br />
        Besides being able to retrieve a lot of information at once, you can also retrieve information on all selections of the multi-caret.
    </td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.json.pretty</code></td>
    <td>
        Copy context information in human-readable JSON format.<br /><br />
        Besides being able to retrieve a lot of information at once, you can also retrieve information on all selections of the multi-caret.
    </td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.flattenJson</code></td>
    <td>
        Copy context information in flatten JSON format.<br /><br />
        Besides being able to retrieve a lot of information at once, you can also retrieve information on all selections of the multi-caret.
    </td>
</tr>
<tr>
    <td><code>operate-from-autohotkey.copy.context.flattenJson.pretty</code></td>
    <td>
        Copy context information in human-readable flatten JSON format.<br /><br />
        Besides being able to retrieve a lot of information at once, you can also retrieve information on all selections of the multi-caret.
    </td>
</tr>
</table>


# Known issues
* V2 only bug. I have confirmed that *Out of memory* occurs in versions `a119`-`a122` when the commands are executed consecutively using hotkeys. However, it does not occur in `a100`, which is closer in specification to v1.


# Development support
Over the next few years, I will be developing a variety of extension to AutoHotkey.

If you like, [Github sponsor](https://github.com/sponsors/zero-plusplus) and support me. **Note that there is no reward**. This is because I believe that the biggest reward is to provide new versions faster by prioritizing development.


# Related My Extensions
* [vscode-autohotkey-debug](https://github.com/zero-plusplus/vscode-autohotkey-debug)
