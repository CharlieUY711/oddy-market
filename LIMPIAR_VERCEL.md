# 🧹 Guía para Limpiar Vercel - Mantener Solo 3 Proyectos

## 🎯 Proyectos a MANTENER:
1. **El proyecto actual que estás usando** (probablemente `charliemarketplacebuilderv15` o `oddy-market`)
2. **Constructor** (`constructor`)
3. **labcine-ufsc** (`labcine-ufsc`)

## 🗑️ Proyectos a ELIMINAR (según las imágenes):
- `marketplacebuilder1`
- `marketplacebuilder2`
- `oddymarket`
- `oddymarket1`
- `marketpplacebuilder`
- Todos los proyectos duplicados de `oddy-market-*` (oddy-market-t45y, oddy-market-45kh, oddy-market-mvaq, etc.)

---

## 📋 Pasos para Eliminar Proyectos en Vercel

### Paso 1: Acceder al Dashboard
1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Verás la lista de todos tus proyectos

### Paso 2: Eliminar Cada Proyecto No Deseado
Para cada proyecto que quieras eliminar:

1. **Haz clic en el proyecto** (no en el deployment, sino en el nombre del proyecto)
2. Ve a **Settings** (Configuración) en la parte superior
3. Desplázate hasta el final de la página
4. En la sección **"Danger Zone"** o **"Zona de Peligro"**
5. Haz clic en **"Delete Project"** o **"Eliminar Proyecto"**
6. Escribe el nombre del proyecto para confirmar
7. Haz clic en **"Delete"** o **"Eliminar"**

### Paso 3: Verificar los Proyectos Restantes
Después de eliminar, deberías tener solo:
- ✅ Tu proyecto actual (Charlie Marketplace Builder)
- ✅ Constructor
- ✅ labcine-ufsc

---

## 🔍 Cómo Identificar el Proyecto Actual

Si no estás seguro cuál es tu proyecto actual, busca:
- El que tiene el commit más reciente relacionado con "catalog-extractor" o "refactor"
- El que tiene la URL de producción que estás usando
- El que tiene el nombre más similar a "Charlie Marketplace Builder V 1.5"

---

## ⚠️ IMPORTANTE - Antes de Eliminar

1. **Verifica las URLs de producción** de cada proyecto antes de eliminarlo
2. **Guarda las variables de entorno** si las necesitas (Settings → Environment Variables)
3. **Anota los dominios personalizados** si los tienes configurados

---

## ✅ Lo que ya limpié en el código local

- ✅ Eliminada carpeta `extraer-catalogo/` (ya está integrado en el proyecto)
- ✅ Eliminado archivo `extraer-catalogo.zip`

---

## 📝 Notas

- Una vez eliminado un proyecto, **NO se puede recuperar** (a menos que tengas backup del código)
- Los deployments antiguos dentro de un proyecto se pueden eliminar individualmente sin eliminar todo el proyecto
- Si solo quieres limpiar deployments antiguos (no proyectos completos), ve a cada proyecto → Deployments → Elimina los antiguos

---

## 🚀 Después de Limpiar

Una vez que hayas limpiado en Vercel, puedes hacer un nuevo deploy del proyecto actual:

```powershell
pnpm deploy "Limpieza de Vercel completada"
```

Esto creará un deployment limpio y actualizado.
