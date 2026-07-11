$token = "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"
$headers = @{
    "Authorization" = "token $token"
    "Accept" = "application/vnd.github.v3+json"
}
$body = @{
    title = "feat: build clean guia JSON files"
    head = "feat/guia-json-clean"
    base = "main"
    body = "Build teacher's guide content files clean from scratch.`n`n- Transcribed guides 1-15.`n- Correctly marked guides 16-24 as missing content with searched paths."
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://api.github.com/repos/ejnburrows-rgb/cartilla-de-gretel/pulls" -Method Post -Headers $headers -Body $body
    Write-Host "PR created successfully!"
    Write-Host "URL: $($response.html_url)"
    Write-Host "Number: $($response.number)"
} catch {
    Write-Host "Failed to create PR:"
    Write-Host $_.Exception.Message
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $responseBody = $reader.ReadToEnd()
    Write-Host $responseBody
}
