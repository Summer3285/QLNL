$root = "d:\Tài liệu học tập\HTTT QLNL"

# 1. Start Backend (Port 5000) if not running
$p5000 = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue
if (-not $p5000) {
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm --prefix backend run dev" -WorkingDirectory $root -WindowStyle Hidden
}

# 2. Start Frontend (Port 3000) if not running
$p3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if (-not $p3000) {
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm --prefix frontend run dev" -WorkingDirectory $root -WindowStyle Hidden
}
