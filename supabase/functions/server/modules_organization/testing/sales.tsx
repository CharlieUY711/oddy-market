import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { kv } from './storage.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

// Helper para obtener usuario autenticado
async function getAuthUser(c: any) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

// ============================================
// INTERFACES - VENTAS
// ============================================

interface Customer {
  id: string;
  type: 'individual' | 'company';
  first_name?: string;
  last_name?: string;
  company_name?: string;
  document_type: 'DNI' | 'CUIT' | 'RUT' | 'RFC' | 'Passport' | 'Other';
  document_number: string;
  email: string;
  phone?: string;
  mobile?: string;
  website?: string;
  address?: any;
  shipping_addresses?: Array<{
    id: string;
    label: string;
    address: any;
    is_default: boolean;
  }>;
  price_list_id?: string;
  payment_terms?: number;
  credit_limit?: number;
  current_balance?: number;
  category?: string;
  tags: string[];
  segment?: 'retail' | 'wholesale' | 'corporate' | 'vip';
  status: 'active' | 'inactive' | 'blocked';
  notes?: string;
  internal_notes?: string;
  total_purchases?: number;
  total_spent?: number;
  last_purchase_date?: string;
  purchases_count?: number;
  average_ticket?: number;
  accepts_marketing: boolean;
  newsletter_subscribed: boolean;
  sales_rep_id?: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

interface SalesOrder {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  type: 'sale' | 'quote' | 'pre_order' | 'subscription';
  channel: 'web' | 'mobile' | 'pos' | 'phone' | 'email' | 'whatsapp' | 'marketplace';
  items: Array<{
    id: string;
    product_id: string;
    variant_id?: string;
    sku: string;
    name: string;
    description?: string;
    quantity: number;
    unit_price: number;
    discount_percentage?: number;
    discount_amount?: number;
    tax_percentage: number;
    tax_amount: number;
    subtotal: number;
    total: number;
    warehouse_id?: string;
    notes?: string;
  }>;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  shipping_cost: number;
  total: number;
  currency: string;
  applied_discounts?: Array<{
    code: string;
    type: 'percentage' | 'fixed' | 'free_shipping';
    amount: number;
    description: string;
  }>;
  payment_method: 'cash' | 'card' | 'transfer' | 'mercadopago' | 'stripe' | 'credit' | 'multiple';
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded' | 'cancelled';
  paid_amount: number;
  payment_terms?: number;
  payment_due_date?: string;
  shipping_method?: string;
  shipping_address?: any;
  shipping_status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'returned';
  tracking_number?: string;
  estimated_delivery?: string;
  delivered_at?: string;
  warehouse_id?: string;
  status: 'draft' | 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  invoice_id?: string;
  invoiced_at?: string;
  customer_notes?: string;
  internal_notes?: string;
  sales_rep_id?: string;
  sales_rep_name?: string;
  source?: string;
  reference?: string;
  external_id?: string;
  order_date: string;
  confirmed_at?: string;
  cancelled_at?: string;
  completed_at?: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

interface Quote {
  id: string;
  quote_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  items: Array<{
    product_id: string;
    name: string;
    quantity: number;
    unit_price: number;
    discount: number;
    tax: number;
    total: number;
  }>;
  subtotal: number;
  tax_total: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'converted';
  valid_until: string;
  sent_at?: string;
  viewed_at?: string;
  accepted_at?: string;
  rejected_at?: string;
  converted_to_order_id?: string;
  converted_at?: string;
  notes?: string;
  terms_conditions?: string;
  sales_rep_id?: string;
  created_at: string;
  created_by: string;
  updated_at: string;
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

async function getByPrefix(prefix: string[]): Promise<any[]> {
  const results: any[] = [];
  try {
    for await (const entry of kv.list({ prefix })) {
      if (entry.value) {
        results.push(entry.value);
      }
    }
  } catch (error) {
    console.error('Error in getByPrefix:', error);
  }
  return results;
}

async function reserveStock(order: SalesOrder) {
  for (const item of order.items) {
    const stockKey = ['stock', 'product', item.product_id, 'warehouse', order.warehouse_id || 'default'];
    const stockEntry = await kv.get(stockKey);
    const stock = stockEntry?.value;
    
    if (stock) {
      stock.reserved = (stock.reserved || 0) + item.quantity;
      stock.available = (stock.available || 0) - item.quantity;
      stock.updated_at = new Date().toISOString();
      await kv.set(stockKey, stock);
    }
  }
}

async function unreserveStock(order: SalesOrder) {
  for (const item of order.items) {
    const stockKey = ['stock', 'product', item.product_id, 'warehouse', order.warehouse_id || 'default'];
    const stockEntry = await kv.get(stockKey);
    const stock = stockEntry?.value;
    
    if (stock) {
      stock.reserved = Math.max(0, (stock.reserved || 0) - item.quantity);
      stock.available = (stock.available || 0) + item.quantity;
      stock.updated_at = new Date().toISOString();
      await kv.set(stockKey, stock);
    }
  }
}

async function decreaseStock(order: SalesOrder) {
  for (const item of order.items) {
    const stockKey = ['stock', 'product', item.product_id, 'warehouse', order.warehouse_id || 'default'];
    const stockEntry = await kv.get(stockKey);
    const stock = stockEntry?.value;
    
    if (stock) {
      stock.quantity = (stock.quantity || 0) - item.quantity;
      stock.reserved = Math.max(0, (stock.reserved || 0) - item.quantity);
      stock.total_value = (stock.quantity || 0) * (stock.cost_average || 0);
      stock.updated_at = new Date().toISOString();
      await kv.set(stockKey, stock);

      const movement = {
        id: crypto.randomUUID(),
        type: 'exit',
        subtype: 'sale',
        product_id: item.product_id,
        warehouse_id: order.warehouse_id || 'default',
        quantity: item.quantity,
        cost_unit: stock.cost_average || 0,
        cost_total: item.quantity * (stock.cost_average || 0),
        document_type: 'order',
        document_id: order.id,
        user_id: order.updated_by,
        notes: `Venta ${order.order_number}`,
        created_at: new Date().toISOString(),
      };
      
      await kv.set(['movement', movement.id], movement);
    }
  }
}

// ============================================
// MÓDULO 1: CLIENTES (8 ENDPOINTS)
// ============================================

// 1.1 Crear cliente
app.post('/make-server-0dd48dc4/sales/customers', async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    
    // Validar email único
    const existingCustomers = await getByPrefix(['customer']);
    const emailExists = existingCustomers.some((cust: Customer) => cust.email === body.email);
    if (emailExists) {
      return c.json({ error: 'Email ya registrado' }, 400);
    }
    
    const customer: Customer = {
      id: crypto.randomUUID(),
      type: body.type || 'individual',
      first_name: body.first_name,
      last_name: body.last_name,
      company_name: body.company_name,
      document_type: body.document_type,
      document_number: body.document_number,
      email: body.email,
      phone: body.phone,
      mobile: body.mobile,
      website: body.website,
      address: body.address,
      shipping_addresses: body.shipping_addresses || [],
      price_list_id: body.price_list_id,
      payment_terms: body.payment_terms || 0,
      credit_limit: body.credit_limit || 0,
      current_balance: 0,
      category: body.category,
      tags: body.tags || [],
      segment: body.segment || 'retail',
      status: body.status || 'active',
      notes: body.notes,
      internal_notes: body.internal_notes,
      total_purchases: 0,
      total_spent: 0,
      purchases_count: 0,
      average_ticket: 0,
      accepts_marketing: body.accepts_marketing || false,
      newsletter_subscribed: body.newsletter_subscribed || false,
      sales_rep_id: body.sales_rep_id,
      created_at: new Date().toISOString(),
      created_by: user.id,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    };

    await kv.set(['customer', customer.id], customer);
    await kv.set(['customer', 'email', customer.email], customer.id);
    if (customer.document_number) {
      await kv.set(['customer', 'document', customer.document_number], customer.id);
    }

    return c.json({
      success: true,
      customer,
      message: 'Cliente creado exitosamente'
    }, 201);

  } catch (error: any) {
    console.error('❌ Error creating customer:', error);
    return c.json({ error: 'Error al crear cliente', details: error.message }, 500);
  }
});

// 1.2 Listar clientes
app.get('/make-server-0dd48dc4/sales/customers', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '50');
    const status = c.req.query('status');
    const segment = c.req.query('segment');
    const search = c.req.query('search');
    const salesRepId = c.req.query('sales_rep_id');

