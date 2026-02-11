# Plan de Deployment a Producción - ODDY Market

## 📋 Resumen Ejecutivo

Este documento detalla el proceso completo para llevar ODDY Market a producción, incluyendo infraestructura, servicios externos, configuración, seguridad, monitoreo y mantenimiento.

---

## 🎯 Arquitectura de Producción

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIOS FINALES                         │
│              (Clientes, Proveedores, Editores, Admin)            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE CDN + DDoS                         │
│                   (SSL, Caching, Protección)                     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                     VERCEL / NETLIFY                             │
│                  (Frontend React + Vite)                         │
│                  oddymarket.com                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SUPABASE (Backend)                             │
│  ┌──────────────┬───────────────┬──────────────┬──────────────┐ │
│  │ PostgreSQL   │ Edge Functions│ Auth         │ Storage      │ │
│  │ (Database)   │ (Hono Server) │ (JWT + 2FA)  │ (Images)     │ │
│  └──────────────┴───────────────┴──────────────┴──────────────┘ │
└────────────────────┬────────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│  REDIS CLOUD     │      │  SENTRY.IO       │
│  (Cache + Queue) │      │  (Error Tracking)│
└──────────────────┘      └──────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICIOS EXTERNOS                            │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────────┐   │
│  │ Mercado  │ Mercado  │ PayPal   │ Stripe   │ Meta/FB      │   │
│  │ Libre    │ Pago     │          │          │ (RRSS)       │   │
│  └──────────┴──────────┴──────────┴──────────┴──────────────┘   │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────────┐   │
│  │ Twilio   │ Resend   │ Google   │ Replicate│ Remove.bg    │   │
│  │ (WhatsApp)│ (Email) │ Ads      │ (AI)     │ (Images)     │   │
│  └──────────┴──────────┴──────────┴──────────┴──────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Fase 1: Preparación de Infraestructura

### 1.1 Hosting del Frontend

**Opción Recomendada: Vercel**

**Ventajas:**
- Deploy automático desde Git
- Edge Network global
- Optimización automática de assets
- Rollbacks instantáneos
- Analytics incluido
- DDoS protection
- Free tier generoso (100GB bandwidth)

**Configuración:**

1. **Crear cuenta en Vercel**
   - Ir a https://vercel.com
   - Sign up con GitHub

2. **Conectar repositorio**
   ```bash
   # En tu proyecto local
   pnpm add -g vercel
   vercel login
   vercel init
   ```

3. **Configurar proyecto**
   ```json
   // vercel.json
   {
     "buildCommand": "pnpm build",
     "outputDirectory": "dist",
     "framework": "vite",
     "installCommand": "pnpm install",
     "devCommand": "pnpm dev",
     "env": {
       "VITE_SUPABASE_URL": "@supabase_url",
       "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key"
     },
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "X-Content-Type-Options",
             "value": "nosniff"
           },
           {
             "key": "X-Frame-Options",
             "value": "DENY"
           },
           {
             "key": "X-XSS-Protection",
             "value": "1; mode=block"
           }
         ]
       }
     ],
     "redirects": [
       {
         "source": "/admin",
         "has": [
           {
             "type": "cookie",
             "key": "authorized",
             "value": "true"
           }
         ],
         "destination": "/admin/dashboard"
       }
     ]
   }
   ```

4. **Deploy inicial**
   ```bash
   vercel --prod
   ```

**Costos Estimados:**
- Tier Free: 0 USD/mes (suficiente para empezar)
- Tier Pro: 20 USD/mes (recomendado para producción)
  - 1TB bandwidth
  - Analytics avanzado
  - Prioridad en soporte

**Alternativa: Netlify**

Similar a Vercel, con configuración:

