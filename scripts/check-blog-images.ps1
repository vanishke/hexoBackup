# Check markdown image links under source/_posts/blogs against source/images (and public/images fallback).
param(
  [string]$BlogsDir = (Join-Path $PSScriptRoot "..\source\_posts\blogs"),
  [string]$SourceImages = (Join-Path $PSScriptRoot "..\source\images"),
  [string]$PublicImages = (Join-Path $PSScriptRoot "..\public\images"),
  [string]$OutCsv = (Join-Path $PSScriptRoot "..\source\_posts\blogs\_audit\image-inventory.csv")
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$blogsRoot = (Resolve-Path $BlogsDir).Path
$sourceRoot = if (Test-Path $SourceImages) { (Resolve-Path $SourceImages).Path } else { $null }
$publicRoot = if (Test-Path $PublicImages) { (Resolve-Path $PublicImages).Path } else { $null }

$pattern = '!\[([^\]]*)\]\(([^)]+)\)'
$rows = New-Object System.Collections.Generic.List[object]
$missing = 0
$ok = 0
$external = 0

Get-ChildItem -LiteralPath $blogsRoot -Filter "*.md" -File -Recurse |
  Where-Object { $_.FullName -notmatch '\\_audit\\' } |
  ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName)
    foreach ($m in [regex]::Matches($content, $pattern)) {
      $alt = $m.Groups[1].Value
      $url = $m.Groups[2].Value.Trim()
      $status = "external"
      $resolved = ""
      if ($url -notmatch '^https?://') {
        $rel = $url.TrimStart('/').Replace('/', [IO.Path]::DirectorySeparatorChar)
        # strip leading "images\"
        if ($rel -match '^(?i)images[\\/](.*)$') {
          $relUnderImages = $Matches[1]
        } else {
          $relUnderImages = $rel
        }
        $candidates = @()
        if ($sourceRoot) { $candidates += (Join-Path $sourceRoot $relUnderImages) }
        if ($publicRoot) { $candidates += (Join-Path $publicRoot $relUnderImages) }
        $hit = $candidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
        if ($hit) {
          $status = "ok"
          $resolved = $hit
          $ok++
        } else {
          $status = "missing"
          $missing++
        }
      } else {
        $external++
      }
      $rows.Add([pscustomobject]@{
          File   = $_.Name
          Alt    = $alt
          Url    = $url
          Status = $status
          Path   = $resolved
        })
    }
  }

$outDir = Split-Path -Parent $OutCsv
if (-not (Test-Path $outDir)) {
  New-Item -ItemType Directory -Force -Path $outDir | Out-Null
}
$rows | Export-Csv -Path $OutCsv -NoTypeInformation -Encoding UTF8

Write-Host "Total: $($rows.Count)  OK: $ok  Missing: $missing  External: $external"
Write-Host "CSV: $OutCsv"
if ($missing -gt 0) {
  Write-Host "--- Missing ---"
  $rows | Where-Object { $_.Status -eq "missing" } | ForEach-Object {
    Write-Host ("{0} => {1}" -f $_.File, $_.Url)
  }
  exit 1
}
exit 0
