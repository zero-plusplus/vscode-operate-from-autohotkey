/**
 * @auther zero-plusplus
 * @licence MIT
 * @see https://github.com/zero-plusplus/vscode-operate-from-autohotkey
 */
/**
 * **Note: To use this function, you need to have [vscode-operate-from-autohotkey](https://github.com/zero-plusplus/vscode-operate-from-autohotkey) installed on your [VSCode](https://code.visualstudio.com/).**
 * **Also, this function uses the clipboard that in order to cooperate with VSCode. Therefore, if you rewrite the clipboard before or after using this, it may not work correctly.**
 *
 * Execute the VSCode command.
 * @param {string} commandName -
 *  A string to indicate vscode's command name. You can check it in VSCode's Keyboard Shortcuts (`Ctrl+K`, `Ctrl+S`).
 *
 *  If you want to execute more than one command, separate them with `,`, such as `"command1, command2"`. Any whitespace before or after will be ignored.
 *  Also, If you want to execute a command multiple times, specify such as `"commandName:N"`, where `N` is an arbitrary integer.
 * @param {number|false} [timeout_ms := 1000] - Timeout (in milliseconds). Specify `false` to disable the timeout. For some commands that prompt for user input, it is recommended to specify `false`.
 * @return {string} - The return value of the command (string only). Otherwise, empty string.
 * @example
 *  ExecuteVsCodeCommand("cursorRight")             ; Move the cursor to the right
 *  ExecuteVsCodeCommand("cursorRight:5")           ; Execute the same command five times
 *  ExecuteVsCodeCommand("cursorRight, cursorDown") ; Execute multiple commands
 */
ExecuteVsCodeCommand(commandName, timeout_ms := 1000) {
  backup := ClipboardAll
  Clipboard := commandName
  SendInput, +^!{F12}

  ; Wait until the return value of the command can be obtained.
  startTime := A_TickCount
  while (true) {
    if (Clipboard != commandName) {
      break
    }

    elapsedTime := A_TickCount - startTime
    if (timeout_ms != false && timeout_ms < elapsedTime) {
      throw Exception("Timeout. '" commandName "' was executed. If you want to disable the timeout, specify false as the second parameter of '" A_ThisFunc "'.")
    }
    Sleep, 1
  }

  result := Clipboard
  Clipboard := backup
  return result
}