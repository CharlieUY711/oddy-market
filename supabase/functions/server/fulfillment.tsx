import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ============================================
// TIPOS Y CONSTANTES
// ============================================

const FULFILLMENT_STATUS = {
  PENDING: "Pendiente",
  PICKING: "Recolectando",
  PACKING: "Empacando",
  READY: "Listo para envío",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const WAREHOUSE_ZONES = {
  A: "Zona A - Electrónica",
  B: "Zona B - Ropa",
  C: "Zona C - Alimentos",
  D: "Zona D - Hogar",
  E: "Zona E - General",
};

const PACKAGE_TYPES = {
  BOX_SMALL: "Caja Pequeña (20x15x10 cm)",
  BOX_MEDIUM: "Caja Mediana (40x30x20 cm)",
  BOX_LARGE: "Caja Grande (60x40x40 cm)",
  ENVELOPE: "Sobre",
  PALLET: "Pallet",
  CUSTOM: "Personalizado",
};

// ============================================
// CREAR ORDEN DE FULFILLMENT
// ============================================

app.post("/make-server-0dd48dc4/fulfillment/orders", async (c) => {
  try {
    const body = await c.req.json();
    const entity_id = body.entity_id || "default";
    const timestamp = new Date().toISOString();

    const id = `fulfillment_order:${Date.now()}`;
    
    // Generar número de fulfillment
    const fulfillment_number = await generateFulfillmentNumber(entity_id);

    const fulfillmentOrder = {
      id,
      entity_id,
      
      // Número
      fulfillment_number,
      
      // Orden relacionada
      order_id: body.order_id || null,
      
      // Cliente
      customer: body.customer || {},
      
      // Dirección de envío
      shipping_address: body.shipping_address || {},
      
      // Warehouse
      warehouse_id: body.warehouse_id || "warehouse:default",
      
      // Items
      items: (body.items || []).map((item: any) => ({
        product_id: item.product_id,
        sku: item.sku || "",
        description: item.description,
        quantity: item.quantity,
        location: item.location || "", // Ubicación en warehouse (ej: "A-12-3")
        picked_quantity: 0,
        packed_quantity: 0,
        barcode: item.barcode || "",
      })),
      
      // Estado
      status: "PENDING",
      
      // Fechas
      created_at: timestamp,
      updated_at: timestamp,
      picking_started_at: null,
      picking_completed_at: null,
      packing_started_at: null,
      packing_completed_at: null,
      shipped_at: null,
      delivered_at: null,
      
      // Asignaciones
      picker_id: null,
      packer_id: null,
      
      // Notas
      notes: body.notes || "",
      special_instructions: body.special_instructions || "",
      
      // Prioridad
      priority: body.priority || "NORMAL", // URGENT, HIGH, NORMAL, LOW
    };

    await kv.set([id], fulfillmentOrder);
    
    // Indexar
    const indexKey = ["fulfillment_orders", entity_id, id];
    await kv.set(indexKey, id);
    
    if (body.order_id) {
      const orderIndexKey = ["fulfillment_orders", "by_order", body.order_id, id];
      await kv.set(orderIndexKey, id);
    }

    return c.json({ 
      fulfillment_order: fulfillmentOrder,
      message: "Fulfillment order created successfully" 
    });
  } catch (error) {
    console.log("Error creating fulfillment order:", error);
    return c.json({ error: "Error creating fulfillment order" }, 500);
  }
});

// ============================================
// ASIGNAR PICKER
// ============================================

app.post("/make-server-0dd48dc4/fulfillment/orders/:id/assign-picker", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const timestamp = new Date().toISOString();
    
    const entry = await kv.get([id]);
    
    if (!entry.value) {
      return c.json({ error: "Fulfillment order not found" }, 404);
    }

    const order = entry.value as any;

    const updatedOrder = {
      ...order,
      picker_id: body.picker_id,
      status: "PICKING",
      picking_started_at: timestamp,
      updated_at: timestamp,
    };

    await kv.set([id], updatedOrder);

    return c.json({ 
      fulfillment_order: updatedOrder,
      message: "Picker assigned successfully" 
    });
  } catch (error) {
    console.log("Error assigning picker:", error);
    return c.json({ error: "Error assigning picker" }, 500);
  }
});

// ============================================
// REGISTRAR PICKING (Item por Item)
// ============================================

