$ErrorActionPreference = "Stop"

$repoRoot = (Get-Item $PSScriptRoot).Parent.FullName
$backendDir = Join-Path $repoRoot "backend"
$frontendDir = Join-Path $repoRoot "frontend"

# Ensure screenshots directory exists
$screenshotsDir = Join-Path $repoRoot "docs\screenshots"
if (-not (Test-Path $screenshotsDir)) {
    New-Item -ItemType Directory -Path $screenshotsDir -Force | Out-Null
}

Write-Host "Starting Backend on port 8000..."
$backendProcess = Start-Process -FilePath "python" -ArgumentList "-m", "uvicorn", "app.main:app", "--port", "8000" -WorkingDirectory $backendDir -PassThru

Write-Host "Starting Frontend on port 5173..."
$frontendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm", "run", "dev" -WorkingDirectory $frontendDir -PassThru

function Check-Port($port) {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect("127.0.0.1", $port)
        $tcp.Close()
        return $true
    } catch {
        try {
            $tcp = New-Object System.Net.Sockets.TcpClient
            $tcp.Connect("::1", $port)
            $tcp.Close()
            return $true
        } catch {
            return $false
        }
    }
}

$retries = 35
while ($retries -gt 0 -and (-not (Check-Port 8000) -or -not (Check-Port 5173))) {
    Start-Sleep -Seconds 1
    $retries--
}

if (-not (Check-Port 8000) -or -not (Check-Port 5173)) {
    Write-Host "Failed to start backend or frontend"
    Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "Servers are up. Running Playwright test..."
$exitCode = 0
try {
    Push-Location $frontendDir
    cmd.exe /c npx playwright test
    $exitCode = $LASTEXITCODE
} finally {
    Pop-Location
    Write-Host "Stopping servers..."
    Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
}

exit $exitCode
