# 🎉 ODDY MARKET - Proyecto Completo en Producción

## 🌐 URLs del Proyecto

### Producción (Live)
- **URL:** https://oddy-market.vercel.app/
- **Estado:** ✅ Activo y funcionando

### Repositorio GitHub
- **URL:** https://github.com/CharlieUY711/oddy-market
- **Branch:** main
- **Deploy automático:** ✅ Activado

### Base de Datos Supabase
- **URL:** https://yomgqobfmgatavnbtvdz.supabase.co
- **Dashboard:** https://app.supabase.com/project/yomgqobfmgatavnbtvdz
- **Tablas creadas:** products, orders, order_items, favorites

---

## 📊 Stack Tecnológico

### Frontend
- ⚛️ **React 18** - Biblioteca de UI
- ⚡ **Vite** - Build tool y dev server
- 🎨 **CSS Modules** - Estilos encapsulados
- 🧭 **React Router** - Navegación
- 🎣 **Custom Hooks** - Lógica reutilizable

### Backend
- 🗄️ **Supabase** - Base de datos PostgreSQL
- 🔐 **Supabase Auth** - Autenticación (configurado)
- 📡 **Supabase Realtime** - Actualizaciones en tiempo real

### Deployment & DevOps
- ▲ **Vercel** - Hosting y CI/CD
- 🐙 **GitHub** - Control de versiones
- 🔄 **Deploy automático** - Cada push a main

### Monitoring (Configurado, pendiente activar)
- 🔍 **Sentry** - Error tracking
- 📊 **Vercel Analytics** - Analytics de rendimiento

---

## 🗂️ Estructura del Proyecto

```
oddy-market/
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── ProductCard/
│   │   ├── SearchBar/
│   │   ├── MegaMenu/
│   │   ├── Toast/
│   │   ├── Loading/
│   │   ├── Skeleton/
│   │   ├── ErrorBoundary/
│   │   └── ErrorMessage/
│   ├── pages/             # Páginas de la aplicación
│   │   ├── Home/
│   │   ├── Products/
│   │   ├── ProductDetail/
│   │   ├── Cart/
│   │   ├── Checkout/
│   │   ├── Login/
│   │   └── Test/
│   ├── context/           # Context API
│   │   ├── AppContext.jsx
│   │   ├── AuthContext.jsx
│   │   └── NotificationContext.jsx
│   ├── hooks/             # Custom hooks
│   │   ├── useFetch.js
│   │   ├── useDebounce.js
│   │   ├── useThrottle.js
│   │   ├── useMediaQuery.js
│   │   ├── useLocalStorage.js
│   │   ├── useClickOutside.js
│   │   ├── useWindowSize.js
│   │   └── useToggle.js
│   ├── services/          # Servicios de API
│   │   ├── productService.js
│   │   └── favoriteService.js
│   ├── utils/             # Utilidades
│   │   ├── api.js
│   │   ├── apiClient.js
│   │   ├── supabase.js
│   │   ├── sentry.js
│   │   ├── formatting.js
│   │   ├── helpers.js
│   │   ├── validation.js
│   │   └── constants.js
│   ├── styles/            # Estilos globales
│   │   ├── variables.css
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── supabase/
│   ├── schema.sql         # Schema de la base de datos
│   └── cleanup.sql        # Script de limpieza
├── public/                # Assets estáticos
├── .env.local            # Variables de entorno (local)
├── vercel.json           # Configuración de Vercel
├── package.json
├── vite.config.js
└── README.md
```

---

## 🗄️ Base de Datos

### Tablas Creadas

#### 1. products
- **Registros:** 12 productos
- **Campos:** id, name, description, price, image, category, discount, rating, stock, created_at, updated_at
- **RLS:** ✅ Habilitado (público puede leer, solo autenticados pueden escribir)

#### 2. orders
- **Campos:** id, user_id, total, status, shipping_address, shipping_city, shipping_zip, payment_method, created_at, updated_at
- **RLS:** ✅ Habilitado (usuarios solo ven sus propios pedidos)

#### 3. order_items
- **Campos:** id, order_id, product_id, quantity, price, created_at
- **RLS:** ✅ Habilitado (usuarios solo ven items de sus pedidos)

#### 4. favorites
- **Campos:** id, user_id, product_id, created_at
- **RLS:** ✅ Habilitado (usuarios solo ven sus propios favoritos)

---

## 🔐 Credenciales y Variables

### Variables de Entorno en Vercel (✅ Configuradas)

```env
VITE_SUPABASE_URL=https://yomgqobfmgatavnbtvdz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_NAME=ODDY Market
VITE_ENABLE_SECOND_HAND=true
VITE_ENABLE_PWA=false
```

### Archivo .env.local (Local Development)
Ver: `SETUP_VARIABLES.md` para el listado completo

---

## 🚀 Funcionalidades Implementadas

