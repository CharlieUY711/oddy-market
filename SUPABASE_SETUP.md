# 🗄️ Setup de Base de Datos - Supabase

## Paso a Paso para Crear las Tablas

### 1. Abrir SQL Editor en Supabase

1. Ve a: https://app.supabase.com/project/yomgqobfmgatavnbtvdz/sql
2. Click en **"New query"** (o usa el editor existente)

---

### 2. Copiar y Ejecutar el Script SQL

**Opción A: Copiar desde el archivo**
1. Abre el archivo `supabase/schema.sql`
2. Copia TODO el contenido
3. Pégalo en el SQL Editor de Supabase
4. Click en **"Run"** (▶️) o presiona `Ctrl+Enter`

**Opción B: Copiar desde aquí**

```sql
-- Copia TODO el contenido del archivo supabase/schema.sql
-- y pégalo en el SQL Editor
```

---

### 3. Verificar que las Tablas se Crearon

Después de ejecutar el script, verás:

```
Success. No rows returned
```

**Verificar en el Table Editor:**
1. Ve a: https://app.supabase.com/project/yomgqobfmgatavnbtvdz/editor
2. Deberías ver estas tablas:
   - ✅ `products` (con 12 productos de ejemplo)
   - ✅ `orders`
   - ✅ `order_items`
   - ✅ `favorites`

---

### 4. Verificar los Datos de Ejemplo

1. Click en la tabla `products`
2. Deberías ver 12 productos
3. Si no ves datos, ejecuta solo la parte de INSERT del script

---

## 🔒 Seguridad (RLS - Row Level Security)

Todas las tablas tienen **RLS habilitado** con estas políticas:

### Products
- ✅ **Todos** pueden ver productos (público)
- ⚠️ Solo usuarios **autenticados** pueden crear/editar

### Orders
- ✅ Los usuarios solo ven **sus propios pedidos**
- ⚠️ No pueden ver pedidos de otros usuarios

### Favorites
- ✅ Los usuarios solo ven **sus propios favoritos**
- ✅ Pueden agregar/eliminar sus favoritos

---

## ✅ Verificación Final

Una vez creadas las tablas, ve a:

**http://localhost:3000/test**

Y ejecuta los tests nuevamente. Ahora deberías ver:

```
✅ Todo funcionando correctamente
```

---

## 🆘 Troubleshooting

### Error: "permission denied for schema public"
**Solución:** Verifica que estés usando la conexión correcta. Supabase Free tier tiene permisos completos.

### Error: "relation already exists"
**Solución:** Las tablas ya existen. Puedes:
1. Eliminarlas y volver a crearlas
2. O simplemente continuar (está bien)

**Para eliminar todas las tablas y empezar de cero:**
```sql
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.favorites CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
```

Luego ejecuta el schema.sql nuevamente.

---

## 📊 Estructura de Datos

### Tabla: products
```
id              → ID único
name            → Nombre del producto
description     → Descripción
price           → Precio (decimal)
image           → URL de la imagen
category        → Categoría
discount        → Descuento (%)
rating          → Calificación (1-5)
stock           → Stock disponible
created_at      → Fecha de creación
updated_at      → Última actualización
```

### Tabla: orders
```
id                  → ID único
user_id             → ID del usuario (auth.users)
total               → Total del pedido
status              → Estado (pending, confirmed, shipped, delivered)
shipping_address    → Dirección de envío
shipping_city       → Ciudad
shipping_zip        → Código postal
payment_method      → Método de pago
created_at          → Fecha de creación
updated_at          → Última actualización
```

### Tabla: order_items
```
id          → ID único
order_id    → ID del pedido
product_id  → ID del producto
quantity    → Cantidad
price       → Precio al momento de la compra
created_at  → Fecha de creación
```

### Tabla: favorites
```
id          → ID único
user_id     → ID del usuario
product_id  → ID del producto
created_at  → Fecha de creación
```

---

¿Dudas? Revisa la documentación de Supabase: https://supabase.com/docs
