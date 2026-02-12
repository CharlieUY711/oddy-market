import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ============================================================
// ALERTAS DE STOCK BAJO
// ============================================================

// GET /inventario/alertas/stock-bajo
app.get("/make-server-0dd48dc4/inventario/alertas/stock-bajo", async (c) => {
  try {
    const tenant_id = c.req.header('x-tenant-id');

    // Productos base con stock bajo
    let query = supabase
      .from('products')
      .select('*')
      .lte('stock_disponible', supabase.raw('stock_minimo'))
      .gt('stock_minimo', 0);

    if (tenant_id) {
      query = query.eq('tenant_id', tenant_id);
    }

    const { data: productos, error: prodError } = await query;
    if (prodError) throw prodError;

    // Variantes con stock bajo
    const { data: variantes, error: varError } = await supabase
      .from('product_variants')
      .select(`
        *,
        product:products!inner(*)
      `)
      .lte('stock_disponible', supabase.raw('stock_minimo'))
      .gt('stock_minimo', 0);

    if (varError) throw varError;

    return c.json({
      alertas: {
        productos: productos || [],
        variantes: variantes || []
      },
      total: (productos?.length || 0) + (variantes?.length || 0)
    });
  } catch (error) {
    console.error("Error fetching stock alerts:", error);
    return c.json({ error: "Error fetching stock alerts" }, 500);
  }
});

// ============================================================
// ALERTAS DE VENCIMIENTO
// ============================================================

