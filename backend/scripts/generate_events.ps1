# Real-time Attendance Event Generator
# This script generates continuous attendance events for testing

Write-Host "`n🎬 Real-time Attendance Event Generator`n" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# Check if server is running
Write-Host "`n📡 Checking backend server..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Server is running" -ForegroundColor Green
} catch {
    try {
        $testResponse = Invoke-WebRequest -Uri "http://localhost:5000/" -TimeoutSec 2 -ErrorAction Stop
        Write-Host "✅ Server is running" -ForegroundColor Green
    } catch {
        Write-Host "❌ Server is NOT running on port 5000" -ForegroundColor Red
        Write-Host "`nPlease start the backend server first:" -ForegroundColor Yellow
        Write-Host "  cd c:\Attendance\MGC\backend" -ForegroundColor White
        Write-Host "  npm run dev" -ForegroundColor White
        exit 1
    }
}

# Menu
Write-Host "`n📋 Select an option:" -ForegroundColor Cyan
Write-Host "  1. Generate single event" -ForegroundColor White
Write-Host "  2. Start continuous simulation (50 events, 2 sec interval)" -ForegroundColor White
Write-Host "  3. Start continuous simulation (100 events, 1 sec interval)" -ForegroundColor White
Write-Host "  4. Custom simulation" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "`n🎯 Generating single event..." -ForegroundColor Yellow
        try {
            $result = Invoke-RestMethod -Uri "http://localhost:5000/api/test-camera/generate" -Method GET
            Write-Host "✅ Event generated successfully!" -ForegroundColor Green
            Write-Host "`nStudent: $($result.testData.studentId)" -ForegroundColor White
            Write-Host "Direction: $($result.testData.direction)" -ForegroundColor White
            Write-Host "Hall: $($result.testData.hallId)" -ForegroundColor White
            Write-Host "Confidence: $($result.testData.confidence * 100)%" -ForegroundColor White
        } catch {
            Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    "2" {
        Write-Host "`n🚀 Starting simulation: 50 events, 2 second interval..." -ForegroundColor Yellow
        try {
            $body = @{ interval = 2000; count = 50 } | ConvertTo-Json
            $result = Invoke-RestMethod -Uri "http://localhost:5000/api/test-camera/start-simulation" `
                -Method POST `
                -ContentType "application/json" `
                -Body $body
            
            Write-Host "✅ Simulation started!" -ForegroundColor Green
            Write-Host "`n📊 Events will be generated over the next ~100 seconds" -ForegroundColor Cyan
            Write-Host "`n👉 Open your browser and navigate to:" -ForegroundColor Yellow
            Write-Host "   http://localhost:4200/attendance/realtime" -ForegroundColor White
            Write-Host "`n💡 You will see events appearing in real-time!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    "3" {
        Write-Host "`n🚀 Starting simulation: 100 events, 1 second interval..." -ForegroundColor Yellow
        try {
            $body = @{ interval = 1000; count = 100 } | ConvertTo-Json
            $result = Invoke-RestMethod -Uri "http://localhost:5000/api/test-camera/start-simulation" `
                -Method POST `
                -ContentType "application/json" `
                -Body $body
            
            Write-Host "✅ Simulation started!" -ForegroundColor Green
            Write-Host "`n📊 Events will be generated over the next ~100 seconds" -ForegroundColor Cyan
            Write-Host "`n👉 Open your browser and navigate to:" -ForegroundColor Yellow
            Write-Host "   http://localhost:4200/attendance/realtime" -ForegroundColor White
            Write-Host "`n💡 You will see events appearing in real-time!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    "4" {
        Write-Host "`n⚙️  Custom Simulation" -ForegroundColor Cyan
        $customCount = Read-Host "Number of events (default: 50)"
        $customInterval = Read-Host "Interval in seconds (default: 2)"
        
        if ([string]::IsNullOrWhiteSpace($customCount)) { $customCount = 50 }
        if ([string]::IsNullOrWhiteSpace($customInterval)) { $customInterval = 2 }
        
        $intervalMs = [int]$customInterval * 1000
        
        Write-Host "`n🚀 Starting simulation: $customCount events, $customInterval second interval..." -ForegroundColor Yellow
        try {
            $body = @{ interval = $intervalMs; count = [int]$customCount } | ConvertTo-Json
            $result = Invoke-RestMethod -Uri "http://localhost:5000/api/test-camera/start-simulation" `
                -Method POST `
                -ContentType "application/json" `
                -Body $body
            
            $duration = ([int]$customCount * [int]$customInterval)
            Write-Host "✅ Simulation started!" -ForegroundColor Green
            Write-Host "`n📊 Events will be generated over the next ~$duration seconds" -ForegroundColor Cyan
            Write-Host "`n👉 Open your browser and navigate to:" -ForegroundColor Yellow
            Write-Host "   http://localhost:4200/attendance/realtime" -ForegroundColor White
            Write-Host "`n💡 You will see events appearing in real-time!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    default {
        Write-Host "`n❌ Invalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Gray
Write-Host "`n✅ Done! Check the real-time dashboard to see the events.`n" -ForegroundColor Green
