import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ============================================
// TIPOS Y CONSTANTES
// ============================================

const REGISTER_STATUS = {
  CLOSED: "Cerrado",
  OPEN: "Abierto",
  SUSPENDED: "Suspendido",
};

const SHIFT_STATUS = {
  OPEN: "Abierto",
  CLOSED: "Cerrado",
};

const SALE_STATUS = {
  IN_PROGRESS: "En Progreso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  SUSPENDED: "Suspendida",
};

const PAYMENT_METHODS = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  TRANSFER: "Transferencia",
  MERCADOPAGO: "Mercado Pago",
  MULTIPLE: "Múltiple",
};

// ============================================
// GESTIÓN DE CAJAS (REGISTERS)
// ============================================

app.post("/make-server-0dd48dc4/pos/registers", async (c) => {
  try {
    const body = await c.req.json();
    const entity_id = body.entity_id || "default";
    const timestamp = new Date().toISOString();

    const id = `register:${Date.now()}`;

    const register = {
      id,
      entity_id,
      
      // Información de la caja
      name: body.name || "Caja 1",
      code: body.code || `REG-${Date.now().toString().slice(-4)}`,
      location: body.location || "Tienda Principal",
      
      // Estado
      status: "CLOSED",
      
      // Hardware asociado
      printer_id: body.printer_id || null,
      scanner_id: body.scanner_id || null,
      
      // Configuración
      config: {
        allow_discount: body.config?.allow_discount !== false,
        max_discount_percent: body.config?.max_discount_percent || 20,
        require_supervisor_for_discount: body.config?.require_supervisor_for_discount || false,
        auto_print_ticket: body.config?.auto_print_ticket !== false,
      },
      
      // Metadata
      created_at: timestamp,
      updated_at: timestamp,
      active: true,
    };

    await kv.set([id], register);
    
    // Indexar por entity_id
    const indexKey = ["pos_registers", entity_id, id];
    await kv.set(indexKey, id);

    return c.json({ 
      register,
      message: "Register created successfully" 
    });
  } catch (error) {
    console.log("Error creating register:", error);
    return c.json({ error: "Error creating register" }, 500);
  }
});

// ============================================
// LISTAR CAJAS
// ============================================

app.get("/make-server-0dd48dc4/pos/registers", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const status = c.req.query("status");

    const registers = [];
    const entries = kv.list({ prefix: ["pos_registers", entity_id] });
    
    for await (const entry of entries) {
      const registerId = entry.value as string;
      const registerEntry = await kv.get([registerId]);
      
      if (registerEntry.value) {
        registers.push(registerEntry.value);
      }
    }

    // Filtrar por estado
    let filtered = registers;
    if (status) {
      filtered = filtered.filter((reg: any) => reg.status === status);
    }

    return c.json({ 
      registers: filtered,
      total: filtered.length 
    });
  } catch (error) {
    console.log("Error listing registers:", error);
    return c.json({ error: "Error listing registers" }, 500);
  }
});

// ============================================
// ABRIR TURNO (SHIFT)
// ============================================

app.post("/make-server-0dd48dc4/pos/shifts/open", async (c) => {
  try {
    const body = await c.req.json();
    const entity_id = body.entity_id || "default";
    const timestamp = new Date().toISOString();

    const id = `shift:${Date.now()}`;

    // Verificar que la caja exista
    const registerEntry = await kv.get([body.register_id]);
    if (!registerEntry.value) {
      return c.json({ error: "Register not found" }, 404);
    }

    const register = registerEntry.value as any;

    // Verificar que no haya turno abierto
    if (register.status === "OPEN") {
      return c.json({ error: "Register already has an open shift" }, 400);
    }

    const shift = {
      id,
      entity_id,
      
      // Caja y cajero
      register_id: body.register_id,
      register_name: register.name,
      cashier_id: body.cashier_id,
      cashier_name: body.cashier_name || "",
      
      // Fondo inicial
      opening_cash: body.opening_cash || 0,
      
      // Contadores
      total_sales: 0,
      total_cash: 0,
      total_card: 0,
      total_transfer: 0,
      total_other: 0,
      sales_count: 0,
      
      // Estado
      status: "OPEN",
      
      // Fechas
      opened_at: timestamp,
      closed_at: null,
      
      // Ventas del turno
      sales_ids: [],
      
      // Notas
      opening_notes: body.opening_notes || "",
      closing_notes: null,
      
      created_at: timestamp,
      updated_at: timestamp,
    };

    await kv.set([id], shift);
    
    // Indexar por entity_id y register_id
    const indexKey = ["pos_shifts", entity_id, id];
    await kv.set(indexKey, id);
    
    const registerIndexKey = ["pos_shifts", "by_register", body.register_id, id];
    await kv.set(registerIndexKey, id);
    
    // Actualizar estado de la caja
    const updatedRegister = {
      ...register,
      status: "OPEN",
      current_shift_id: id,
      updated_at: timestamp,
    };
    await kv.set([body.register_id], updatedRegister);

    return c.json({ 
      shift,
      register: updatedRegister,
      message: "Shift opened successfully" 
    });
  } catch (error) {
    console.log("Error opening shift:", error);
    return c.json({ error: "Error opening shift" }, 500);
  }
});

