# 🧹 Guía para Limpiar Vercel

## 📋 Pasos para limpiar deployments antiguos en Vercel

### 1. Acceder al Dashboard de Vercel
1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Busca tu proyecto "Charlie Marketplace Builder V 1.5" (o el nombre que tenga)

### 2. Limpiar Deployments Antiguos
1. En el dashboard del proyecto, ve a la pestaña **"Deployments"**
2. Verás una lista de todos los deployments (producción, preview, etc.)
3. Para cada deployment antiguo que quieras eliminar:
   - Haz clic en los **3 puntos** (⋯) al lado del deployment
   - Selecciona **"Delete"** o **"Eliminar"**
   - Confirma la eliminación

### 3. Limpiar Variables de Entorno Obsoletas
1. Ve a **Settings** → **Environment Variables**
2. Revisa las variables y elimina las que ya no uses
3. **IMPORTANTE**: No elimines variables que estés usando (como `SUPABASE_URL`, `SUPABASE_ANON_KEY`, etc.)

### 4. Limpiar Dominios No Usados
1. Ve a **Settings** → **Domains**
2. Elimina dominios que ya no uses

### 5. Limpiar Integraciones
1. Ve a **Settings** → **Integrations**
2. Revisa las integraciones conectadas (GitHub, etc.)
3. Si hay alguna que no uses, puedes desconectarla

## ✅ Lo que ya limpié en el código local

- ✅ Eliminada carpeta `extraer-catalogo/` (ya está integrado en el proyecto)
- ✅ Eliminado archivo `extraer-catalogo.zip`

## 📝 Notas

- El archivo `vercel.json` está bien configurado y no necesita cambios
- Los deployments antiguos no afectan el funcionamiento, pero ocupan espacio
- Puedes mantener los últimos 3-5 deployments por si necesitas hacer rollback

## 🚀 Después de limpiar

Una vez que hayas limpiado en Vercel, puedes hacer un nuevo deploy:

```powershell
pnpm deploy "Limpieza de Vercel"
```

Esto creará un deployment limpio y actualizado.