### ✅ Core Features
- [x] Listado de productos con datos reales de Supabase
- [x] Detalle de producto
- [x] Carrito de compras con persistencia en localStorage
- [x] Checkout con validación de formularios
- [x] Sistema de favoritos
- [x] Búsqueda de productos
- [x] Filtrado por categorías
- [x] Sistema de notificaciones (toasts)
- [x] Loading states con skeleton loaders
- [x] Error boundaries para manejo de errores

### ✅ UI/UX
- [x] Diseño responsive
- [x] Header con navegación y búsqueda
- [x] MegaMenu para categorías
- [x] Footer
- [x] Animaciones CSS
- [x] Estados de carga
- [x] Mensajes de error amigables

### ✅ Performance
- [x] Lazy loading de imágenes
- [x] Code splitting
- [x] Debouncing en búsqueda
- [x] Caching de datos

### ✅ SEO
- [x] Meta tags
- [x] Open Graph tags
- [x] Estructura semántica HTML

### ✅ Accessibility
- [x] Aria labels
- [x] Navegación por teclado
- [x] Contraste de colores

---

## 🔄 Workflow de Desarrollo

### Hacer Cambios y Deployar

```bash
# 1. Hacer cambios en el código
# 2. Commit
git add -A
git commit -m "descripción del cambio"

# 3. Push a GitHub
git push

# 4. Vercel automáticamente despliega
# ⏱️ Espera 2-3 minutos y tu cambio estará en producción
```

### Rollback (si algo sale mal)

1. Ve a: https://vercel.com/carlos-varallas-projects/oddy-market
2. Click en "Deployments"
3. Busca un deployment anterior que funcionaba
4. Click en "⋯" → "Promote to Production"

---

## 📊 Próximos Pasos Recomendados

### Corto Plazo (Semana 1-2)
- [ ] Agregar más productos a la base de datos
- [ ] Implementar autenticación de usuarios real
- [ ] Conectar sistema de favoritos con Supabase
- [ ] Agregar página de perfil de usuario
- [ ] Implementar página "Mis Pedidos"

### Mediano Plazo (Mes 1)
- [ ] Integración con Mercado Pago para pagos reales
- [ ] Sistema de administración de productos
- [ ] Dashboard de ventas
- [ ] Notificaciones por email (con Supabase Functions)
- [ ] Sistema de reviews y ratings

### Largo Plazo (Mes 2-3)
- [ ] Dominio personalizado (www.oddymarket.com.uy)
- [ ] PWA (Progressive Web App)
- [ ] Marketplace de segunda mano
- [ ] Sistema de chat/WhatsApp integrado
- [ ] Aplicación móvil (React Native)

---

## 🆘 Troubleshooting

### Problema: Los productos no cargan en producción
**Solución:** Verifica las variables de entorno en Vercel.

### Problema: Error 404 en rutas
**Solución:** Vercel está configurado con `vercel.json` para manejar SPA routing.

### Problema: Cambios no se reflejan en producción
**Solución:** 
1. Verifica que hiciste `git push`
2. Ve a Vercel dashboard → Deployments
3. Verifica que el último deploy terminó exitosamente

---

## 📚 Documentación Adicional

- **Setup inicial:** `DIAGNOSTICO_PROYECTO.md`
- **Fases de desarrollo:** `FASES_ADICIONALES_PRODUCCION.md`
- **Variables de entorno:** `SETUP_VARIABLES.md`
- **Configuración de GitHub:** `GITHUB_SETUP.md`
- **Configuración de Supabase:** `SUPABASE_SETUP.md`
- **Deployment a Vercel:** `VERCEL_DEPLOYMENT.md`
- **Guía de deployment:** `DEPLOYMENT_GUIDE.md`
- **Colores del proyecto:** `COLORES_PROYECTO.md`

---

## 🎓 Tecnologías y Conceptos Aprendidos

- ✅ React 18 con hooks modernos
- ✅ Context API para estado global
- ✅ Custom hooks reutilizables
- ✅ Integración con Supabase (PostgreSQL + Auth)
- ✅ CI/CD con Vercel
- ✅ Git workflow profesional
- ✅ Environment variables
- ✅ Error boundaries y manejo de errores
- ✅ Performance optimization
- ✅ SEO y accessibility
- ✅ Responsive design
- ✅ Form validation
- ✅ Local storage para persistencia

---

## 👥 Colaboradores

- **Carlos Varalla** (@CharlieUY711) - Developer

---

## 📝 Licencia

Este proyecto es privado y propietario de ODDY Market.

---

## 🎉 Estado Actual

```
✅ PROYECTO EN PRODUCCIÓN Y FUNCIONANDO
✅ Base de datos configurada y poblada
✅ Frontend conectado a backend
✅ Deploy automático configurado
✅ Listo para agregar más funcionalidades
```

**Última actualización:** 2026-02-12

**Versión:** 1.0.0

**URL de Producción:** https://oddy-market.vercel.app/
