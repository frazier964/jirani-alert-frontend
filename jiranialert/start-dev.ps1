# Jirani Alert Development Startup Script
# This script starts the backend first, waits for it to be ready, then starts the frontend

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Jirani Alert Development Environment" -ForegroundColor Green
Write-Host ""

# Function to check if backend is ready
function Test-BackendReady {
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:5005/jiranialert/us-central1/health" -TimeoutSec 2 -UseBasicParsing
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

# Start backend in a new window
Write-Host "📦 Starting Firebase backend emulators..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD/backend'; npm run dev" -WindowStyle Normal

# Wait for backend to be ready (max 60 seconds)
Write-Host "⏳ Waiting for backend to be ready..." -ForegroundColor Yellow
$maxAttempts = 60
$attempt = 0
$backendReady = $false

while ($attempt -lt $maxAttempts -and -not $backendReady) {
    Start-Sleep -Seconds 1
    $attempt++
    $backendReady = Test-BackendReady
    if ($attempt % 10 -eq 0) {
        Write-Host "   Still waiting... ($attempt seconds)"
    }
}

if ($backendReady) {
    Write-Host "✅ Backend is ready! (took $attempt seconds)" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend didn't start within $maxAttempts seconds. Starting frontend anyway..." -ForegroundColor Yellow
}

# Start frontend
Write-Host ""
Write-Host "🎨 Starting frontend development server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD/frontend'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "🎉 Development environment started!" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "   Backend:  http://127.0.0.1:5005" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")