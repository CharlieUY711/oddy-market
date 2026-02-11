# ⚡ Quick Start: Plexo Integration

## 🚀 Setup en 3 pasos

### 1️⃣ Obtener credenciales

1. Regístrate en [www.plexo.com.uy](https://www.plexo.com.uy)
2. Solicita credenciales de **Sandbox** para testing
3. Obtendrás: `Client ID` y `Secret Key`

### 2️⃣ Configurar en Supabase

Ve a **Supabase Dashboard → Settings → Edge Functions → Secrets**

Agrega estas 3 variables:

```bash
PLEXO_CLIENT_ID=tu_client_id_aquí
PLEXO_SECRET_KEY=tu_secret_key_aquí
PLEXO_ENVIRONMENT=sandbox
```

### 3️⃣ Verificar

1. Reinicia la Edge Function (opcional)
2. Ve al Dashboard de tu app → **Integraciones de Pago**
3. Verifica que **Plexo 🇺🇾** esté marcado como **Configurado** ✅

---

## 🧪 Probar en Sandbox

### Tarjeta aprobada:
```
Número: 4111 1111 1111 1111
CVV: 123
Vencimiento: 12/25
Nombre: TEST APPROVED
```

### Tarjeta rechazada:
```
Número: 4000 0000 0000 0002
CVV: 123
Vencimiento: 12/25
Nombre: TEST DECLINED
```

---

## 🔄 Configurar Webhook

En el panel de Plexo:

1. Ve a **Configuración → Webhooks**
2. Agrega esta URL:
   ```
   https://TU-PROYECTO-ID.supabase.co/functions/v1/make-server-0dd48dc4/integrations/plexo/webhook
   ```
3. Selecciona eventos:
   - ✅ `payment.approved`
   - ✅ `payment.rejected`
   - ✅ `payment.refunded`

---

## 🎯 Pasar a Producción

Cuando estés listo para real:

1. Solicita credenciales de **Producción** a Plexo
2. Actualiza en Supabase Secrets:
   ```bash
   PLEXO_ENVIRONMENT=production
   ```
3. Actualiza la URL del webhook en el panel de Plexo
4. ¡Listo para procesar pagos reales! 🎉

---

## 📚 Documentación completa

Para más detalles, consulta: [/docs/PLEXO_INTEGRATION.md](/docs/PLEXO_INTEGRATION.md)
