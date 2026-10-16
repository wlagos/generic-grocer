<#
Scans the scraped department pages (pages/shop_*_d_*.html) for embedded product
cards and writes a flat product index to assets/data/search-index.json for the
client-side search feature (assets/js/site-search.js) to fetch at runtime.

The scraped site has no real pricing anywhere (price always requires selecting
a store on the live site), so Get-PlaceholderPrice derives a deterministic
placeholder price from each product id — stable across rebuilds, not real data.

Run manually whenever the scraped pages/shop_*_d_*.html files change:
    powershell -File tools/build-search-index.ps1
#>

function Get-PlaceholderPrice([string]$id) {
    $hash = 0
    foreach ($ch in $id.ToCharArray()) {
        $hash = ($hash * 31 + [int]$ch) % 2000003
    }
    $cents = 99 + ($hash % 1901)  # $0.99 - $19.99
    return [math]::Round($cents / 100.0, 2)
}

$pagesDir = Join-Path $PSScriptRoot '..\pages'
$outFile = Join-Path $PSScriptRoot '..\assets\data\search-index.json'

$outDir = Split-Path $outFile -Parent
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null
}

$files = Get-ChildItem -Path $pagesDir -Filter 'shop_*_d_*.html' -File

$singleline = [System.Text.RegularExpressions.RegexOptions]::Singleline
$itemPattern = [regex]::new('<li class="fp-item[^>]*data-product-id="(?<id>\d+)".*?</li>', $singleline)
$namePattern = [regex]::new('class="fp-item-name[^"]*">\s*<span[^>]*>\s*<a[^>]*href="(?<href>[^"]+)"[^>]*>\s*(?<name>[^<]+?)\s*</a>', $singleline)
$imgDataSrcPattern = [regex]::new('<img[^>]*data-src="(?<src>[^"]+)"', $singleline)
$imgSrcPattern = [regex]::new('<img[^>]*\ssrc="(?<src>[^"]+)"', $singleline)

$index = [ordered]@{}

foreach ($file in $files) {
    $content = Get-Content -Raw -Path $file.FullName
    foreach ($m in $itemPattern.Matches($content)) {
        $id = $m.Groups['id'].Value
        if ($index.Contains($id)) { continue }

        $block = $m.Value
        $nameMatch = $namePattern.Match($block)
        if (-not $nameMatch.Success) { continue }

        $imgMatch = $imgDataSrcPattern.Match($block)
        if (-not $imgMatch.Success) { $imgMatch = $imgSrcPattern.Match($block) }

        $index[$id] = [ordered]@{
            id    = $id
            name  = ($nameMatch.Groups['name'].Value.Trim() -replace '&amp;', '&')
            url   = $nameMatch.Groups['href'].Value
            image = if ($imgMatch.Success) { ($imgMatch.Groups['src'].Value -replace '&amp;', '&') } else { '' }
            price = Get-PlaceholderPrice $id
        }
    }
}

$list = @($index.Values | Sort-Object { $_.name })
$tempFile = "$outFile.tmp"
$list | ConvertTo-Json -Depth 3 | Set-Content -Path $tempFile -Encoding utf8 -Force
Move-Item -Path $tempFile -Destination $outFile -Force

Write-Host "Wrote $($list.Count) products to $outFile"