// ============================================
// CERRAR TURNO (SHIFT) CON ARQUEO
// ============================================

app.post("/make-server-0dd48dc4/pos/shifts/:id/close", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const timestamp = new Date().toISOString();
    
    const shiftEntry = await kv.get([id]);
    
    if (!shiftEntry.value) {
      return c.json({ error: "Shift not found" }, 404);
    }

    const shift = shiftEntry.value as any;

    if (shift.status === "CLOSED") {
      return c.json({ error: "Shift already closed" }, 400);
    }

    // Arqueo (cash reconciliation)
    const expected_cash = shift.opening_cash + shift.total_cash;
    const counted_cash = body.counted_cash || 0;
    const difference = counted_cash - expected_cash;

    const updatedShift = {
      ...shift,
      status: "CLOSED",
      closed_at: timestamp,
      
      // Arqueo
      counted_cash,
      expected_cash,
      difference,
      
      // Detalle del arqueo
      cash_breakdown: body.cash_breakdown || {}, // { "1000": 5, "500": 10, ... }
      
      closing_notes: body.closing_notes || "",
      closed_by: body.closed_by || shift.cashier_id,
      
      updated_at: timestamp,
    };

    await kv.set([id], updatedShift);
    
    // Actualizar estado de la caja
    const registerEntry = await kv.get([shift.register_id]);
    if (registerEntry.value) {
      const register = registerEntry.value as any;
      const updatedRegister = {
        ...register,
        status: "CLOSED",
        current_shift_id: null,
        updated_at: timestamp,
      };
      await kv.set([shift.register_id], updatedRegister);
    }

    return c.json({ 
      shift: updatedShift,
      message: "Shift closed successfully",
      arqueo: {
        expected_cash,
        counted_cash,
        difference,
        status: difference === 0 ? "OK" : (difference > 0 ? "SURPLUS" : "SHORTAGE"),
      }
    });
  } catch (error) {
    console.log("Error closing shift:", error);
    return c.json({ error: "Error closing shift" }, 500);
  }
});

// ============================================
// OBTENER TURNO ACTUAL DE UNA CAJA
// ============================================

app.get("/make-server-0dd48dc4/pos/registers/:register_id/current-shift", async (c) => {
  try {
    const register_id = c.req.param("register_id");
    
    const registerEntry = await kv.get([register_id]);
    
    if (!registerEntry.value) {
      return c.json({ error: "Register not found" }, 404);
    }

    const register = registerEntry.value as any;

    if (!register.current_shift_id) {
      return c.json({ error: "No active shift" }, 404);
    }

    const shiftEntry = await kv.get([register.current_shift_id]);

    if (!shiftEntry.value) {
      return c.json({ error: "Shift not found" }, 404);
    }

    return c.json({ shift: shiftEntry.value });
  } catch (error) {
    console.log("Error getting current shift:", error);
    return c.json({ error: "Error getting current shift" }, 500);
  }
});

// ============================================
// CREAR VENTA EN POS
// ============================================