app.post("/make-server-0dd48dc4/fulfillment/orders/:id/pick-item", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const timestamp = new Date().toISOString();
    
    const entry = await kv.get([id]);
    
    if (!entry.value) {
      return c.json({ error: "Fulfillment order not found" }, 404);
    }

    const order = entry.value as any;
    
    // Actualizar item específico
    const updatedItems = order.items.map((item: any) => {
      if (item.product_id === body.product_id) {
        return {
          ...item,
          picked_quantity: body.picked_quantity,
          picker_notes: body.notes || "",
        };
      }
      return item;
    });

    // Verificar si todo está picked
    const allPicked = updatedItems.every((item: any) => 
      item.picked_quantity >= item.quantity
    );

    const updatedOrder = {
      ...order,
      items: updatedItems,
      status: allPicked ? "PACKING" : "PICKING",
      picking_completed_at: allPicked ? timestamp : null,
      packing_started_at: allPicked ? timestamp : null,
      updated_at: timestamp,
    };

    await kv.set([id], updatedOrder);

    return c.json({ 
      fulfillment_order: updatedOrder,
      message: allPicked ? "All items picked. Ready for packing" : "Item picked successfully" 
    });
  } catch (error) {
    console.log("Error picking item:", error);
    return c.json({ error: "Error picking item" }, 500);
  }
});

// ============================================
// ASIGNAR PACKER Y CREAR PAQUETES
// ============================================

app.post("/make-server-0dd48dc4/fulfillment/orders/:id/pack", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const timestamp = new Date().toISOString();
    
    const entry = await kv.get([id]);
    
    if (!entry.value) {
      return c.json({ error: "Fulfillment order not found" }, 404);
    }

    const order = entry.value as any;

    // Crear paquetes
    const packages = (body.packages || []).map((pkg: any, index: number) => ({
      package_number: index + 1,
      type: pkg.type || "BOX_MEDIUM",
      weight_kg: pkg.weight_kg || 0,
      length_cm: pkg.length_cm || 0,
      width_cm: pkg.width_cm || 0,
      height_cm: pkg.height_cm || 0,
      tracking_number: pkg.tracking_number || "",
      items: pkg.items || [],
    }));

    const updatedOrder = {
      ...order,
      packer_id: body.packer_id,
      packages,
      status: "READY",
      packing_completed_at: timestamp,
      updated_at: timestamp,
    };

    await kv.set([id], updatedOrder);

    return c.json({ 
      fulfillment_order: updatedOrder,
      message: "Order packed successfully. Ready for shipment" 
    });
  } catch (error) {
    console.log("Error packing order:", error);
    return c.json({ error: "Error packing order" }, 500);
  }
});

// ============================================
// GENERAR GUÍA DE ENVÍO (WAYBILL)
// ============================================

app.post("/make-server-0dd48dc4/fulfillment/orders/:id/generate-waybill", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const timestamp = new Date().toISOString();
    
    const entry = await kv.get([id]);
    
    if (!entry.value) {
      return c.json({ error: "Fulfillment order not found" }, 404);
    }

    const order = entry.value as any;

    const waybillId = `waybill:${Date.now()}`;
    
    const waybill = {
      id: waybillId,
      fulfillment_order_id: id,
      
      // Courier
      courier: body.courier || "UPS",
      service_type: body.service_type || "STANDARD",
      
      // Tracking
      tracking_number: body.tracking_number || `TRK${Date.now()}`,
      
      // Origen
      origin: {
        name: body.origin?.name || order.warehouse_id,
        address: body.origin?.address || {},
        contact: body.origin?.contact || {},
      },
      
      // Destino
      destination: {
        name: order.customer?.name || "",
        address: order.shipping_address,
        contact: order.customer?.contact || {},
      },
      
      // Paquetes
      packages: order.packages || [],
      
      // Fecha de generación
      generated_at: timestamp,
      
      // PDF URL
      pdf_url: `/waybills/${waybillId}.pdf`,
    };

    await kv.set([waybillId], waybill);

    // Actualizar orden
    const updatedOrder = {
      ...order,
      waybill_id: waybillId,
      updated_at: timestamp,
    };
    
    await kv.set([id], updatedOrder);

    // Aquí se integraría con shipping.tsx para crear shipment real
    // y con documents.tsx para generar PDF de la guía

    return c.json({ 
      waybill,
      fulfillment_order: updatedOrder,
      message: "Waybill generated successfully" 
    });
  } catch (error) {
    console.log("Error generating waybill:", error);
    return c.json({ error: "Error generating waybill" }, 500);
  }
});

// ============================================
// MARCAR COMO ENVIADO
// ============================================

