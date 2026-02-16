# Script de Organización de Módulos
# Este script ayuda a organizar y clasificar los módulos del backend

param(
    [string]$Action = "backup",  # backup, move-active, move-testing, restore
    [string]$Module = ""
)

$ServerPath = "C:\ODDY_Market\supabase\functions\server"
$OrgPath = Join-Path $ServerPath "modules_organization"
$BackupPath = Join-Path $OrgPath "backup_original"
$ActivePath = Join-Path $OrgPath "active"
$TestingPath = Join-Path $OrgPath "testing"
$ArchivePath = Join-Path $OrgPath "archive"
$UnusedPath = Join-Path $OrgPath "unused"

# Módulos activos (importados en index.tsx)
$ActiveModules = @(
    "system.tsx", "entities.tsx", "parties.tsx", "products.tsx",
    "orders.tsx", "cart.tsx", "auth.tsx", "users.tsx",
    "billing.tsx", "pos.tsx", "customs.tsx", "fulfillment.tsx",
    "documents.tsx", "library.tsx", "shipping.tsx", "inventory.tsx",
    "categories.tsx", "integrations.tsx"
)

# Módulos para probar
$TestingModules = @(
    "analytics.tsx", "api_keys.tsx", "audit.tsx", "automation.tsx",
    "backups.tsx", "crm.tsx", "departments.tsx", "documentation.tsx",
    "erp.tsx", "help.tsx", "mailing.tsx", "marketing.tsx",
    "notifications.tsx", "provider.tsx", "reports.tsx", "settings.tsx",
    "social.tsx", "support.tsx", "webhooks.tsx", "wheel.tsx",
    "kv_store.tsx", "ocr.tsx", "qr-barcode.tsx", "sales.tsx"
)

function Backup-AllModules {
    Write-Host "[BACKUP] Haciendo backup de todos los modulos..." -ForegroundColor Cyan
    
    if (-not (Test-Path $BackupPath)) {
        New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
    }
    
    Get-ChildItem -Path $ServerPath -Filter "*.tsx" -Exclude "index.tsx", "storage.tsx", "provider.tsx" | ForEach-Object {
        $dest = Join-Path $BackupPath $_.Name
        Copy-Item $_.FullName $dest -Force
        Write-Host "  [OK] Backup: $($_.Name)" -ForegroundColor Green
    }
    
    Write-Host "[OK] Backup completado en: $BackupPath" -ForegroundColor Green
}

function Move-ActiveModules {
    Write-Host "[MOVE] Moviendo modulos activos a active/..." -ForegroundColor Cyan
    
    if (-not (Test-Path $ActivePath)) {
        New-Item -ItemType Directory -Path $ActivePath -Force | Out-Null
    }
    
    foreach ($module in $ActiveModules) {
        $source = Join-Path $ServerPath $module
        if (Test-Path $source) {
            $dest = Join-Path $ActivePath $module
            Copy-Item $source $dest -Force
            Write-Host "  [OK] Movido: $module" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] No encontrado: $module" -ForegroundColor Yellow
        }
    }
    
    Write-Host "[OK] Modulos activos copiados a: $ActivePath" -ForegroundColor Green
}

function Move-TestingModules {
    Write-Host "[MOVE] Moviendo modulos a testing/..." -ForegroundColor Cyan
    
    if (-not (Test-Path $TestingPath)) {
        New-Item -ItemType Directory -Path $TestingPath -Force | Out-Null
    }
    
    foreach ($module in $TestingModules) {
        $source = Join-Path $ServerPath $module
        if (Test-Path $source) {
            $dest = Join-Path $TestingPath $module
            Copy-Item $source $dest -Force
            Write-Host "  [OK] Movido: $module" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] No encontrado: $module" -ForegroundColor Yellow
        }
    }
    
    Write-Host "[OK] Modulos de prueba copiados a: $TestingPath" -ForegroundColor Green
}

function Move-ModuleToCategory {
    param(
        [string]$ModuleName,
        [string]$Category  # active, testing, archive, unused
    )
    
    $CategoryPath = switch ($Category) {
        "active" { $ActivePath }
        "testing" { $TestingPath }
        "archive" { $ArchivePath }
        "unused" { $UnusedPath }
        default { Write-Host "[ERROR] Categoria invalida: $Category" -ForegroundColor Red; return }
    }
    
    if (-not (Test-Path $CategoryPath)) {
        New-Item -ItemType Directory -Path $CategoryPath -Force | Out-Null
    }
    
    # Buscar en todas las carpetas de organización
    $found = $false
    $searchPaths = @($ServerPath, $ActivePath, $TestingPath, $ArchivePath, $UnusedPath)
    
    foreach ($searchPath in $searchPaths) {
        $source = Join-Path $searchPath $ModuleName
        if (Test-Path $source) {
            $dest = Join-Path $CategoryPath $ModuleName
            Move-Item $source $dest -Force
            Write-Host "[OK] Movido $ModuleName a $Category/" -ForegroundColor Green
            $found = $true
            break
        }
    }
    
    if (-not $found) {
        Write-Host "[ERROR] No se encontro: $ModuleName" -ForegroundColor Red
    }
}

function Show-Status {
    Write-Host "`n[STATUS] Estado de Organizacion:" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Gray
    
    $categories = @{
        "Active" = $ActivePath
        "Testing" = $TestingPath
        "Archive" = $ArchivePath
        "Unused" = $UnusedPath
        "Backup" = $BackupPath
    }
    
    foreach ($cat in $categories.GetEnumerator()) {
        $count = 0
        if (Test-Path $cat.Value) {
            $count = (Get-ChildItem -Path $cat.Value -Filter "*.tsx" -ErrorAction SilentlyContinue).Count
        }
        Write-Host "  $($cat.Key): $count modulos" -ForegroundColor White
    }
    
    Write-Host "========================================`n" -ForegroundColor Gray
}

# Ejecutar acción
switch ($Action.ToLower()) {
    "backup" {
        Backup-AllModules
        Show-Status
    }
    "move-active" {
        Move-ActiveModules
        Show-Status
    }
    "move-testing" {
        Move-TestingModules
        Show-Status
    }
    "move" {
        if ($Module -and $Category) {
            Move-ModuleToCategory -ModuleName $Module -Category $Category
        } else {
            Write-Host "[ERROR] Uso: organize_modules.ps1 -Action move -Module 'modulo.tsx' -Category active" -ForegroundColor Red
        }
    }
    "status" {
        Show-Status
    }
    default {
        Write-Host "[ERROR] Accion no reconocida: $Action" -ForegroundColor Red
        Write-Host "`nAcciones disponibles:" -ForegroundColor Yellow
        Write-Host "  backup        - Hacer backup de todos los modulos"
        Write-Host "  move-active   - Copiar modulos activos a active/"
        Write-Host "  move-testing  - Copiar modulos a testing/"
        Write-Host "  status        - Mostrar estado de organizacion"
    }
}