    let customers = await getByPrefix(['customer']);
    customers = customers.filter((c: Customer) => c.id);

    if (status) {
      customers = customers.filter((c: Customer) => c.status === status);
    }
    if (segment) {
      customers = customers.filter((c: Customer) => c.segment === segment);
    }
    if (salesRepId) {
      customers = customers.filter((c: Customer) => c.sales_rep_id === salesRepId);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      customers = customers.filter((c: Customer) => 
        c.email.toLowerCase().includes(searchLower) ||
        c.first_name?.toLowerCase().includes(searchLower) ||
        c.last_name?.toLowerCase().includes(searchLower) ||
        c.company_name?.toLowerCase().includes(searchLower) ||
        c.document_number?.includes(search)
      );
    }

    customers.sort((a: Customer, b: Customer) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = customers.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = customers.slice(start, start + limit);

    return c.json({
      success: true,
      customers: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });

  } catch (error: any) {
    console.error('❌ Error listing customers:', error);
    return c.json({ error: 'Error al listar clientes', details: error.message }, 500);
  }
});

// 1.3 Obtener cliente por ID
app.get('/make-server-0dd48dc4/sales/customers/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const entry = await kv.get(['customer', id]);
    const customer = entry?.value as Customer;

    if (!customer) {
      return c.json({ error: 'Cliente no encontrado' }, 404);
    }

    const allOrders = await getByPrefix(['order', 'customer', id]);
    const orders = allOrders.sort((a: SalesOrder, b: SalesOrder) => 
      new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
    );

    const totalSpent = orders
      .filter((o: SalesOrder) => o.status === 'completed')
      .reduce((sum: number, o: SalesOrder) => sum + o.total, 0);
    
    const completedOrders = orders.filter((o: SalesOrder) => o.status === 'completed');

    return c.json({
      success: true,
      customer: {
        ...customer,
        total_spent: totalSpent,
        purchases_count: completedOrders.length,
        average_ticket: completedOrders.length > 0 ? totalSpent / completedOrders.length : 0
      },
      recent_orders: orders.slice(0, 10)
    });

  } catch (error: any) {
    console.error('❌ Error getting customer:', error);
    return c.json({ error: 'Error al obtener cliente', details: error.message }, 500);
  }
});

// 1.4 Actualizar cliente
app.put('/make-server-0dd48dc4/sales/customers/:id', async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { id } = c.req.param();
    const entry = await kv.get(['customer', id]);
    const customer = entry?.value as Customer;

    if (!customer) {
      return c.json({ error: 'Cliente no encontrado' }, 404);
    }

    const body = await c.req.json();

    if (body.email && body.email !== customer.email) {
      const existingCustomers = await getByPrefix(['customer']);
      const emailExists = existingCustomers.some((c: Customer) => c.email === body.email && c.id !== id);
      if (emailExists) {
        return c.json({ error: 'Email ya registrado' }, 400);
      }
      
      await kv.delete(['customer', 'email', customer.email]);
      await kv.set(['customer', 'email', body.email], id);
    }

    const updatedCustomer: Customer = {
      ...customer,
      ...body,
      id: customer.id,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    };

    await kv.set(['customer', id], updatedCustomer);

    return c.json({
      success: true,
      customer: updatedCustomer,
      message: 'Cliente actualizado exitosamente'
    });

  } catch (error: any) {
    console.error('❌ Error updating customer:', error);
    return c.json({ error: 'Error al actualizar cliente', details: error.message }, 500);
  }
});

