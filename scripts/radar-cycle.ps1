param([int]$IntervalMinutes = 60, [switch]$Once)
$ErrorActionPreference = 'Stop'
if ($IntervalMinutes -lt 30) { throw 'Minimum interval is 30 minutes.' }
$radarRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $radarRoot
do {
    rtk npm run radar:collect
    if ($LASTEXITCODE -eq 0) {
        rtk npm run build:free
    }
    if (!$Once) { Start-Sleep -Seconds ($IntervalMinutes * 60) }
} while (!$Once)