```toml
# netlify.toml
[build]
  command = "pnpm build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

---

### 1.2 Backend (Supabase)

**Configuración de Proyecto en Supabase:**

1. **Crear proyecto en Supabase**
   - Ir a https://supabase.com/dashboard
   - Crear nuevo proyecto
   - Elegir región: South America (São Paulo) - más cercana
   - Tier: Pro ($25/mes recomendado)

2. **Configurar Database**
   ```sql
   -- Ya tienes la tabla kv_store_0dd48dc4
   -- Optimizaciones adicionales:
   
   -- Índices para performance
   CREATE INDEX idx_kv_store_key ON kv_store_0dd48dc4(key);
   CREATE INDEX idx_kv_store_prefix ON kv_store_0dd48dc4(key text_pattern_ops);
   
   -- Enable Row Level Security
   ALTER TABLE kv_store_0dd48dc4 ENABLE ROW LEVEL SECURITY;
   
   -- Políticas de acceso
   CREATE POLICY "Enable read for authenticated users"
   ON kv_store_0dd48dc4 FOR SELECT
   TO authenticated
   USING (true);
   
   CREATE POLICY "Enable write for service role"
   ON kv_store_0dd48dc4 FOR ALL
   TO service_role
   USING (true);
   ```

3. **Configurar Storage Buckets**
   ```typescript
   // Script de inicialización (correr una vez)
   // supabase/functions/server/init-storage.ts
   
   const buckets = [
     { name: 'make-0dd48dc4-products', public: false },
     { name: 'make-0dd48dc4-user-uploads', public: false },
     { name: 'make-0dd48dc4-invoices', public: false },
     { name: 'make-0dd48dc4-public', public: true },
   ];
   
   for (const bucket of buckets) {
     const { data: exists } = await supabase.storage.getBucket(bucket.name);
     if (!exists) {
       await supabase.storage.createBucket(bucket.name, {
         public: bucket.public,
         fileSizeLimit: 52428800, // 50MB
         allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
       });
     }
   }
   ```

4. **Desplegar Edge Functions**
   ```bash
   # Autenticar con Supabase
   supabase login
   
   # Linkar proyecto
   supabase link --project-ref <tu-project-ref>
   
   # Desplegar función
   supabase functions deploy server
   
   # Configurar secrets
   supabase secrets set \
     MERCADOPAGO_ACCESS_TOKEN=xxx \
     MERCADOLIBRE_ACCESS_TOKEN=xxx \
     TWILIO_AUTH_TOKEN=xxx \
     RESEND_API_KEY=xxx \
     --project-ref <tu-project-ref>
   ```

5. **Configurar Auth**
   - Dashboard → Authentication → Settings
   - Site URL: https://oddymarket.com
   - Redirect URLs: https://oddymarket.com/auth/callback
   - Email Templates: Personalizar con branding
   - Enable Email Confirmations: ✅
   - Enable 2FA: ✅ (TOTP)

**Costos Supabase:**
- Tier Free: 0 USD/mes (limitado, no para producción)
- Tier Pro: 25 USD/mes
  - 8GB database
  - 100GB bandwidth
  - 100GB storage
  - 2M edge function invocations
- Tier Scale: Por uso (recomendado al crecer)
  - Database: $0.125/GB-hora
  - Storage: $0.021/GB
  - Bandwidth: $0.09/GB

**Estimación inicial:** $25-50 USD/mes

---

### 1.3 CDN y Seguridad (Cloudflare)

**Configuración:**

1. **Crear cuenta Cloudflare**
   - https://dash.cloudflare.com/sign-up

2. **Agregar dominio**
   - Agregar oddymarket.com
   - Cambiar nameservers en tu registrador
   - Esperar propagación DNS (24-48 horas)

3. **Configurar SSL/TLS**
   - SSL/TLS → Overview → Full (strict)
   - Edge Certificates → Always Use HTTPS: ✅
   - Automatic HTTPS Rewrites: ✅

4. **Configurar Firewall Rules**
   ```
   Rate Limiting Rules:
   
   Rule 1: Login Rate Limit
   - Path: /make-server-0dd48dc4/auth/login
   - Requests: 5 per minute per IP
   - Action: Challenge (CAPTCHA)
   
   Rule 2: API Rate Limit
   - Path: /make-server-0dd48dc4/*
   - Requests: 100 per minute per IP
   - Action: Block
   
   Rule 3: Admin Protection
   - Path: /admin/*
   - Country NOT IN: [Argentina, Uruguay, Chile] (ajustar según tu ubicación)
   - Action: Challenge
   ```

5. **Configurar Page Rules**
   ```
   Rule 1: Cache Static Assets
   - URL: oddymarket.com/assets/*
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 month
   
   Rule 2: Cache Images
   - URL: oddymarket.com/images/*
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 week
   
   Rule 3: Bypass Admin
   - URL: oddymarket.com/admin/*
   - Cache Level: Bypass
   ```

6. **Configurar DDoS Protection**
   - Security → Settings
   - Security Level: High
   - Bot Fight Mode: ✅
   - Enable DNSSEC: ✅

**Costos Cloudflare:**
- Tier Free: 0 USD/mes (suficiente inicialmente)
- Tier Pro: 20 USD/mes (recomendado)
  - WAF
  - Rate limiting avanzado
  - Analytics detallado
  - 20 page rules

---

### 1.4 Caché y Colas (Redis Cloud)

**Propósito:**
- Cache de datos frecuentes (productos, categorías)
- Queue de trabajos (envío de emails, procesamiento de imágenes)
- Session storage (alternativa)
- Rate limiting storage

**Configuración:**

1. **Crear cuenta Redis Cloud**
   - https://redis.com/try-free/
   - Crear database

2. **Obtener credenciales**
   ```
   Redis Endpoint: redis-xxxxx.c123.us-east-1-2.ec2.cloud.redislabs.com:12345
   Password: xxxxxxxxxxxxxxxx
   ```

3. **Agregar a Supabase Secrets**
   ```bash
   supabase secrets set \
     REDIS_URL=redis://:password@endpoint:port \
     --project-ref <tu-project-ref>
   ```

4. **Implementar en código**
   ```typescript
   // supabase/functions/server/cache.ts
   import { createClient } from 'npm:redis@4'
   
   const redis = createClient({
     url: Deno.env.get('REDIS_URL'),
   })
   
   await redis.connect()
   
   export async function getCached<T>(
     key: string,
     fetchFn: () => Promise<T>,
     ttl: number = 3600
   ): Promise<T> {
     const cached = await redis.get(key)
     if (cached) return JSON.parse(cached)
     
     const data = await fetchFn()
     await redis.setEx(key, ttl, JSON.stringify(data))
     return data
   }
   
   export async function invalidateCache(pattern: string) {
     const keys = await redis.keys(pattern)
     if (keys.length > 0) {
       await redis.del(keys)
     }
   }
   ```

**Costos Redis Cloud:**
- Tier Free: 0 USD/mes (30MB, suficiente para empezar)
- Tier Paid: desde 5 USD/mes (250MB)

---

### 1.5 Monitoreo y Logging (Sentry)

**Configuración:**

1. **Crear cuenta Sentry**
   - https://sentry.io/signup/
   - Crear proyecto React

2. **Instalar SDK**
   ```bash
   pnpm add @sentry/react @sentry/vite-plugin
   ```

3. **Configurar Frontend**
   ```typescript
   // src/main.tsx
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: "https://xxxxx@xxxxx.ingest.sentry.io/xxxxx",
     environment: import.meta.env.MODE,
     integrations: [
       new Sentry.BrowserTracing(),
       new Sentry.Replay({
         maskAllText: false,
         blockAllMedia: false,
       }),
     ],
     tracesSampleRate: 1.0,
     replaysSessionSampleRate: 0.1,
     replaysOnErrorSampleRate: 1.0,
   });
   ```

4. **Configurar Backend (Edge Functions)**
   ```typescript
   // supabase/functions/server/index.tsx
   import * as Sentry from "npm:@sentry/deno";
   
   Sentry.init({
     dsn: Deno.env.get('SENTRY_DSN'),
     environment: "production",
     tracesSampleRate: 1.0,
   });
   ```

5. **Configurar Alertas**
   - Sentry Dashboard → Alerts
   - Email cuando error rate > 10/minuto
   - Slack notification para errores críticos

**Costos Sentry:**
- Tier Developer: 0 USD/mes (5k errors/month)
- Tier Team: 26 USD/mes (50k errors/month)

---

## 🔌 Fase 2: Configuración de Servicios Externos

### 2.1 Pasarelas de Pago

#### Mercado Pago

**Setup:**

1. **Crear cuenta vendedor**
   - https://www.mercadopago.com.ar/developers
   - Crear aplicación
   - Obtener credenciales

2. **Credenciales necesarias**
   ```bash
   # Producción
   MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxx
   MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxx
   ```

3. **Configurar webhook**
   - URL: https://oddymarket.com/webhooks/mercadopago
   - Eventos: payment, merchant_order

4. **Implementar en servidor**
   ```typescript
   // supabase/functions/server/routes/mercadopago.tsx
   app.post('/make-server-0dd48dc4/payment/mercadopago', async (c) => {
     const { amount, description, payer } = await c.req.json()
     
     const preference = {
       items: [{
         title: description,
         unit_price: amount,
         quantity: 1,
       }],
       payer: payer,
       back_urls: {
         success: 'https://oddymarket.com/payment/success',
         failure: 'https://oddymarket.com/payment/failure',
         pending: 'https://oddymarket.com/payment/pending',
       },
       notification_url: 'https://oddymarket.com/webhooks/mercadopago',
     }
     
     // Crear preferencia con SDK
     const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify(preference),
     })
     
     return c.json(await response.json())
   })
   ```

**Costos:**
- Configuración: Gratis
- Comisión por transacción: ~4.99% + $0.50 USD

---

#### Stripe

**Setup:**

1. **Crear cuenta Stripe**
   - https://dashboard.stripe.com/register
   - Completar verificación

2. **Obtener keys**
   ```bash
   STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
   STRIPE_SECRET_KEY=sk_live_xxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

3. **Instalar SDK**
   ```bash
   pnpm add stripe @stripe/stripe-js
   ```

4. **Configurar webhook**
   - Dashboard → Developers → Webhooks
   - Endpoint: https://oddymarket.com/webhooks/stripe
   - Events: payment_intent.succeeded, payment_intent.failed

5. **Implementar checkout**
   ```typescript
   // Frontend
   import { loadStripe } from '@stripe/stripe-js'
   
   const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
   
   const response = await fetch('/make-server-0dd48dc4/payment/stripe/checkout', {
     method: 'POST',
     body: JSON.stringify({ items: cartItems }),
   })
   
   const { sessionId } = await response.json()
   await stripe.redirectToCheckout({ sessionId })
   ```

**Costos:**
- Configuración: Gratis
- Comisión: 2.9% + $0.30 USD por transacción

---

#### PayPal

**Setup:**

1. **Crear cuenta Business**
   - https://www.paypal.com/businessmanage/account/aboutBusiness
   - Developer Dashboard: https://developer.paypal.com/

2. **Credenciales**
   ```bash
   PAYPAL_CLIENT_ID=xxxxx
   PAYPAL_CLIENT_SECRET=xxxxx
   ```

3. **Integrar SDK**
   ```bash
   pnpm add @paypal/react-paypal-js
   ```

4. **Implementar**
   ```typescript
   // Frontend
   import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"
   
   <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID }}>
     <PayPalButtons
       createOrder={async () => {
         const response = await fetch('/make-server-0dd48dc4/payment/paypal/create')
         const { orderID } = await response.json()
         return orderID
       }}
       onApprove={async (data) => {
         await fetch('/make-server-0dd48dc4/payment/paypal/capture', {
           method: 'POST',
           body: JSON.stringify({ orderID: data.orderID }),
         })
       }}
     />
   </PayPalScriptProvider>
   ```

**Costos:**
- Configuración: Gratis
- Comisión: 3.4% + tarifa fija

---

### 2.2 Marketplaces

#### Mercado Libre

**Setup:**

1. **Crear aplicación**
   - https://developers.mercadolibre.com.ar/
   - Crear app
   - Obtener Client ID y Secret

2. **Autorizar aplicación**
   - OAuth flow para obtener access token
   - URL: https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=YOUR_CLIENT_ID

3. **Credenciales**
   ```bash
   MERCADOLIBRE_CLIENT_ID=xxxxx
   MERCADOLIBRE_CLIENT_SECRET=xxxxx
   MERCADOLIBRE_ACCESS_TOKEN=APP_USR-xxxxx
   MERCADOLIBRE_REFRESH_TOKEN=TG-xxxxx
   MERCADOLIBRE_USER_ID=xxxxx
   ```

4. **Implementar sincronización**
   ```typescript
   // supabase/functions/server/routes/mercadolibre.tsx
   
   // Publicar producto
   app.post('/make-server-0dd48dc4/ml/publish', async (c) => {
     const product = await c.req.json()
     
     const mlProduct = {
       title: product.title,
       category_id: product.mlCategoryId,
       price: product.price,
       currency_id: 'ARS',
       available_quantity: product.stock,
       buying_mode: 'buy_it_now',
       listing_type_id: 'gold_special',
       condition: 'new',
       description: { plain_text: product.description },
       pictures: product.images.map(img => ({ source: img })),
       shipping: {
         mode: 'me2',
         free_shipping: product.freeShipping,
       },
     }
     
     const response = await fetch('https://api.mercadolibre.com/items', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${Deno.env.get('MERCADOLIBRE_ACCESS_TOKEN')}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify(mlProduct),
     })
     
     return c.json(await response.json())
   })
   
   // Webhook para notificaciones
   app.post('/make-server-0dd48dc4/webhooks/mercadolibre', async (c) => {
     const notification = await c.req.json()
     
     if (notification.topic === 'orders') {
       // Procesar nueva orden
       const orderResponse = await fetch(
         `https://api.mercadolibre.com/orders/${notification.resource}`,
         {
           headers: {
             'Authorization': `Bearer ${Deno.env.get('MERCADOLIBRE_ACCESS_TOKEN')}`,
           },
         }
       )
       const order = await orderResponse.json()
       
       // Guardar orden en tu sistema
       await kv.set(`ml_order:${order.id}`, JSON.stringify(order))
     }
     
     return c.json({ success: true })
   })
   ```

**Costos:**
- Publicación: Variable según categoría
- Comisión: 11-16% según categoría

---

### 2.3 Comunicaciones

#### Twilio (WhatsApp + SMS)

**Setup:**

1. **Crear cuenta Twilio**
   - https://www.twilio.com/try-twilio
   - Verificar cuenta

2. **Configurar WhatsApp**
   - Console → Messaging → Try it out → Send a WhatsApp message
   - Activar WhatsApp Business API (requiere aprobación)
   - Configurar plantillas de mensajes

3. **Credenciales**
   ```bash
   TWILIO_ACCOUNT_SID=ACxxxxx
   TWILIO_AUTH_TOKEN=xxxxx
   TWILIO_PHONE_NUMBER=+1xxxxx
   TWILIO_WHATSAPP_NUMBER=whatsapp:+1xxxxx
   ```

4. **Implementar**
   ```typescript
   // supabase/functions/server/services/whatsapp.ts
   import { Twilio } from 'npm:twilio'
   
   const client = new Twilio(
     Deno.env.get('TWILIO_ACCOUNT_SID'),
     Deno.env.get('TWILIO_AUTH_TOKEN')
   )
   
   export async function sendWhatsAppMessage(
     to: string,
     message: string,
     mediaUrl?: string
   ) {
     try {
       const result = await client.messages.create({
         from: Deno.env.get('TWILIO_WHATSAPP_NUMBER'),
         to: `whatsapp:${to}`,
         body: message,
         ...(mediaUrl && { mediaUrl: [mediaUrl] }),
       })
       return { success: true, sid: result.sid }
     } catch (error) {
       console.error('WhatsApp send error:', error)
       return { success: false, error }
     }
   }
   
   // Notificar nuevo pedido
   export async function notifyNewOrder(order: any) {
     const message = `🎉 *Nuevo Pedido #${order.id}*\n\n` +
       `Cliente: ${order.customer.name}\n` +
       `Total: $${order.total}\n` +
       `Items: ${order.items.length}\n\n` +
       `Ver detalles: https://oddymarket.com/admin/orders/${order.id}`
     
     await sendWhatsAppMessage('+549xxxxx', message) // Tu número
   }
   ```

**Costos:**
- WhatsApp: $0.005 por mensaje (conversación de negocio)
- SMS: $0.0079 por mensaje (Argentina)

---

#### Resend (Emails)

**Setup:**

1. **Crear cuenta**
   - https://resend.com/signup
   - Verificar dominio

2. **Configurar dominio**
   - Dashboard → Domains → Add Domain
   - Agregar registros DNS:
     ```
     TXT _resend.oddymarket.com → resend-verification-xxxxx
     MX oddymarket.com → mx.resend.com (priority 10)
     ```
   - Esperar verificación

3. **Credenciales**
   ```bash
   RESEND_API_KEY=re_xxxxx
   ```

4. **Implementar**
   ```typescript
   // supabase/functions/server/services/email.ts
   import { Resend } from 'npm:resend'
   
   const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
   
   export async function sendOrderConfirmation(order: any) {
     const { data, error } = await resend.emails.send({
       from: 'ODDY Market <pedidos@oddymarket.com>',
       to: order.customer.email,
       subject: `Confirmación de Pedido #${order.id}`,
       html: `
         <!DOCTYPE html>
         <html>
           <head>
             <style>
               body { font-family: Arial, sans-serif; }
               .header { background: #FF6B35; color: white; padding: 20px; }
               .content { padding: 20px; }
               .footer { background: #f5f5f5; padding: 20px; text-align: center; }
             </style>
           </head>
           <body>
             <div class="header">
               <h1>¡Gracias por tu compra!</h1>
             </div>
             <div class="content">
               <h2>Pedido #${order.id}</h2>
               <p>Hola ${order.customer.name},</p>
               <p>Confirmamos la recepción de tu pedido.</p>
               
               <h3>Resumen:</h3>
               <ul>
                 ${order.items.map(item => `<li>${item.name} x${item.quantity} - $${item.price}</li>`).join('')}
               </ul>
               
               <p><strong>Total: $${order.total}</strong></p>
               
               <p>Estado: ${order.status}</p>
               
               <a href="https://oddymarket.com/orders/${order.id}" 
                  style="background: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; margin-top: 20px;">
                 Ver Pedido
               </a>
             </div>
             <div class="footer">
               <p>© 2026 ODDY Market. Todos los derechos reservados.</p>
             </div>
           </body>
         </html>
       `,
     })
     
     if (error) {
       console.error('Email send error:', error)
       return { success: false, error }
     }
     
     return { success: true, messageId: data?.id }
   }
   
   // Templates adicionales
   export const emailTemplates = {
     orderShipped: (order: any, tracking: string) => ({
       subject: `Tu pedido #${order.id} ha sido enviado`,
       html: `...`,
     }),
     passwordReset: (token: string) => ({
       subject: 'Restablecer contraseña - ODDY Market',
       html: `...`,
     }),
     welcomeEmail: (user: any) => ({
       subject: '¡Bienvenido a ODDY Market!',
       html: `...`,
     }),
   }
   ```

**Costos:**
- Free tier: 100 emails/día
- Paid: $20/mes por 50,000 emails

---

### 2.4 Redes Sociales

#### Meta Business Suite (Facebook + Instagram)

**Setup:**

1. **Crear Meta Business Account**
   - https://business.facebook.com/
   - Configurar Business Manager
   - Conectar Facebook Page e Instagram Business Account

2. **Crear App**
   - https://developers.facebook.com/
   - Crear app → Tipo: Business
   - Agregar productos: Instagram Basic Display, Instagram Graph API, Facebook Login

3. **Obtener Access Token**
   - Graph API Explorer
   - Generar token de larga duración
   - Permisos necesarios:
     - pages_show_list
     - pages_read_engagement
     - pages_manage_posts
     - instagram_basic
     - instagram_content_publish

4. **Credenciales**
   ```bash
   META_APP_ID=xxxxx
   META_APP_SECRET=xxxxx
   META_ACCESS_TOKEN=xxxxx
   META_PAGE_ID=xxxxx
   META_INSTAGRAM_ACCOUNT_ID=xxxxx
   ```

5. **Implementar publicación**
   ```typescript
   // supabase/functions/server/services/social.ts
   
   // Publicar en Facebook
   export async function postToFacebook(post: {
     message: string
     imageUrl?: string
     link?: string
   }) {
     const endpoint = `https://graph.facebook.com/v18.0/${Deno.env.get('META_PAGE_ID')}/photos`
     
     const response = await fetch(endpoint, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         url: post.imageUrl,
         caption: post.message,
         access_token: Deno.env.get('META_ACCESS_TOKEN'),
       }),
     })
     
     return await response.json()
   }
   
   // Publicar en Instagram
   export async function postToInstagram(post: {
     imageUrl: string
     caption: string
   }) {
     const igAccountId = Deno.env.get('META_INSTAGRAM_ACCOUNT_ID')
     const accessToken = Deno.env.get('META_ACCESS_TOKEN')
     
     // Paso 1: Crear container
     const containerResponse = await fetch(
       `https://graph.facebook.com/v18.0/${igAccountId}/media`,
       {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           image_url: post.imageUrl,
           caption: post.caption,
           access_token: accessToken,
         }),
       }
     )
     
     const { id: creationId } = await containerResponse.json()
     
     // Paso 2: Publicar
     const publishResponse = await fetch(
       `https://graph.facebook.com/v18.0/${igAccountId}/media_publish`,
       {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           creation_id: creationId,
           access_token: accessToken,
         }),
       }
     )
     
     return await publishResponse.json()
   }
   
   // Obtener estadísticas
   export async function getInsights(period: string = 'day') {
     const pageId = Deno.env.get('META_PAGE_ID')
     const accessToken = Deno.env.get('META_ACCESS_TOKEN')
     
     const response = await fetch(
       `https://graph.facebook.com/v18.0/${pageId}/insights?` +
       `metric=page_impressions,page_engaged_users&period=${period}&` +
       `access_token=${accessToken}`
     )
     
     return await response.json()
   }
   ```

**Costos:**
- API: Gratis
- Ads: Variable (presupuesto definido por ti)

---

### 2.5 Marketing y Ads

#### Google Ads

**Setup:**

1. **Crear cuenta Google Ads**
   - https://ads.google.com/
   - Configurar billing

2. **Obtener API access**
   - https://developers.google.com/google-ads/api/docs/first-call/overview
   - Solicitar developer token (puede tomar 24-48 horas)

3. **Credenciales**
   ```bash
   GOOGLE_ADS_CLIENT_ID=xxxxx
   GOOGLE_ADS_CLIENT_SECRET=xxxxx
   GOOGLE_ADS_DEVELOPER_TOKEN=xxxxx
   GOOGLE_ADS_REFRESH_TOKEN=xxxxx
   GOOGLE_ADS_CUSTOMER_ID=xxxxx
   ```

4. **Google Shopping Feed**
   ```typescript
   // supabase/functions/server/routes/google-shopping.tsx
   
   app.get('/make-server-0dd48dc4/feed/google-shopping.xml', async (c) => {
     // Obtener productos activos
     const products = await kv.getByPrefix('product:')
     
     const feed = `<?xml version="1.0" encoding="UTF-8"?>
     <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
       <channel>
         <title>ODDY Market</title>
         <link>https://oddymarket.com</link>
         <description>Productos ODDY Market</description>
         ${products.map(product => `
           <item>
             <g:id>${product.id}</g:id>
             <g:title>${product.name}</g:title>
             <g:description>${product.description}</g:description>
             <g:link>https://oddymarket.com/products/${product.slug}</g:link>
             <g:image_link>${product.images[0]}</g:image_link>
             <g:price>${product.price} ARS</g:price>
             <g:availability>${product.stock > 0 ? 'in stock' : 'out of stock'}</g:availability>
             <g:brand>ODDY Market</g:brand>
             <g:condition>new</g:condition>
             <g:google_product_category>${product.googleCategory}</g:google_product_category>
           </item>
         `).join('')}
       </channel>
     </rss>`
     
     c.header('Content-Type', 'application/xml')
     return c.body(feed)
   })
   ```

5. **Vincular feed en Merchant Center**
   - https://merchants.google.com/
   - Products → Feeds → Add feed
   - URL: https://oddymarket.com/make-server-0dd48dc4/feed/google-shopping.xml
   - Frecuencia: Diaria

**Costos:**
- Shopping feed: Gratis
- Ads: Pay per click (CPC), variable

---

### 2.6 Herramientas de Imagen

#### Remove.bg

**Setup:**

1. **Crear cuenta**
   - https://www.remove.bg/api
   - Obtener API key

2. **Credenciales**
   ```bash
   REMOVE_BG_API_KEY=xxxxx
   ```

3. **Implementar**
   ```typescript
   // supabase/functions/server/services/image.ts
   
   export async function removeBackground(imageUrl: string) {
     const formData = new FormData()
     formData.append('image_url', imageUrl)
     formData.append('size', 'auto')
     
     const response = await fetch('https://api.remove.bg/v1.0/removebg', {
       method: 'POST',
       headers: {
         'X-Api-Key': Deno.env.get('REMOVE_BG_API_KEY')!,
       },
       body: formData,
     })
     
     if (!response.ok) {
       throw new Error(`Remove.bg error: ${response.statusText}`)
     }
     
     const blob = await response.blob()
     return blob
   }
   ```

**Costos:**
- Free: 50 images/mes
- Paid: desde $9/mes por 500 créditos

---

#### Replicate (AI Image Generation)

**Setup:**

1. **Crear cuenta**
   - https://replicate.com/
   - Obtener API token

2. **Credenciales**
   ```bash
   REPLICATE_API_KEY=r8_xxxxx
   ```

3. **Implementar**
   ```typescript
   // supabase/functions/server/services/ai-image.ts
   import Replicate from 'npm:replicate'
   
   const replicate = new Replicate({
     auth: Deno.env.get('REPLICATE_API_KEY')!,
   })
   
   export async function generateProductImage(prompt: string) {
     const output = await replicate.run(
       "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
       {
         input: {
           prompt: `Professional product photo: ${prompt}, clean white background, studio lighting, high quality`,
           negative_prompt: "blurry, low quality, distorted",
           width: 1024,
           height: 1024,
         },
       }
     )
     
     return output
   }
   ```

**Costos:**
- Pay per use: ~$0.0055 por imagen (modelo SDXL)

---

### 2.7 Envío y Logística

#### Andreani API

**Setup:**

1. **Crear cuenta corporativa**
   - https://www.andreani.com/empresas
   - Solicitar acceso a API

2. **Credenciales**
   ```bash
   ANDREANI_USERNAME=xxxxx
   ANDREANI_PASSWORD=xxxxx
   ```

3. **Implementar**
   ```typescript
   // supabase/functions/server/services/shipping.ts
   
   export async function getShippingQuote(
     origin: string,
     destination: string,
     weight: number
   ) {
     const auth = btoa(`${Deno.env.get('ANDREANI_USERNAME')}:${Deno.env.get('ANDREANI_PASSWORD')}`)
     
     const response = await fetch('https://api.andreani.com/v2/tarifas', {
       method: 'POST',
       headers: {
         'Authorization': `Basic ${auth}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         cpOrigen: origin,
         cpDestino: destination,
         peso: weight,
       }),
     })
     
     return await response.json()
   }
   
   export async function createShipment(order: any) {
     // Implementar creación de envío
   }
   ```

**Alternativa: Correo Argentino**

Similar setup con API de Correo Argentino.

**Costos:**
- Variable según peso y distancia
- Requiere contrato corporativo

---

## 🔒 Fase 3: Seguridad en Producción

### 3.1 Implementar 2FA (Autenticación de Dos Factores)

```typescript
// supabase/functions/server/routes/auth.tsx

app.post('/make-server-0dd48dc4/auth/enable-2fa', async (c) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1]
  const { data: { user } } = await supabase.auth.getUser(accessToken)
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  // Generar secret para TOTP
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
  })
  
  if (error) {
    return c.json({ error: error.message }, 400)
  }
  
  // Retornar QR code para escanear con Google Authenticator
  return c.json({
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
  })
})

app.post('/make-server-0dd48dc4/auth/verify-2fa', async (c) => {
  const { code, factorId } = await c.req.json()
  
  const { data, error } = await supabase.auth.mfa.verify({
    factorId,
    code,
  })
  
  if (error) {
    return c.json({ error: 'Invalid code' }, 400)
  }
  
  return c.json({ success: true })
})
```

### 3.2 Rate Limiting Avanzado

```typescript
// supabase/functions/server/middleware/ratelimit.ts
import { createClient } from 'npm:redis@4'

const redis = createClient({ url: Deno.env.get('REDIS_URL') })
await redis.connect()

export async function rateLimitMiddleware(
  key: string,
  limit: number,
  window: number // segundos
): Promise<boolean> {
  const current = await redis.incr(key)
  
  if (current === 1) {
    await redis.expire(key, window)
  }
  
  return current <= limit
}

// Uso en rutas
app.post('/make-server-0dd48dc4/auth/login', async (c) => {
  const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For')
  const key = `ratelimit:login:${ip}`
  
  const allowed = await rateLimitMiddleware(key, 5, 60) // 5 intentos por minuto
  
  if (!allowed) {
    return c.json({ error: 'Too many attempts' }, 429)
  }
  
  // Continuar con login
})
```

### 3.3 Anti-Fraude

```typescript
// supabase/functions/server/middleware/fraud-detection.ts

export async function detectFraud(order: any): Promise<{
  risk: 'low' | 'medium' | 'high'
  reasons: string[]
}> {
  const reasons: string[] = []
  let riskScore = 0
  
  // 1. Verificar múltiples pedidos mismo IP
  const recentOrders = await kv.getByPrefix(`order:ip:${order.ip}`)
  if (recentOrders.length > 3) {
    reasons.push('Multiple orders from same IP')
    riskScore += 30
  }
  
  // 2. Verificar monto inusual
  if (order.total > 100000) { // $100k ARS
    reasons.push('High order amount')
    riskScore += 20
  }
  
  // 3. Verificar email temporal
  const tempEmailDomains = ['tempmail.com', 'guerrillamail.com', '10minutemail.com']
  const emailDomain = order.email.split('@')[1]
  if (tempEmailDomains.includes(emailDomain)) {
    reasons.push('Temporary email used')
    riskScore += 40
  }
  
  // 4. Verificar dirección de envío
  if (!order.shippingAddress || order.shippingAddress.length < 10) {
    reasons.push('Invalid shipping address')
    riskScore += 25
  }
  
  // 5. Verificar velocidad de compra
  const sessionTime = Date.now() - order.sessionStart
  if (sessionTime < 30000) { // menos de 30 segundos
    reasons.push('Purchase too fast')
    riskScore += 20
  }
  
  let risk: 'low' | 'medium' | 'high' = 'low'
  if (riskScore > 50) risk = 'high'
  else if (riskScore > 30) risk = 'medium'
  
  // Loggear en Sentry si riesgo alto
  if (risk === 'high') {
    console.error('High risk order detected:', { order, reasons, riskScore })
  }
  
  return { risk, reasons }
}

// Uso en checkout
app.post('/make-server-0dd48dc4/orders/create', async (c) => {
  const order = await c.req.json()
  
  const fraudCheck = await detectFraud(order)
  
  if (fraudCheck.risk === 'high') {
    // Marcar para revisión manual
    await kv.set(`order:review:${order.id}`, JSON.stringify({
      order,
      fraudCheck,
      status: 'pending_review',
    }))
    
    return c.json({
      success: true,
      requiresReview: true,
      message: 'Order requires manual review',
    })
  }
  
  // Procesar orden normalmente
})
```

### 3.4 Content Security Policy

```typescript
// Agregar headers en vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.paypal.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.mercadopago.com https://api.mercadolibre.com; frame-src 'self' https://js.stripe.com https://www.paypal.com; object-src 'none';"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

---

## 📊 Fase 4: Monitoreo y Analytics

### 4.1 Google Analytics 4

```typescript
// src/utils/analytics.ts
import ReactGA from 'react-ga4'

export function initAnalytics() {
  ReactGA.initialize('G-XXXXXXXXXX')
}

export function trackPageView(path: string) {
  ReactGA.send({ hitType: 'pageview', page: path })
}

export function trackEvent(category: string, action: string, label?: string) {
  ReactGA.event({
    category,
    action,
    label,
  })
}

// Eventos de ecommerce
export function trackPurchase(order: any) {
  ReactGA.event('purchase', {
    transaction_id: order.id,
    value: order.total,
    currency: 'ARS',
    items: order.items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  })
}

// En App.tsx
useEffect(() => {
  initAnalytics()
}, [])
```

### 4.2 Uptime Monitoring (UptimeRobot)

1. **Crear cuenta**
   - https://uptimerobot.com/
   - Crear monitores:
     - https://oddymarket.com (HTTP 200)
     - https://oddymarket.com/api/health (HTTP 200)
     - https://your-project.supabase.co (HTTP 200)

2. **Configurar alertas**
   - Email cuando down
   - Slack notification
   - Check interval: 5 minutos

**Costos:**
- Free: 50 monitors
- Paid: $7/mes por 50 monitors con checks de 1 minuto

### 4.3 Performance Monitoring

```typescript
// src/utils/performance.ts
export function measurePerformance() {
  if (typeof window === 'undefined') return
  
  // Core Web Vitals
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(metric => console.log('CLS:', metric))
    getFID(metric => console.log('FID:', metric))
    getFCP(metric => console.log('FCP:', metric))
    getLCP(metric => console.log('LCP:', metric))
    getTTFB(metric => console.log('TTFB:', metric))
  })
}

// Reportar a analytics
export function reportWebVitals(metric: any) {
  ReactGA.event('web_vitals', {
    name: metric.name,
    value: Math.round(metric.value),
    label: metric.id,
  })
}
```

---

## 🚀 Fase 5: Deploy a Producción

### 5.1 Checklist Pre-Deploy

**Código:**
- [ ] Todos los tests pasan
- [ ] No hay console.logs innecesarios
- [ ] Bundle size optimizado (< 500KB gzipped)
- [ ] Images optimizadas (WebP cuando sea posible)
- [ ] Lazy loading implementado
- [ ] Error boundaries en componentes críticos
- [ ] Loading states en todas las operaciones async

**Configuración:**
- [ ] Variables de entorno de producción configuradas
- [ ] Todas las API keys son de producción (no test)
- [ ] Dominio configurado y DNS propagado
- [ ] SSL/TLS activo
- [ ] CDN configurado

**Seguridad:**
- [ ] Rate limiting activo
- [ ] 2FA habilitado para admin
- [ ] Fraud detection activo
- [ ] CSP headers configurados
- [ ] CORS configurado correctamente
- [ ] Secrets no expuestos en frontend

**Integraciones:**
- [ ] Webhooks de pagos configurados
- [ ] Webhooks de Mercado Libre configurados
- [ ] Email templates testeados
- [ ] WhatsApp templates aprobados
- [ ] Social media access tokens válidos

**Monitoreo:**
- [ ] Sentry configurado
- [ ] Google Analytics activo
- [ ] Uptime monitoring configurado
- [ ] Alertas configuradas

### 5.2 Proceso de Deploy

```bash
# 1. Build local final
pnpm build

# 2. Test build locally
pnpm preview

# 3. Deploy a staging primero (recomendado)
vercel --prod --scope staging

# 4. Test en staging
# - Hacer pruebas manuales completas
# - Verificar todas las integraciones
# - Probar checkout end-to-end

# 5. Si todo OK, deploy a producción
vercel --prod

# 6. Deploy edge functions
supabase functions deploy server --project-ref <prod-ref>

# 7. Verificar deployment
curl https://oddymarket.com
curl https://oddymarket.com/make-server-0dd48dc4/health

# 8. Monitorear logs por 30 minutos
supabase functions logs server --project-ref <prod-ref>
```

### 5.3 Post-Deploy

**Primeras 24 horas:**
1. Monitorear Sentry para errores
2. Verificar tráfico en Analytics
3. Revisar logs de servidor cada 4 horas
4. Verificar que webhooks funcionen
5. Hacer transacción de prueba real (montos pequeños)

**Primera semana:**
1. Daily check de errores en Sentry
2. Revisar performance (Core Web Vitals)
3. Analizar conversión de checkout
4. Verificar tiempos de respuesta de API
5. Revisar feedback de usuarios

---

## 💰 Resumen de Costos Mensuales

### Infraestructura Base

| Servicio | Tier | Costo Mensual |
|----------|------|---------------|
| **Vercel** | Pro | $20 |
| **Supabase** | Pro | $25 |
| **Cloudflare** | Pro | $20 |
| **Redis Cloud** | 250MB | $5 |
| **Sentry** | Team | $26 |
| **UptimeRobot** | Pro | $7 |
| **Subtotal Base** | | **$103** |

### APIs y Servicios

| Servicio | Costo Base | Costo Variable |
|----------|------------|----------------|
| **Mercado Pago** | $0 | 4.99% + $0.50 por transacción |
| **Mercado Libre** | $0 | 11-16% comisión |
| **Stripe** | $0 | 2.9% + $0.30 por transacción |
| **PayPal** | $0 | 3.4% + tarifa fija |
| **Twilio (WhatsApp)** | $0 | $0.005 por mensaje |
| **Resend (Email)** | $20 | 50k emails incluidos |
| **Remove.bg** | $9 | 500 imágenes incluidas |
| **Replicate (AI)** | $0 | $0.0055 por imagen |
| **Google Ads** | Variable | Pay per click |
| **Meta Ads** | Variable | Presupuesto definido |
| **Subtotal Servicios** | **~$29** | **Variable según uso** |

### Total Estimado

**Costo Fijo Mensual:** ~$132 USD (+ impuestos)

**Costo Variable:**
- Bajo tráfico (0-100 órdenes/mes): +$50-100
- Medio tráfico (100-500 órdenes/mes): +$200-400
- Alto tráfico (500+ órdenes/mes): +$500+

**Estimación realista primer año:** $200-300 USD/mes

---

## 📈 Roadmap Post-Producción

### Mes 1-2: Estabilización
- [ ] Corregir bugs reportados
- [ ] Optimizar performance basado en métricas reales
- [ ] Ajustar rate limits según uso real
- [ ] Implementar features faltantes críticos (2FA, etc.)

### Mes 3-4: Mejoras
- [ ] A/B testing en checkout
- [ ] Optimización de conversión
- [ ] Agregar más carriers de envío
- [ ] Mejorar sistema de búsqueda (Algolia/ElasticSearch)

### Mes 5-6: Escalamiento
- [ ] Implementar sistema de cupones avanzado
- [ ] Programa de afiliados
- [ ] Multi-currency
- [ ] Multi-idioma

### Mes 7-12: Expansión
- [ ] App móvil (React Native)
- [ ] Integración con más marketplaces
- [ ] Sistema de dropshipping
- [ ] B2B portal para mayoristas

---

## 🆘 Plan de Contingencia

### Escenario 1: Caída de Supabase

**Plan B:**
1. Switch a self-hosted PostgreSQL + PostgREST
2. Alternativa rápida: Firebase (requiere refactor)
3. Tiempo estimado de migración: 2-3 días

### Escenario 2: Caída de Vercel

**Plan B:**
1. Deploy en Netlify (configuración ya lista)
2. Alternativa: AWS S3 + CloudFront
3. Tiempo de switch: 1-2 horas

### Escenario 3: Pico de tráfico inesperado

**Acciones:**
1. Activar caching agresivo en Cloudflare
2. Implementar queue para procesos pesados
3. Escalar tier de Supabase temporalmente
4. Contactar soporte de plataformas

### Escenario 4: Ataque DDoS

**Protección:**
1. Cloudflare bloqueará automáticamente
2. Activar "I'm Under Attack" mode
3. Revisar logs y patrones
4. Ajustar firewall rules

### Escenario 5: Brecha de seguridad

**Protocolo:**
1. Inmediatamente invalidar todos los tokens
2. Forzar logout de todos los usuarios
3. Rotar todas las API keys
4. Investigar origen
5. Notificar usuarios afectados (según ley)
6. Documentar incidente para auditores

---

## 📝 Documentación para el Equipo

### Onboarding de Nuevos Desarrolladores

1. **Setup local** (seguir MIGRATION_TO_CURSOR.md)
2. **Leer documentación**:
   - README.md
   - ARCHITECTURE.md
   - API.md
3. **Accesos necesarios**:
   - GitHub repository
   - Vercel team
   - Supabase project (role: Developer)
   - Sentry project
   - Slack channel #oddy-dev
4. **Primera tarea**: Corregir un bug marcado como "good first issue"

### Proceso de Development

1. **Crear branch** desde `main`
   ```bash
   git checkout -b feature/nombre-feature
   ```

2. **Desarrollar localmente** con Supabase local

3. **Testing**
   - Manual testing completo
   - Screenshots si hay cambios visuales

4. **Pull Request**
   - Descripción detallada
   - Screenshots/videos
   - Link a ticket/issue

5. **Code Review** (al menos 1 aprobación)

6. **Merge a main** → auto-deploy a staging

7. **Testing en staging**

8. **Deploy a producción** (sólo admin)

### Guía de Troubleshooting

Ver sección "Problemas Comunes" en MIGRATION_TO_CURSOR.md

---

## ✅ Checklist Final de Producción

### Semana -2 (Preparación)
- [ ] Dominio comprado y configurado
- [ ] Todas las cuentas de servicios creadas
- [ ] API keys de producción obtenidas
- [ ] Testing completo en staging

### Semana -1 (Pre-Launch)
- [ ] Load testing realizado
- [ ] Security audit completo
- [ ] Backup strategy definida
- [ ] Runbook de incidentes creado
- [ ] Equipo de soporte entrenado

### Día 0 (Launch)
- [ ] Deploy a producción ejecutado
- [ ] Todas las integraciones verificadas
- [ ] Monitoring activo
- [ ] Equipo on-call disponible
- [ ] Comunicado de lanzamiento enviado

### Día +1 (Post-Launch)
- [ ] Review de métricas
- [ ] No hay errores críticos en Sentry
- [ ] Performance dentro de rangos esperados
- [ ] Transacciones funcionando correctamente

### Semana +1 (Stabilización)
- [ ] Reporte de primera semana
- [ ] Feedback de usuarios recopilado
- [ ] Hotfixes aplicados si necesario
- [ ] Documentación actualizada

---

**Última actualización:** Febrero 2026  
**Versión:** 1.0  
**Proyecto:** ODDY Market  
**Autor:** Equipo ODDY Market

---

## 🎯 Próximos Pasos Inmediatos

1. **Leer este documento completo**
2. **Seguir MIGRATION_TO_CURSOR.md** para migrar código
3. **Crear cuentas** en todos los servicios listados
4. **Obtener API keys** de producción
5. **Configurar Vercel** y hacer primer deploy a staging
6. **Testing exhaustivo** en staging
7. **Deploy a producción** cuando todo esté validado
8. **Monitorear** primeras 24-48 horas intensivamente

---

## 📞 Contactos de Soporte

### Servicios Críticos

- **Vercel Support:** support@vercel.com (Pro plan)
- **Supabase Support:** support@supabase.com (Pro plan)
- **Cloudflare Support:** Portal web (Pro plan)
- **Stripe Support:** https://support.stripe.com/
- **PayPal Support:** https://www.paypal.com/support

### Escalamiento

Para incidentes críticos que afecten el servicio:

1. Revisar Sentry para detalles del error
2. Consultar logs en Supabase
3. Verificar status pages de servicios externos
4. Si es outage de proveedor, esperar resolución
5. Si es bug propio, hotfix inmediato

---

¡Éxito con el lanzamiento de ODDY Market! 🚀