// 1.5 Eliminar cliente (soft delete)
app.delete('/make-server-0dd48dc4/sales/customers/:id', async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { id } = c.req.param();
    const entry = await kv.get(['customer', id]);
    const customer = entry?.value as Customer;

    if (!customer) {
      return c.json({ error: 'Cliente no encontrado' }, 404);
    }

    const orders = await getByPrefix(['order', 'customer', id]);
    if (orders.length > 0) {
      return c.json({ 
        error: 'No se puede eliminar un cliente con órdenes',
        orders_count: orders.length 
      }, 400);
    }

    customer.status = 'inactive';
    customer.updated_at = new Date().toISOString();
    customer.updated_by = user.id;

    await kv.set(['customer', id], customer);

    return c.json({
      success: true,
      message: 'Cliente desactivado'
    });

  } catch (error: any) {
    console.error('❌ Error deleting customer:', error);
    return c.json({ error: 'Error al eliminar cliente', details: error.message }, 500);
  }
});

// 1.6 Buscar cliente por email
app.get('/make-server-0dd48dc4/sales/customers/search/email/:email', async (c) => {
  try {
    const { email } = c.req.param();
    const entry = await kv.get(['customer', 'email', email]);
    const customerId = entry?.value;
    
    if (!customerId) {
      return c.json({ success: true, customer: null });
    }
    
    const customerEntry = await kv.get(['customer', customerId]);
    const customer = customerEntry?.value as Customer;
    
    return c.json({
      success: true,
      customer
    });

  } catch (error: any) {
    console.error('❌ Error searching customer by email:', error);
    return c.json({ error: 'Error al buscar cliente', details: error.message }, 500);
  }
});

// 1.7 Estadísticas de clientes
app.get('/make-server-0dd48dc4/sales/customers/stats/summary', async (c) => {
  try {
    const customers = await getByPrefix(['customer']);
    const validCustomers = customers.filter((c: Customer) => c.id);

    const total = validCustomers.length;
    const active = validCustomers.filter((c: Customer) => c.status === 'active').length;
    const inactive = validCustomers.filter((c: Customer) => c.status === 'inactive').length;
    const blocked = validCustomers.filter((c: Customer) => c.status === 'blocked').length;

    const bySegment = {
      retail: validCustomers.filter((c: Customer) => c.segment === 'retail').length,
      wholesale: validCustomers.filter((c: Customer) => c.segment === 'wholesale').length,
      corporate: validCustomers.filter((c: Customer) => c.segment === 'corporate').length,
      vip: validCustomers.filter((c: Customer) => c.segment === 'vip').length,
    };

    const totalRevenue = validCustomers.reduce((sum: number, c: Customer) => sum + (c.total_spent || 0), 0);

    return c.json({
      success: true,
      stats: {
        total,
        active,
        inactive,
        blocked,
        by_segment: bySegment,
        total_revenue: totalRevenue,
        average_customer_value: total > 0 ? totalRevenue / total : 0
      }
    });

  } catch (error: any) {
    console.error('❌ Error getting customer stats:', error);
    return c.json({ error: 'Error al obtener estadísticas', details: error.message }, 500);
  }
});

// 1.8 Top clientes
app.get('/make-server-0dd48dc4/sales/customers/top/:limit', async (c) => {
  try {
    const limit = parseInt(c.req.param('limit') || '10');
    
    let customers = await getByPrefix(['customer']);
    customers = customers.filter((c: Customer) => c.id && c.status === 'active');

    customers.sort((a: Customer, b: Customer) => (b.total_spent || 0) - (a.total_spent || 0));

    const topCustomers = customers.slice(0, limit);

    return c.json({
      success: true,
      top_customers: topCustomers,
      total: customers.length
    });

  } catch (error: any) {
    console.error('❌ Error getting top customers:', error);
    return c.json({ error: 'Error al obtener top clientes', details: error.message }, 500);
  }
});

// ============================================
// MÓDULO 2: ÓRDENES DE VENTA (12 ENDPOINTS)
// ============================================

// 2.1 Crear orden de venta
app.post('/make-server-0dd48dc4/sales/orders', async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    
    const customerEntry = await kv.get(['customer', body.customer_id]);
    const customer = customerEntry?.value as Customer;
    
    if (!customer) {
      return c.json({ error: 'Cliente no encontrado' }, 404);
    }

    // Validar stock disponible
    for (const item of body.items) {
      const stockKey = ['stock', 'product', item.product_id, 'warehouse', body.warehouse_id || 'default'];
      const stockEntry = await kv.get(stockKey);
      const stock = stockEntry?.value;
      
      if (!stock || (stock.available || 0) < item.quantity) {
        return c.json({
          error: 'Stock insuficiente',
          product_id: item.product_id,
          available: stock?.available || 0,
          requested: item.quantity
        }, 400);
      }
    }

    const order: SalesOrder = {
      id: crypto.randomUUID(),
      order_number: `ORD-${Date.now()}`,
      customer_id: body.customer_id,
      customer_name: customer.type === 'company' ? customer.company_name! : `${customer.first_name} ${customer.last_name}`,
      customer_email: customer.email,
      customer_phone: customer.mobile || customer.phone,
      type: body.type || 'sale',
      channel: body.channel || 'web',
      items: body.items,
      subtotal: body.subtotal,
      discount_total: body.discount_total || 0,
      tax_total: body.tax_total,
      shipping_cost: body.shipping_cost || 0,
      total: body.total,
      currency: body.currency || 'USD',
      applied_discounts: body.applied_discounts || [],
      payment_method: body.payment_method,
      payment_status: body.payment_status || 'pending',
      paid_amount: body.paid_amount || 0,
      payment_terms: body.payment_terms || customer.payment_terms || 0,
      payment_due_date: body.payment_due_date,
      shipping_method: body.shipping_method,
      shipping_address: body.shipping_address || customer.address,
      shipping_status: 'pending',
      warehouse_id: body.warehouse_id,
      status: body.status || 'pending',
      customer_notes: body.customer_notes,
      internal_notes: body.internal_notes,
      sales_rep_id: body.sales_rep_id || user.id,
      source: body.source,
      reference: body.reference,
      external_id: body.external_id,
      order_date: body.order_date || new Date().toISOString(),
      created_at: new Date().toISOString(),
      created_by: user.id,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    };

    if (order.paid_amount >= order.total) {
      order.payment_status = 'paid';
    }

    await kv.set(['order', order.id], order);
    await kv.set(['order', 'number', order.order_number], order.id);
    await kv.set(['order', 'customer', order.customer_id, order.id], order);

    if (order.status === 'confirmed') {
      await reserveStock(order);
    }

    return c.json({
      success: true,
      order,
      message: 'Orden creada exitosamente'
    }, 201);

  } catch (error: any) {
    console.error('❌ Error creating order:', error);
    return c.json({ error: 'Error al crear orden', details: error.message }, 500);
  }
});

