# Gestor de API Keys - ODDY Market

## Descripción General

El Gestor de API Keys centraliza todas las credenciales y configuraciones de integraciones externas en ODDY Market. Permite pegar y guardar API keys directamente desde la UI del AdminDashboard sin necesidad de acceder al panel de configuración de Supabase.

## Características

✅ **Gestión centralizada** de todas las API keys
✅ **Encriptación básica** para almacenamiento seguro
✅ **Categorización** por tipo de servicio
✅ **Detección automática** de integraciones configuradas
✅ **UI intuitiva** con validación y feedback visual
✅ **Fallback a variables de entorno** para máxima flexibilidad

## Categorías de Integraciones

### 🛍️ Marketplaces
Integraciones con plataformas de venta externa.

**Mercado Libre**
- `MERCADOLIBRE_ACCESS_TOKEN` - Token de acceso para API (requerido)
- `MERCADOLIBRE_USER_ID` - ID de usuario de Mercado Libre (requerido)
- **Documentación**: https://developers.mercadolibre.com.ar/

### 💳 Pagos
Pasarelas de pago y procesamiento de transacciones.

**Mercado Pago** (Argentina/LATAM)
- `MERCADOPAGO_ACCESS_TOKEN` - Token privado para backend (requerido)
- `MERCADOPAGO_PUBLIC_KEY` - Public Key para frontend
- **Documentación**: https://www.mercadopago.com.ar/developers/
- **Notas**: Mercado Pago es la pasarela principal del sistema

**Plexo** (Uruguay)
- `PLEXO_CLIENT_ID` - ID de cliente
- `PLEXO_SECRET_KEY` - Clave secreta
- `PLEXO_ENVIRONMENT` - Entorno (sandbox/production)
- **Documentación**: https://www.plexo.com.uy/docs

**PayPal**
- `PAYPAL_CLIENT_ID` - Client ID
- `PAYPAL_SECRET` - Secret Key
- **Documentación**: https://developer.paypal.com/

**Stripe**
- `STRIPE_SECRET_KEY` - Secret Key (backend)
- `STRIPE_PUBLISHABLE_KEY` - Publishable Key (frontend)
- **Documentación**: https://stripe.com/docs/

### 📱 Redes Sociales
Centro operativo de RRSS y mensajería.

**Meta (Facebook & Instagram)**
- `META_ACCESS_TOKEN` - Token para Facebook Shopping e Instagram Shopping
- `META_CATALOG_ID` - ID del catálogo de productos
- **Documentación**: https://developers.facebook.com/

**WhatsApp Business**
- `WHATSAPP_BUSINESS_ID` - ID de cuenta de WhatsApp Business
- `WHATSAPP_ACCESS_TOKEN` - Token de acceso para WhatsApp Business API
- **Documentación**: https://business.whatsapp.com/

### ⚙️ Servicios
Herramientas y servicios auxiliares.

**Resend** (Email)
- `RESEND_API_KEY` - API Key para envío de emails
- **Documentación**: https://resend.com/docs
- **Uso**: Sistema de mailing, notificaciones, marketing

**Replicate** (IA)
- `REPLICATE_API_KEY` - API Key para procesamiento de IA
- **Documentación**: https://replicate.com/docs
- **Uso**: Generación de imágenes, procesamiento con IA

**Remove.bg**
- `REMOVE_BG_API_KEY` - API Key para remover fondos de imágenes
- **Documentación**: https://www.remove.bg/api
- **Uso**: Edición automática de imágenes de productos

**MetaMap** (KYC)
- `METAMAP_CLIENT_ID` - Client ID para verificación de identidad (requerido)
- `METAMAP_CLIENT_SECRET` - Secret Key (requerido)
- **Documentación**: https://docs.metamap.com/
- **Uso**: Verificación de identidad para contenido adulto y Second Hand

### 🏗️ Infraestructura
Configuración de base de datos y hosting.

**Supabase** (Base de datos y Backend)
- `SUPABASE_URL` - URL del proyecto Supabase (solo lectura)
- `SUPABASE_ANON_KEY` - Anon/Public Key (solo lectura)
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role Key privada (solo lectura)
- **Documentación**: https://supabase.com/dashboard
- **Notas**: Estos valores solo se muestran, no se pueden editar desde la UI

