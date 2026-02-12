# 🚀 ODDY Market - Backend API

API Server para ODDY Market construido con Deno + Hono.

---

## ⚡ Inicio Rápido

### **Windows:**

```bash
start-server.bat
```

### **Mac/Linux:**

```bash
cd supabase/functions
deno run --allow-all --watch server/index.tsx
```

El servidor estará disponible en: **http://localhost:8000**

---

## 🧪 Probar que Funciona

```bash
curl http://localhost:8000/
```

**Respuesta esperada:**

```json
{
  "status": "ok",
  "message": "ODDY Market API Server",
  "version": "1.0.0",
  "modules": ["parties", "products", "orders", "inventory", "categories", "integrations"]
}
```

---

## 📦 Módulos Implementados

| Módulo | Estado | Endpoints | Descripción |
|--------|--------|-----------|-------------|
| **parties** | ✅ | 14 | Personas y Organizaciones (clientes, proveedores) |
| **products** | ✅ | 12 | Artículos con 3 niveles, variantes, trazabilidad |
| **orders** | ✅ | 10 | Pedidos con estados, tracking, facturación |
| **inventory** | ✅ | 8 | Stock, alertas, movimientos, FIFO |
| **categories** | ✅ | 8 | Categorías jerárquicas, atributos, mapeo |
| **integrations** | ✅ | 18 | ML, FB, IG, WA, Google, Couriers (FedEx, UPS, DHL, etc) |
| **entities** | ✅ | 8 | Multi-tenant (entidades, territorios) |
| **cart** | ✅ | 9 | Carrito de compras con totales y cupones |
| **auth** | ✅ | 7 | Autenticación (registro, login, reset) |
| **users** | ✅ | 9 | Usuarios con RBAC y permisos |
| **documents** | ✅ | 34 | Documentos + Tickets + E-Invoice + Etiquetas + Emotivas |
| **library** | ✅ | 9 | Almacenamiento de archivos + OCR |
| **shipping** | ✅ | 9 | Envíos + GPS + Google Maps + Tracking |
| billing | ⚪ | - | Próximamente |
| fulfillment | ⚪ | - | Próximamente |

---

## 📚 Documentación

- **Parties API**: `PARTIES_API_DOCUMENTACION.md`
- **Instrucciones de Prueba**: `INSTRUCCIONES_PROBAR_PARTIES.md`
- **Lista de Módulos**: `LISTA_COMPLETA_37_MODULOS_BACKEND.md`
- **Arquitectura**: `ARQUITECTURA_PARTIES_UNICA.md`

---

## 🔧 Endpoints Principales

### **Parties (Personas y Organizaciones)**

```bash
# Crear party
POST /make-server-0dd48dc4/parties

# Listar parties
GET /make-server-0dd48dc4/parties?entity_id=default

# Buscar
GET /make-server-0dd48dc4/parties/search?q=juan

# Dashboard
GET /make-server-0dd48dc4/parties/dashboard?entity_id=default
```

### **Products (Artículos)**

```bash
# Crear artículo
POST /make-server-0dd48dc4/articles

# Listar artículos
GET /make-server-0dd48dc4/articles?entity_id=default

# Búsqueda exhaustiva
GET /make-server-0dd48dc4/articles/search?q=camiseta
```

### **Orders (Pedidos)**

```bash
# Crear pedido
POST /make-server-0dd48dc4/orders

# Listar pedidos
GET /make-server-0dd48dc4/orders?entity_id=default

# Reportes
GET /make-server-0dd48dc4/orders/reports/sales
```

---

## 🗄️ Base de Datos

### **Ejecutar Migraciones**

#### **Opción A: Supabase Dashboard**

1. Abre tu proyecto en **Supabase Dashboard**
2. Ve a **SQL Editor**
3. Ejecuta las migraciones en orden:
   - `supabase/migrations/001_entities.sql` (si existe)
   - `supabase/migrations/002_parties.sql`

#### **Opción B: CLI**

```bash
cd supabase
supabase db push
```

---

## 🧪 Ejemplo de Uso Completo

### **1. Crear un Cliente**

```bash
curl -X POST http://localhost:8000/make-server-0dd48dc4/parties \
  -H "Content-Type: application/json" \
  -d '{
    "entity_id": "default",
    "type": "PERSON",
    "person_data": {
      "first_name": "Juan",
      "last_name": "Pérez"
    },
    "contact": {
      "email": "juan@email.com",
      "phone": "+598 99 123 456"
    },
    "roles": ["CUSTOMER"],
    "context_data": {
      "customer": {
        "credit_limit": 50000
      }
    }
  }'
```

### **2. Listar Clientes**

```bash
curl "http://localhost:8000/make-server-0dd48dc4/parties/customers?entity_id=default"
```

### **3. Ver Dashboard**

```bash
curl "http://localhost:8000/make-server-0dd48dc4/parties/dashboard?entity_id=default"
```

---

## 🐛 Troubleshooting

### **Error: "Cannot find module"**

Asegúrate de estar en la carpeta correcta:

```bash
cd supabase/functions
deno run --allow-all server/index.tsx
```

### **Error: "Address already in use"**

El puerto 8000 está ocupado. Detén cualquier proceso usando el puerto:

**Windows:**
```bash
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:8000 | xargs kill -9
```

### **Error: "Party not found"**

Verifica que hayas ejecutado las migraciones SQL en Supabase.

---

## 📊 Estructura del Proyecto

```
supabase/
├── functions/
│   ├── server/
│   │   ├── index.tsx          ← Servidor principal
│   │   ├── parties.tsx        ← Módulo parties (850 líneas)
│   │   ├── products.tsx       ← Módulo products (645 líneas)
│   │   ├── orders.tsx         ← Módulo orders (472 líneas)
│   │   ├── inventory.tsx      ← Módulo inventory (467 líneas)
│   │   ├── categories.tsx     ← Módulo categories (525 líneas)
│   │   └── integrations.tsx   ← Módulo integrations (566 líneas)
│   └── deno.json              ← Configuración Deno
├── migrations/
│   └── 002_parties.sql        ← Schema SQL parties
└── ...

start-server.bat               ← Iniciar servidor (Windows)
```

---

## 🚀 Próximos Pasos

1. ✅ **Probar el módulo Parties**
2. ⚪ Implementar `cart.tsx` (Carrito)
3. ⚪ Implementar `auth.tsx` (Autenticación)
4. ⚪ Implementar `users.tsx` (Usuarios y RBAC)
5. ⚪ Implementar `billing.tsx` (Facturación)

---

## 💬 Soporte

¿Problemas o dudas? Consulta:
- `INSTRUCCIONES_PROBAR_PARTIES.md` - Guía paso a paso
- `PARTIES_API_DOCUMENTACION.md` - Documentación completa de API
- `LISTA_COMPLETA_37_MODULOS_BACKEND.md` - Lista de todos los módulos

---

## 📝 Notas Técnicas

- **Runtime**: Deno 1.40+
- **Framework**: Hono 3.11+
- **Database**: Supabase (PostgreSQL + KV)
- **Auth**: Supabase Auth (JWT)
- **Storage**: Deno KV (development) / Supabase (production)

---

**¡Listo para empezar! 🎉**
