import ahkEval from './ahkEval';
import { CaretCoordinates } from '../../types/tools/utils/getCaretCoordinates.types';

const ahkCode_v1 = `
  #NoTrayIcon
  #SingleInstance

  ; #region Auto-Exec selection
  stdwrite := FileOpen("*", "w", "utf-8")
  caret := GetCaretCoordinates()
  if (caret) {
    stdwrite.write("{ ""x"": " caret.x ", ""y"": " caret.y " }")
  }
  else {
    stdwrite.write("{}")
  }
  return
  ; #endregion Auto-Exec selection

  ; #region utils
  GetCaretCoordinates() {
    static module, VT_BYREF := 0x4000, VT_I4 := 3, BYREF_INT32 := VT_BYREF + VT_I4, OBJID_CARET := 0xFFFFFFF8

    if (!module) {
      module := DllCall("LoadLibrary", "str", "oleacc", "ptr")
    }

    VarSetCapacity(IID_IAccessible, 16)
    DllCall("ole32\\CLSIDFromString", "wstr", "{618736e0-3c3d-11cf-810c-00aa00389b71}", "ptr", &IID_IAccessible) ; https://learn.microsoft.com/en-us/windows/win32/api/combaseapi/nf-combaseapi-clsidfromstring
    DllCall("oleacc\\AccessibleObjectFromWindow", "ptr", WinActive("A"), "uint", OBJID_CARET, "ptr", &IID_IAccessible, "ptr*", pacc) ; https://learn.microsoft.com/en-us/windows/win32/api/oleacc/nf-oleacc-accessibleobjectfromwindow
    caret := ComObject(9, pacc, 1)

    _x := ComObject(BYREF_INT32, &_x := 0)
    _y := ComObject(BYREF_INT32, &_y := 0)
    _width := ComObject(BYREF_INT32, &_width := 0)
    _height := ComObject(BYREF_INT32, &_height := 0)
    try {
      caret.accLocation(_x, _y, _width, _height, 0)
    }
    catch {
      return
    }

    x := NumGet(_x, 0, "int")
    y := NumGet(_y, 0, "int")
    width := NumGet(_width, 0, "int")
    height := NumGet(_height, 0, "int")
    if (!(x || y || width || height)) {
      return
    }
    return { x: x, y: y, width: width, height: height }
  }
  ; #endregion utils
`;

export const getCaretCoordinates = async(): Promise<CaretCoordinates> => {
  const result = await ahkEval(ahkCode_v1);
  if (result) {
    const caretCoordinates = JSON.parse(result) as CaretCoordinates;
    return caretCoordinates;
  }
  return { x: -1, y: -1 };
};