app.post("/make-server-0dd48dc4/fulfillment/orders/:id/ship", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const timestamp = new Date().toISOString();
    
    const entry = await kv.get([id]);
    
    if (!entry.value) {
      return c.json({ error: "Fulfillment order not found" }, 404);
    }

    const order = entry.value as any;

    const updatedOrder = {
      ...order,
      status: "SHIPPED",
      shipped_at: timestamp,
      courier: body.courier || order.courier,
      tracking_numbers: body.tracking_numbers || [],
      updated_at: timestamp,
    };

    await kv.set([id], updatedOrder);

    // Aquí se integraría con inventory para confirmar la salida de stock

    return c.json({ 
      fulfillment_order: updatedOrder,
      message: "Order shipped successfully" 
    });
  } catch (error) {
    console.log("Error shipping order:", error);
    return c.json({ error: "Error shipping order" }, 500);
  }
});

// ============================================
// MARCAR COMO ENTREGADO
// ============================================

app.post("/make-server-0dd48dc4/fulfillment/orders/:id/deliver", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const timestamp = new Date().toISOString();
    
    const entry = await kv.get([id]);
    
    if (!entry.value) {
      return c.json({ error: "Fulfillment order not found" }, 404);
    }

    const order = entry.value as any;

    const updatedOrder = {
      ...order,
      status: "DELIVERED",
      delivered_at: timestamp,
      delivery_proof: body.delivery_proof || {}, // Firma, foto, etc.
      updated_at: timestamp,
    };

    await kv.set([id], updatedOrder);

    return c.json({ 
      fulfillment_order: updatedOrder,
      message: "Order delivered successfully" 
    });
  } catch (error) {
    console.log("Error delivering order:", error);
    return c.json({ error: "Error delivering order" }, 500);
  }
});

// ============================================
// CANCELAR ORDEN DE FULFILLMENT
// ============================================

app.post("/make-server-0dd48dc4/fulfillment/orders/:id/cancel", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const timestamp = new Date().toISOString();
    
    const entry = await kv.get([id]);
    
    if (!entry.value) {
      return c.json({ error: "Fulfillment order not found" }, 404);
    }

    const order = entry.value as any;

    const updatedOrder = {
      ...order,
      status: "CANCELLED",
      cancelled_at: timestamp,
      cancellation_reason: body.reason || "",
      updated_at: timestamp,
    };

    await kv.set([id], updatedOrder);

    return c.json({ 
      fulfillment_order: updatedOrder,
      message: "Fulfillment order cancelled successfully" 
    });
  } catch (error) {
    console.log("Error cancelling fulfillment order:", error);
    return c.json({ error: "Error cancelling fulfillment order" }, 500);
  }
});

// ============================================
// LISTAR ÓRDENES DE FULFILLMENT
// ============================================

app.get("/make-server-0dd48dc4/fulfillment/orders", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const status = c.req.query("status");
    const warehouse_id = c.req.query("warehouse_id");
    const picker_id = c.req.query("picker_id");

    const orders = [];
    const entries = kv.list({ prefix: ["fulfillment_orders", entity_id] });
    
    for await (const entry of entries) {
      const orderId = entry.value as string;
      const orderEntry = await kv.get([orderId]);
      
      if (orderEntry.value) {
        const order = orderEntry.value as any;
        
        // Filtros
        if (status && order.status !== status) continue;
        if (warehouse_id && order.warehouse_id !== warehouse_id) continue;
        if (picker_id && order.picker_id !== picker_id) continue;
        
        orders.push(order);
      }
    }

    return c.json({ 
      orders,
      total: orders.length 
    });
  } catch (error) {
    console.log("Error listing fulfillment orders:", error);
    return c.json({ error: "Error listing fulfillment orders" }, 500);
  }
});

// ============================================
// DASHBOARD DE FULFILLMENT
// ============================================

