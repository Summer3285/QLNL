Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File ""d:\Tài liệu học tập\HTTT QLNL\scripts\start-services.ps1""", 0, False