// GET /inventario/alertas/vencimiento?dias=30
app.get("/make-server-0dd48dc4/inventario/alertas/vencimiento", async (c) => {
  try {
    const dias = parseInt(c.req.query('dias') || '30');
    const tenant_id = c.req.header('x-tenant-id');
    
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    // Productos base por vencer
    let queryProd = supabase
      .from('products')
      .select('*')
      .not('fecha_vencimiento', 'is', null)
      .lte('fecha_vencimiento', fechaLimite.toISOString());

    if (tenant_id) {
      queryProd = queryProd.eq('tenant_id', tenant_id);
    }

    const { data: productos, error: prodError } = await queryProd;
    if (prodError) throw prodError;

    // Variantes por vencer
    const { data: variantes, error: varError } = await supabase
      .from('product_variants')
      .select(`
        *,
        product:products!inner(*)
      `)
      .not('fecha_vencimiento', 'is', null)
      .lte('fecha_vencimiento', fechaLimite.toISOString());

    if (varError) throw varError;

    // Categorizar por urgencia
    const hoy = new Date();
    const vencidos: any[] = [];
    const proximos15Dias: any[] = [];
    const proximos30Dias: any[] = [];
    const proximos60Dias: any[] = [];

    const categorizar = (items: any[]) => {
      items.forEach(item => {
        const fechaVenc = new Date(item.fecha_vencimiento);
        const diasRestantes = Math.ceil((fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diasRestantes < 0) {
          vencidos.push({ ...item, dias_restantes: diasRestantes });
        } else if (diasRestantes <= 15) {
          proximos15Dias.push({ ...item, dias_restantes: diasRestantes });
        } else if (diasRestantes <= 30) {
          proximos30Dias.push({ ...item, dias_restantes: diasRestantes });
        } else if (diasRestantes <= 60) {
          proximos60Dias.push({ ...item, dias_restantes: diasRestantes });
        }
      });
    };

    categorizar(productos || []);
    categorizar(variantes || []);

    return c.json({
      alertas: {
        vencidos: vencidos.sort((a, b) => a.dias_restantes - b.dias_restantes),
        proximos_15_dias: proximos15Dias.sort((a, b) => a.dias_restantes - b.dias_restantes),
        proximos_30_dias: proximos30Dias.sort((a, b) => a.dias_restantes - b.dias_restantes),
        proximos_60_dias: proximos60Dias.sort((a, b) => a.dias_restantes - b.dias_restantes)
      },
      total: vencidos.length + proximos15Dias.length + proximos30Dias.length + proximos60Dias.length
    });
  } catch (error) {
    console.error("Error fetching expiry alerts:", error);
    return c.json({ error: "Error fetching expiry alerts" }, 500);
  }
});

// ============================================================
// MOVIMIENTOS DE STOCK
// ============================================================

// POST /inventario/movimientos - Registrar movimiento de stock
app.post("/make-server-0dd48dc4/inventario/movimientos", async (c) => {
  try {
    const body = await c.req.json();
    const tenant_id = c.req.header('x-tenant-id');

    const {
      product_id,
      variant_id,
      tipo, // 'entrada' | 'salida' | 'ajuste' | 'venta' | 'devolucion'
      cantidad,
      motivo,
      referencia, // ID de pedido, compra, etc.
      usuario_id
    } = body;

    if (!product_id || !tipo || !cantidad) {
      return c.json({ error: "product_id, tipo y cantidad son requeridos" }, 400);
    }

    // Iniciar transacción (simulada con múltiples queries)
    // 1. Registrar movimiento
    const { data: movimiento, error: movError } = await supabase
      .from('inventory_movements')
      .insert([{
        product_id,
        variant_id: variant_id || null,
        tipo,
        cantidad,
        motivo: motivo || null,
        referencia: referencia || null,
        usuario_id: usuario_id || null,
        tenant_id: tenant_id || null,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (movError) throw movError;

    // 2. Actualizar stock
    const tabla = variant_id ? 'product_variants' : 'products';
    const idColumn = variant_id ? 'id' : 'id';
    const idValue = variant_id || product_id;

    // Obtener stock actual
    const { data: item, error: getError } = await supabase
      .from(tabla)
      .select('stock_disponible')
      .eq(idColumn, idValue)
      .single();

    if (getError) throw getError;

    // Calcular nuevo stock
    let nuevoStock = item.stock_disponible;
    if (tipo === 'entrada' || tipo === 'devolucion') {
      nuevoStock += cantidad;
    } else if (tipo === 'salida' || tipo === 'venta') {
      nuevoStock -= cantidad;
    } else if (tipo === 'ajuste') {
      nuevoStock = cantidad; // Ajuste absoluto
    }

    // Actualizar stock
    const { error: updateError } = await supabase
      .from(tabla)
      .update({
        stock_disponible: nuevoStock,
        updated_at: new Date().toISOString()
      })
      .eq(idColumn, idValue);

    if (updateError) throw updateError;

    return c.json({
      movimiento,
      stock_anterior: item.stock_disponible,
      stock_nuevo: nuevoStock
    });
  } catch (error) {
    console.error("Error creating movement:", error);
    return c.json({ error: "Error creating movement" }, 500);
  }
});

// GET /inventario/movimientos?product_id=123
app.get("/make-server-0dd48dc4/inventario/movimientos", async (c) => {
  try {
    const product_id = c.req.query('product_id');
    const variant_id = c.req.query('variant_id');
    const tipo = c.req.query('tipo');
    const limit = parseInt(c.req.query('limit') || '50');
    const tenant_id = c.req.header('x-tenant-id');

    let query = supabase
      .from('inventory_movements')
      .select(`
        *,
        product:products(*),
        variant:product_variants(*)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (tenant_id) {
      query = query.eq('tenant_id', tenant_id);
    }
    if (product_id) {
      query = query.eq('product_id', product_id);
    }
    if (variant_id) {
      query = query.eq('variant_id', variant_id);
    }
    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    const { data, error } = await query;
    if (error) throw error;

    return c.json({
      movimientos: data,
      total: data.length
    });
  } catch (error) {
    console.error("Error fetching movements:", error);
    return c.json({ error: "Error fetching movements" }, 500);
  }
});

// ============================================================
// REPORTE FIFO/FEFO
// ============================================================

// GET /inventario/reporte/fifo?product_id=123
app.get("/make-server-0dd48dc4/inventario/reporte/fifo", async (c) => {
  try {
    const product_id = c.req.query('product_id');
    const tenant_id = c.req.header('x-tenant-id');

    if (!product_id) {
      return c.json({ error: "product_id requerido" }, 400);
    }

    // Obtener producto
    let queryProd = supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .single();

    if (tenant_id) {
      queryProd = queryProd.eq('tenant_id', tenant_id);
    }

    const { data: producto, error: prodError } = await queryProd;
    if (prodError) throw prodError;

    // Obtener movimientos de entrada (compras)
    const { data: entradas, error: entError } = await supabase
      .from('inventory_movements')
      .select('*')
      .eq('product_id', product_id)
      .in('tipo', ['entrada', 'compra'])
      .order('created_at', { ascending: true });

    if (entError) throw entError;

    // Obtener movimientos de salida (ventas)
    const { data: salidas, error: salError } = await supabase
      .from('inventory_movements')
      .select('*')
      .eq('product_id', product_id)
      .in('tipo', ['salida', 'venta'])
      .order('created_at', { ascending: true });

    if (salError) throw salError;

    // Calcular FIFO
    let stockRestante = producto.stock_disponible;
    const lotesPendientes: any[] = [];
    
    let totalEntradas = 0;
    entradas?.forEach(e => {
      totalEntradas += e.cantidad;
    });

    let totalSalidas = 0;
    salidas?.forEach(s => {
      totalSalidas += s.cantidad;
    });

    // Simplificación: mostrar lotes pendientes si hay trazabilidad
    if (producto.requiere_trazabilidad) {
      // Agrupar por lote
      const lotes = new Map();
      
      entradas?.forEach(e => {
        if (e.motivo && e.motivo.includes('lote')) {
          const loteMatch = e.motivo.match(/lote:(\S+)/);
          if (loteMatch) {
            const lote = loteMatch[1];
            if (!lotes.has(lote)) {
              lotes.set(lote, { lote, entrada: 0, salida: 0 });
            }
            lotes.get(lote).entrada += e.cantidad;
          }
        }
      });

      salidas?.forEach(s => {
        if (s.motivo && s.motivo.includes('lote')) {
          const loteMatch = s.motivo.match(/lote:(\S+)/);
          if (loteMatch) {
            const lote = loteMatch[1];
            if (lotes.has(lote)) {
              lotes.get(lote).salida += s.cantidad;
            }
          }
        }
      });

      lotes.forEach((value, key) => {
        const pendiente = value.entrada - value.salida;
        if (pendiente > 0) {
          lotesPendientes.push({
            lote: key,
            cantidad_pendiente: pendiente
          });
        }
      });
    }

    return c.json({
      producto_id: product_id,
      nombre: producto.nombre,
      stock_actual: stockRestante,
      total_entradas: totalEntradas,
      total_salidas: totalSalidas,
      lotes_pendientes: lotesPendientes,
      requiere_trazabilidad: producto.requiere_trazabilidad || false,
      metodo: producto.requiere_trazabilidad ? 'FEFO' : 'FIFO'
    });
  } catch (error) {
    console.error("Error in FIFO report:", error);
    return c.json({ error: "Error in FIFO report" }, 500);
  }
});

// ============================================================
// AJUSTES DE INVENTARIO
// ============================================================

// POST /inventario/ajustes - Realizar ajuste de inventario
app.post("/make-server-0dd48dc4/inventario/ajustes", async (c) => {
  try {
    const body = await c.req.json();
    const tenant_id = c.req.header('x-tenant-id');

    const {
      product_id,
      variant_id,
      stock_sistema,
      stock_fisico,
      motivo,
      usuario_id
    } = body;

    if (!product_id || stock_fisico === undefined) {
      return c.json({ error: "product_id y stock_fisico son requeridos" }, 400);
    }

    const diferencia = stock_fisico - (stock_sistema || 0);

    // Registrar movimiento de ajuste
    const { data: ajuste, error: ajusteError } = await supabase
      .from('inventory_movements')
      .insert([{
        product_id,
        variant_id: variant_id || null,
        tipo: 'ajuste',
        cantidad: stock_fisico,
        motivo: motivo || `Ajuste inventario físico. Diferencia: ${diferencia}`,
        usuario_id: usuario_id || null,
        tenant_id: tenant_id || null,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (ajusteError) throw ajusteError;

    // Actualizar stock
    const tabla = variant_id ? 'product_variants' : 'products';
    const idColumn = 'id';
    const idValue = variant_id || product_id;

    const { error: updateError } = await supabase
      .from(tabla)
      .update({
        stock_disponible: stock_fisico,
        updated_at: new Date().toISOString()
      })
      .eq(idColumn, idValue);

    if (updateError) throw updateError;

    return c.json({
      ajuste,
      stock_sistema: stock_sistema || 0,
      stock_fisico,
      diferencia
    });
  } catch (error) {
    console.error("Error creating adjustment:", error);
    return c.json({ error: "Error creating adjustment" }, 500);
  }
});

// ============================================================
// DASHBOARD DE INVENTARIO
// ============================================================

// GET /inventario/dashboard - Dashboard con métricas
app.get("/make-server-0dd48dc4/inventario/dashboard", async (c) => {
  try {
    const tenant_id = c.req.header('x-tenant-id');

    // Total de productos
    let queryTotal = supabase
      .from('products')
      .select('id', { count: 'exact', head: true });

    if (tenant_id) {
      queryTotal = queryTotal.eq('tenant_id', tenant_id);
    }

    const { count: totalProductos } = await queryTotal;

    // Productos con stock bajo
    let queryBajo = supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .lte('stock_disponible', supabase.raw('stock_minimo'))
      .gt('stock_minimo', 0);

    if (tenant_id) {
      queryBajo = queryBajo.eq('tenant_id', tenant_id);
    }

    const { count: stockBajo } = await queryBajo;

    // Productos sin stock
    let querySinStock = supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('stock_disponible', 0);

    if (tenant_id) {
      querySinStock = querySinStock.eq('tenant_id', tenant_id);
    }

    const { count: sinStock } = await querySinStock;

    // Productos por vencer (próximos 30 días)
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + 30);

    let queryVencer = supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .not('fecha_vencimiento', 'is', null)
      .lte('fecha_vencimiento', fechaLimite.toISOString());

    if (tenant_id) {
      queryVencer = queryVencer.eq('tenant_id', tenant_id);
    }

    const { count: porVencer } = await queryVencer;

    // Valor total del inventario
    let queryValor = supabase
      .from('products')
      .select('precio, stock_disponible');

    if (tenant_id) {
      queryValor = queryValor.eq('tenant_id', tenant_id);
    }

    const { data: productos } = await queryValor;

    let valorTotal = 0;
    productos?.forEach(p => {
      valorTotal += (p.precio || 0) * (p.stock_disponible || 0);
    });

    return c.json({
      metricas: {
        total_productos: totalProductos || 0,
        stock_bajo: stockBajo || 0,
        sin_stock: sinStock || 0,
        por_vencer_30_dias: porVencer || 0,
        valor_total_inventario: valorTotal
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return c.json({ error: "Error fetching dashboard" }, 500);
  }
});

export default app;
