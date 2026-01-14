# ============================================
# Go-Live Checklist - PowerShell Script
# ============================================

Write-Host "🚀 Go-Live Checklist for Lottery Platform" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$checklist = @{
    "Day Before" = @(
        "Final code review completed",
        "Database backup created",
        "All critical flows tested",
        "Monitoring verified (Sentry)",
        "Error tracking configured",
        "DNS configured (if custom domain)"
    )
    "Launch Day" = @(
        "Backend deployed to Railway",
        "Database migrations ran successfully",
        "Initial data seeded",
        "Frontend deployed to Vercel",
        "Smoke test: Registration",
        "Smoke test: Browse tickets",
        "Smoke test: Add to cart",
        "Smoke test: Checkout",
        "Smoke test: Payment",
        "Smoke test: View orders",
        "Smoke test: Admin dashboard",
        "Monitor logs for errors"
    )
    "Day After" = @(
        "Check error rates in Sentry",
        "Monitor performance metrics",
        "Review user feedback",
        "Verify payment transactions",
        "Confirm cron jobs running",
        "Check database performance",
        "Review API response times"
    )
}

function Test-Item {
    param($description)
    $response = Read-Host "✓ $description (y/n)"
    return $response -eq 'y'
}

foreach ($phase in $checklist.Keys | Sort-Object) {
    Write-Host ""
    Write-Host "📋 $phase" -ForegroundColor Yellow
    Write-Host ("=" * 50)
    
    $completed = 0
    $total = $checklist[$phase].Count
    
    foreach ($item in $checklist[$phase]) {
        if (Test-Item $item) {
            $completed++
        } else {
            Write-Host "   ⚠️  Action required!" -ForegroundColor Red
        }
    }
    
    $percentage = [math]::Round(($completed / $total) * 100, 2)
    Write-Host ""
    Write-Host "Progress: $completed/$total ($percentage%)" -ForegroundColor $(if ($completed -eq $total) { "Green" } else { "Yellow" })
}

Write-Host ""
Write-Host "🎉 Checklist completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Important URLs:" -ForegroundColor Cyan
Write-Host "  Frontend: https://your-app.vercel.app"
Write-Host "  Backend: https://your-app.railway.app"
Write-Host "  Sentry: https://sentry.io/organizations/your-org"
Write-Host "  Railway: https://railway.app/project/your-project"
Write-Host ""
