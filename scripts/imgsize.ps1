Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('public/cartilla/art/hd/workbook/page-001.jpg')
Write-Host $img.Width, $img.Height