app.post("/make-server-0dd48dc4/pos/sales", async (c) => {
  try {
    const body = await c.req.json();
    const entity_id = body.entity_id || "default";
    const timestamp = new Date().toISOString();

    const id = `sale:${Date.now()}`;

    // Verificar que el turno exista y esté abierto
    const shiftEntry = await kv.get([body.shift_id]);
    if (!shiftEntry.value) {
      return c.json({ error: "Shift not found" }, 404);
    }

    const shift = shiftEntry.value as any;
    if (shift.status !== "OPEN") {
      return c.json({ error: "Shift is not open" }, 400);
    }

    // Calcular totales
    const items = body.items || [];
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (item.quantity * item.unit_price), 0
    );
    
    const discount_amount = body.discount_amount || 0;
    const discount_percent = body.discount_percent || 0;
    
    let total_discount = discount_amount;
    if (discount_percent > 0) {
      total_discount = subtotal * (discount_percent / 100);
    }
    
    const subtotal_after_discount = subtotal - total_discount;
    const tax_rate = body.tax_rate || 0.22; // IVA 22% por defecto
    const tax_amount = subtotal_after_discount * tax_rate;
    const total = subtotal_after_discount + tax_amount;

    const sale = {
      id,
      entity_id,
      
      // Relaciones
      shift_id: body.shift_id,
      register_id: shift.register_id,
      cashier_id: shift.cashier_id,
      customer_id: body.customer_id || null,
      
      // Número de ticket
      ticket_number: await generateTicketNumber(entity_id, shift.register_id),
      
      // Items
      items,
      
      // Totales
      subtotal,
      discount_amount: total_discount,
      discount_percent,
      discount_reason: body.discount_reason || "",
      discount_authorized_by: body.discount_authorized_by || null,
      
      subtotal_after_discount,
      tax_rate,
      tax_amount,
      total: Math.round(total * 100) / 100,
      
      // Pago
      payment_method: body.payment_method || "CASH",
      payments: body.payments || [],
      amount_paid: body.amount_paid || 0,
      change: body.change || 0,
      
      // Estado
      status: "IN_PROGRESS",
      
      // Fechas
      created_at: timestamp,
      completed_at: null,
      updated_at: timestamp,
      
      // Notas
      notes: body.notes || "",
    };

    await kv.set([id], sale);
    
    // Indexar
    const indexKey = ["pos_sales", entity_id, id];
    await kv.set(indexKey, id);
    
    const shiftIndexKey = ["pos_sales", "by_shift", body.shift_id, id];
    await kv.set(shiftIndexKey, id);

    return c.json({ 
      sale,
      message: "Sale created successfully" 
    });
  } catch (error) {
    console.log("Error creating sale:", error);
    return c.json({ error: "Error creating sale" }, 500);
  }
});

// ============================================
// COMPLETAR VENTA
// ============================================

app.post("/make-server-0dd48dc4/pos/sales/:id/complete", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const timestamp = new Date().toISOString();
    
    const saleEntry = await kv.get([id]);
    
    if (!saleEntry.value) {
      return c.json({ error: "Sale not found" }, 404);
    }

    const sale = saleEntry.value as any;

    if (sale.status === "COMPLETED") {
      return c.json({ error: "Sale already completed" }, 400);
    }

    const updatedSale = {
      ...sale,
      status: "COMPLETED",
      completed_at: timestamp,
      amount_paid: body.amount_paid || sale.total,
      change: (body.amount_paid || sale.total) - sale.total,
      updated_at: timestamp,
    };

    await kv.set([id], updatedSale);
    
    // Actualizar el turno
    const shiftEntry = await kv.get([sale.shift_id]);
    if (shiftEntry.value) {
      const shift = shiftEntry.value as any;
      
      let payment_totals = {
        cash: shift.total_cash,
        card: shift.total_card,
        transfer: shift.total_transfer,
        other: shift.total_other,
      };

      // Actualizar totales según método de pago
      if (sale.payment_method === "CASH") {
        payment_totals.cash += sale.total;
      } else if (sale.payment_method === "CARD") {
        payment_totals.card += sale.total;
      } else if (sale.payment_method === "TRANSFER") {
        payment_totals.transfer += sale.total;
      } else {
        payment_totals.other += sale.total;
      }

      const updatedShift = {
        ...shift,
        total_sales: shift.total_sales + sale.total,
        total_cash: payment_totals.cash,
        total_card: payment_totals.card,
        total_transfer: payment_totals.transfer,
        total_other: payment_totals.other,
        sales_count: shift.sales_count + 1,
        sales_ids: [...shift.sales_ids, id],
        updated_at: timestamp,
      };

      await kv.set([sale.shift_id], updatedShift);
    }

    // Aquí se integraría con inventory para descontar stock
    // Aquí se integraría con documents para generar ticket

    return c.json({ 
      sale: updatedSale,
      message: "Sale completed successfully",
      ticket: {
        number: sale.ticket_number,
        total: sale.total,
        payment_method: sale.payment_method,
        change: updatedSale.change,
      }
    });
  } catch (error) {
    console.log("Error completing sale:", error);
    return c.json({ error: "Error completing sale" }, 500);
  }
});

// ============================================
// CANCELAR VENTA
// ============================================