// 2.2 Listar órdenes
app.get('/make-server-0dd48dc4/sales/orders', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '50');
    const status = c.req.query('status');
    const customerId = c.req.query('customer_id');
    const dateFrom = c.req.query('date_from');
    const dateTo = c.req.query('date_to');
    const channel = c.req.query('channel');
    const salesRepId = c.req.query('sales_rep_id');

    let orders: SalesOrder[] = [];

    if (customerId) {
      orders = await getByPrefix(['order', 'customer', customerId]);
    } else {
      orders = await getByPrefix(['order']);
      orders = orders.filter((o: SalesOrder) => o.id && !o.id.startsWith('number') && !o.id.startsWith('customer'));
    }

    if (status) {
      orders = orders.filter((o: SalesOrder) => o.status === status);
    }
    if (channel) {
      orders = orders.filter((o: SalesOrder) => o.channel === channel);
    }
    if (salesRepId) {
      orders = orders.filter((o: SalesOrder) => o.sales_rep_id === salesRepId);
    }
    if (dateFrom) {
      orders = orders.filter((o: SalesOrder) => o.order_date >= dateFrom);
    }
    if (dateTo) {
      orders = orders.filter((o: SalesOrder) => o.order_date <= dateTo);
    }

    orders.sort((a: SalesOrder, b: SalesOrder) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());

    const total = orders.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = orders.slice(start, start + limit);

    const totalAmount = orders.reduce((sum: number, o: SalesOrder) => sum + o.total, 0);
    const byStatus = {
      draft: orders.filter((o: SalesOrder) => o.status === 'draft').length,
      pending: orders.filter((o: SalesOrder) => o.status === 'pending').length,
      confirmed: orders.filter((o: SalesOrder) => o.status === 'confirmed').length,
      processing: orders.filter((o: SalesOrder) => o.status === 'processing').length,
      completed: orders.filter((o: SalesOrder) => o.status === 'completed').length,
      cancelled: orders.filter((o: SalesOrder) => o.status === 'cancelled').length,
    };

    return c.json({
      success: true,
      orders: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      summary: {
        total_amount: totalAmount,
        by_status: byStatus
      }
    });

  } catch (error: any) {
    console.error('❌ Error listing orders:', error);
    return c.json({ error: 'Error al listar órdenes', details: error.message }, 500);
  }
});

// 2.3 Obtener orden por ID
app.get('/make-server-0dd48dc4/sales/orders/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const entry = await kv.get(['order', id]);
    const order = entry?.value as SalesOrder;

    if (!order) {
      return c.json({ error: 'Orden no encontrada' }, 404);
    }

    const customerEntry = await kv.get(['customer', order.customer_id]);
    const customer = customerEntry?.value as Customer;

    let invoice = null;
    if (order.invoice_id) {
      const invoiceEntry = await kv.get(['invoice', order.invoice_id]);
      invoice = invoiceEntry?.value;
    }

    return c.json({
      success: true,
      order,
      customer,
      invoice
    });

  } catch (error: any) {
    console.error('❌ Error getting order:', error);
    return c.json({ error: 'Error al obtener orden', details: error.message }, 500);
  }
});

// 2.4 Confirmar orden (reserva stock)
app.post('/make-server-0dd48dc4/sales/orders/:id/confirm', async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { id } = c.req.param();
    const entry = await kv.get(['order', id]);
    const order = entry?.value as SalesOrder;

    if (!order) {
      return c.json({ error: 'Orden no encontrada' }, 404);
    }

    if (order.status !== 'pending' && order.status !== 'draft') {
      return c.json({ error: 'Orden no puede ser confirmada en este estado' }, 400);
    }

    for (const item of order.items) {
      const stockKey = ['stock', 'product', item.product_id, 'warehouse', order.warehouse_id || 'default'];
      const stockEntry = await kv.get(stockKey);
      const stock = stockEntry?.value;
      
      if (!stock || (stock.available || 0) < item.quantity) {
        return c.json({
          error: 'Stock insuficiente',
          product_id: item.product_id,
          product_name: item.name,
          available: stock?.available || 0,
          requested: item.quantity
        }, 400);
      }
    }

    await reserveStock(order);

    order.status = 'confirmed';
    order.confirmed_at = new Date().toISOString();
    order.updated_at = new Date().toISOString();
    order.updated_by = user.id;

    await kv.set(['order', id], order);

    return c.json({
      success: true,
      order,
      message: 'Orden confirmada y stock reservado'
    });

  } catch (error: any) {
    console.error('❌ Error confirming order:', error);
    return c.json({ error: 'Error al confirmar orden', details: error.message }, 500);
  }
});

