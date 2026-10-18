# Create a reliable startup shortcut that calls node.exe directly (no VBS intermediary)
$startupDir = [Environment]::GetFolderPath('Startup')
$lnkPath = Join-Path $startupDir "NexNova_HRM_AutoStart.lnk"

# Remove old shortcut
if (Test-Path $lnkPath) { Remove-Item $lnkPath -Force }

$WshShell = New-Object -ComObject WScript.Shell
$shortcut = $WshShell.CreateShortcut($lnkPath)
$shortcut.TargetPath = "C:\Program Files\nodejs\node.exe"
$shortcut.Arguments = "`"C:\Users\ADMIN\AppData\Roaming\NexNovaHRM\start-services.js`""
$shortcut.WorkingDirectory = "C:\Users\ADMIN\AppData\Roaming\NexNovaHRM"
$shortcut.WindowStyle = 7  # Minimized
$shortcut.Description = "NexNova HRM Auto-Start Service"
$shortcut.Save()

Write-Host "Shortcut created at: $lnkPath"
Write-Host "TargetPath: $($shortcut.TargetPath)"
Write-Host "Arguments: $($shortcut.Arguments)"
Write-Host "WindowStyle: $($shortcut.WindowStyle) (Minimized)"
