param(
  [string]$Message = "Trend Arbitrage Radar MVP",
  [string]$Remote = "",
  [string]$Branch = "main",
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

function RunStep([string]$cmd) {
  if ($DryRun) { Write-Host "[dry-run] $cmd"; return }
  Write-Host "> $cmd"
  Invoke-Expression $cmd
  if ($LASTEXITCODE -ne 0) { throw "failed: $cmd" }
}

try { git rev-parse --is-inside-work-tree 2>$null | Out-Null }
catch { throw "not a git repository: $repo" }

if ($DryRun) {
  $pending = (git status --short | Measure-Object).Count
  Write-Host "[dry-run] git add -A ($pending files would stage)"
} else {
  RunStep "git add -A"
  $staged = (git diff --cached --name-only | Measure-Object).Count
  Write-Host "staged files: $staged"
  if ($staged -eq 0) { Write-Host "nothing to commit."; exit 0 }
}

if ($DryRun) {
  Write-Host "[dry-run] git commit -m <message>"
} else {
  git commit -m $Message
  if ($LASTEXITCODE -ne 0) { throw "commit failed" }
}

RunStep "git branch -M $Branch"

$origin = $null
if ((git remote) -contains "origin") { $origin = git remote get-url origin }
if (-not $origin) {
  if (-not $Remote) {
    Write-Host "no origin set. create an empty repo on GitHub, then run:"
    Write-Host '  .\scripts\publish.ps1 -Remote https://github.com/<user>/<repo>.git'
    exit 0
  }
  RunStep "git remote add origin $Remote"
} elseif ($Remote -and ($origin -ne $Remote)) {
  Write-Host "origin already set to $origin - leaving it (pass nothing to keep)."
}

RunStep "git push -u origin $Branch"
Write-Host "done. next: vercel.com -> Add New -> Project -> import this repo (see docs/DEPLOY.md)."
