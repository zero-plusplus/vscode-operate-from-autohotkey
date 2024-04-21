ExecuteVsCodeCommand(commandName, config := "") {
  ; #region variables and constants
  static DEFAULT_PORT := 9001, DEFUALT_HOSTNAME := "127.0.0.1", DEFAULT_TIMEOUT_MS := 1000, DEFAULT_RECIEVED_MAX_LENGTH := A_IsUnicode ? 4096 * 2 : 4096, DEFAULT_KEY := "+^!{F12}"
  static NULL := 0, STRING_TYPE := A_IsUnicode ? "WStr" : "AStr"
  static module
       , socket       ; https://learn.microsoft.com/en-us/windows/win32/api/winsock2/nf-winsock2-socket
       , wsaData      ; https://learn.microsoft.com/en-us/windows/win32/api/winsock/ns-winsock-wsadata
       , sockaddrIn   ; https://learn.microsoft.com/en-us/windows/win32/api/ws2def/ns-ws2def-sockaddr_in
       , initialized := false
  ; data types: https://learn.microsoft.com/en-us/windows/win32/winprog/windows-data-types
  static CHAR_BYTE_SIZE := 1
       , UCHAR_BYTE_SIZE := 1
       , WORD_BYTE_SIZE := 2
       , UNSIGNED_SHORT_BYTE_SIZE := 2
       , SHORT_BYTE_SIZE := 2
       , USHORT_BYTE_SIZE := 2
       , ULONG_BYTE_SIZE := 4
       , WSA_DATA_BYTE_SIZE := (CHAR_BYTE_SIZE * 6) + (WORD_BYTE_SIZE * 2) + (UNSIGNED_SHORT_BYTE_SIZE * 4)     ; https://learn.microsoft.com/en-us/windows/win32/api/winsock/ns-winsock-wsadata#syntax
       , IN_ADDR_BYTE_SIZE := ULONG_BYTE_SIZE                                                                   ; https://learn.microsoft.com/en-us/windows/win32/api/winsock2/ns-winsock2-in_addr
       , SOCKADDR_IN_BYTE_SIZE := SHORT_BYTE_SIZE + USHORT_BYTE_SIZE + IN_ADDR_BYTE_SIZE + (CHAR_BYTE_SIZE * 8) ; https://learn.microsoft.com/en-us/windows/win32/api/ws2def/ns-ws2def-sockaddr_in
  ; winshock2.h
  static WINSOCK_VERSION := 0x0202
       , WSABASEERR := 10000
       , WSASYSNOTREADY := WSABASEERR + 91
       , WSAVERNOTSUPPORTED := WSABASEERR+ + 92
       , WSAEINPROGRESS := WSABASEERR + 36
       , WSAEPROCLIM := WSABASEERR + 67
       , WSAEFAULT := WSABASEERR + 14
       , AF_INET := 2
       , SOCK_STREAM := 1
       , IPPROTO_TCP := 6
  ; #endregion variables and constants

  ; #region config
  port := config ? (config.port ? config.port : DEFAULT_PORT) : DEFAULT_PORT
  hostname := config ? (config.hostname ? config.hostname : DEFUALT_HOSTNAME) : DEFUALT_HOSTNAME
  timeout_ms := config ? (config.timeout_ms ? config.timeout_ms : DEFAULT_TIMEOUT_MS) : DEFAULT_TIMEOUT_MS
  recievedMaxLength := config ? (config.recievedMaxLength ? config.recievedMaxLength : DEFAULT_RECIEVED_MAX_LENGTH) : DEFAULT_RECIEVED_MAX_LENGTH
  key := config ? (config.key ? config.key : DEFAULT_KEY) : DEFAULT_KEY
  ; #endregion config

  ; #region initialize
  if (!initialized) {
    module := DllCall("LoadLibrary", STRING_TYPE, "ws2_32.dll")

    VarSetCapacity(wsaData, WSA_DATA_BYTE_SIZE)
    stratUpError := DllCall("ws2_32\WSAStartup", "UShort", WINSOCK_VERSION, "Ptr", &wsaData)
    if (0 < stratUpError) {
      ; https://learn.microsoft.com/en-us/windows/win32/api/winsock/nf-winsock-wsastartup#return-value
      switch (error) {
        case WSASYSNOTREADY: throw Exception("The underlying network subsystem is not ready for network communication.")
        case WSAVERNOTSUPPORTED: throw Exception("The version of Windows Sockets support requested is not provided by this particular Windows Sockets implementation.")
        case WSAEINPROGRESS: throw Exception("A blocking Windows Sockets 1.1 operation is in progress.")
        case WSAEPROCLIM: throw Exception("A limit on the number of tasks supported by the Windows Sockets implementation has been reached.")
        case WSAEFAULT: throw Exception("The lpWSAData parameter is not a valid pointer.")
      }
      throw Exception("Unknown error.")
    }

    socket := DllCall("ws2_32\socket", "Int", AF_INET, "Int", SOCK_STREAM, "Int", IPPROTO_TCP)

    VarSetCapacity(sockaddrIn, SOCKADDR_IN_BYTE_SIZE, 0)
    NumPut(AF_INET, sockaddrIn, offset := 0, "UShort") ; sin_family
    NumPut(DllCall("ws2_32\htons", "UShort", port, "UShort"), sockaddrIn, offset += SHORT_BYTE_SIZE, "UShort") ; https://learn.microsoft.com/en-us/windows/win32/api/winsock2/nf-winsock2-htons
    NumPut(DllCall("ws2_32\inet_addr", "AStr", hostname), sockaddrIn, offset += USHORT_BYTE_SIZE) ; https://learn.microsoft.com/en-us/windows/win32/api/winsock/nf-winsock-inet_addr

    connectError := DllCall("ws2_32\connect", "Ptr", socket, "Ptr", &sockaddrIn, "Int", SOCKADDR_IN_BYTE_SIZE)
    if (connectError != 0) {
      throw Exception("Could not connect to the server; restarting current script may help.")
    }

    OnExit(Func("ExecuteVsCodeCommand_OnExit").bind(module, socket))
    initialized := true
  }
  ; #endregion initialize

  ; #region main process
  ; https://learn.microsoft.com/en-us/windows/win32/api/winsock2/nf-winsock2-send
  sentBytes := DllCall("ws2_32\send", "Ptr", socket, "AStr", commandName, "Int", StrLen(commandName), "Int", NULL)
  if (sentBytes < 0) {
    throw Exception("send error")
  }
  SendInput, %key%

  VarSetCapacity(response, recievedMaxLength)
  bytesReceived := DllCall("ws2_32\recv", "Ptr", socket, "Ptr", &response, "Int", recievedMaxLength, "Int", NULL)
  recievedMessage := StrGet(&response, recievedMaxLength, A_IsUnicode ? "UTF-8" : "CP0")
  ; #endregion main process

  return recievedMessage
}
ExecuteVsCodeCommand_OnExit(module, socket) {
  ; https://learn.microsoft.com/en-us/windows/win32/api/winsock2/nf-winsock2-shutdown
  static SD_SEND := 2

  DllCall("ws2_32\shutdown", "ptr", socket, "Int", SD_SEND)
  DllCall("ws2_32\closesocket", "ptr", socket)
  DllCall("Ws2_32\WSACleanup")
  DllCall("FreeLibrary", "Ptr", module)
}

