# Real-time Attendance Event Generator
Write-Host "`n🎬 Real-time Attendance Event Generator`n" -ForegroundColor Cyan

# Start simulation directly
Write-Host "🚀 Starting simulation: 50 events, 2 second interval..." -ForegroundColor Yellow

try {
    $body = @{ interval = 2000; count = 50 } | ConvertTo-Json
    $result = Invoke-RestMethod -Uri "http://localhost:5000/api/test-camera/start-simulation" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body
    
    Write-Host "✅ Simulation started successfully!" -ForegroundColor Green
    Write-Host "`n📊 50 events will be generated over the next 100 seconds" -ForegroundColor Cyan
    Write-Host "`n👉 Open your browser and navigate to:" -ForegroundColor Yellow
    Write-Host "   http://localhost:4200/attendance/realtime" -ForegroundColor White
    Write-Host "`n💡 You will see:" -ForegroundColor Green
    Write-Host "   - Live attendance events appearing in real-time" -ForegroundColor White
    Write-Host "   - Student IN/OUT status updates" -ForegroundColor White
    Write-Host "   - Statistics updating automatically" -ForegroundColor White
    Write-Host "   - Toast notifications for each event" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nMake sure the backend server is running:" -ForegroundColor Yellow
    Write-Host "  cd c:\Attendance\MGC\backend" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor White
}
