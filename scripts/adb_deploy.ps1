<#
.SYNOPSIS
    Automated Android verification, build, and ADB deployment script for MediaStream Downloader.
.DESCRIPTION
    Complies with ADB-first standard: checks devices, builds the web assets, syncs Capacitor,
    compiles debug APK, installs via ADB, launches the app, and streams logcat.
#>

param (
    [switch]$SkipBuild = $false,
    [switch]$StreamLogs = $true
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  MediaStream Downloader - ADB Automation & Deployment    " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Device Verification
Write-Host "`n[1/5] Verifying connected Android devices via ADB..." -ForegroundColor Yellow
$devices = adb devices | Select-String -Pattern "device$"
if (-not $devices) {
    Write-Warning "No connected Android devices or emulators found via ADB."
    Write-Host "Please connect your device with USB Debugging enabled, or launch an Android emulator."
    Write-Host "Current adb output:"
    adb devices
} else {
    Write-Host "Connected target device(s):" -ForegroundColor Green
    $devices | ForEach-Object { Write-Host "  -> $_" -ForegroundColor Green }
}

# 2. Web Build
if (-not $SkipBuild) {
    Write-Host "`n[2/5] Building production web assets..." -ForegroundColor Yellow
    Push-Location frontend
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Web build failed."
        Pop-Location
        exit $LASTEXITCODE
    }
    Pop-Location
}

# 3. Capacitor Sync
Write-Host "`n[3/5] Syncing assets with Capacitor Android..." -ForegroundColor Yellow
Push-Location frontend
npx cap sync android
Pop-Location

# 4. APK Compilation and ADB Installation
$apkPath = "frontend\android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path "frontend\android\gradlew.bat") {
    Write-Host "`n[4/5] Compiling Android APK with Gradle..." -ForegroundColor Yellow
    Push-Location frontend\android
    .\gradlew.bat assembleDebug
    Pop-Location

    if (Test-Path $apkPath) {
        Write-Host "`n[5/5] Deploying APK to device via ADB..." -ForegroundColor Yellow
        adb install -r $apkPath

        Write-Host "`nLaunching MediaStream Downloader..." -ForegroundColor Green
        adb shell am start -n com.mediastream.downloader/.MainActivity

        if ($StreamLogs) {
            Write-Host "`nMonitoring ADB logcat (Press Ctrl+C to stop)..." -ForegroundColor Cyan
            adb logcat -s Capacitor:V MediaStreamApp:V Chromium:D
        }
    } else {
        Write-Warning "APK output not found at $apkPath. Check Gradle compilation logs."
    }
} else {
    Write-Host "Capacitor android directory ready. Use Android Studio or gradlew to compile APK." -ForegroundColor Green
}

Write-Host "`n[OK] Script finished successfully." -ForegroundColor Green
