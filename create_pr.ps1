$token = "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"
$headers = @{
    "Authorization" = "token $token"
    "Accept" = "application/vnd.github.v3+json"
}
$body = @{
    title = "feat: implement dark mode, palette overhaul, and i18n"
    head = "feat/ui-dark-mode-i18n"
    base = "main"
    body = "Implemented dark mode, readability/palette overhaul, and EN/ES language switch for the teacher CRM.`n`n- Dark mode and UI overhaul.`n- i18n language toggle integrated.`n- UI layout fixes and tests.`n- Screenshots pending.`n`nCloses user request."
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
