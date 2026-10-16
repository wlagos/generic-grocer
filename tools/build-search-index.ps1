<#
Scans the scraped department pages (pages/shop_*_d_*.html) for embedded product
cards and writes a flat product index to assets/data/search-index.json for the
client-side search feature (assets/js/site-search.js) to fetch at runtime.

Each department page's own id (the "_d_<digits>" in its filename) is recorded
per product as categoryId — whichever department page a product's id is
first encountered on. A product can legitimately appear on more than one
department page; only the first is kept, same as name/image/url already were.
categoryId is also resolved to a readable full breadcrumb path (categoryPath,
e.g. "Pantry > Beverages > Water > Sparkling & Seltzer") via Build-CategoryPathMap,
which walks the site's own scraped department mega-menu (present identically
on every page's header) to recover the real category hierarchy.

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

# Walks the scraped department mega-menu (#departments, present on every
# page's header) to build a categoryId -> full breadcrumb path map, e.g.
# "22241625" -> "Pantry / Beverages / Water / Sparkling & Seltzer".
function Build-CategoryPathMap([string]$sourceFile) {
    $map = @{}
    $html = Get-Content -Raw -Path $sourceFile
    $doc = New-Object -ComObject "HTMLFile"
    try {
        $doc.IHTMLDocument2_write($html)
    } catch {
        $doc.write([System.Text.Encoding]::Unicode.GetBytes($html))
    }

    function Walk-Department($liElement, $prefixPath) {
        $a = $null
        $ul = $null
        foreach ($child in $liElement.children) {
            if ($child.tagName -eq 'A' -and -not $a) { $a = $child }
            if ($child.tagName -eq 'UL' -and -not $ul) { $ul = $child }
        }
        if (-not $a) { return }
        $id = $a.getAttribute('data-id')
        $name = ($a.innerText).Trim()
        if (-not $id -or -not $name) { return }
        $path = if ($prefixPath) { "$prefixPath > $name" } else { $name }
        $map[$id] = $path
        if ($ul) {
            foreach ($childLi in $ul.children) {
                if ($childLi.tagName -eq 'LI') {
                    Walk-Department $childLi $path
                }
            }
        }
    }

    $departments = $doc.getElementById('departments')
    if ($departments) {
        foreach ($li in $departments.children) {
            if ($li.tagName -eq 'LI') { Walk-Department $li '' }
        }
    }
    return $map
}

$pagesDir = Join-Path $PSScriptRoot '..\pages'
$outFile = Join-Path $PSScriptRoot '..\assets\data\search-index.json'

$outDir = Split-Path $outFile -Parent
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null
}

$categoryPathMap = Build-CategoryPathMap (Join-Path $pagesDir 'shop.html')
Write-Host "Resolved $($categoryPathMap.Count) category paths from the department menu"

$files = Get-ChildItem -Path $pagesDir -Filter 'shop_*_d_*.html' -File

$singleline = [System.Text.RegularExpressions.RegexOptions]::Singleline
$itemPattern = [regex]::new('<li class="fp-item[^>]*data-product-id="(?<id>\d+)".*?</li>', $singleline)
$namePattern = [regex]::new('class="fp-item-name[^"]*">\s*<span[^>]*>\s*<a[^>]*href="(?<href>[^"]+)"[^>]*>\s*(?<name>[^<]+?)\s*</a>', $singleline)
$imgDataSrcPattern = [regex]::new('<img[^>]*data-src="(?<src>[^"]+)"', $singleline)
$imgSrcPattern = [regex]::new('<img[^>]*\ssrc="(?<src>[^"]+)"', $singleline)

$index = [ordered]@{}

foreach ($file in $files) {
    $categoryMatch = [regex]::Match($file.Name, '_d_(?<catId>\d+)\.html$')
    $categoryId = if ($categoryMatch.Success) { $categoryMatch.Groups['catId'].Value } else { '' }
    $categoryPath = if ($categoryId -and $categoryPathMap.Contains($categoryId)) { $categoryPathMap[$categoryId] } else { '' }

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
            id           = $id
            name         = ($nameMatch.Groups['name'].Value.Trim() -replace '&amp;', '&')
            url          = $nameMatch.Groups['href'].Value
            image        = if ($imgMatch.Success) { ($imgMatch.Groups['src'].Value -replace '&amp;', '&') } else { '' }
            price        = Get-PlaceholderPrice $id
            categoryId   = $categoryId
            categoryPath = $categoryPath
        }
    }
}

$list = @($index.Values | Sort-Object { $_.name })
$tempFile = "$outFile.tmp"
$list | ConvertTo-Json -Depth 3 | Set-Content -Path $tempFile -Encoding utf8 -Force
Move-Item -Path $tempFile -Destination $outFile -Force

Write-Host "Wrote $($list.Count) products to $outFile"
