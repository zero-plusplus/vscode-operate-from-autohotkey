#SingleInstance, Force

+^!0::ExecuteVsCodeCommand("NonexistentCommand")
+^!1::ExecuteVsCodeCommand("cursorRight")
+^!2::ExecuteVsCodeCommand("cursorRight:5")
+^!3::ExecuteVsCodeCommand("cursorRight, cursorDown")
4::
DisplayContexts() {
  ToolTip
  start := A_TickCount
  message := ""
  message .= "coordinates " ExecuteVsCodeCommand("operate-from-autohotkey.copy.context.caret.coordinates")
  message .= "`nx " ExecuteVsCodeCommand("operate-from-autohotkey.copy.context.caret.coordinates.x")
  message .= "`ny " ExecuteVsCodeCommand("operate-from-autohotkey.copy.context.caret.coordinates.y")
  message .= "`nposition " ExecuteVsCodeCommand("operate-from-autohotkey.copy.context.caret")
  message .= "`nline " ExecuteVsCodeCommand("operate-from-autohotkey.copy.context.caret.line")
  message .= "`ncolumn " ExecuteVsCodeCommand("operate-from-autohotkey.copy.context.caret.column")
  message .= "`nselection " ExecuteVsCodeCommand("operate-from-autohotkey.copy.context.selection")
  message .= "`nselection.start " ExecuteVsCodeCommand("operate-from-autohotkey.copy.context.selection.start")
  message .= "`nselection.start.line " ExecuteVsCodeCommand("operate-from-autohotkey.copy.context.selection.start.line")
  message .= "`nselection.start.column " ExecuteVsCodeCommand("operate-from-autohotkey.copy.context.selection.start.column")
  message .= "`nselection.end " ExecuteVsCodeCommand("operate-from-autohotkey.copy.context.selection.end")
  message .= "`nselection.end.line " ExecuteVsCodeCommand("operate-from-autohotkey.copy.context.selection.end.line")
  message .= "`nselection.end.column " ExecuteVsCodeCommand("operate-from-autohotkey.copy.context.selection.end.column")
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