app.post("/make-server-0dd48dc4/pos/sales/:id/cancel", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const timestamp = new Date().toISOString();
    
    const saleEntry = await kv.get([id]);
    
    if (!saleEntry.value) {
      return c.json({ error: "Sale not found" }, 404);
    }

    const sale = saleEntry.value as any;

    if (sale.status === "CANCELLED") {
      return c.json({ error: "Sale already cancelled" }, 400);
    }

    const updatedSale = {
      ...sale,
      status: "CANCELLED",
      cancelled_at: timestamp,
      cancelled_reason: body.reason || "",
      cancelled_by: body.cancelled_by || sale.cashier_id,
      updated_at: timestamp,
    };

    await kv.set([id], updatedSale);

    return c.json({ 
      sale: updatedSale,
      message: "Sale cancelled successfully" 
    });
  } catch (error) {
    console.log("Error cancelling sale:", error);
    return c.json({ error: "Error cancelling sale" }, 500);
  }
});

// ============================================
// SUSPENDER VENTA (PARKING)
// ============================================

app.post("/make-server-0dd48dc4/pos/sales/:id/suspend", async (c) => {
  try {
    const id = c.req.param("id");
    const timestamp = new Date().toISOString();
    
    const saleEntry = await kv.get([id]);
    
    if (!saleEntry.value) {
      return c.json({ error: "Sale not found" }, 404);
    }

    const sale = saleEntry.value as any;

    const updatedSale = {
      ...sale,
      status: "SUSPENDED",
      suspended_at: timestamp,
      updated_at: timestamp,
    };

    await kv.set([id], updatedSale);

    return c.json({ 
      sale: updatedSale,
      message: "Sale suspended successfully" 
    });
  } catch (error) {
    console.log("Error suspending sale:", error);
    return c.json({ error: "Error suspending sale" }, 500);
  }
});

// ============================================
// RECUPERAR VENTA SUSPENDIDA
// ============================================

app.post("/make-server-0dd48dc4/pos/sales/:id/resume", async (c) => {
  try {
    const id = c.req.param("id");
    const timestamp = new Date().toISOString();
    
    const saleEntry = await kv.get([id]);
    
    if (!saleEntry.value) {
      return c.json({ error: "Sale not found" }, 404);
    }

    const sale = saleEntry.value as any;

    if (sale.status !== "SUSPENDED") {
      return c.json({ error: "Sale is not suspended" }, 400);
    }

    const updatedSale = {
      ...sale,
      status: "IN_PROGRESS",
      resumed_at: timestamp,
      updated_at: timestamp,
    };

    await kv.set([id], updatedSale);

    return c.json({ 
      sale: updatedSale,
      message: "Sale resumed successfully" 
    });
  } catch (error) {
    console.log("Error resuming sale:", error);
    return c.json({ error: "Error resuming sale" }, 500);
  }
});

// ============================================
// LISTAR VENTAS SUSPENDIDAS
// ============================================

app.get("/make-server-0dd48dc4/pos/sales/suspended", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const register_id = c.req.query("register_id");

    const sales = [];
    const entries = kv.list({ prefix: ["pos_sales", entity_id] });
    
    for await (const entry of entries) {
      const saleId = entry.value as string;
      const saleEntry = await kv.get([saleId]);
      
      if (saleEntry.value) {
        const sale = saleEntry.value as any;
        if (sale.status === "SUSPENDED") {
          if (!register_id || sale.register_id === register_id) {
            sales.push(sale);
          }
        }
      }
    }

    return c.json({ 
      sales,
      total: sales.length 
    });
  } catch (error) {
    console.log("Error listing suspended sales:", error);
    return c.json({ error: "Error listing suspended sales" }, 500);
  }
});

// ============================================
// LISTAR VENTAS DE UN TURNO
// ============================================

app.get("/make-server-0dd48dc4/pos/shifts/:shift_id/sales", async (c) => {
  try {
    const shift_id = c.req.param("shift_id");

    const sales = [];
    const entries = kv.list({ prefix: ["pos_sales", "by_shift", shift_id] });
    
    for await (const entry of entries) {
      const saleId = entry.value as string;
      const saleEntry = await kv.get([saleId]);
      
      if (saleEntry.value) {
        sales.push(saleEntry.value);
      }
    }

    return c.json({ 
      sales,
      total: sales.length 
    });
  } catch (error) {
    console.log("Error listing shift sales:", error);
    return c.json({ error: "Error listing shift sales" }, 500);
  }
});

// ============================================
// DASHBOARD POS
// ============================================

