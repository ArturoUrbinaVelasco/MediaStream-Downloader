<#
.SYNOPSIS
    Script de arranque local para MediaStream Downloader (Backend FastAPI + Frontend Vite)
.DESCRIPTION
    Inicia el servidor backend en http://127.0.0.1:8000 y el cliente frontend en http://localhost:5173,
    abriendo automáticamente el navegador en Windows.
#>

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       Iniciando MediaStream Downloader (Local)           " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$backendDir = Join-Path $PSScriptRoot "backend"
$frontendDir = Join-Path $PSScriptRoot "frontend"

# 1. Iniciar Backend
Write-Host "`n[1/3] Levantando Backend (FastAPI + yt-dlp)..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload" -PassThru

Start-Sleep -Seconds 3

# 2. Iniciar Frontend
Write-Host "`n[2/3] Levantando Frontend (React + Vite)..." -ForegroundColor Yellow
$frontendProcess = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev -- --open" -PassThru

Write-Host "`n[3/3] Aplicación en ejecución:" -ForegroundColor Green
Write-Host "  -> Frontend UI:    http://localhost:5173" -ForegroundColor Green
Write-Host "  -> Backend API:    http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "  -> Swagger Docs:   http://127.0.0.1:8000/docs" -ForegroundColor Green
Write-Host "`nPara detener los servicios, cierra las ventanas de terminal abiertas." -ForegroundColor Cyan
