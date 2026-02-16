import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ==========================================
// DASHBOARD - Dashboard Ejecutivo ERP
// ==========================================

// Get executive dashboard
app.get("/make-server-0dd48dc4/erp/dashboard", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const period = c.req.query("period") || "month"; // day, week, month, quarter, year

    // Collect data from all modules
    const products = [];
    const orders = [];
    const invoices = [];
    const inventory = [];

    for await (const entry of kv.list({ prefix: "product:" })) {
      const product = entry.value as any;
      if (product.entity_id === entity_id) products.push(product);
    }

    for await (const entry of kv.list({ prefix: "order:" })) {
      const order = entry.value as any;
      if (order.entity_id === entity_id) orders.push(order);
    }

    for await (const entry of kv.list({ prefix: "invoice:" })) {
      const invoice = entry.value as any;
      if (invoice.entity_id === entity_id) invoices.push(invoice);
    }

    for await (const entry of kv.list({ prefix: "inventory:" })) {
      const inv = entry.value as any;
      if (inv.entity_id === entity_id) inventory.push(inv);
    }

    const dashboard = {
      entity_id,
      period,
      kpis: {
        revenue: invoices.reduce((sum, i) => sum + (i.totals?.grand_total || 0), 0),
        orders: orders.length,
        products: products.length,
        customers: new Set(orders.map((o) => o.customer_id)).size,
      },
      sales: {
        total: orders.length,
        completed: orders.filter((o) => o.status === "completed").length,
        pending: orders.filter((o) => o.status === "pending").length,
        average_order_value: orders.length > 0
          ? orders.reduce((sum, o) => sum + (o.total || 0), 0) / orders.length
          : 0,
      },
      inventory: {
        total_items: inventory.length,
        low_stock: inventory.filter((i) => i.quantity < i.min_stock).length,
        out_of_stock: inventory.filter((i) => i.quantity === 0).length,
        total_value: inventory.reduce((sum, i) => sum + (i.quantity * i.unit_cost), 0),
      },
      financial: {
        invoiced: invoices.reduce((sum, i) => sum + (i.totals?.grand_total || 0), 0),
        paid: invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + (i.totals?.grand_total || 0), 0),
        pending: invoices.filter((i) => i.status === "pending").reduce((sum, i) => sum + (i.totals?.grand_total || 0), 0),
        overdue: invoices.filter((i) => i.status === "overdue").reduce((sum, i) => sum + (i.totals?.grand_total || 0), 0),
      },
    };

    return c.json({ dashboard });
  } catch (error) {
    return c.json({ error: "Error fetching ERP dashboard" }, 500);
  }
});

// ==========================================
// REPORTS - Reportes Consolidados
// ==========================================

// Sales report
app.get("/make-server-0dd48dc4/erp/reports/sales", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const start_date = c.req.query("start_date");
    const end_date = c.req.query("end_date");

    const orders = [];
    for await (const entry of kv.list({ prefix: "order:" })) {
      const order = entry.value as any;
      if (order.entity_id === entity_id) {
        if (start_date && end_date) {
          const orderDate = new Date(order.created_at);
          if (orderDate >= new Date(start_date) && orderDate <= new Date(end_date)) {
            orders.push(order);
          }
        } else {
          orders.push(order);
        }
      }
    }

    const report = {
      period: { start_date, end_date },
      total_orders: orders.length,
      total_revenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
      average_order_value: orders.length > 0
        ? orders.reduce((sum, o) => sum + (o.total || 0), 0) / orders.length
        : 0,
      by_status: {
        completed: orders.filter((o) => o.status === "completed").length,
        pending: orders.filter((o) => o.status === "pending").length,
        cancelled: orders.filter((o) => o.status === "cancelled").length,
      },
      top_products: this.getTopProducts(orders),
    };

    return c.json({ report });
  } catch (error) {
    return c.json({ error: "Error generating sales report" }, 500);
  }
});

// Helper: Get top products from orders
function getTopProducts(orders: any[]): any[] {
  const productCounts: any = {};
  orders.forEach((order) => {
    order.items?.forEach((item: any) => {
      productCounts[item.product_id] = (productCounts[item.product_id] || 0) + item.quantity;
    });
  });
  return Object.entries(productCounts)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 10)
    .map(([product_id, quantity]) => ({ product_id, quantity }));
}

// Inventory report
app.get("/make-server-0dd48dc4/erp/reports/inventory", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";

    const inventory = [];
    for await (const entry of kv.list({ prefix: "inventory:" })) {
      const inv = entry.value as any;
      if (inv.entity_id === entity_id) inventory.push(inv);
    }

    const report = {
      total_items: inventory.length,
      total_value: inventory.reduce((sum, i) => sum + (i.quantity * i.unit_cost), 0),
      alerts: {
        low_stock: inventory.filter((i) => i.quantity < i.min_stock),
        out_of_stock: inventory.filter((i) => i.quantity === 0),
        excess_stock: inventory.filter((i) => i.quantity > i.max_stock),
      },
      by_category: this.groupByCategory(inventory),
    };

    return c.json({ report });
  } catch (error) {
    return c.json({ error: "Error generating inventory report" }, 500);
  }
});

