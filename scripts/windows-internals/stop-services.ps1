# Stop any process listening on port 3000 or 5000
$ports = @(3000, 5000)
$killed = 0

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    foreach ($conn in $connections) {
        $procId = $conn.OwningProcess
        if ($procId -and $procId -gt 0) {
            try {
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                Write-Host "Da dung tien trinh PID $procId dang lang nghe tai cong $port"
                $killed++
            } catch {
                # ignore
            }
        }
    }
}

if ($killed -eq 0) {
    Write-Host "Khong co dich vu nao dang chay tren cong 3000 hoac 5000."
} else {
    Write-Host "Da tat toan bo he thong NexNova HRM thanh cong."
}
