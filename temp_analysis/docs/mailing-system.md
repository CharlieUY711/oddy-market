# Sistema de Mailing con Resend - ODDY Market

## 📧 Descripción

Sistema completo de email marketing integrado con Resend que incluye:
- **Emails transaccionales**: Confirmación de compra, notificaciones de envío
- **Newsletters**: Campañas de marketing y comunicación
- **Recuperación de carritos abandonados**: Automatización para recuperar ventas perdidas

## ⚠️ IMPORTANTE: Modo Demo

El sistema está actualmente funcionando en **MODO DEMO** porque no se ha configurado la API key de Resend.

**En modo demo:**
- ✅ Todas las funcionalidades están disponibles
- ✅ Los emails se registran en los logs del servidor
- ✅ Puedes probar toda la interfaz
- ❌ No se envían emails reales

**Para enviar emails reales:**
Necesitas configurar tu API key de Resend (ver sección de configuración abajo).

## 🚀 Configuración

### 1. Obtener API Key de Resend

1. Registrate en [Resend](https://resend.com) (es gratuito para empezar)
2. Verifica tu dominio o usa el dominio de prueba de Resend
3. Ve a [API Keys](https://resend.com/api-keys) en el dashboard
4. Genera una nueva API key
5. Copia la API key (comienza con `re_...`)

### 2. Configurar la API Key en Supabase

1. Ve al dashboard de Supabase de tu proyecto
2. Ve a Settings → Edge Functions → Secrets
3. Busca la variable `RESEND_API_KEY`
4. Pega tu API key de Resend
5. Guarda los cambios
6. Reinicia las Edge Functions

**Alternativamente**, puedes usar el CLI de Supabase:
```bash
supabase secrets set RESEND_API_KEY=re_tu_api_key_aqui
```

### 3. Configurar el dominio de envío

Por defecto, los emails se envían desde `noreply@oddymarket.com`. 

**Para usar tu propio dominio:**
1. Verifica tu dominio en [Resend Dashboard](https://resend.com/domains)
2. Edita `/supabase/functions/server/mailing.tsx`
3. Busca la línea: `from: "ODDY Market <noreply@oddymarket.com>"`
4. Reemplaza con tu dominio verificado: `from: "Tu Tienda <noreply@tudominio.com>"`

**Sin dominio personalizado:**
Puedes usar el dominio de prueba de Resend que viene incluido, pero solo podrás enviar a tu propio email.

## 📝 Funcionalidades

### Emails Transaccionales

Los emails transaccionales se envían automáticamente cuando:
- ✅ Un cliente completa una compra (confirmación de pedido)
- 📦 Un pedido es enviado (notificación de envío)

**Ejemplo de uso:**

```typescript
await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/mailing/send-transactional`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({
      type: "confirmation", // o "shipping"
      to: "cliente@ejemplo.com",
      data: {
        customerName: "Juan Pérez",
        orderNumber: "ORD-123",
        orderTotal: "50000",
        // ... más datos
      },
    }),
  }
);
```

### Newsletters

Gestiona campañas de email marketing:

1. **Crear una plantilla**:
   - Ve a Panel Admin → Mailing → Plantillas
   - Click en "Nueva Plantilla"
   - Selecciona tipo "Newsletter"
   - Crea tu contenido HTML

2. **Crear una campaña**:
   - Ve a Panel Admin → Mailing → Campañas
   - Click en "Nueva Campaña"
   - Selecciona una plantilla
   - Define fecha de envío (opcional)

3. **Enviar campaña**:
   - Click en el botón "Enviar" de la campaña
   - Se enviará a todos los clientes en la base de datos

### Recuperación de Carritos Abandonados

El sistema detecta automáticamente carritos abandonados:

**Funcionamiento:**
1. Usuario agrega productos al carrito
2. Después de 5 minutos de inactividad (configurable), se registra como "abandonado"
3. Desde Panel Admin → Mailing → Carritos Abandonados
4. Click en "Enviar" para enviar email de recuperación

**Personalizar tiempo de espera:**
Edita `/src/app/App.tsx`, línea ~54:
```typescript
const timer = window.setTimeout(() => {
  trackAbandonedCart();
}, 300000); // 300000 ms = 5 minutos
```

Cambia `300000` a tu preferencia:
- 1 hora = 3600000
- 24 horas = 86400000

## 🎨 Plantillas de Email

Las plantillas están en `/src/app/utils/email-templates.ts`:

- `orderConfirmationTemplate`: Confirmación de compra
- `shippingConfirmationTemplate`: Notificación de envío
- `newsletterTemplate`: Newsletter genérica
- `cartRecoveryTemplate`: Recuperación de carrito

### Personalizar plantillas

Las plantillas usan variables con doble llave `{{variable}}`:

```html
<h2>Hola {{customerName}},</h2>
<p>Tu pedido {{orderNumber}} está en camino.</p>
```

Variables disponibles:
- `{{customerName}}`: Nombre del cliente
- `{{customerEmail}}`: Email del cliente
- `{{orderNumber}}`: Número de orden
- `{{orderTotal}}`: Total de la orden
- `{{orderItems}}`: Lista de productos
- `{{trackingLink}}`: Link de seguimiento
- `{{cartLink}}`: Link al carrito
- Y más...

## 📊 Métricas

El dashboard de mailing muestra:
- 📤 Total de emails enviados
- 👁️ Aperturas de email
- 📈 Tasa de apertura
- 🛒 Carritos abandonados
- 💰 Ventas recuperadas

## 🔐 Seguridad

- La API key de Resend está almacenada de forma segura en variables de entorno
- Los emails solo se envían desde rutas autenticadas del servidor
- Los datos de clientes están protegidos

## 🐛 Debugging

Si los emails no se envían:

1. Verifica que la API key de Resend esté configurada correctamente
2. Revisa los logs del servidor en Supabase
3. Verifica que el dominio esté verificado en Resend
4. Asegúrate de que los clientes tengan emails válidos

**Modo demo:**
Si no hay API key configurada, el sistema funciona en modo demo y registra en consola los emails que se enviarían.

## 📞 Soporte

Para más información sobre Resend:
- Documentación: https://resend.com/docs
- Dashboard: https://resend.com/dashboard

## 🎯 Próximos pasos

- [ ] Configurar dominio personalizado en Resend
- [ ] Crear más plantillas de email
- [ ] Configurar webhooks para tracking de aperturas
- [ ] A/B testing de subject lines
- [ ] Segmentación avanzada de audiencias
