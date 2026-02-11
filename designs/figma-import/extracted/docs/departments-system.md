# Sistema de Gestión de Departamentos y Categorías - ODDY Market

## 🏬 Descripción

Sistema completo de organización de productos por departamentos, categorías y subcategorías con:
- **15 departamentos predefinidos** con sus categorías
- **Mega menú responsive** desktop y mobile
- **Filtros avanzados** por departamento/categoría/subcategoría
- **Gestión completa** desde el panel de administración
- **Sistema expandible** para agregar nuevos departamentos

## 📋 Departamentos Incluidos

### 1. Alimentos 🍕
- Despensa (Pastas, Aceites, Conservas, Harinas)
- Snacks y Dulces
- Bebidas (Con y sin alcohol)
- Productos frescos
- Congelados
- Orgánicos y saludables

### 2. Higiene y Cuidado Personal 🧴
- Higiene corporal, dental y capilar
- Cuidado de la piel
- Afeitado y cuidado masculino
- Higiene femenina
- Protección solar

### 3. Tecnología 💻
- Celulares y accesorios
- Computación (Laptops, PCs, Periféricos)
- Audio y video
- Gaming
- Smart Home
- Fotografía

### 4. Accesorios 👜
- Carteras y bolsos
- Mochilas y billeteras
- Relojes y joyería
- Gafas

### 5. Home (Hogar) 🏠
- Cocina y organización
- Decoración
- Dormitorio y baño
- Iluminación
- Muebles pequeños

### 6. Herramientas 🔧
- Herramientas manuales y eléctricas
- Ferretería
- Seguridad y protección
- Jardinería

### 7. Electrodomésticos 🔌
- Línea blanca
- Pequeños electrodomésticos
- Climatización
- Cuidado de la ropa

### 8. Moda 👗
- Hombre, Mujer, Niños
- Calzado
- Ropa interior
- Accesorios de moda

### 9. Bebés y Niños 👶
- Maternidad y alimentación
- Higiene y cuidado
- Juguetes
- Ropa y mobiliario infantil

### 10. Deportes y Aire Libre ⚽
- Fitness y camping
- Ciclismo y natación
- Deportes de equipo
- Ropa deportiva

### 11. Mascotas 🐾
- Alimentos y juguetes
- Higiene y accesorios
- Salud

### 12. Automotriz 🚗
- Limpieza y cuidado
- Accesorios y electrónica
- Seguridad
- Repuestos básicos

### 13. Oficina y Papelería 📚
- Papelería e insumos
- Mobiliario
- Tecnología de oficina
- Arte y manualidades

### 14. Salud y Bienestar 💊
- Suplementos
- Aromaterapia
- Cuidado corporal
- Ortopedia ligera
- Bienestar emocional

### 15. Contenido Adulto 🔞
- Juguetes íntimos
- Lencería
- Accesorios
- **Nota**: Este departamento está oculto por defecto

## 🎯 Funcionalidades

### Panel de Administración

**Ubicación**: Panel Admin → Departamentos

**Características**:
- ✅ Vista de lista y grid
- ✅ Búsqueda en tiempo real
- ✅ Crear/editar/eliminar departamentos
- ✅ Agregar categorías y subcategorías ilimitadas
- ✅ Mostrar/ocultar departamentos
- ✅ Expandir/colapsar jerarquía
- ✅ Estadísticas en tiempo real

**Crear un nuevo departamento**:
1. Click en "Nuevo Departamento"
2. Ingresa nombre e ícono (emoji)
3. Agrega categorías (opcional)
4. Para cada categoría, agrega subcategorías (opcional)
5. Click en "Guardar Departamento"

**Estructura de datos**:
```typescript
{
  id: "uuid",
  name: "Tecnología",
  icon: "💻",
  visible: true,
  order: 3,
  categories: [
    {
      id: "cat-uuid",
      name: "Computación",
      subcategories: [
        { id: "sub-uuid", name: "Laptops" },
        { id: "sub-uuid", name: "PCs" },
      ]
    }
  ]
}
```

### Mega Menú (Frontend)

**Desktop**:
- Barra horizontal con todos los departamentos visibles
- Hover sobre un departamento muestra dropdown
- Grid de 3 columnas con categorías y subcategorías
- Click en cualquier nivel navega a productos filtrados

**Mobile**:
- Botón "📂 Todos los Departamentos"
- Drawer lateral con lista completa
- Navegación con acordeones expandibles
- 3 niveles: Departamento → Categoría → Subcategoría

### Filtros Avanzados

**En la página de productos (/shop)**:
- Filtrado automático por departamento seleccionado
- Filtrado por categoría
- Filtrado por subcategoría
- Botón "Limpiar filtros" para resetear
- Breadcrumb visual del filtro actual