**Hosting**
- `HOSTING_PROVIDER` - Proveedor de hosting (Vercel, Netlify, AWS, etc.)
- `HOSTING_DOMAIN` - Dominio principal del sitio
- `HOSTING_API_KEY` - API Key del proveedor (si aplica)

## Uso desde la UI

### Acceso al Gestor
1. Login como Administrador
2. Ir a AdminDashboard
3. Buscar "Gestor de API Keys" o "Integraciones"

### Agregar/Editar API Keys
1. Selecciona la categoría (Marketplaces, Pagos, etc.)
2. Encuentra la integración que necesitas
3. Pega tu API Key en el campo correspondiente
4. Click en "Guardar" (💾)
5. Verifica el check verde (✓) de confirmación

### Visualización
- Por defecto las keys están ocultas (******)
- Click en el ícono de ojo (👁️) para mostrar/ocultar
- Las keys previamente guardadas se muestran como "********"

### Indicadores
- **Requerido**: Badge rojo indica que la key es necesaria para funcionalidad básica
- **✓ Configurada**: Check verde indica que la key ya está guardada
- **Solo lectura**: Badge azul indica valores de solo lectura (Supabase)

## Uso desde el Backend

### Helper getApiKey()

Función auxiliar para obtener API keys con fallback a variables de entorno:

```typescript
import { getApiKey } from "./api-keys.tsx";

// Obtener API key con fallback automático
const mercadoPagoToken = await getApiKey("mercadopago_access_token") 
  || Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");

const paypalClientId = await getApiKey("paypal_client_id")
  || Deno.env.get("PAYPAL_CLIENT_ID");
```

### Endpoints Disponibles

#### GET /api-keys
Obtener todas las API keys (valores enmascarados).

```typescript
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/api-keys`,
  {
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
    },
  }
);
const data = await response.json();
// { keys: { mercadopago_access_token: "********", ... } }
```

#### GET /api-keys/:keyName
Obtener una API key específica (valor decriptado, solo backend).

```typescript
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/api-keys/mercadopago_access_token`,
  {
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
    },
  }
);
const data = await response.json();
// { value: "APP_USR-1234567890123456-..." }
```

#### POST /api-keys
Guardar una API key.

