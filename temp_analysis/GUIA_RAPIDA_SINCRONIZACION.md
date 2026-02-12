# Guía Rápida: Sistema de Sincronización y Gestión Avanzada

## 🚀 Inicio Rápido

### 1. Acceder al Sistema
```
AdminDashboard → ERP → "Productos Avanzado"
```

### 2. Crear un Producto con Información Automática

1. Click en **"Nuevo Producto"**
2. Click en **"Buscar Información"**
3. Ingresar nombre, SKU o código de barras
4. Revisar resultados y seleccionar el más adecuado
5. Click en **"Aceptar y Aplicar"**
6. Verificar que los datos se aplicaron correctamente

### 3. Configurar Múltiples Precios

```
Ejemplo: Producto "Laptop HP 15"

Precio 1: Principal
- Tipo: Principal
- Monto: $45,000
- Fecha inicio: 2025-02-11
- Fecha fin: (vacío = indefinido)
- Estado: ✓ Activo

Precio 2: Oferta
- Tipo: Oferta
- Monto: $39,990
- Fecha inicio: 2025-02-11
- Fecha fin: 2025-02-28
- Estado: ✓ Activo

Precio 3: Alternativo
- Tipo: Alternativo
- Monto: $42,500
- Fecha inicio: 2025-03-01
- Fecha fin: 2025-03-31
- Estado: ✓ Activo
```

**Agregar más precios**: Click en "Agregar Precio" (máximo 9)

### 4. Configurar Sincronización por Canal

#### Opción 1: Sincronización Completa
- ✓ Marcar **"Sincronización Completa"**
- Esto activará automáticamente todos los canales

#### Opción 2: Sincronización Selectiva
```
Para un producto de alta rotación:
✓ Mercado Libre
✓ Facebook Shops
✓ Instagram Shopping
✓ WhatsApp Business

Para un producto exclusivo:
✓ Instagram Shopping
□ Mercado Libre
□ Facebook Shops
□ WhatsApp Business
```

### 5. Guardar Producto
Click en **"Guardar Producto"**

---

## 🔄 Sincronizar Catálogos

### Acceso
```
AdminDashboard → ERP → "Sincronización Catálogos"
```

### Dashboard de Sincronización
Verás:
- 📊 **Total Productos**: Todos los productos en el sistema
- ✅ **Sincronizados**: Productos que están en al menos un canal
- ⏳ **Pendientes**: Productos que nunca se sincronizaron
- ❌ **Errores**: Productos con errores de sincronización

### Sincronizar un Canal Individual
1. Localizar el canal (ej: "Facebook Shops")
2. Verificar que esté **Activo**
3. Click en **"Sincronizar"**
4. Esperar confirmación de éxito

### Sincronizar Todos los Canales
Click en **"Sincronizar Todo"** (botón naranja superior derecho)

### Activar/Desactivar un Canal
Click en el badge **"Activo"** o **"Inactivo"** del canal deseado

---

## 📦 Acciones por Lote

### Ejemplo 1: Aumentar Precios 10%

1. Click en **"Acciones por Lote"**
2. Seleccionar productos (checkbox en cada producto)
   - O usar **"Seleccionar todo"**
3. Click en **"Acciones en lote"**
4. Seleccionar acción: **"Actualizar Precio"**
5. Configurar:
   - Tipo de Precio: **Principal**
   - Acción: **Aumentar %**
   - Valor: **10**
6. Click en **"Aplicar a X elemento(s)"**

### Ejemplo 2: Activar Facebook Shops en Múltiples Productos

1. Seleccionar productos deseados
2. Click en **"Acciones en lote"**
3. Seleccionar acción: **"Sincronización"**
4. Marcar: ✓ **Facebook Shops**
5. Aplicar

### Ejemplo 3: Cambiar Categoría en Lote

1. Seleccionar productos de electrónica
2. Acciones en lote → **"Cambiar Categoría"**
3. Seleccionar: **Electrónica**
4. Aplicar

### Ejemplo 4: Ajustar Stock Masivamente

1. Seleccionar productos
2. Acciones en lote → **"Ajustar Stock"**
3. Configurar:
   - Acción: **Agregar**
   - Cantidad: **50**
4. Aplicar (agrega 50 unidades a cada producto)

---

## 🔍 Usar el Buscador de Información

### Caso de Uso: Agregar Producto Nuevo Sin Información

