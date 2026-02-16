# Script de Respaldo Manual
# Ejecuta este script cuando quieras hacer un respaldo inmediato

$ErrorActionPreference = "Stop"

# Cambiar al directorio del proyecto
Set-Location "C:\ODDY_Market"

# Obtener fecha y hora actual
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESPALDO MANUAL - ODDY Market" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fecha/Hora: $timestamp" -ForegroundColor White
Write-Host ""

# Verificar estado de Git
$status = git status --porcelain

if (-not $status) {
    Write-Host "No hay cambios para respaldar" -ForegroundColor Yellow
    exit 0
}

# Mostrar cambios
Write-Host "Cambios detectados:" -ForegroundColor Green
git status --short

Write-Host "`n¿Deseas hacer commit de estos cambios? (S/N): " -ForegroundColor Yellow -NoNewline
$response = Read-Host

if ($response -eq "S" -or $response -eq "s" -or $response -eq "Y" -or $response -eq "y") {
    # Agregar todos los cambios
    git add -A
    
    # Hacer commit
    $commitMessage = "Respaldo manual: $timestamp"
    git commit -m $commitMessage
    
    Write-Host "`nRespaldo completado exitosamente" -ForegroundColor Green
    Write-Host "Commit: $commitMessage" -ForegroundColor Cyan
    
    # Preguntar si hacer push
    Write-Host "`n¿Deseas subir los cambios al repositorio remoto? (S/N): " -ForegroundColor Yellow -NoNewline
    $pushResponse = Read-Host
    
    if ($pushResponse -eq "S" -or $pushResponse -eq "s" -or $pushResponse -eq "Y" -or $pushResponse -eq "y") {
        git push origin main
        Write-Host "Cambios subidos al repositorio remoto" -ForegroundColor Green
    }
} else {
    Write-Host "Respaldo cancelado" -ForegroundColor Yellow
}
