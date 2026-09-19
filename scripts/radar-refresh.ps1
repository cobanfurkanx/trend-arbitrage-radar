param(
    [int]$AiLimit = 3
)

$ErrorActionPreference = 'Stop'
$radarRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $radarRoot

Write-Host "[$(Get-Date -Format o)] collecting radar sources"
npm.cmd run radar:collect -- --ai-limit=$AiLimit
if ($LASTEXITCODE -ne 0) { throw "Radar collection failed with exit code $LASTEXITCODE" }

Write-Host "[$(Get-Date -Format o)] building static site"
npm.cmd run build:free
if ($LASTEXITCODE -ne 0) { throw "Static build failed with exit code $LASTEXITCODE" }

npm.cmd run verify:export
if ($LASTEXITCODE -ne 0) { throw "Export verification failed with exit code $LASTEXITCODE" }

Write-Host "[$(Get-Date -Format o)] deploying Cloudflare Pages"
npx.cmd --yes wrangler@4 pages deploy free/out --project-name trendcatcher-shepardai --branch main --commit-dirty=true
if ($LASTEXITCODE -ne 0) { throw "Cloudflare deployment failed with exit code $LASTEXITCODE" }

Write-Host "[$(Get-Date -Format o)] refresh complete"
