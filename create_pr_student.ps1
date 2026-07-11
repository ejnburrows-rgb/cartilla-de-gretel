$token = "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"
$headers = @{
    "Authorization" = "token $token"
    "Accept" = "application/vnd.github.v3+json"
}
$body = @{
    title = "fix: student routing v2"
    head = "fix/student-routing-v2"
    base = "main"
    body = "Enforce strict session isolation between teacher and student lanes.`n`n- Student login lands on /cartilla/lecciones`n- Active student session blocked from teacher routes`n- Teacher/student logins clear opposing session data.`n`nIncludes regression tests."
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
