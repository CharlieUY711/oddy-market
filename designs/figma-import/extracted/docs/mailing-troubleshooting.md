# Guía de Resolución de Errores - Sistema de Mailing

## ✅ Error Resuelto: "Missing API key"

### Problema Original
```
Error: Missing API key. Pass it to the constructor `new Resend("re_123")`
```

### Causa
El cliente de Resend se estaba instanciando al inicio del módulo con una string vacía cuando no había API key configurada.

### Solución Implementada

**Lazy Initialization**: El cliente de Resend ahora se crea solo cuando se necesita y hay una API key válida.

```typescript
// Antes (❌ Causaba error)
const resend = new Resend(Deno.env.get("RESEND_API_KEY") || "");

// Después (✅ Funciona correctamente)
function getResendClient() {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}
```

### Modo Demo

Cuando no hay API key configurada, el sistema funciona en **modo demo**:

1. **No se envían emails reales**
2. **Los logs muestran los detalles del email**:
   ```
   =================================
   RESEND_API_KEY not configured.
   Running in DEMO MODE
   =================================
   Email would be sent to: cliente@ejemplo.com
   Subject: ¡Gracias por tu compra!
   HTML length: 5234 characters
   =================================
   ```
3. **Todas las funcionalidades siguen disponibles** en la interfaz

### Verificación

Para verificar que todo funciona:

1. **Sin API key** (modo demo):
   - Ve a Panel Admin → Mailing
   - Verás un banner azul indicando "modo demo"
   - Todas las acciones funcionan pero no envían emails reales
   - Revisa los logs del servidor para ver los emails simulados

2. **Con API key** (modo producción):
   - Configura tu API key de Resend
   - El banner azul desaparece
   - Los emails se envían realmente

### Logs del Servidor

Para ver los logs en Supabase:
1. Ve a Dashboard de Supabase
2. Project → Edge Functions
3. Selecciona "make-server-0dd48dc4"
4. Ve a la pestaña "Logs"
5. Busca los mensajes que comienzan con "DEMO MODE"

### Próximos Pasos

1. ✅ Sistema funcionando en modo demo
2. ⏳ Configura tu API key de Resend para enviar emails reales
3. ⏳ Verifica tu dominio en Resend (opcional pero recomendado)
4. ⏳ Prueba enviando un email real

### Recursos

- [Documentación de Resend](https://resend.com/docs)
- [Obtener API Key](https://resend.com/api-keys)
- [Verificar Dominio](https://resend.com/domains)
- [Guía del Sistema de Mailing](/docs/mailing-system.md)