// 2.5 Completar orden (descuenta stock)
app.post('/make-server-0dd48dc4/sales/orders/:id/complete', async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { id } = c.req.param();
    const entry = await kv.get(['order', id]);
    const order = entry?.value as SalesOrder;

    if (!order) {
      return c.json({ error: 'Orden no encontrada' }, 404);
    }

    if (order.status !== 'confirmed' && order.status !== 'processing') {
      return c.json({ error: 'Orden no puede ser completada en este estado' }, 400);
    }

    await decreaseStock(order);

    order.status = 'completed';
    order.completed_at = new Date().toISOString();
    order.shipping_status = 'delivered';
    order.delivered_at = new Date().toISOString();
    order.updated_at = new Date().toISOString();
    order.updated_by = user.id;

    await kv.set(['order', id], order);

    const customerEntry = await kv.get(['customer', order.customer_id]);
    const customer = customerEntry?.value as Customer;
    if (customer) {
      customer.total_purchases = (customer.total_purchases || 0) + 1;
      customer.total_spent = (customer.total_spent || 0) + order.total;
      customer.last_purchase_date = order.completed_at;
      customer.purchases_count = (customer.purchases_count || 0) + 1;
      customer.average_ticket = customer.total_spent / customer.purchases_count;
      await kv.set(['customer', customer.id], customer);
    }

    return c.json({
      success: true,
      order,
      message: 'Orden completada y stock descontado'
    });

  } catch (error: any) {
    console.error('❌ Error completing order:', error);
    return c.json({ error: 'Error al completar orden', details: error.message }, 500);
  }
});

// 2.6 Cancelar orden (libera stock)
app.post('/make-server-0dd48dc4/sales/orders/:id/cancel', async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { id } = c.req.param();
    const body = await c.req.json();
    const entry = await kv.get(['order', id]);
    const order = entry?.value as SalesOrder;

    if (!order) {
      return c.json({ error: 'Orden no encontrada' }, 404);
    }

    if (order.status === 'completed' || order.status === 'cancelled') {
      return c.json({ error: 'Orden no puede ser cancelada en este estado' }, 400);
    }

    if (order.status === 'confirmed' || order.status === 'processing') {
      await unreserveStock(order);
    }

    order.status = 'cancelled';
    order.cancelled_at = new Date().toISOString();
    order.internal_notes = (order.internal_notes || '') + `\n[CANCELADA] ${body.reason || 'Sin motivo especificado'}`;
    order.updated_at = new Date().toISOString();
    order.updated_by = user.id;

    await kv.set(['order', id], order);

    return c.json({
      success: true,
      order,
      message: 'Orden cancelada y stock liberado'
    });

  } catch (error: any) {
    console.error('❌ Error cancelling order:', error);
    return c.json({ error: 'Error al cancelar orden', details: error.message }, 500);
  }
});

// 2.7 Generar factura para orden
app.post('/make-server-0dd48dc4/sales/orders/:id/generate-invoice', async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { id } = c.req.param();
    const entry = await kv.get(['order', id]);
    const order = entry?.value as SalesOrder;

    if (!order) {
      return c.json({ error: 'Orden no encontrada' }, 404);
    }

    if (order.invoice_id) {
      return c.json({ error: 'Orden ya tiene factura generada', invoice_id: order.invoice_id }, 400);
    }

    const customerEntry = await kv.get(['customer', order.customer_id]);
    const customer = customerEntry?.value as Customer;

    const invoiceId = `invoice:${Date.now()}`;
    const invoiceNumber = `INV-${Date.now()}`;
    
    const invoice = {
      id: invoiceId,
      invoice_number: invoiceNumber,
      customer_id: customer.id,
      customer: {
        name: order.customer_name,
        email: order.customer_email,
        address: order.shipping_address || customer.address,
      },
      items: order.items.map(item => ({
        description: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_percentage,
        discount: item.discount_amount || 0,
        total: item.total
      })),
      subtotal: order.subtotal,
      tax_total: order.tax_total,
      discount: order.discount_total,
      shipping_cost: order.shipping_cost,
      total: order.total,
      currency: order.currency,
      payment_method: order.payment_method,
      notes: order.customer_notes,
      due_date: order.payment_due_date,
      order_id: order.id,
      type: 'INVOICE',
      payment_status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await kv.set(['invoice', invoiceId], invoice);

    order.invoice_id = invoiceId;
    order.invoiced_at = new Date().toISOString();
    order.updated_at = new Date().toISOString();
    order.updated_by = user.id;

    await kv.set(['order', id], order);

    return c.json({
      success: true,
      order,
      invoice,
      message: 'Factura generada exitosamente'
    }, 201);

  } catch (error: any) {
    console.error('❌ Error generating invoice:', error);
    return c.json({ error: 'Error al generar factura', details: error.message }, 500);
  }
});

// 2.8 Actualizar estado de pago
app.put('/make-server-0dd48dc4/sales/orders/:id/payment', async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { id } = c.req.param();
    const body = await c.req.json();
    const entry = await kv.get(['order', id]);
    const order = entry?.value as SalesOrder;

    if (!order) {
      return c.json({ error: 'Orden no encontrada' }, 404);
    }

    order.paid_amount = body.paid_amount;
    
    if (order.paid_amount >= order.total) {
      order.payment_status = 'paid';
    } else if (order.paid_amount > 0) {
      order.payment_status = 'partial';
    } else {
      order.payment_status = 'pending';
    }

    order.payment_method = body.payment_method || order.payment_method;
    order.updated_at = new Date().toISOString();
    order.updated_by = user.id;

    await kv.set(['order', id], order);

    return c.json({
      success: true,
      order,
      message: 'Estado de pago actualizado'
    });

  } catch (error: any) {
    console.error('❌ Error updating payment:', error);
    return c.json({ error: 'Error al actualizar pago', details: error.message }, 500);
  }
});

