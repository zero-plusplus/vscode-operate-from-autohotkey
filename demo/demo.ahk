#SingleInstance, Force

+^!1::ExecuteVsCodeCommand("cursorRight")
+^!2::ExecuteVsCodeCommand("cursorRight:5")
+^!3::ExecuteVsCodeCommand("cursorRight, cursorDown")
+^!4::
DisplayContexts() {
  start := A_TickCount
  message := ""
  message .= "coordinates " ExecuteVsCodeCommand("operate-from-autohotkey.copy.context.caret.coordinates")
  message .= "`nx " ExecuteVsCodeCommand("operate-from-autohotkey.copy.context.caret.coordinates.x")
  message .= "`ny " ExecuteVsCodeCommand("operate-from-autohotkey.copy.context.caret.coordinates.y")
  message .= "`nposition " ExecuteVsCodeCommand("operate-from-autohotkey.copy.context.caret.position")
  message .= "`nline " ExecuteVsCodeCommand("operate-from-autohotkey.copy.context.caret.position.line")
  message .= "`ncolumn " ExecuteVsCodeCommand("operate-from-autohotkey.copy.context.caret.position.column")
  message .= "`nfile " ExecuteVsCodeCommand("operate-from-autohotkey.copy.context.file")
  message .= "`npath " ExecuteVsCodeCommand("operate-from-autohotkey.copy.context.file.path")
  message .= "`nlength " ExecuteVsCodeCommand("operate-from-autohotkey.copy.context.file.length")
  message .= "`neol " ExecuteVsCodeCommand("operate-from-autohotkey.copy.context.file.eol")
  message .= "`nelapsedTime: " A_TickCount - start
  ToolTip %message%
}
+^!5::
DisplayContextJson() {
  start := A_TickCount
  message := ""
  message .= ExecuteVsCodeCommand("operate-from-autohotkey.copy.context.json")
  message .= "`nelapsedTime: " A_TickCount - start
  ToolTip %message%
}
+^!6::
DisplayContextPrettyJson() {
  start := A_TickCount
  message := ""
  message .= ExecuteVsCodeCommand("operate-from-autohotkey.copy.context.json.pretty")
  message .= "`nelapsedTime: " A_TickCount - start
  ToolTip %message%
}
+^!7::
DisplayContextFlattenJson() {
  start := A_TickCount
  message := ""
  message .= ExecuteVsCodeCommand("operate-from-autohotkey.copy.context.flattenJson")
  message .= "`nelapsedTime: " A_TickCount - start
  ToolTip %message%
}
+^!8::
DisplayContextFlattenPrettyJson() {
  start := A_TickCount
  message := ""
  message .= ExecuteVsCodeCommand("operate-from-autohotkey.copy.context.flattenJson.pretty")
  message .= "`nelapsedTime: " A_TickCount - start
  ToolTip %message%
}