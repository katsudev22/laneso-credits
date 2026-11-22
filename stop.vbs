Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "taskkill /IM ""laneso-credits.exe"" /F", 0, False