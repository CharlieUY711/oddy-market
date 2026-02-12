# 🚀 Deploy Backend ODDY Market con Deno Deploy

**Tiempo estimado:** 5 minutos  
**Costo:** GRATIS (hasta 100K requests/día)

---

## 📋 Pasos para Deploy

### **1. Conectar GitHub con Deno Deploy**

1. Ve a: **https://dash.deno.com/new**
2. Haz clic en **"Sign in with GitHub"**
3. Autoriza Deno Deploy

---

### **2. Crear Nuevo Proyecto**

1. En el dashboard, haz clic en **"New Project"**
2. Selecciona tu repositorio: **`CharlieUY711/oddy-market`**
3. Configuración:
   - **Branch:** `main`
   - **Entry Point:** `supabase/functions/server/index.tsx`
   - **Environment Variables:** (ninguna por ahora)

4. Haz clic en **"Deploy Project"**

---

### **3. Esperar Deploy (1-2 minutos)**

Verás el proceso de build en tiempo real:
```
✓ Downloading dependencies...
✓ Building project...
✓ Deploying to edge...
✓ Success!
```

---

### **4. Obtener URL de Producción**

Tu backend estará disponible en:
```
https://tu-proyecto.deno.dev
```

Ejemplo:
```
https://oddy-market.deno.dev
```

---

## ✅ Verificar que Funciona

### **Test 1: Health Check**
```bash
curl https://tu-proyecto.deno.dev
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "message": "ODDY Market API Server",
  "version": "1.0.0",
  "modules": [
    "system", "entities", "parties", "products", "orders",
    "cart", "auth", "users", "billing", "pos", "customs",
    "fulfillment", "documents", "library", "shipping",
    "inventory", "categories", "integrations"
  ]
}
```

### **Test 2: Calcular IVA Uruguay**
```bash
curl -X POST https://tu-proyecto.deno.dev/make-server-0dd48dc4/system/taxes/calculate \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "country": "UY", "product_category": "goods"}'
```

### **Test 3: Crear Factura**
```bash
curl -X POST https://tu-proyecto.deno.dev/make-server-0dd48dc4/billing/invoices \
  -H "Content-Type: application/json" \
  -d '{"entity_id": "default", "customer": {"name": "Juan Perez"}, "items": [{"description": "Producto A", "quantity": 2, "unit_price": 100}]}'
```

---

## 🔧 Variables de Entorno (Opcional)

Si necesitas configurar Supabase en producción:

1. En Deno Deploy Dashboard, ve a tu proyecto
2. Click en **"Settings"** → **"Environment Variables"**
3. Agrega:
   ```
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_ANON_KEY=tu-anon-key
   ```

---

## 🌍 Endpoints Disponibles

Una vez deployado, todos estos endpoints estarán disponibles:

### **SYSTEM (13 endpoints)**
- `POST /make-server-0dd48dc4/system/taxes/calculate`
- `POST /make-server-0dd48dc4/system/convert-currency`
- `POST /make-server-0dd48dc4/system/convert-unit`
- Y más...

### **BILLING (16 endpoints)**
- `POST /make-server-0dd48dc4/billing/invoices`
- `POST /make-server-0dd48dc4/billing/invoices/:id/payments`
- `GET /make-server-0dd48dc4/billing/dashboard`
- Y más...

### **POS (14 endpoints)**
- `POST /make-server-0dd48dc4/pos/registers`
- `POST /make-server-0dd48dc4/pos/shifts/open`
- `POST /make-server-0dd48dc4/pos/sales`
- Y más...

### **CUSTOMS (11 endpoints)**
- `POST /make-server-0dd48dc4/customs/declarations`
- `POST /make-server-0dd48dc4/customs/packing-list/generate`
- `POST /make-server-0dd48dc4/customs/calculate-duties`
- Y más...

### **FULFILLMENT (12 endpoints)**
- `POST /make-server-0dd48dc4/fulfillment/orders`
- `POST /make-server-0dd48dc4/fulfillment/orders/:id/pick-item`
- `POST /make-server-0dd48dc4/fulfillment/orders/:id/pack`
- Y más...

---

## 📊 Límites Gratuitos de Deno Deploy

| Recurso | Límite Gratuito |
|---------|----------------|
| Requests | 100,000 / día |
| CPU Time | 100 horas / mes |
| Bandwidth | 100 GB / mes |
| Storage | No incluido (usa KV) |

**Para ODDY Market:** Más que suficiente para desarrollo y pruebas

---

## 🔄 Auto-Deploy

Cada vez que hagas `git push` a `main`, Deno Deploy **automáticamente**:
1. Detecta los cambios
2. Rebuilds el proyecto
3. Deploya la nueva versión
4. Sin downtime

---

## 🚨 Troubleshooting

### **Error: "Module not found"**
✅ Verifica que el Entry Point sea: `supabase/functions/server/index.tsx`

### **Error: "Import error"**
✅ Deno Deploy soporta imports desde npm: con el prefijo `npm:`

### **Error: "KV not available"**
✅ Usa SimpleKV (ya configurado) o configura Deno KV en el dashboard

---

## 🎯 Siguientes Pasos

Una vez deployado:

1. ✅ Probar todos los endpoints con la guía: `PRUEBAS_MODULOS_NUEVOS.md`
2. ✅ Actualizar frontend para usar la URL de producción
3. ✅ Configurar dominio custom (opcional): `api.oddymarket.com`

---

## 💡 Ventajas de Deno Deploy

- ✅ **Global Edge Network** - Velocidad en todo el mundo
- ✅ **Auto-scaling** - Se escala automáticamente
- ✅ **Zero Config** - No necesitas configurar nada
- ✅ **Git Integration** - Deploy automático con cada push
- ✅ **TypeScript Native** - Soporte nativo para TypeScript
- ✅ **GRATIS** - 100K requests/día gratis

---

## 📝 URL Final

Anota tu URL aquí cuando termine el deploy:

```
https://_____________________.deno.dev
```

---

**¡Listo para deployar! 🚀**

1. Ve a: https://dash.deno.com/new
2. Conecta tu repo GitHub
3. Entry Point: `supabase/functions/server/index.tsx`
4. Deploy!

**En 2 minutos tendrás tu backend en producción** 🎉
