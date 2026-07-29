# Deployment script for cartilla-de-gretel
# Bypasses PowerShell execution policy to run npm and vercel commands

Write-Host "Installing dependencies..." -ForegroundColor Green
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "npm install failed" -ForegroundColor Red
    exit 1
}

Write-Host "Deploying to Vercel..." -ForegroundColor Green
npx vercel deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "Vercel deploy failed" -ForegroundColor Red
    exit 1
}

Write-Host "Deployment successful!" -ForegroundColor Green
