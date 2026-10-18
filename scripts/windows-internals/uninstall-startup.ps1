$startupFolder = [System.Environment]::GetFolderPath('Startup')
$shortcutPath = Join-Path $startupFolder "NexNova_HRM_AutoStart.lnk"

if (Test-Path $shortcutPath) {
    Remove-Item $shortcutPath -Force
    Write-Host "[OK] Da go bo khoi dong cung Windows."
} else {
    Write-Host "Chua cai dat khoi dong cung Windows."
}

$appDataDir = "$env:APPDATA\NexNovaHRM"
if (Test-Path $appDataDir) {
    Remove-Item $appDataDir -Recurse -Force -ErrorAction SilentlyContinue
}