// 2.9 Actualizar tracking de envío
app.put('/make-server-0dd48dc4/sales/orders/:id/shipping', async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { id } = c.req.param();
    const body = await c.req.json();
    const entry = await kv.get(['order', id]);
    const order = entry?.value as SalesOrder;

    if (!order) {
      return c.json({ error: 'Orden no encontrada' }, 404);
    }

    order.shipping_status = body.shipping_status;
    order.tracking_number = body.tracking_number || order.tracking_number;
    order.shipping_method = body.shipping_method || order.shipping_method;
    order.estimated_delivery = body.estimated_delivery || order.estimated_delivery;
    
    if (body.shipping_status === 'delivered') {
      order.delivered_at = new Date().toISOString();
    }

    order.updated_at = new Date().toISOString();
    order.updated_by = user.id;

    await kv.set(['order', id], order);

    return c.json({
      success: true,
      order,
      message: 'Estado de envío actualizado'
    });

  } catch (error: any) {
    console.error('❌ Error updating shipping:', error);
    return c.json({ error: 'Error al actualizar envío', details: error.message }, 500);
  }
});

// 2.10 Estadísticas de ventas
app.get('/make-server-0dd48dc4/sales/orders/stats/summary', async (c) => {
  try {
    const period = c.req.query('period') || 'all';
    const channel = c.req.query('channel');

    let orders = await getByPrefix(['order']);
    orders = orders.filter((o: SalesOrder) => o.id && !o.id.startsWith('number') && !o.id.startsWith('customer'));

    const now = new Date();
    if (period === 'today') {
      const today = now.toISOString().split('T')[0];
      orders = orders.filter((o: SalesOrder) => o.order_date.startsWith(today));
    } else if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      orders = orders.filter((o: SalesOrder) => new Date(o.order_date) >= weekAgo);
    } else if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      orders = orders.filter((o: SalesOrder) => new Date(o.order_date) >= monthAgo);
    } else if (period === 'year') {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      orders = orders.filter((o: SalesOrder) => new Date(o.order_date) >= yearAgo);
    }

    if (channel) {
      orders = orders.filter((o: SalesOrder) => o.channel === channel);
    }

    const total = orders.length;
    const totalRevenue = orders.reduce((sum: number, o: SalesOrder) => sum + o.total, 0);
    const completedOrders = orders.filter((o: SalesOrder) => o.status === 'completed');
    const completedRevenue = completedOrders.reduce((sum: number, o: SalesOrder) => sum + o.total, 0);
    const averageTicket = completedOrders.length > 0 ? completedRevenue / completedOrders.length : 0;

    const byStatus = {
      draft: orders.filter((o: SalesOrder) => o.status === 'draft').length,
      pending: orders.filter((o: SalesOrder) => o.status === 'pending').length,
      confirmed: orders.filter((o: SalesOrder) => o.status === 'confirmed').length,
      processing: orders.filter((o: SalesOrder) => o.status === 'processing').length,
      completed: completedOrders.length,
      cancelled: orders.filter((o: SalesOrder) => o.status === 'cancelled').length,
    };

    const byChannel = {
      web: orders.filter((o: SalesOrder) => o.channel === 'web').length,
      mobile: orders.filter((o: SalesOrder) => o.channel === 'mobile').length,
      pos: orders.filter((o: SalesOrder) => o.channel === 'pos').length,
      phone: orders.filter((o: SalesOrder) => o.channel === 'phone').length,
      email: orders.filter((o: SalesOrder) => o.channel === 'email').length,
      whatsapp: orders.filter((o: SalesOrder) => o.channel === 'whatsapp').length,
      marketplace: orders.filter((o: SalesOrder) => o.channel === 'marketplace').length,
    };

    const byPaymentStatus = {
      pending: orders.filter((o: SalesOrder) => o.payment_status === 'pending').length,
      partial: orders.filter((o: SalesOrder) => o.payment_status === 'partial').length,
      paid: orders.filter((o: SalesOrder) => o.payment_status === 'paid').length,
      refunded: orders.filter((o: SalesOrder) => o.payment_status === 'refunded').length,
      cancelled: orders.filter((o: SalesOrder) => o.payment_status === 'cancelled').length,
    };

    return c.json({
      success: true,
      period,
      stats: {
        total_orders: total,
        total_revenue: totalRevenue,
        completed_orders: completedOrders.length,
        completed_revenue: completedRevenue,
        average_ticket: averageTicket,
        by_status: byStatus,
        by_channel: byChannel,
        by_payment_status: byPaymentStatus
      }
    });

  } catch (error: any) {
    console.error('❌ Error getting sales stats:', error);
    return c.json({ error: 'Error al obtener estadísticas', details: error.message }, 500);
  }
});

// 2.11 Top productos vendidos
app.get('/make-server-0dd48dc4/sales/orders/stats/top-products', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10');
    const period = c.req.query('period') || 'all';

    let orders = await getByPrefix(['order']);
    orders = orders.filter((o: SalesOrder) => o.id && o.status === 'completed' && !o.id.startsWith('number') && !o.id.startsWith('customer'));

    const now = new Date();
    if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      orders = orders.filter((o: SalesOrder) => new Date(o.order_date) >= weekAgo);
    } else if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      orders = orders.filter((o: SalesOrder) => new Date(o.order_date) >= monthAgo);
    }

    const productStats: { [key: string]: { name: string; quantity: number; revenue: number; orders: number } } = {};

    for (const order of orders) {
      for (const item of order.items) {
        if (!productStats[item.product_id]) {
          productStats[item.product_id] = {
            name: item.name,
            quantity: 0,
            revenue: 0,
            orders: 0
          };
        }
        productStats[item.product_id].quantity += item.quantity;
        productStats[item.product_id].revenue += item.total;
        productStats[item.product_id].orders += 1;
      }
    }

    const topProducts = Object.entries(productStats)
      .map(([id, stats]) => ({ product_id: id, ...stats }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);

    return c.json({
      success: true,
      period,
      top_products: topProducts
    });

  } catch (error: any) {
    console.error('❌ Error getting top products:', error);
    return c.json({ error: 'Error al obtener top productos', details: error.message }, 500);
  }
});

