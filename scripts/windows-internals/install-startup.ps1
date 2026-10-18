# Create isolated ASCII launcher folder in %APPDATA%
$appDataDir = "$env:APPDATA\NexNovaHRM"
New-Item -ItemType Directory -Path $appDataDir -Force | Out-Null

$vbsContent = @'
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "node """ & "d:\Tài liệu học tập\HTTT QLNL\scripts\start-services.js" & """", 0, False
'@

$vbsPath = "$appDataDir\start.vbs"
[System.IO.File]::WriteAllText($vbsPath, $vbsContent, [System.Text.Encoding]::Unicode)

# Create shortcut in Windows Startup folder (100% ASCII paths, immune to Unicode/ANSI mojibake)
$startupFolder = [System.Environment]::GetFolderPath('Startup')
$shortcutPath = Join-Path $startupFolder "NexNova_HRM_AutoStart.lnk"

$wshShell = New-Object -ComObject WScript.Shell
$shortcut = $wshShell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "wscript.exe"
$shortcut.Arguments = "`"$vbsPath`""
$shortcut.WorkingDirectory = $appDataDir
$shortcut.Description = "Tu dong khoi dong NexNova Enterprise HRM cung Windows"
$shortcut.Save()

Write-Host "[OK] Da tao thanh cong loi tat khoi dong cung Windows tai:"
Write-Host $shortcutPath