app.get("/make-server-0dd48dc4/fulfillment/dashboard", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const warehouse_id = c.req.query("warehouse_id");

    const orders = [];
    const entries = kv.list({ prefix: ["fulfillment_orders", entity_id] });
    
    for await (const entry of entries) {
      const orderId = entry.value as string;
      const orderEntry = await kv.get([orderId]);
      
      if (orderEntry.value) {
        const order = orderEntry.value as any;
        if (!warehouse_id || order.warehouse_id === warehouse_id) {
          orders.push(order);
        }
      }
    }

    // Métricas
    const total_orders = orders.length;
    const pending = orders.filter((o: any) => o.status === "PENDING").length;
    const picking = orders.filter((o: any) => o.status === "PICKING").length;
    const packing = orders.filter((o: any) => o.status === "PACKING").length;
    const ready = orders.filter((o: any) => o.status === "READY").length;
    const shipped = orders.filter((o: any) => o.status === "SHIPPED").length;
    const delivered = orders.filter((o: any) => o.status === "DELIVERED").length;

    // Items totales
    const total_items = orders.reduce((sum: number, o: any) => {
      return sum + (o.items?.length || 0);
    }, 0);

    // Tiempo promedio de fulfillment
    const completed_orders = orders.filter((o: any) => o.delivered_at);
    let avg_fulfillment_time = 0;
    
    if (completed_orders.length > 0) {
      const times = completed_orders.map((o: any) => {
        const start = new Date(o.created_at).getTime();
        const end = new Date(o.delivered_at).getTime();
        return (end - start) / (1000 * 60 * 60); // Horas
      });
      avg_fulfillment_time = times.reduce((a, b) => a + b, 0) / times.length;
    }

    return c.json({
      dashboard: {
        summary: {
          total_orders,
          pending,
          picking,
          packing,
          ready,
          shipped,
          delivered,
          total_items,
          avg_fulfillment_time_hours: Math.round(avg_fulfillment_time * 10) / 10,
        },
        recent_orders: orders.slice(-10),
        urgent_orders: orders.filter((o: any) => o.priority === "URGENT" && o.status !== "DELIVERED"),
      },
    });
  } catch (error) {
    console.log("Error getting fulfillment dashboard:", error);
    return c.json({ error: "Error getting fulfillment dashboard" }, 500);
  }
});

// ============================================
// GENERAR PICKING LIST
// ============================================

app.post("/make-server-0dd48dc4/fulfillment/orders/:id/picking-list", async (c) => {
  try {
    const id = c.req.param("id");
    
    const entry = await kv.get([id]);
    
    if (!entry.value) {
      return c.json({ error: "Fulfillment order not found" }, 404);
    }

    const order = entry.value as any;

    // Generar picking list
    const pickingList = generatePickingList(order);

    return c.json({ 
      picking_list: pickingList,
      message: "Picking list generated successfully" 
    });
  } catch (error) {
    console.log("Error generating picking list:", error);
    return c.json({ error: "Error generating picking list" }, 500);
  }
});

// ============================================
// FUNCIONES AUXILIARES
// ============================================

async function generateFulfillmentNumber(entity_id: string): Promise<string> {
  const counterKey = ["fulfillment_counter", entity_id];
  const counterEntry = await kv.get(counterKey);
  
  let counter = 1;
  if (counterEntry.value) {
    counter = (counterEntry.value as number) + 1;
  }
  
  await kv.set(counterKey, counter);
  
  return `FFL-${String(counter).padStart(8, "0")}`;
}

function generatePickingList(order: any): string {
  const lines = [];
  
  lines.push("================================================================================");
  lines.push("                              PICKING LIST");
  lines.push("================================================================================");
  lines.push("");
  lines.push(`Fulfillment Order: ${order.fulfillment_number}`);
  lines.push(`Warehouse: ${order.warehouse_id}`);
  lines.push(`Priority: ${order.priority}`);
  lines.push(`Created: ${new Date(order.created_at).toLocaleString()}`);
  lines.push("");
  lines.push(`Customer: ${order.customer?.name || ""}`);
  lines.push(`Shipping to: ${order.shipping_address?.city || ""}, ${order.shipping_address?.country || ""}`);
  lines.push("");
  lines.push("--------------------------------------------------------------------------------");
  lines.push(" # | LOCATION | SKU            | DESCRIPTION          | QTY | BARCODE");
  lines.push("--------------------------------------------------------------------------------");
  
  order.items.forEach((item: any, index: number) => {
    lines.push(
      ` ${String(index + 1).padStart(2)} | ` +
      `${item.location.padEnd(8)} | ` +
      `${item.sku.padEnd(14)} | ` +
      `${item.description.substring(0, 20).padEnd(20)} | ` +
      `${String(item.quantity).padStart(3)} | ` +
      `${item.barcode}`
    );
  });
  
  lines.push("--------------------------------------------------------------------------------");
  lines.push(`Total Items: ${order.items.length}`);
  lines.push(`Total Units: ${order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)}`);
  lines.push("================================================================================");
  
  if (order.special_instructions) {
    lines.push("");
    lines.push("SPECIAL INSTRUCTIONS:");
    lines.push(order.special_instructions);
    lines.push("================================================================================");
  }
  
  lines.push("");
  lines.push("Picker Signature: _______________________   Date/Time: _______________");
  lines.push("");
  lines.push("================================================================================");
  
  return lines.join("\n");
}

export default app;
