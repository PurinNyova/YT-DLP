# run.ps1 — Start backend and frontend concurrently

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot

# ── Ensure Go is on PATH ────────────────────────────────────────────────────
if (-not (Get-Command go -ErrorAction SilentlyContinue)) {
    $env:PATH = "C:\Program Files\Go\bin;" + $env:PATH
}

Write-Host ""
Write-Host "  YT-DLP — starting services" -ForegroundColor Cyan
Write-Host "  Backend  → http://localhost:8080" -ForegroundColor Green
Write-Host "  Frontend → http://localhost:5173" -ForegroundColor Green
Write-Host ""

# ── Backend ─────────────────────────────────────────────────────────────────
$backend = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "& { `$env:PATH = 'C:\Program Files\Go\bin;' + `$env:PATH; cd '$Root\backend'; Write-Host '[Backend] Starting...' -ForegroundColor Yellow; go run .; }"
) -PassThru

# ── Frontend ─────────────────────────────────────────────────────────────────
$frontend = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "& { cd '$Root\frontend'; Write-Host '[Frontend] Starting...' -ForegroundColor Yellow; npm run dev; }"
) -PassThru

Write-Host "  Both services launched in separate windows." -ForegroundColor Cyan
Write-Host "  Press Ctrl+C here to stop both." -ForegroundColor Gray
Write-Host ""

try {
    Wait-Process -Id $backend.Id, $frontend.Id
} catch {
    # One or both were closed manually — clean up the other
    $backend, $frontend | ForEach-Object {
        if ($_ -and -not $_.HasExited) { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue }
    }
}