app.get("/make-server-0dd48dc4/pos/dashboard", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const register_id = c.req.query("register_id");

    // Obtener todos los turnos
    const shifts = [];
    const shiftEntries = kv.list({ prefix: ["pos_shifts", entity_id] });
    
    for await (const entry of shiftEntries) {
      const shiftId = entry.value as string;
      const shiftEntry = await kv.get([shiftId]);
      
      if (shiftEntry.value) {
        const shift = shiftEntry.value as any;
        if (!register_id || shift.register_id === register_id) {
          shifts.push(shift);
        }
      }
    }

    // Calcular métricas
    const openShifts = shifts.filter((s: any) => s.status === "OPEN");
    const closedShifts = shifts.filter((s: any) => s.status === "CLOSED");
    
    const totalSales = shifts.reduce((sum: number, s: any) => sum + s.total_sales, 0);
    const totalCash = shifts.reduce((sum: number, s: any) => sum + s.total_cash, 0);
    const totalCard = shifts.reduce((sum: number, s: any) => sum + s.total_card, 0);
    const totalTransactions = shifts.reduce((sum: number, s: any) => sum + s.sales_count, 0);

    return c.json({
      dashboard: {
        summary: {
          open_shifts: openShifts.length,
          closed_shifts: closedShifts.length,
          total_sales: Math.round(totalSales * 100) / 100,
          total_cash: Math.round(totalCash * 100) / 100,
          total_card: Math.round(totalCard * 100) / 100,
          total_transactions: totalTransactions,
          average_ticket: totalTransactions > 0 ? Math.round((totalSales / totalTransactions) * 100) / 100 : 0,
        },
        open_shifts: openShifts,
        recent_closed: closedShifts.slice(-5),
      },
    });
  } catch (error) {
    console.log("Error getting POS dashboard:", error);
    return c.json({ error: "Error getting POS dashboard" }, 500);
  }
});

// ============================================
// IMPRIMIR TICKET
// ============================================

app.post("/make-server-0dd48dc4/pos/sales/:id/print-ticket", async (c) => {
  try {
    const id = c.req.param("id");
    
    const saleEntry = await kv.get([id]);
    
    if (!saleEntry.value) {
      return c.json({ error: "Sale not found" }, 404);
    }

    const sale = saleEntry.value as any;

    // Aquí se integraría con documents.tsx para generar ticket térmico
    const ticket = generateTicketContent(sale);

    return c.json({ 
      ticket,
      message: "Ticket generated successfully" 
    });
  } catch (error) {
    console.log("Error printing ticket:", error);
    return c.json({ error: "Error printing ticket" }, 500);
  }
});

// ============================================
// FUNCIONES AUXILIARES
// ============================================

async function generateTicketNumber(entity_id: string, register_id: string): Promise<string> {
  const counterKey = ["pos_ticket_counter", entity_id, register_id];
  const counterEntry = await kv.get(counterKey);
  
  let counter = 1;
  if (counterEntry.value) {
    counter = (counterEntry.value as number) + 1;
  }
  
  await kv.set(counterKey, counter);
  
  const registerCode = register_id.split(":")[1]?.slice(-4) || "0000";
  return `TKT-${registerCode}-${String(counter).padStart(6, "0")}`;
}

function generateTicketContent(sale: any): string {
  const lines = [];
  
  lines.push("================================");
  lines.push("       ODDY MARKET POS");
  lines.push("================================");
  lines.push(`Ticket: ${sale.ticket_number}`);
  lines.push(`Fecha: ${new Date(sale.created_at).toLocaleString()}`);
  lines.push(`Cajero: ${sale.cashier_id}`);
  lines.push("--------------------------------");
  
  sale.items.forEach((item: any) => {
    lines.push(`${item.description}`);
    lines.push(`  ${item.quantity} x $${item.unit_price.toFixed(2)} = $${(item.quantity * item.unit_price).toFixed(2)}`);
  });
  
  lines.push("--------------------------------");
  lines.push(`Subtotal:      $${sale.subtotal.toFixed(2)}`);
  
  if (sale.discount_amount > 0) {
    lines.push(`Descuento:    -$${sale.discount_amount.toFixed(2)}`);
  }
  
  lines.push(`IVA (${(sale.tax_rate * 100).toFixed(0)}%):       $${sale.tax_amount.toFixed(2)}`);
  lines.push(`TOTAL:         $${sale.total.toFixed(2)}`);
  lines.push("--------------------------------");
  lines.push(`Pago (${sale.payment_method}): $${sale.amount_paid.toFixed(2)}`);
  
  if (sale.change > 0) {
    lines.push(`Cambio:        $${sale.change.toFixed(2)}`);
  }
  
  lines.push("================================");
  lines.push("   ¡Gracias por su compra!");
  lines.push("================================");
  
  return lines.join("\n");
}

export default app;
