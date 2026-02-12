# 🔐 Acceso al Backend - ODDY Market

## 🗄️ Supabase Dashboard

### URLs de Acceso Rápido

#### 1. Dashboard Principal
https://app.supabase.com/project/yomgqobfmgatavnbtvdz

#### 2. Table Editor (Ver/Editar Datos)
https://app.supabase.com/project/yomgqobfmgatavnbtvdz/editor

#### 3. SQL Editor (Ejecutar Queries)
https://app.supabase.com/project/yomgqobfmgatavnbtvdz/sql

#### 4. Authentication (Gestión de Usuarios)
https://app.supabase.com/project/yomgqobfmgatavnbtvdz/auth/users

#### 5. Storage (Archivos/Imágenes)
https://app.supabase.com/project/yomgqobfmgatavnbtvdz/storage/buckets

#### 6. API Settings (Keys y URLs)
https://app.supabase.com/project/yomgqobfmgatavnbtvdz/settings/api

---

## 📊 Gestión de Productos

### Ver Productos
1. Ve a: https://app.supabase.com/project/yomgqobfmgatavnbtvdz/editor
2. Click en la tabla **`products`**
3. Verás todos los productos

### Agregar Producto
1. En la tabla `products`, click en **"Insert"** → **"Insert row"**
2. Completa los campos:
   - **name:** Nombre del producto
   - **description:** Descripción
   - **price:** Precio (número sin decimales para UYU)
   - **image:** URL de la imagen
   - **category:** Categoría
   - **discount:** Descuento en % (0 si no tiene)
   - **rating:** Calificación de 1-5
   - **stock:** Cantidad disponible
3. Click en **"Save"**

### Editar Producto
1. Busca el producto en la tabla
2. Click en el **icono de lápiz** ✏️
3. Modifica los campos
4. Click en **"Save"**

### Eliminar Producto
1. Busca el producto en la tabla
2. Click en el **icono de basura** 🗑️
3. Confirma la eliminación

---

## 📋 Gestión de Pedidos

### Ver Pedidos
1. Ve a la tabla **`orders`**
2. Verás todos los pedidos

### Ver Items de un Pedido
1. Ve a la tabla **`order_items`**
2. Filtra por `order_id` para ver los items de un pedido específico

---

## 👥 Gestión de Usuarios

### Ver Usuarios Registrados
https://app.supabase.com/project/yomgqobfmgatavnbtvdz/auth/users

### Crear Usuario Manualmente
1. Ve a: Authentication → Users
2. Click en **"Add user"**
3. Completa email y password
4. Click en **"Create user"**

---

## 🔍 Ejecutar Queries SQL

### URL del SQL Editor
https://app.supabase.com/project/yomgqobfmgatavnbtvdz/sql

### Ejemplos de Queries Útiles

#### Ver todos los productos con descuento
```sql
SELECT * FROM products
WHERE discount > 0
ORDER BY discount DESC;
```

#### Ver pedidos del último mes
```sql
SELECT * FROM orders
WHERE created_at > NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;
```

#### Ver productos más vendidos
```sql
SELECT 
  p.name,
  SUM(oi.quantity) as total_vendido
FROM products p
JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name
ORDER BY total_vendido DESC
LIMIT 10;
```

#### Actualizar stock de un producto
```sql
UPDATE products
SET stock = stock - 1
WHERE id = 1;
```

#### Agregar producto rápido
```sql
INSERT INTO products (name, description, price, category, stock, image)
VALUES (
  'Nuevo Producto',
  'Descripción del producto',
  1990,
  'Tecnología',
  10,
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
);
```

---

## 🔐 Credenciales API

### URL del Proyecto
```
https://yomgqobfmgatavnbtvdz.supabase.co
```

### Anon Key (Pública - Frontend)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvbWdxb2JmbWdhdGF2bmJ0dmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MzAzMTksImV4cCI6MjA4NjAwNjMxOX0.yZ9Zb6Jz9BKZTkn7Ld8TzeLyHsb8YhBAoCvFLPBiqZk
```

### Service Role Key (Privada - Backend Only)
⚠️ **NUNCA expongas esta key en el frontend**
Ver en: https://app.supabase.com/project/yomgqobfmgatavnbtvdz/settings/api

---

## 📊 Monitoring

### Ver Logs en Tiempo Real
https://app.supabase.com/project/yomgqobfmgatavnbtvdz/logs/explorer

### Ver Uso de Base de Datos
https://app.supabase.com/project/yomgqobfmgatavnbtvdz/reports/database

### Ver Tráfico API
https://app.supabase.com/project/yomgqobfmgatavnbtvdz/reports/api

---

## 🆘 Troubleshooting

### Error: "Row Level Security" impide operación

**Problema:** No puedes insertar/actualizar datos.

**Solución 1 (Temporal - Solo para testing):**
```sql
-- Deshabilitar RLS temporalmente
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
```

**Solución 2 (Recomendado):**
- Autentícate en tu aplicación
- O crea políticas RLS más permisivas

### No puedo ver las tablas

**Solución:**
1. Verifica que estás en el proyecto correcto
2. Ve a Table Editor y refresca la página
3. Si no aparecen, ejecuta el schema.sql nuevamente

---

## 📱 Supabase en el Celular

Puedes acceder a Supabase desde cualquier dispositivo:
- Mismo URL: https://app.supabase.com/
- Totalmente responsive
- Edita datos desde donde estés

---

## 🔗 Links Rápidos de Documentación

- **Supabase Docs:** https://supabase.com/docs
- **SQL Tutorial:** https://supabase.com/docs/guides/database
- **Row Level Security:** https://supabase.com/docs/guides/auth/row-level-security
- **Realtime:** https://supabase.com/docs/guides/realtime

---

**Última actualización:** 2026-02-12
