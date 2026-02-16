# Script para configurar el respaldo automático por hora en Windows
# Ejecuta este script UNA VEZ como Administrador para configurar la tarea programada

# Verificar si se está ejecutando como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: Este script debe ejecutarse como Administrador" -ForegroundColor Red
    Write-Host "Haz clic derecho en PowerShell y selecciona 'Ejecutar como Administrador'" -ForegroundColor Yellow
    exit 1
}

$taskName = "ODDY_Market_AutoBackup_Hourly"
$scriptPath = "C:\ODDY_Market\scripts\auto-backup-hourly.ps1"
$description = "Respaldo automático del código ODDY Market cada hora"

# Eliminar tarea existente si existe
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    Write-Host "Tarea existente eliminada" -ForegroundColor Yellow
}

# Crear la acción (ejecutar el script PowerShell)
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
    -Argument "-ExecutionPolicy Bypass -File `"$scriptPath`""

# Crear el trigger (cada hora)
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 1) -RepetitionDuration (New-TimeSpan -Days 365)

# Configurar para ejecutar aunque el usuario no esté conectado
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Highest

# Configurar settings
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# Registrar la tarea
Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Principal $principal `
    -Settings $settings `
    -Description $description `
    -Force

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "RESPALDO AUTOMÁTICO CONFIGURADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Tarea: $taskName" -ForegroundColor Cyan
Write-Host "Frecuencia: Cada hora" -ForegroundColor Cyan
Write-Host "Script: $scriptPath" -ForegroundColor Cyan
Write-Host "`nPara verificar la tarea, ejecuta:" -ForegroundColor Yellow
Write-Host "Get-ScheduledTask -TaskName '$taskName'" -ForegroundColor White
Write-Host "`nPara eliminar la tarea, ejecuta:" -ForegroundColor Yellow
Write-Host "Unregister-ScheduledTask -TaskName '$taskName' -Confirm:`$false" -ForegroundColor White