**Ejemplo de uso**:
```
Tecnología → Computación → Laptops
```

## 🛠️ Uso Técnico

### API Endpoints

**GET /departments**
```bash
curl https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/departments \
  -H "Authorization: Bearer ${publicAnonKey}"
```

**POST /departments**
```bash
curl -X POST https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/departments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${publicAnonKey}" \
  -d '{
    "name": "Nuevo Departamento",
    "icon": "🎨",
    "categories": []
  }'
```

**PUT /departments/:id**
```bash
curl -X PUT https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/departments/123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${publicAnonKey}" \
  -d '{"visible": false}'
```

**DELETE /departments/:id**
```bash
curl -X DELETE https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/departments/123 \
  -H "Authorization: Bearer ${publicAnonKey}"
```

### Integración con Productos

Para que los productos se filtren correctamente, necesitas agregar campos de departamento/categoría:

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  department: string;      // Ej: "Tecnología"
  category?: string;        // Ej: "Computación"
  subcategory?: string;     // Ej: "Laptops"
  // ... otros campos
}
```

**Al crear/editar productos**, selecciona el departamento y categoría correspondientes.

### Componentes

**DepartmentManagement.tsx**: Panel de administración
- Path: `/src/app/components/DepartmentManagement.tsx`
- Uso: Dentro de AdminDashboard

**MegaMenu.tsx**: Mega menú del frontend
- Path: `/src/app/components/MegaMenu.tsx`
- Uso: En App.tsx, debajo del Header
- Props: `onCategorySelect(dept, cat?, subcat?)`

**departments.tsx**: Backend API
- Path: `/supabase/functions/server/departments.tsx`
- CRUD completo de departamentos

## 🎨 Personalización

### Cambiar íconos

Los íconos son emojis. Para cambiarlos:
1. Ve a Panel Admin → Departamentos
2. Click en editar (ícono de lápiz)
3. Cambia el emoji en el campo "Ícono"
4. Guarda

**Emojis sugeridos**:
- Comida: 🍕 🍔 🍝 🥗
- Tecnología: 💻 📱 🖥️ ⌨️
- Hogar: 🏠 🛋️ 🪑 🛏️
- Moda: 👗 👔 👠 👜
- Deportes: ⚽ 🏀 🏈 🎾

### Ocultar departamentos

Departamentos sensibles (como "Contenido Adulto") pueden ocultarse:
1. Panel Admin → Departamentos
2. Click en el ícono de ojo (👁️)
3. El departamento ya no aparece en el mega menú

### Reordenar departamentos

Los departamentos se ordenan por el campo `order`:
```typescript
department.order = 1; // Primer departamento
department.order = 15; // Último departamento
```

## 📊 Estadísticas

El panel muestra en tiempo real:
- **Total de departamentos**
- **Departamentos visibles**
- **Total de categorías** (suma de todas)
- **Total de subcategorías** (suma de todas)

## 🚀 Expansión Futura

Ideas para expandir el sistema:

- [ ] **Drag & Drop** para reordenar departamentos
- [ ] **Imágenes** en lugar de emojis
- [ ] **Descripciones** de departamentos
- [ ] **SEO URLs** (ej: /tecnologia/computacion/laptops)
- [ ] **Filtros múltiples** (precio, marca, rating)
- [ ] **Faceted search** avanzado
- [ ] **Departamentos destacados** en home
- [ ] **Landing pages** por departamento
- [ ] **Analytics** por departamento
- [ ] **Import/Export** en CSV

## 💡 Tips

1. **Nombres claros**: Usa nombres descriptivos y concisos
2. **Jerarquía lógica**: Máximo 3 niveles (Dept → Cat → Subcat)
3. **No más de 20 categorías** por departamento (UX)
4. **Emojis consistentes**: Usa un estilo similar de emojis
5. **Revisa antes de publicar**: Departamentos ocultos no se pueden filtrar

## 🐛 Troubleshooting

**No aparecen los departamentos en el mega menú**:
- Verifica que estén marcados como `visible: true`
- Revisa los logs del servidor
- Limpia caché del navegador

**No se filtran los productos**:
- Asegúrate de que los productos tengan los campos `department`, `category`, `subcategory`
- Verifica que los nombres coincidan exactamente

**Error al crear departamento**:
- Completa todos los campos requeridos (nombre, ícono)
- Verifica que el nombre no esté duplicado

## 📞 Soporte

Para más información:
- Documentación del sistema: `/docs/`
- Componentes: `/src/app/components/`
- API: `/supabase/functions/server/departments.tsx`
