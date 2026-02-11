# 🚀 ODDY Market - Guía de Inicio para Cursor

Esta es la guía rápida para abrir y trabajar con el proyecto ODDY Market en Cursor.

## ✅ Paso 1: Abrir el Proyecto en Cursor

1. **Abre Cursor**
2. **File > Open Folder** (o `Cmd/Ctrl + O`)
3. **Selecciona esta carpeta** (la carpeta raíz del proyecto)

## ✅ Paso 2: Instalar Dependencias

Abre la terminal integrada de Cursor:
- **Windows/Linux**: `Ctrl + ` ` 
- **Mac**: `Cmd + ` `

Ejecuta:
```bash
pnpm install
```

Si no tienes pnpm instalado:
```bash
npm install -g pnpm
```

## ✅ Paso 3: Iniciar el Servidor de Desarrollo

```bash
pnpm run dev
```

El proyecto se abrirá automáticamente en `http://localhost:5173`

## 🎨 Sobre ODDY Market

- **Nombre**: ODDY Market
- **Colores**: 
  - Naranja principal: `#FF6B35`
  - Celeste secundario: `#4ECDC4`
- **Mobile-first**: Optimizado para dispositivos móviles
- **Stack**: React + Vite + Tailwind CSS v4 + Supabase

## 📂 Archivos Importantes

- `/src/app/App.tsx` - Componente principal
- `/src/app/components/` - Todos los componentes React
- `/src/styles/theme.css` - Tokens de color y diseño
- `/supabase/functions/server/` - Backend API
- `/package.json` - Dependencias del proyecto

## 🔑 Variables de Entorno

**Ya están configuradas en el sistema:**
- SUPABASE_URL
- SUPABASE_ANON_KEY  
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_PUBLISHABLE_KEY
- PLEXO_CLIENT_ID
- FIXED_API_KEY

**No necesitas crear un archivo .env**

## 💡 Funcionalidades Implementadas

✅ Sistema de productos con carrito
✅ Checkout completo
✅ Integraciones de pago (Mercado Pago, PayPal, Stripe, Plexo, Mercado Libre)
✅ Sistema de facturación electrónica (Fixed - DGI Uruguay)
✅ Dashboard administrativo
✅ Gestión de inventario
✅ Design system completo con Radix UI

## 📚 Documentación Completa

- [README Principal](/README.md)
- [Guía Visual 4 Pasos](/GUIA_VISUAL_4_PASOS.md)
- [Roadmap](/ROADMAP.md)
- [Sistema de Facturación](/docs/BILLING_SYSTEM.md)
- [Integraciones de Pago](/docs/PAYMENT_INTEGRATIONS_SUMMARY.md)

## 🎯 Próximos Pasos

1. **Explora el código** - Empieza por `/src/app/App.tsx`
2. **Revisa los componentes** - En `/src/app/components/`
3. **Personaliza el diseño** - Modifica `/src/styles/theme.css`
4. **Consulta el ROADMAP** - Para ver qué funcionalidades están pendientes

## 🆘 ¿Problemas?

1. **Error de puerto ocupado**: Cambia el puerto en `vite.config.ts`
2. **Errores de instalación**: Borra `node_modules` y `pnpm-lock.yaml`, luego reinstala
3. **Errores de TypeScript**: Ejecuta `pnpm run build` para ver detalles

---

¡Listo para desarrollar! 🎉
