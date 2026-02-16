# 📋 Plan de Organización y Clasificación de Módulos

## 🎯 Objetivo
Organizar, probar y clasificar todos los módulos del backend, manteniendo solo los que funcionan correctamente.

---

## 📁 Estructura de Carpetas

```
supabase/functions/server/
├── modules_organization/
│   ├── active/          # Módulos activos y probados ✅
│   ├── testing/         # Módulos en proceso de prueba 🔄
│   ├── archive/         # Módulos archivados/obsoletos 📦
│   ├── unused/          # Módulos no utilizados 🗑️
│   └── backup_original/ # Backup de todos los módulos originales 💾
└── [módulos actuales]   # Se moverán según clasificación
```

---

## 📊 Estado Actual de Módulos

### ✅ Módulos ACTIVOS (18) - Importados en index.tsx
Estos módulos están actualmente en uso:

1. `system.tsx` ✅
2. `entities.tsx` ✅
3. `parties.tsx` ✅
4. `products.tsx` ✅
5. `orders.tsx` ✅
6. `cart.tsx` ✅
7. `auth.tsx` ✅
8. `users.tsx` ✅
9. `billing.tsx` ✅
10. `pos.tsx` ✅
11. `customs.tsx` ✅
12. `fulfillment.tsx` ✅
13. `documents.tsx` ✅
14. `library.tsx` ✅
15. `shipping.tsx` ✅
16. `inventory.tsx` ✅
17. `categories.tsx` ✅
18. `integrations.tsx` ✅

### 🔄 Módulos para PROBAR (25)
Estos módulos existen pero NO están importados:

1. `analytics.tsx` - Analíticas
2. `api_keys.tsx` - API Keys
3. `audit.tsx` - Auditoría
4. `automation.tsx` - Automatización
5. `backups.tsx` - Backups
6. `crm.tsx` - CRM
7. `departments.tsx` - Departamentos
8. `documentation.tsx` - Documentación
9. `erp.tsx` - ERP
10. `help.tsx` - Ayuda
11. `mailing.tsx` - Email Marketing
12. `marketing.tsx` - Marketing
13. `notifications.tsx` - Notificaciones
14. `provider.tsx` - Proveedores
15. `reports.tsx` - Reportes
16. `settings.tsx` - Configuración
17. `social.tsx` - Redes Sociales
18. `support.tsx` - Soporte
19. `webhooks.tsx` - Webhooks
20. `wheel.tsx` - Ruleta Promocional
21. `kv_store.tsx` ⚠️ (sin commit)
22. `ocr.tsx` ⚠️ (sin commit)
23. `qr-barcode.tsx` ⚠️ (sin commit)
24. `sales.tsx` ⚠️ (sin commit)

---

## 🔄 Proceso de Organización

### FASE 1: Backup Inicial ✅
- [x] Crear estructura de carpetas
- [ ] Hacer backup de todos los módulos actuales
- [ ] Documentar estado inicial

### FASE 2: Mover Módulos Activos
- [ ] Mover módulos activos a `active/`
- [ ] Verificar que `index.tsx` sigue funcionando
- [ ] Probar endpoints básicos

### FASE 3: Probar Módulos No Activos
Para cada módulo en `testing/`:
1. **Revisar código:**
   - Verificar imports
   - Verificar dependencias
   - Verificar estructura

2. **Probar funcionalidad:**
   - Importar en `index.tsx` temporalmente
   - Probar endpoints básicos
   - Verificar que no rompe otros módulos

3. **Clasificar:**
   - ✅ **ACTIVO** → Mover a `active/` y agregar a `index.tsx`
   - ❌ **NO FUNCIONA** → Mover a `archive/`
   - ⏸️ **INCOMPLETO** → Dejar en `testing/` con notas
   - 🗑️ **NO NECESARIO** → Mover a `unused/`

### FASE 4: Limpieza Final
- [ ] Eliminar módulos de `unused/` (o mover a backup)
- [ ] Documentar módulos en `archive/`
- [ ] Actualizar `index.tsx` con solo módulos activos
- [ ] Crear documentación final

---

## 📝 Checklist de Pruebas por Módulo

Para cada módulo, verificar:

- [ ] **Sintaxis:** ¿Compila sin errores?
- [ ] **Imports:** ¿Todas las dependencias existen?
- [ ] **Endpoints:** ¿Los endpoints responden?
- [ ] **Errores:** ¿Hay errores en consola?
- [ ] **Integración:** ¿Funciona con otros módulos?
- [ ] **Documentación:** ¿Tiene documentación?

---

## 🚀 Comandos Útiles

### Mover módulo a testing
```powershell
Move-Item "supabase/functions/server/modulo.tsx" "supabase/functions/server/modules_organization/testing/"
```

### Mover módulo a active
```powershell
Move-Item "supabase/functions/server/modules_organization/testing/modulo.tsx" "supabase/functions/server/modules_organization/active/"
```

### Restaurar desde backup
```powershell
Copy-Item "supabase/functions/server/modules_organization/backup_original/modulo.tsx" "supabase/functions/server/"
```

---

## 📊 Resultado Esperado

Al final del proceso:
- ✅ Solo módulos probados y funcionales en `active/`
- ✅ `index.tsx` limpio con solo módulos activos
- ✅ Módulos no usados organizados en carpetas
- ✅ Backup completo de todo el código original
- ✅ Documentación actualizada

---

**¿Empezamos con el backup y luego movemos los módulos activos?**
