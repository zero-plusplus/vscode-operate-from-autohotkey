#Requires AutoHotkey v1.1.33+
/**
 * @auther zero-plusplus
 * @license MIT
 * @see https://github.com/zero-plusplus/vscode-operate-from-autohotkey
 */
/**
 * Get the position and size of the caret (text cursor) within a specified window.
 * @param {string} [hwnd := WinActive("A")] - Target [window handle](https://www.autohotkey.com/docs/v1/misc/WinTitle.htm#ahk_id)
 * @return {{ x: number; y: number, width: number; height: number; } | ""}
 * @example
 *   vscodeCaretRect := GetCaretRect(WinActive("ahk_exe Code.exe"))
 */
GetCaretRect(hwnd := "") {
  ; #region variables and constants
  static initialize := false, module
  ; Variant Type Constants: https://www.autohotkey.com/docs/v1/lib/ComObjType.htm#vt
  static VT_BYREF := 0x4000
       , VT_I4 := 3
       , BYREF_INT32 := VT_BYREF + VT_I4
  ; Winuser.h
  static OBJID_CARET := 0xFFFFFFF8
  ; oleacc.h
  static IID_IAccessible_GUID := "{618736e0-3c3d-11cf-810c-00aa00389b71}"
  ; data type bytes
  static CLSID_BYTE_SIZE := 16
  ; #endregion variables and constants

  ; #region initialize
  if (!initialize) {
    module := DllCall("LoadLibrary", "Str", "oleacc", "Ptr")
    OnExit(Func("GetCaretCoordinates_OnExit").bind(module))

    initialize := true
  }
  ; #endregion initialize

  ; #region main process
  try {
    hwnd := hwnd == "" ? WinActive("A") : hwnd

    VarSetCapacity(IID_IAccessible, CLSID_BYTE_SIZE)
    DllCall("ole32\CLSIDFromString", "WStr", IID_IAccessible_GUID, "Ptr", &IID_IAccessible)                                     ; https://learn.microsoft.com/en-us/windows/win32/api/combaseapi/nf-combaseapi-clsidfromstring
    DllCall("oleacc\AccessibleObjectFromWindow", "Ptr", hwnd, "UInt", OBJID_CARET, "Ptr", &IID_IAccessible, "Ptr*", ppvObject)  ; https://learn.microsoft.com/en-us/windows/win32/api/oleacc/nf-oleacc-accessibleobjectfromwindow

    _x := ComObject(BYREF_INT32, &_x := 0)
    _y := ComObject(BYREF_INT32, &_y := 0)
    _width := ComObject(BYREF_INT32, &_width := 0)
    _height := ComObject(BYREF_INT32, &_height := 0)

    caret := ComObject(9, ppvObject, 1)
    caret.accLocation(_x, _y, _width, _height, 0)

    x := NumGet(_x, 0, "Int")
    y := NumGet(_y, 0, "Int")
    width := NumGet(_width, 0, "Int")
    height := NumGet(_height, 0, "Int")
    if (x == "" || y == "" || width == "" || height == "") {
      return
    }
    return { x: x, y: y, width: width, height: height }
  }
  catch e {
    return
  }
  ; #endregion main process
}
GetCaretCoordinates_OnExit(module) {
  DllCall("FreeLibrary", "Ptr", module)
}