// Helper: Group inventory by category
function groupByCategory(inventory: any[]): any[] {
  const categories: any = {};
  inventory.forEach((item) => {
    const cat = item.category || "uncategorized";
    if (!categories[cat]) {
      categories[cat] = { category: cat, items: 0, value: 0 };
    }
    categories[cat].items += 1;
    categories[cat].value += item.quantity * item.unit_cost;
  });
  return Object.values(categories);
}

// Financial report
app.get("/make-server-0dd48dc4/erp/reports/financial", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const start_date = c.req.query("start_date");
    const end_date = c.req.query("end_date");

    const invoices = [];
    for await (const entry of kv.list({ prefix: "invoice:" })) {
      const invoice = entry.value as any;
      if (invoice.entity_id === entity_id) {
        if (start_date && end_date) {
          const invoiceDate = new Date(invoice.createdAt);
          if (invoiceDate >= new Date(start_date) && invoiceDate <= new Date(end_date)) {
            invoices.push(invoice);
          }
        } else {
          invoices.push(invoice);
        }
      }
    }

    const report = {
      period: { start_date, end_date },
      invoices: {
        total: invoices.length,
        paid: invoices.filter((i) => i.status === "paid").length,
        pending: invoices.filter((i) => i.status === "pending").length,
        overdue: invoices.filter((i) => i.status === "overdue").length,
      },
      revenue: {
        total: invoices.reduce((sum, i) => sum + (i.totals?.grand_total || 0), 0),
        collected: invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + (i.totals?.grand_total || 0), 0),
        pending: invoices.filter((i) => i.status === "pending").reduce((sum, i) => sum + (i.totals?.grand_total || 0), 0),
      },
      taxes: {
        collected: invoices.reduce((sum, i) => sum + (i.totals?.total_tax || 0), 0),
      },
    };

    return c.json({ report });
  } catch (error) {
    return c.json({ error: "Error generating financial report" }, 500);
  }
});

// ==========================================
// ANALYTICS - Análisis Avanzado
// ==========================================

// Get business metrics
app.get("/make-server-0dd48dc4/erp/analytics/metrics", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";

    const orders = [];
    const invoices = [];
    const customers = [];

    for await (const entry of kv.list({ prefix: "order:" })) {
      const order = entry.value as any;
      if (order.entity_id === entity_id) orders.push(order);
    }

    for await (const entry of kv.list({ prefix: "invoice:" })) {
      const invoice = entry.value as any;
      if (invoice.entity_id === entity_id) invoices.push(invoice);
    }

    for await (const entry of kv.list({ prefix: "party:" })) {
      const party = entry.value as any;
      if (party.entity_id === entity_id && party.roles?.includes("customer")) {
        customers.push(party);
      }
    }

    const metrics = {
      customer_lifetime_value: customers.length > 0
        ? invoices.reduce((sum, i) => sum + (i.totals?.grand_total || 0), 0) / customers.length
        : 0,
      customer_acquisition_cost: 0, // Would need marketing spend data
      churn_rate: 0, // Would need historical customer data
      repeat_purchase_rate: this.calculateRepeatPurchaseRate(orders),
      average_order_value: orders.length > 0
        ? orders.reduce((sum, o) => sum + (o.total || 0), 0) / orders.length
        : 0,
    };

    return c.json({ metrics });
  } catch (error) {
    return c.json({ error: "Error fetching analytics metrics" }, 500);
  }
});

// Helper: Calculate repeat purchase rate
function calculateRepeatPurchaseRate(orders: any[]): number {
  const customerOrders: any = {};
  orders.forEach((order) => {
    customerOrders[order.customer_id] = (customerOrders[order.customer_id] || 0) + 1;
  });
  const repeatCustomers = Object.values(customerOrders).filter((count: any) => count > 1).length;
  const totalCustomers = Object.keys(customerOrders).length;
  return totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;
}

// Get trends
app.get("/make-server-0dd48dc4/erp/analytics/trends", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const metric = c.req.query("metric") || "revenue"; // revenue, orders, customers

    const orders = [];
    for await (const entry of kv.list({ prefix: "order:" })) {
      const order = entry.value as any;
      if (order.entity_id === entity_id) orders.push(order);
    }

    // Group by date
    const trendData = this.groupByDate(orders, metric);

    return c.json({ trends: trendData });
  } catch (error) {
    return c.json({ error: "Error fetching trends" }, 500);
  }
});

// Helper: Group data by date
function groupByDate(orders: any[], metric: string): any[] {
  const grouped: any = {};
  orders.forEach((order) => {
    const date = new Date(order.created_at).toISOString().split("T")[0];
    if (!grouped[date]) {
      grouped[date] = { date, value: 0 };
    }
    if (metric === "revenue") {
      grouped[date].value += order.total || 0;
    } else if (metric === "orders") {
      grouped[date].value += 1;
    }
  });
  return Object.values(grouped).sort((a: any, b: any) => a.date.localeCompare(b.date));
}

export default app;
