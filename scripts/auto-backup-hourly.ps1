# Script de Respaldo Automático por Hora
# Este script hace commit automático del código cada hora
# Para ejecutarlo automáticamente, configúralo como Tarea Programada de Windows

$ErrorActionPreference = "Stop"

# Cambiar al directorio del proyecto
Set-Location "C:\ODDY_Market"

# Obtener fecha y hora actual
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$date = Get-Date -Format "yyyy-MM-dd"
$time = Get-Date -Format "HH-mm"

# Verificar si hay cambios
$status = git status --porcelain

if ($status) {
    # Hay cambios, hacer commit automático
    $commitMessage = "Auto-backup: $timestamp"
    
    Write-Host "Realizando respaldo automático a las $timestamp..." -ForegroundColor Green
    
    # Agregar todos los cambios
    git add -A
    
    # Hacer commit
    git commit -m $commitMessage
    
    Write-Host "Respaldo completado exitosamente" -ForegroundColor Green
    
    # Opcional: hacer push (descomentar si quieres que se suba automáticamente)
    # git push origin main
} else {
    Write-Host "No hay cambios para respaldar a las $timestamp" -ForegroundColor Yellow
}

# Crear log del respaldo
$logFile = "C:\ODDY_Market\backup-log.txt"
$logEntry = "$timestamp - Respaldo ejecutado. Cambios: $(if ($status) { 'Sí' } else { 'No' })"
Add-Content -Path $logFile -Value $logEntry

Write-Host "Log guardado en: $logFile" -ForegroundColor Cyan
