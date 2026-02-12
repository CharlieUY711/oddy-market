import { Hono } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

// Create Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// ============================================================
// CRUD DE PEDIDOS
// ============================================================

// GET /pedidos - Listar todos los pedidos
app.get("/make-server-0dd48dc4/pedidos", async (c) => {
  try {
    const tenant_id = c.req.header('x-tenant-id');
    const estado = c.req.query('estado');
    const cliente_id = c.req.query('cliente_id');
    const fecha_desde = c.req.query('fecha_desde');
    const fecha_hasta = c.req.query('fecha_hasta');
    const limit = parseInt(c.req.query('limit') || '50');

    let query = supabase
      .from('orders')
      .select(`
        *,
        cliente:customers(*),
        items:order_items(
          *,
          producto:products(*),
          variante:product_variants(*)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (tenant_id) {
      query = query.eq('tenant_id', tenant_id);
    }
    if (estado) {
      query = query.eq('estado', estado);
    }
    if (cliente_id) {
      query = query.eq('cliente_id', cliente_id);
    }
    if (fecha_desde) {
      query = query.gte('created_at', fecha_desde);
    }
    if (fecha_hasta) {
      query = query.lte('created_at', fecha_hasta);
    }

    const { data, error } = await query;
    if (error) throw error;

    return c.json({
      pedidos: data,
      total: data.length
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return c.json({ error: "Error fetching orders" }, 500);
  }
});

// GET /pedidos/:id - Obtener pedido por ID
app.get("/make-server-0dd48dc4/pedidos/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const tenant_id = c.req.header('x-tenant-id');

    let query = supabase
      .from('orders')
      .select(`
        *,
        cliente:customers(*),
        items:order_items(
          *,
          producto:products(*),
          variante:product_variants(*)
        ),
        tracking:order_tracking(*)
      `)
      .eq('id', id)
      .single();

    if (tenant_id) {
      query = query.eq('tenant_id', tenant_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    if (!data) return c.json({ error: "Pedido no encontrado" }, 404);

    return c.json({ pedido: data });
  } catch (error) {
    console.error("Error fetching order:", error);
    return c.json({ error: "Error fetching order" }, 500);
  }
});

// POST /pedidos - Crear nuevo pedido
app.post("/make-server-0dd48dc4/pedidos", async (c) => {
  try {
    const body = await c.req.json();
    const tenant_id = c.req.header('x-tenant-id');

    const {
      cliente_id,
      items, // [{ product_id, variant_id, cantidad, precio }]
      direccion_envio,
      metodo_pago,
      notas
    } = body;

    if (!cliente_id || !items || items.length === 0) {
      return c.json({ error: "cliente_id e items son requeridos" }, 400);
    }

    // Calcular totales
    let subtotal = 0;
    items.forEach((item: any) => {
      subtotal += item.precio * item.cantidad;
    });

    const costo_envio = direccion_envio ? 150 : 0; // TODO: Calcular según zona
    const total = subtotal + costo_envio;

    // Crear pedido
    const { data: pedido, error: pedidoError } = await supabase
      .from('orders')
      .insert([{
        cliente_id,
        estado: 'pendiente',
        subtotal,
        costo_envio,
        total,
        direccion_envio,
        metodo_pago: metodo_pago || 'mercadopago',
        notas: notas || null,
        tenant_id: tenant_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (pedidoError) throw pedidoError;

    // Crear items del pedido
    const itemsData = items.map((item: any) => ({
      order_id: pedido.id,
      product_id: item.product_id,
      variant_id: item.variant_id || null,
      cantidad: item.cantidad,
      precio_unitario: item.precio,
      subtotal: item.precio * item.cantidad,
      created_at: new Date().toISOString()
    }));

    const { data: itemsCreated, error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsData)
      .select();

    if (itemsError) throw itemsError;

    // Descontar stock (si es necesario)
    for (const item of items) {
      // TODO: Implementar lógica de descuento de stock
      // mediante movimientos de inventario
    }

    return c.json({
      pedido: {
        ...pedido,
        items: itemsCreated
      }
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return c.json({ error: "Error creating order" }, 500);
  }
});

// ============================================================
// CAMBIO DE ESTADO
// ============================================================

// PUT /pedidos/:id/estado - Actualizar estado del pedido
app.put("/make-server-0dd48dc4/pedidos/:id/estado", async (c) => {
  try {
    const id = c.req.param("id");
    const { estado, motivo, usuario_id } = await c.req.json();
    const tenant_id = c.req.header('x-tenant-id');

    // Estados válidos: pendiente, confirmado, preparando, enviado, en_transito, entregado, cancelado
    const estadosValidos = [
      'pendiente', 'confirmado', 'preparando', 'enviado', 
      'en_transito', 'entregado', 'cancelado', 'devuelto'
    ];

    if (!estadosValidos.includes(estado)) {
      return c.json({ error: "Estado inválido" }, 400);
    }

    // Actualizar pedido
    let query = supabase
      .from('orders')
      .update({
        estado,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (tenant_id) {
      query = query.eq('tenant_id', tenant_id);
    }

    const { data: pedido, error: pedidoError } = await query;
    if (pedidoError) throw pedidoError;
    if (!pedido) return c.json({ error: "Pedido no encontrado" }, 404);

    // Registrar cambio de estado en tracking
    const { error: trackingError } = await supabase
      .from('order_tracking')
      .insert([{
        order_id: id,
        estado,
        descripcion: motivo || `Pedido ${estado}`,
        usuario_id: usuario_id || null,
        created_at: new Date().toISOString()
      }]);

    if (trackingError) {
      console.warn("Error creating tracking:", trackingError);
    }

    // TODO: Enviar notificación al cliente

    return c.json({
      pedido,
      mensaje: `Pedido actualizado a estado: ${estado}`
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return c.json({ error: "Error updating order status" }, 500);
  }
});

// ============================================================
// TRACKING
// ============================================================

// GET /pedidos/:id/tracking - Obtener tracking del pedido
app.get("/make-server-0dd48dc4/pedidos/:id/tracking", async (c) => {
  try {
    const order_id = c.req.param("id");

    const { data, error } = await supabase
      .from('order_tracking')
      .select('*')
      .eq('order_id', order_id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return c.json({
      order_id,
      tracking: data,
      total_eventos: data.length
    });
  } catch (error) {
    console.error("Error fetching tracking:", error);
    return c.json({ error: "Error fetching tracking" }, 500);
  }
});

// POST /pedidos/:id/tracking - Agregar evento de tracking
app.post("/make-server-0dd48dc4/pedidos/:id/tracking", async (c) => {
  try {
    const order_id = c.req.param("id");
    const { estado, descripcion, ubicacion, usuario_id } = await c.req.json();

    const { data, error } = await supabase
      .from('order_tracking')
      .insert([{
        order_id,
        estado: estado || 'info',
        descripcion: descripcion || '',
        ubicacion: ubicacion || null,
        usuario_id: usuario_id || null,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    return c.json({ tracking: data });
  } catch (error) {
    console.error("Error creating tracking event:", error);
    return c.json({ error: "Error creating tracking event" }, 500);
  }
});

// ============================================================
// FACTURACIÓN
// ============================================================

// POST /pedidos/:id/facturar - Facturar pedido
app.post("/make-server-0dd48dc4/pedidos/:id/facturar", async (c) => {
  try {
    const id = c.req.param("id");
    const { tipo_comprobante, datos_fiscales } = await c.req.json();
    const tenant_id = c.req.header('x-tenant-id');

    // Obtener pedido
    let query = supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          producto:products(*)
        ),
        cliente:customers(*)
      `)
      .eq('id', id)
      .single();

    if (tenant_id) {
      query = query.eq('tenant_id', tenant_id);
    }

    const { data: pedido, error: pedidoError } = await query;
    if (pedidoError) throw pedidoError;
    if (!pedido) return c.json({ error: "Pedido no encontrado" }, 404);

    // TODO: Integrar con sistema de facturación (Fixed DGI Uruguay, AFIP Argentina, etc.)
    // Por ahora, solo guardamos los datos

    const { data: factura, error: facturaError } = await supabase
      .from('invoices')
      .insert([{
        order_id: id,
        cliente_id: pedido.cliente_id,
        tipo_comprobante: tipo_comprobante || 'eTicket',
        subtotal: pedido.subtotal,
        iva: pedido.subtotal * 0.22, // 22% IVA Uruguay
        total: pedido.total,
        datos_fiscales: datos_fiscales || {},
        estado: 'generada',
        tenant_id: tenant_id || null,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (facturaError) throw facturaError;

    // Actualizar pedido
    await supabase
      .from('orders')
      .update({
        facturado: true,
        factura_id: factura.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    return c.json({
      factura,
      mensaje: "Factura generada exitosamente"
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return c.json({ error: "Error creating invoice" }, 500);
  }
});

// ============================================================
// REPORTES
// ============================================================

// GET /pedidos/reporte/ventas - Reporte de ventas
app.get("/make-server-0dd48dc4/pedidos/reporte/ventas", async (c) => {
  try {
    const fecha_desde = c.req.query('fecha_desde');
    const fecha_hasta = c.req.query('fecha_hasta');
    const tenant_id = c.req.header('x-tenant-id');

    let query = supabase
      .from('orders')
      .select('*');

    if (tenant_id) {
      query = query.eq('tenant_id', tenant_id);
    }
    if (fecha_desde) {
      query = query.gte('created_at', fecha_desde);
    }
    if (fecha_hasta) {
      query = query.lte('created_at', fecha_hasta);
    }

    const { data: pedidos, error } = await query;
    if (error) throw error;

    // Calcular métricas
    let totalVentas = 0;
    let totalPedidos = pedidos.length;
    const estadosCount: any = {};
    const ventasPorDia: any = {};

    pedidos.forEach(p => {
      totalVentas += p.total || 0;
      
      // Contar por estado
      estadosCount[p.estado] = (estadosCount[p.estado] || 0) + 1;
      
      // Ventas por día
      const fecha = new Date(p.created_at).toISOString().split('T')[0];
      if (!ventasPorDia[fecha]) {
        ventasPorDia[fecha] = { fecha, ventas: 0, pedidos: 0 };
      }
      ventasPorDia[fecha].ventas += p.total || 0;
      ventasPorDia[fecha].pedidos += 1;
    });

    const ticketPromedio = totalPedidos > 0 ? totalVentas / totalPedidos : 0;

    return c.json({
      periodo: {
        desde: fecha_desde || 'inicio',
        hasta: fecha_hasta || 'ahora'
      },
      metricas: {
        total_ventas: totalVentas,
        total_pedidos: totalPedidos,
        ticket_promedio: ticketPromedio,
        por_estado: estadosCount
      },
      ventas_por_dia: Object.values(ventasPorDia).sort((a: any, b: any) => 
        a.fecha.localeCompare(b.fecha)
      )
    });
  } catch (error) {
    console.error("Error fetching sales report:", error);
    return c.json({ error: "Error fetching sales report" }, 500);
  }
});

// ============================================================
// CANCELACIÓN Y DEVOLUCIONES
// ============================================================

// PUT /pedidos/:id/cancelar - Cancelar pedido
app.put("/make-server-0dd48dc4/pedidos/:id/cancelar", async (c) => {
  try {
    const id = c.req.param("id");
    const { motivo, usuario_id } = await c.req.json();
    const tenant_id = c.req.header('x-tenant-id');

    // Actualizar estado
    let query = supabase
      .from('orders')
      .update({
        estado: 'cancelado',
        motivo_cancelacion: motivo || 'Sin motivo',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (tenant_id) {
      query = query.eq('tenant_id', tenant_id);
    }

    const { data: pedido, error } = await query;
    if (error) throw error;
    if (!pedido) return c.json({ error: "Pedido no encontrado" }, 404);

    // Registrar en tracking
    await supabase
      .from('order_tracking')
      .insert([{
        order_id: id,
        estado: 'cancelado',
        descripcion: `Pedido cancelado. Motivo: ${motivo || 'Sin motivo'}`,
        usuario_id: usuario_id || null,
        created_at: new Date().toISOString()
      }]);

    // TODO: Devolver stock si corresponde
    // TODO: Procesar reembolso si corresponde

    return c.json({
      pedido,
      mensaje: "Pedido cancelado exitosamente"
    });
  } catch (error) {
    console.error("Error canceling order:", error);
    return c.json({ error: "Error canceling order" }, 500);
  }
});

export default app;
