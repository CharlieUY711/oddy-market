# Sistema de Respaldo Automático - ODDY Market

Este proyecto incluye un sistema de respaldo automático por hora para proteger el código.

## 📋 Archivos del Sistema

- `scripts/auto-backup-hourly.ps1` - Script que se ejecuta cada hora automáticamente
- `scripts/setup-hourly-backup.ps1` - Script para configurar la tarea programada (ejecutar UNA VEZ)
- `scripts/backup-manual.ps1` - Script para hacer respaldo manual cuando lo necesites

## 🚀 Configuración Inicial (Una sola vez)

1. **Abrir PowerShell como Administrador**
   - Clic derecho en PowerShell → "Ejecutar como Administrador"

2. **Ejecutar el script de configuración:**
   ```powershell
   cd C:\ODDY_Market
   .\scripts\setup-hourly-backup.ps1
   ```

3. **Verificar que se creó la tarea:**
   ```powershell
   Get-ScheduledTask -TaskName "ODDY_Market_AutoBackup_Hourly"
   ```

## ⏰ Funcionamiento

- **Automático**: Cada hora se ejecuta un commit automático si hay cambios
- **Mensaje de commit**: `Auto-backup: YYYY-MM-DD HH:mm:ss`
- **Log**: Se guarda en `backup-log.txt` en la raíz del proyecto

## 🔧 Respaldo Manual

Si necesitas hacer un respaldo inmediato:

```powershell
cd C:\ODDY_Market
.\scripts\backup-manual.ps1
```

Este script te preguntará si quieres hacer commit y si quieres subir los cambios al repositorio remoto.

## 📊 Ver Historial de Respaldos

```powershell
# Ver commits de respaldo automático
git log --grep="Auto-backup" --oneline

# Ver log de respaldos
cat backup-log.txt
```

## 🛠️ Gestión de la Tarea Programada

### Ver estado de la tarea:
```powershell
Get-ScheduledTask -TaskName "ODDY_Market_AutoBackup_Hourly" | Format-List
```

### Deshabilitar temporalmente:
```powershell
Disable-ScheduledTask -TaskName "ODDY_Market_AutoBackup_Hourly"
```

### Habilitar nuevamente:
```powershell
Enable-ScheduledTask -TaskName "ODDY_Market_AutoBackup_Hourly"
```

### Eliminar la tarea:
```powershell
Unregister-ScheduledTask -TaskName "ODDY_Market_AutoBackup_Hourly" -Confirm:$false
```

## ⚠️ Notas Importantes

1. **Los commits automáticos NO hacen push automáticamente** por seguridad
2. Si quieres que los respaldos se suban automáticamente, edita `auto-backup-hourly.ps1` y descomenta la línea `git push origin main`
3. Los respaldos se guardan en el repositorio Git local
4. El log de respaldos se guarda en `backup-log.txt`

## 🔍 Recuperar Versión de Hace X Horas

Una vez configurado el sistema, podrás recuperar versiones anteriores usando:

```powershell
# Ver commits de las últimas 24 horas
git log --since="24 hours ago" --oneline

# Ver commits de hace 9 horas
git log --since="9 hours ago" --until="8 hours ago" --oneline

# Restaurar a un commit específico
git checkout <commit-hash>
```

## 📝 Ejemplo de Uso

```powershell
# 1. Configurar (una vez)
.\scripts\setup-hourly-backup.ps1

# 2. Hacer respaldo manual ahora
.\scripts\backup-manual.ps1

# 3. Ver respaldos de hoy
git log --since="today" --grep="Auto-backup" --oneline

# 4. Restaurar a un respaldo específico
git log --oneline -10  # Ver últimos 10 commits
git checkout <hash-del-commit>  # Restaurar a ese commit
```
