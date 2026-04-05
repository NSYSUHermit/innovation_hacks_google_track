# Run this on your PC (with Node.js installed) to install deps and create a full zip for others.
# Usage: right-click -> Run with PowerShell, or: powershell -ExecutionPolicy Bypass -File .\pack-for-sharing.ps1
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Set-Location $root

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "ERROR: npm not found. Install Node.js LTS from https://nodejs.org/ then run this script again." -ForegroundColor Red
  exit 1
}

Write-Host "Installing dependencies (npm install)..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$stamp = Get-Date -Format "yyyyMMdd-HHmm"
$out = Join-Path $env:USERPROFILE "Downloads\hiremind-dashboard-FULL-$stamp.zip"
if (Test-Path $out) { Remove-Item $out -Force }

Write-Host "Creating zip (includes node_modules, may take 1-2 minutes)..." -ForegroundColor Cyan
Compress-Archive -LiteralPath $root -DestinationPath $out -CompressionLevel Optimal

$sizeMb = [math]::Round((Get-Item $out).Length / 1MB, 2)
Write-Host ""
Write-Host "Done. Full package:" -ForegroundColor Green
Write-Host "  $out"
Write-Host "  Size: $sizeMb MB"
Write-Host ""
Write-Host "Send that zip to your colleague. They can unzip and run: npm run dev" -ForegroundColor Gray
