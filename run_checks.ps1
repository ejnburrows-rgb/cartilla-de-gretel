Write-Host "=== TYPECHECK ==="
pnpm typecheck
Write-Host "=== BUILD ==="
pnpm build
Write-Host "=== TESTS ==="
pnpm test -- --run