```typescript
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/api-keys`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key: "mercadopago_access_token",
      value: "APP_USR-1234567890123456-...",
    }),
  }
);
```

## Almacenamiento

### KV Store
Las API keys se almacenan en el KV store de Supabase con el prefijo `apikey:`:

```
apikey:mercadopago_access_token
apikey:mercadolibre_access_token
apikey:paypal_client_id
...
```

### Encriptación
Se utiliza encriptación básica (base64 + reverse string) para almacenar las keys. 

**NOTA**: Para producción se recomienda implementar encriptación más robusta usando `crypto` de Deno.

### Estructura de Datos

```json
{
  "key": "apikey:mercadopago_access_token",
  "value": "ZW5jcnlwdGVkX3ZhbHVlX2hlcmU=",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

## Configuración por Integración

### Mercado Pago (Principal)

1. **Crear cuenta**: https://www.mercadopago.com.ar/
2. **Ir a Desarrolladores**: https://www.mercadopago.com.ar/developers/
3. **Crear aplicación**
4. **Obtener credenciales**:
   - Access Token (producción o prueba)
   - Public Key
5. **Configurar en ODDY**:
   - Pegar Access Token en `MERCADOPAGO_ACCESS_TOKEN`
   - Pegar Public Key en `MERCADOPAGO_PUBLIC_KEY`

**Webhooks**: Configurar en Mercado Pago
```
https://{projectId}.supabase.co/functions/v1/make-server-0dd48dc4/payments/mercadopago-webhook
```

### Mercado Libre

1. **Cuenta de Mercado Libre** activa
2. **Ir a Developers**: https://developers.mercadolibre.com.ar/
3. **Crear aplicación**
4. **OAuth**: Autorizar la aplicación para tu cuenta
5. **Obtener**:
   - Access Token
   - User ID
6. **Configurar en ODDY**:
   - Pegar Access Token en `MERCADOLIBRE_ACCESS_TOKEN`
   - Pegar User ID en `MERCADOLIBRE_USER_ID`

### MetaMap (Verificación KYC)

1. **Registrarse**: https://metamap.com/
2. **Crear proyecto**
3. **Configurar flujo de verificación**:
   - Documento de identidad
   - Selfie con liveness detection
   - Validación de edad
4. **Obtener credenciales**:
   - Client ID
   - Client Secret
   - Flow ID (opcional)
5. **Configurar en ODDY**:
   - Pegar Client ID en `METAMAP_CLIENT_ID`
   - Pegar Client Secret en `METAMAP_CLIENT_SECRET`

**Webhook**: Configurar en MetaMap
```
https://{projectId}.supabase.co/functions/v1/make-server-0dd48dc4/verification/metamap-webhook
```

### Supabase (Infraestructura)

Las credenciales de Supabase se obtienen de:
1. **Dashboard de Supabase**: https://supabase.com/dashboard
2. **Seleccionar proyecto**
3. **Settings → API**
4. **Copiar**:
   - Project URL → `SUPABASE_URL`
   - anon/public key → `SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

**IMPORTANTE**: Estas credenciales deben configurarse como variables de entorno en tu plataforma de hosting.

### Hosting (Vercel, Netlify, etc.)

#### Vercel
1. **Dashboard**: https://vercel.com/dashboard
2. **Obtener dominio** del proyecto
3. **API Token**: Settings → Tokens
4. **Configurar**:
   - Provider: "Vercel"
   - Domain: "oddymarket.vercel.app"
   - API Key: (token de Vercel)

#### Netlify
1. **Dashboard**: https://app.netlify.com/
2. **Obtener dominio** del sitio
3. **API Token**: User settings → Applications
4. **Configurar**:
   - Provider: "Netlify"
   - Domain: "oddymarket.netlify.app"
   - API Key: (token de Netlify)

## Prioridades de Configuración

### Básico (Mínimo Funcional)
✅ Supabase (URL, Anon Key, Service Role Key)
✅ Mercado Pago (Access Token)

### Recomendado
✅ Mercado Libre (Access Token, User ID)
✅ Resend (Email)
✅ MetaMap (para contenido adulto)

### Opcional
⚪ PayPal, Stripe (pagos alternativos)
⚪ Plexo (solo Uruguay)
⚪ Meta & WhatsApp (redes sociales)
⚪ Replicate, Remove.bg (herramientas)

## Seguridad

### Mejores Prácticas

1. **NUNCA** compartas las Service Role Keys
2. **NUNCA** expongas API keys en el frontend (excepto las Public Keys)
3. **Usa** variables de entorno para producción
4. **Rota** las keys periódicamente
5. **Limita** el acceso al gestor solo a Administradores
6. **Monitorea** el uso de las APIs

### Niveles de Seguridad

- **Frontend**: Solo Public Keys (Stripe, Mercado Pago)
- **Backend**: Todas las Secret Keys
- **KV Store**: Valores encriptados
- **Variables de Entorno**: Valores en texto plano (pero protegidos por plataforma)

### Encriptación en Producción

Para producción, reemplaza la encriptación básica con:

```typescript
import { crypto } from "https://deno.land/std/crypto/mod.ts";

async function encryptKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(Deno.env.get("ENCRYPTION_KEY")),
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );
  // ... implementación completa
}
```

## Troubleshooting

### Key no se guarda
- Verifica que tienes rol de Administrador
- Comprueba que el valor no esté vacío
- Revisa la consola del navegador para errores

### Integración no funciona
- Verifica que la key esté correctamente copiada (sin espacios)
- Comprueba que sea la key correcta (producción vs sandbox)
- Revisa los logs del backend para más detalles

### Keys de Supabase no aparecen
- Son valores de solo lectura
- Deben estar en variables de entorno
- Verifica en el hosting que estén configuradas

## Migración desde Variables de Entorno

Si ya tienes keys en variables de entorno:

1. El sistema usará automáticamente el fallback
2. Puedes migrarlas al gestor para centralizar
3. El gestor tiene prioridad sobre las variables de entorno
4. Mantén las variables de entorno como backup

## Roadmap

### Próximas Mejoras
- [ ] Encriptación AES-GCM para producción
- [ ] Rotación automática de keys
- [ ] Logs de auditoría
- [ ] Notificaciones de expiración
- [ ] Validación automática de keys
- [ ] Test de conectividad por integración
- [ ] Grupos de keys por ambiente (dev/staging/prod)

---

**Última actualización**: Febrero 2026
**Versión del sistema**: 2.0
