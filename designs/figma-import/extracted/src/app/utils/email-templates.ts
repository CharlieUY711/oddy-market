// Email templates for ODDY Market
// These templates can be stored in the database and customized

export const orderConfirmationTemplate = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Compra - ODDY Market</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ff6b35 0%, #ff8f5c 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">ODDY Market</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">¡Gracias por tu compra!</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Hola {{customerName}},</h2>
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Tu pedido ha sido confirmado y estamos preparándolo para el envío. Recibirás un email con el código de seguimiento cuando tu pedido sea despachado.
              </p>
              
              <!-- Order Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; border: 2px solid #f0f0f0; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px; background-color: #fafafa; border-bottom: 2px solid #f0f0f0;">
                    <h3 style="margin: 0; color: #ff6b35; font-size: 18px;">Resumen del Pedido</h3>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #666666; font-size: 14px;">Número de orden:</td>
                        <td align="right" style="color: #333333; font-size: 14px; font-weight: bold;">{{orderNumber}}</td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px;">Fecha:</td>
                        <td align="right" style="color: #333333; font-size: 14px;">{{orderDate}}</td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding-top: 15px; border-top: 1px solid #f0f0f0;">Total:</td>
                        <td align="right" style="color: #ff6b35; font-size: 20px; font-weight: bold; padding-top: 15px; border-top: 1px solid #f0f0f0;">${{orderTotal}}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Products -->
              <h3 style="margin: 30px 0 15px 0; color: #333333; font-size: 18px;">Productos</h3>
              <div style="border: 1px solid #f0f0f0; border-radius: 8px; padding: 15px;">
                {{orderItems}}
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="{{trackingLink}}" style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #ff8f5c 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);">
                  Ver Estado del Pedido
                </a>
              </div>
              
              <p style="margin: 30px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                Si tenés alguna pregunta, no dudes en contactarnos.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 30px; text-align: center; border-top: 1px solid #f0f0f0;">
              <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px;">ODDY Market</p>
              <p style="margin: 0 0 15px 0; color: #999999; font-size: 12px;">Tu tienda de confianza</p>
              <div style="margin: 15px 0;">
                <a href="https://facebook.com" style="margin: 0 8px; color: #4ecdc4; text-decoration: none;">Facebook</a>
                <a href="https://instagram.com" style="margin: 0 8px; color: #4ecdc4; text-decoration: none;">Instagram</a>
                <a href="https://twitter.com" style="margin: 0 8px; color: #4ecdc4; text-decoration: none;">Twitter</a>
              </div>
              <p style="margin: 15px 0 0 0; color: #cccccc; font-size: 11px;">
                © 2026 ODDY Market. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const newsletterTemplate = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Newsletter - ODDY Market</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ff6b35 0%, #4ecdc4 100%); padding: 60px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 36px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">ODDY Market</h1>
              <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 18px; opacity: 0.95;">{{newsletterTitle}}</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Hola {{customerName}},</h2>
              <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                {{newsletterIntro}}
              </p>
              
              <!-- Featured Section -->
              <div style="background: linear-gradient(135deg, #fff5f0 0%, #f0fffe 100%); border-radius: 12px; padding: 30px; margin: 30px 0;">
                <h3 style="margin: 0 0 20px 0; color: #ff6b35; font-size: 22px; text-align: center;">✨ Destacados del Mes</h3>
                {{featuredContent}}
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="{{ctaLink}}" style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #ff8f5c 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 8px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);">
                  {{ctaText}}
                </a>
              </div>
              
              <p style="margin: 30px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                Gracias por ser parte de ODDY Market
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 30px; text-align: center; border-top: 1px solid #f0f0f0;">
              <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px;">ODDY Market</p>
              <p style="margin: 0 0 15px 0; color: #999999; font-size: 12px;">Tu tienda de confianza</p>
              <div style="margin: 15px 0;">
                <a href="https://facebook.com" style="margin: 0 8px; color: #4ecdc4; text-decoration: none;">Facebook</a>
                <a href="https://instagram.com" style="margin: 0 8px; color: #4ecdc4; text-decoration: none;">Instagram</a>
                <a href="https://twitter.com" style="margin: 0 8px; color: #4ecdc4; text-decoration: none;">Twitter</a>
              </div>
              <p style="margin: 15px 0 0 0; color: #cccccc; font-size: 11px;">
                <a href="{{unsubscribeLink}}" style="color: #cccccc; text-decoration: underline;">Cancelar suscripción</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const cartRecoveryTemplate = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu carrito te espera - ODDY Market</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #4ecdc4 0%, #5eddd4 100%); padding: 50px 30px; text-align: center;">
              <div style="font-size: 60px; margin-bottom: 15px;">🛒</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">Tu carrito te espera</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">¡No te pierdas estos productos!</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Hola {{customerName}},</h2>
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Notamos que dejaste algunos productos en tu carrito. ¡No te preocupes! Los guardamos para vos.
              </p>
              
              <!-- Cart Items -->
              <div style="background-color: #fafafa; border-radius: 12px; padding: 25px; margin: 30px 0;">
                <h3 style="margin: 0 0 20px 0; color: #4ecdc4; font-size: 18px;">Productos en tu carrito:</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  {{items}}
                </ul>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
                  <table width="100%" cellpadding="5" cellspacing="0">
                    <tr>
                      <td style="color: #333333; font-size: 18px; font-weight: bold;">Total:</td>
                      <td align="right" style="color: #4ecdc4; font-size: 24px; font-weight: bold;">${{total}}</td>
                    </tr>
                  </table>
                </div>
              </div>
              
              <!-- Special Offer -->
              <div style="background: linear-gradient(135deg, #fff5f0 0%, #ffe6d9 100%); border-left: 4px solid #ff6b35; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <p style="margin: 0; color: #ff6b35; font-size: 16px; font-weight: bold;">🎁 Oferta especial</p>
                <p style="margin: 10px 0 0 0; color: #666666; font-size: 14px;">
                  Completá tu compra en las próximas 24 horas y obtené un <strong>10% de descuento</strong> adicional.
                </p>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="{{cartLink}}" style="display: inline-block; background: linear-gradient(135deg, #4ecdc4 0%, #5eddd4 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 8px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);">
                  Completar Mi Compra
                </a>
              </div>
              
              <p style="margin: 30px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                ¿Necesitás ayuda? Nuestro equipo está disponible para asistirte.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 30px; text-align: center; border-top: 1px solid #f0f0f0;">
              <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px;">ODDY Market</p>
              <p style="margin: 0 0 15px 0; color: #999999; font-size: 12px;">Tu tienda de confianza</p>
              <div style="margin: 15px 0;">
                <a href="https://facebook.com" style="margin: 0 8px; color: #4ecdc4; text-decoration: none;">Facebook</a>
                <a href="https://instagram.com" style="margin: 0 8px; color: #4ecdc4; text-decoration: none;">Instagram</a>
                <a href="https://whatsapp.com" style="margin: 0 8px; color: #4ecdc4; text-decoration: none;">WhatsApp</a>
              </div>
              <p style="margin: 15px 0 0 0; color: #cccccc; font-size: 11px;">
                © 2026 ODDY Market. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const shippingConfirmationTemplate = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu pedido está en camino - ODDY Market</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #4ecdc4 0%, #45b7af 100%); padding: 50px 30px; text-align: center;">
              <div style="font-size: 60px; margin-bottom: 15px;">📦</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">¡Tu pedido está en camino!</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">Seguí tu envío en tiempo real</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Hola {{customerName}},</h2>
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                ¡Buenas noticias! Tu pedido #{{orderNumber}} ha sido enviado y está en camino.
              </p>
              
              <!-- Tracking Info -->
              <div style="background: linear-gradient(135deg, #f0fffe 0%, #e6fffe 100%); border-radius: 12px; padding: 25px; margin: 30px 0; border: 2px solid #4ecdc4;">
                <h3 style="margin: 0 0 15px 0; color: #4ecdc4; font-size: 18px;">Información de Envío</h3>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #666666; font-size: 14px;">Transportista:</td>
                    <td align="right" style="color: #333333; font-size: 14px; font-weight: bold;">{{carrier}}</td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-size: 14px;">Código de seguimiento:</td>
                    <td align="right" style="color: #4ecdc4; font-size: 16px; font-weight: bold; font-family: monospace;">{{trackingNumber}}</td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-size: 14px;">Entrega estimada:</td>
                    <td align="right" style="color: #333333; font-size: 14px; font-weight: bold;">{{estimatedDelivery}}</td>
                  </tr>
                </table>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="{{trackingLink}}" style="display: inline-block; background: linear-gradient(135deg, #4ecdc4 0%, #5eddd4 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 8px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);">
                  Rastrear Mi Pedido
                </a>
              </div>
              
              <p style="margin: 30px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                Te notificaremos cuando tu pedido esté listo para ser entregado.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 30px; text-align: center; border-top: 1px solid #f0f0f0;">
              <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px;">ODDY Market</p>
              <p style="margin: 0 0 15px 0; color: #999999; font-size: 12px;">Tu tienda de confianza</p>
              <div style="margin: 15px 0;">
                <a href="https://facebook.com" style="margin: 0 8px; color: #4ecdc4; text-decoration: none;">Facebook</a>
                <a href="https://instagram.com" style="margin: 0 8px; color: #4ecdc4; text-decoration: none;">Instagram</a>
                <a href="https://whatsapp.com" style="margin: 0 8px; color: #4ecdc4; text-decoration: none;">WhatsApp</a>
              </div>
              <p style="margin: 15px 0 0 0; color: #cccccc; font-size: 11px;">
                © 2026 ODDY Market. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