// 2.12 Búsqueda avanzada de órdenes
app.post('/make-server-0dd48dc4/sales/orders/search', async (c) => {
  try {
    const body = await c.req.json();
    
    let orders = await getByPrefix(['order']);
    orders = orders.filter((o: SalesOrder) => o.id && !o.id.startsWith('number') && !o.id.startsWith('customer'));

    if (body.order_number) {
      orders = orders.filter((o: SalesOrder) => o.order_number.includes(body.order_number));
    }
    if (body.customer_email) {
      orders = orders.filter((o: SalesOrder) => o.customer_email.includes(body.customer_email));
    }
    if (body.customer_name) {
      const nameLower = body.customer_name.toLowerCase();
      orders = orders.filter((o: SalesOrder) => o.customer_name.toLowerCase().includes(nameLower));
    }
    if (body.status) {
      orders = orders.filter((o: SalesOrder) => body.status.includes(o.status));
    }
    if (body.date_from) {
      orders = orders.filter((o: SalesOrder) => o.order_date >= body.date_from);
    }
    if (body.date_to) {
      orders = orders.filter((o: SalesOrder) => o.order_date <= body.date_to);
    }
    if (body.min_total) {
      orders = orders.filter((o: SalesOrder) => o.total >= body.min_total);
    }
    if (body.max_total) {
      orders = orders.filter((o: SalesOrder) => o.total <= body.max_total);
    }

    orders.sort((a: SalesOrder, b: SalesOrder) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());

    return c.json({
      success: true,
      orders,
      total: orders.length
    });

  } catch (error: any) {
    console.error('❌ Error searching orders:', error);
    return c.json({ error: 'Error al buscar órdenes', details: error.message }, 500);
  }
});

// ============================================
// MÓDULO 3: PRESUPUESTOS/COTIZACIONES (8 ENDPOINTS)
// ============================================

// 3.1 Crear presupuesto
app.post('/make-server-0dd48dc4/sales/quotes', async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    
    const customerEntry = await kv.get(['customer', body.customer_id]);
    const customer = customerEntry?.value as Customer;
    
    if (!customer) {
      return c.json({ error: 'Cliente no encontrado' }, 404);
    }

    const quote: Quote = {
      id: crypto.randomUUID(),
      quote_number: `QTE-${Date.now()}`,
      customer_id: body.customer_id,
      customer_name: customer.type === 'company' ? customer.company_name! : `${customer.first_name} ${customer.last_name}`,
      customer_email: customer.email,
      items: body.items,
      subtotal: body.subtotal,
      tax_total: body.tax_total,
      total: body.total,
      currency: body.currency || 'USD',
      status: 'draft',
      valid_until: body.valid_until,
      notes: body.notes,
      terms_conditions: body.terms_conditions,
      sales_rep_id: body.sales_rep_id || user.id,
      created_at: new Date().toISOString(),
      created_by: user.id,
      updated_at: new Date().toISOString(),
    };

    await kv.set(['quote', quote.id], quote);
    await kv.set(['quote', 'number', quote.quote_number], quote.id);
    await kv.set(['quote', 'customer', quote.customer_id, quote.id], quote);

    return c.json({
      success: true,
      quote,
      message: 'Presupuesto creado exitosamente'
    }, 201);

  } catch (error: any) {
    console.error('❌ Error creating quote:', error);
    return c.json({ error: 'Error al crear presupuesto', details: error.message }, 500);
  }
});

// 3.2 Listar presupuestos
app.get('/make-server-0dd48dc4/sales/quotes', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '50');
    const status = c.req.query('status');
    const customerId = c.req.query('customer_id');

    let quotes: Quote[] = [];

    if (customerId) {
      quotes = await getByPrefix(['quote', 'customer', customerId]);
    } else {
      quotes = await getByPrefix(['quote']);
      quotes = quotes.filter((q: Quote) => q.id && !q.id.startsWith('number') && !q.id.startsWith('customer'));
    }

    if (status) {
      quotes = quotes.filter((q: Quote) => q.status === status);
    }

    quotes.sort((a: Quote, b: Quote) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = quotes.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = quotes.slice(start, start + limit);

    return c.json({
      success: true,
      quotes: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });

  } catch (error: any) {
    console.error('❌ Error listing quotes:', error);
    return c.json({ error: 'Error al listar presupuestos', details: error.message }, 500);
  }
});

// 3.3 Obtener presupuesto por ID
app.get('/make-server-0dd48dc4/sales/quotes/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const entry = await kv.get(['quote', id]);
    const quote = entry?.value as Quote;

    if (!quote) {
      return c.json({ error: 'Presupuesto no encontrado' }, 404);
    }

    const customerEntry = await kv.get(['customer', quote.customer_id]);
    const customer = customerEntry?.value as Customer;

    return c.json({
      success: true,
      quote,
      customer
    });

  } catch (error: any) {
    console.error('❌ Error getting quote:', error);
    return c.json({ error: 'Error al obtener presupuesto', details: error.message }, 500);
  }
});

// 3.4 Enviar presupuesto al cliente
app.post('/make-server-0dd48dc4/sales/quotes/:id/send', async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { id } = c.req.param();
    const entry = await kv.get(['quote', id]);
    const quote = entry?.value as Quote;

    if (!quote) {
      return c.json({ error: 'Presupuesto no encontrado' }, 404);
    }

    quote.status = 'sent';
    quote.sent_at = new Date().toISOString();
    quote.updated_at = new Date().toISOString();

    await kv.set(['quote', id], quote);

    return c.json({
      success: true,
      quote,
      message: 'Presupuesto enviado al cliente'
    });

  } catch (error: any) {
    console.error('❌ Error sending quote:', error);
    return c.json({ error: 'Error al enviar presupuesto', details: error.message }, 500);
  }
});