1. Nuevo Producto
2. Click en **"Buscar Información"**
3. Ingresar: "iPhone 15 Pro Max 256GB"
4. Click en **"Buscar"**
5. Ver resultados:
   - Imagen del producto
   - Descripción completa
   - Especificaciones técnicas
   - Precios de referencia
   - Tags sugeridas
6. Seleccionar el resultado más apropiado
7. Click en **"Aceptar y Aplicar"**
8. Revisar datos autocompletados
9. Ajustar si es necesario
10. Guardar

---

## 📊 Monitoreo de Sincronización

### Ver Estado de Sincronización de un Producto
En la tarjeta del producto, verás badges:
- **ML** = Sincronizado con Mercado Libre
- **FB** = Sincronizado con Facebook Shops
- **IG** = Sincronizado con Instagram Shopping
- **WA** = Sincronizado con WhatsApp Business

### Ver Última Sincronización
```
AdminDashboard → ERP → "Sincronización Catálogos"
```
Cada canal muestra:
- "Última sincronización: [fecha y hora]"

---

## 🎯 Flujos Completos

### Flujo 1: Producto Nuevo con Alta en Todos los Canales

```
1. Nuevo Producto
2. Buscar Información → "Zapatillas Nike Air Max"
3. Aceptar información encontrada
4. Configurar 3 precios:
   - Principal: $8,500
   - Oferta: $7,650 (10% off, válido 15 días)
   - Alternativo: $8,000 (precio cliente frecuente)
5. Marcar "Sincronización Completa"
6. Guardar
7. Ir a "Sincronización Catálogos"
8. Sincronizar Todo
9. Verificar que aparece en los 4 canales
```

### Flujo 2: Actualización Masiva de Precios de Temporada

```
1. Productos Avanzado
2. Filtrar por categoría: "Ropa de Verano"
3. Acciones por Lote
4. Seleccionar todos los productos de verano
5. Actualizar Precio → Oferta
6. Aumentar % → -25 (descuento 25%)
7. Aplicar
8. Ir a Sincronización Catálogos
9. Sincronizar Todo
10. Los nuevos precios se actualizan en todos los canales
```

### Flujo 3: Ocultar Productos Sin Stock de Canales Online

```
1. Productos Avanzado
2. Seleccionar productos con stock = 0
3. Acciones por Lote → Visibilidad → Oculto
4. Aplicar
5. Sincronización Catálogos → Sincronizar Todo
6. Productos con stock 0 ya no aparecen en tiendas online
```

---

## ⚙️ Configuración Avanzada

### Configurar Sincronización Automática

```
Sincronización Catálogos → ⚙️ Configuración

Opciones:
- Manual (por defecto)
- Cada hora
- Diaria (recomendado)
- Semanal

✓ Notificar errores de sincronización
✓ Sincronizar solo productos con stock
```

### Mejores Prácticas

1. **Precios**:
   - Siempre tener un precio Principal activo
   - Usar fechas en Ofertas para automatizar promociones
   - Crear Alternativos para segmentos de clientes

2. **Sincronización**:
   - Activar solo canales que realmente uses
   - Sincronizar después de cambios masivos
   - Revisar errores de sincronización regularmente

3. **Búsqueda de Información**:
   - Usar SKU o código de barras para mejores resultados
   - Siempre validar información antes de aceptar
   - Complementar con datos propios

4. **Acciones por Lote**:
   - Probar primero con 1-2 productos
   - Usar filtros para seleccionar grupos específicos
   - Hacer backup antes de cambios masivos

---

## 🐛 Solución de Problemas

### Problema: No encuentra información del producto
**Solución**: 
- Probar con SKU o código de barras
- Buscar por modelo o nombre genérico
- Completar manualmente si no hay resultados

### Problema: Error al sincronizar
**Solución**:
- Verificar que el canal esté activo
- Revisar que el producto tenga todos los campos requeridos
- Ver logs en consola del navegador

### Problema: Precio no se actualiza en canal
**Solución**:
- Verificar que el precio esté activo
- Sincronizar manualmente el canal
- Revisar que el producto esté marcado para ese canal

---

## 📞 Soporte

Para más información sobre integraciones específicas con cada canal:
- **Facebook Shops**: https://developers.facebook.com/docs/commerce-platform
- **Instagram Shopping**: https://help.instagram.com/1187859655048322
- **WhatsApp Business**: https://business.whatsapp.com/products/catalog
- **Mercado Libre**: Ya implementado con autenticación OAuth