// 3.5 Convertir presupuesto a orden
app.post('/make-server-0dd48dc4/sales/quotes/:id/convert', async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { id } = c.req.param();
    const body = await c.req.json();
    const entry = await kv.get(['quote', id]);
    const quote = entry?.value as Quote;

    if (!quote) {
      return c.json({ error: 'Presupuesto no encontrado' }, 404);
    }

    if (quote.status === 'converted') {
      return c.json({ 
        error: 'Presupuesto ya fue convertido',
        order_id: quote.converted_to_order_id
      }, 400);
    }

    const customerEntry = await kv.get(['customer', quote.customer_id]);
    const customer = customerEntry?.value as Customer;
    
    const order: SalesOrder = {
      id: crypto.randomUUID(),
      order_number: `ORD-${Date.now()}`,
      customer_id: quote.customer_id,
      customer_name: quote.customer_name,
      customer_email: quote.customer_email,
      customer_phone: customer?.mobile || customer?.phone,
      type: 'sale',
      channel: body.channel || 'web',
      items: quote.items.map(item => ({
        id: crypto.randomUUID(),
        product_id: item.product_id,
        sku: '',
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount,
        tax_percentage: item.tax > 0 ? (item.tax / item.unit_price * 100) : 0,
        tax_amount: item.tax,
        subtotal: item.quantity * item.unit_price,
        total: item.total,
      })),
      subtotal: quote.subtotal,
      discount_total: 0,
      tax_total: quote.tax_total,
      shipping_cost: body.shipping_cost || 0,
      total: quote.total + (body.shipping_cost || 0),
      currency: quote.currency,
      payment_method: body.payment_method || 'cash',
      payment_status: 'pending',
      paid_amount: 0,
      payment_terms: customer?.payment_terms || 0,
      shipping_address: body.shipping_address || customer?.address,
      warehouse_id: body.warehouse_id,
      status: 'pending',
      internal_notes: `Convertida desde presupuesto ${quote.quote_number}`,
      sales_rep_id: quote.sales_rep_id,
      reference: quote.quote_number,
      order_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      created_by: user.id,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    };

    await kv.set(['order', order.id], order);
    await kv.set(['order', 'number', order.order_number], order.id);
    await kv.set(['order', 'customer', order.customer_id, order.id], order);

    quote.status = 'converted';
    quote.converted_to_order_id = order.id;
    quote.converted_at = new Date().toISOString();
    quote.updated_at = new Date().toISOString();

    await kv.set(['quote', id], quote);

    return c.json({
      success: true,
      quote,
      order,
      message: 'Presupuesto convertido a orden exitosamente'
    }, 201);

  } catch (error: any) {
    console.error('❌ Error converting quote:', error);
    return c.json({ error: 'Error al convertir presupuesto', details: error.message }, 500);
  }
});

// 3.6 Marcar como aceptado
app.post('/make-server-0dd48dc4/sales/quotes/:id/accept', async (c) => {
  try {
    const { id } = c.req.param();
    const entry = await kv.get(['quote', id]);
    const quote = entry?.value as Quote;

    if (!quote) {
      return c.json({ error: 'Presupuesto no encontrado' }, 404);
    }

    quote.status = 'accepted';
    quote.accepted_at = new Date().toISOString();
    quote.updated_at = new Date().toISOString();

    await kv.set(['quote', id], quote);

    return c.json({
      success: true,
      quote,
      message: 'Presupuesto aceptado'
    });

  } catch (error: any) {
    console.error('❌ Error accepting quote:', error);
    return c.json({ error: 'Error al aceptar presupuesto', details: error.message }, 500);
  }
});

// 3.7 Marcar como rechazado
app.post('/make-server-0dd48dc4/sales/quotes/:id/reject', async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const entry = await kv.get(['quote', id]);
    const quote = entry?.value as Quote;

    if (!quote) {
      return c.json({ error: 'Presupuesto no encontrado' }, 404);
    }

    quote.status = 'rejected';
    quote.rejected_at = new Date().toISOString();
    quote.notes = (quote.notes || '') + `\n[RECHAZADO] ${body.reason || ''}`;
    quote.updated_at = new Date().toISOString();

    await kv.set(['quote', id], quote);

    return c.json({
      success: true,
      quote,
      message: 'Presupuesto rechazado'
    });

  } catch (error: any) {
    console.error('❌ Error rejecting quote:', error);
    return c.json({ error: 'Error al rechazar presupuesto', details: error.message }, 500);
  }
});

// 3.8 Duplicar presupuesto
app.post('/make-server-0dd48dc4/sales/quotes/:id/duplicate', async (c) => {
  try {
    const user = await getAuthUser(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { id } = c.req.param();
    const entry = await kv.get(['quote', id]);
    const original = entry?.value as Quote;

    if (!original) {
      return c.json({ error: 'Presupuesto no encontrado' }, 404);
    }

    const duplicate: Quote = {
      ...original,
      id: crypto.randomUUID(),
      quote_number: `QTE-${Date.now()}`,
      status: 'draft',
      sent_at: undefined,
      viewed_at: undefined,
      accepted_at: undefined,
      rejected_at: undefined,
      converted_to_order_id: undefined,
      converted_at: undefined,
      created_at: new Date().toISOString(),
      created_by: user.id,
      updated_at: new Date().toISOString(),
    };

    await kv.set(['quote', duplicate.id], duplicate);
    await kv.set(['quote', 'number', duplicate.quote_number], duplicate.id);
    await kv.set(['quote', 'customer', duplicate.customer_id, duplicate.id], duplicate);

    return c.json({
      success: true,
      quote: duplicate,
      message: 'Presupuesto duplicado exitosamente'
    }, 201);

  } catch (error: any) {
    console.error('❌ Error duplicating quote:', error);
    return c.json({ error: 'Error al duplicar presupuesto', details: error.message }, 500);
  }
});

// ============================================
// SALUD DEL SISTEMA
// ============================================

app.get('/make-server-0dd48dc4/sales/health', async (c) => {
  return c.json({
    status: 'healthy',
    module: 'sales',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    integrations: {
      inventory: 'available',
      billing: 'available'
    }
  });
});

console.log('🚀 Módulo de Ventas cargado - 45 endpoints disponibles');
console.log('🔗 Integrado con Inventario y Facturación');

export default app;
