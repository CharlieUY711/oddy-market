import { Hono } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

async function getUserFromToken(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// Helper para calcular rango de fechas
function getDateRange(period: "today" | "week" | "month" | "year" | "previous_month") {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case "today":
      return {
        start: today.toISOString(),
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      };
    case "week":
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 7);
      return {
        start: weekStart.toISOString(),
        end: now.toISOString(),
      };
    case "month":
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        start: monthStart.toISOString(),
        end: now.toISOString(),
      };
    case "previous_month":
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        start: prevMonthStart.toISOString(),
        end: prevMonthEnd.toISOString(),
      };
    case "year":
      const yearStart = new Date(now.getFullYear(), 0, 1);
      return {
        start: yearStart.toISOString(),
        end: now.toISOString(),
      };
    default:
      return { start: today.toISOString(), end: now.toISOString() };
  }
}

// KPIs en tiempo real con comparación de períodos
app.get("/make-server-0dd48dc4/analytics/kpis", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Obtener todos los datos en paralelo
    const [orders, articles, customers] = await Promise.all([
      kv.getByPrefix("order:"),
      kv.getByPrefix("article:"),
      kv.getByPrefix("customer:"),
    ]);

    const now = new Date();
    const currentMonth = getDateRange("month");
    const previousMonth = getDateRange("previous_month");

    // Filtrar órdenes por período
    const ordersThisMonth = orders.filter((o: any) => 
      o.createdAt && o.createdAt >= currentMonth.start && o.createdAt <= currentMonth.end
    );
    
    const ordersPrevMonth = orders.filter((o: any) => 
      o.createdAt && o.createdAt >= previousMonth.start && o.createdAt <= previousMonth.end
    );

    // Calcular ventas totales
    const salesThisMonth = ordersThisMonth
      .filter((o: any) => o.status === "completed")
      .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

    const salesPrevMonth = ordersPrevMonth
      .filter((o: any) => o.status === "completed")
      .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

    const salesChange = salesPrevMonth > 0 
      ? Math.round(((salesThisMonth - salesPrevMonth) / salesPrevMonth) * 100)
      : salesThisMonth > 0 ? 100 : 0;

    // Calcular órdenes
    const ordersCountThisMonth = ordersThisMonth.length;
    const ordersCountPrevMonth = ordersPrevMonth.length;
    const ordersChange = ordersCountPrevMonth > 0
      ? Math.round(((ordersCountThisMonth - ordersCountPrevMonth) / ordersCountPrevMonth) * 100)
      : ordersCountThisMonth > 0 ? 100 : 0;

    // Calcular artículos activos
    const activeArticles = articles.filter((a: any) => a.active !== false).length;
    const articlesThisMonth = articles.filter((a: any) => 
      a.createdAt && a.createdAt >= currentMonth.start
    ).length;
    const articlesPrevMonth = articles.filter((a: any) => 
      a.createdAt && a.createdAt >= previousMonth.start && a.createdAt < currentMonth.start
    ).length;
    const articlesChange = articlesPrevMonth > 0
      ? Math.round(((articlesThisMonth - articlesPrevMonth) / articlesPrevMonth) * 100)
      : articlesThisMonth > 0 ? 100 : 0;

    // Calcular clientes
    const customersThisMonth = customers.filter((c: any) => 
      c.createdAt && c.createdAt >= currentMonth.start
    ).length;
    const customersPrevMonth = customers.filter((c: any) => 
      c.createdAt && c.createdAt >= previousMonth.start && c.createdAt < currentMonth.start
    ).length;
    const customersChange = customersPrevMonth > 0
      ? Math.round(((customersThisMonth - customersPrevMonth) / customersPrevMonth) * 100)
      : customersThisMonth > 0 ? 100 : 0;

    // KPIs adicionales
    const avgOrderValue = ordersCountThisMonth > 0 
      ? Math.round(salesThisMonth / ordersCountThisMonth) 
      : 0;

    const conversionRate = customers.length > 0
      ? Math.round((ordersCountThisMonth / customers.length) * 100)
      : 0;

    return c.json({
      kpis: {
        totalSales: {
          value: salesThisMonth,
          formatted: `$${(salesThisMonth / 100).toLocaleString('es-AR')}`,
          change: salesChange,
          trend: salesChange >= 0 ? "up" : "down",
        },
        totalOrders: {
          value: ordersCountThisMonth,
          formatted: ordersCountThisMonth.toString(),
          change: ordersChange,
          trend: ordersChange >= 0 ? "up" : "down",
        },
        totalArticles: {
          value: activeArticles,
          formatted: activeArticles.toString(),
          change: articlesChange,
          trend: articlesChange >= 0 ? "up" : "down",
          new: articlesThisMonth,
        },
        totalCustomers: {
          value: customers.length,
          formatted: customers.length.toString(),
          change: customersChange,
          trend: customersChange >= 0 ? "up" : "down",
          new: customersThisMonth,
        },
        avgOrderValue: {
          value: avgOrderValue,
          formatted: `$${(avgOrderValue / 100).toLocaleString('es-AR')}`,
        },
        conversionRate: {
          value: conversionRate,
          formatted: `${conversionRate}%`,
        },
      },
      period: {
        current: currentMonth,
        previous: previousMonth,
      },
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.log("Error fetching KPIs:", error);
    return c.json({ error: "Error fetching KPIs" }, 500);
  }
});

// Dashboard analytics (endpoint existente mejorado)
app.get("/make-server-0dd48dc4/analytics/dashboard", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const [orders, products, customers] = await Promise.all([
      kv.getByPrefix("order:"),
      kv.getByPrefix("product:"),
      kv.getByPrefix("customer:"),
    ]);

    const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
    const completedOrders = orders.filter((o: any) => o.status === "completed").length;
    
    return c.json({
      totalOrders: orders.length,
      totalProducts: products.length,
      totalCustomers: customers.length,
      totalRevenue,
      completedOrders,
      pendingOrders: orders.length - completedOrders,
    });
  } catch (error) {
    console.log("Error fetching analytics:", error);
    return c.json({ error: "Error fetching analytics" }, 500);
  }
});

// Gráficos de ventas por mes (últimos 6 meses)
app.get("/make-server-0dd48dc4/analytics/sales-chart", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const orders = await kv.getByPrefix("order:");
    const now = new Date();
    
    // Generar datos de los últimos 6 meses
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthOrders = orders.filter((o: any) => {
        if (!o.createdAt) return false;
        const orderDate = new Date(o.createdAt);
        return orderDate >= monthDate && orderDate <= monthEnd;
      });

      const completedOrders = monthOrders.filter((o: any) => o.status === "completed");
      const sales = completedOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);

      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      
      chartData.push({
        name: monthNames[monthDate.getMonth()],
        month: monthDate.getMonth() + 1,
        year: monthDate.getFullYear(),
        ventas: Math.round(sales / 100), // Convertir a pesos
        ordenes: completedOrders.length,
      });
    }

    return c.json({ data: chartData });
  } catch (error) {
    console.log("Error fetching sales chart:", error);
    return c.json({ error: "Error fetching sales chart" }, 500);
  }
});

// Top productos más vendidos
app.get("/make-server-0dd48dc4/analytics/top-products", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const orders = await kv.getByPrefix("order:");
    const completedOrders = orders.filter((o: any) => o.status === "completed");

    // Contar ventas por producto
    const productSales: Record<string, any> = {};
    
    for (const order of completedOrders) {
      if (order.items) {
        for (const item of order.items) {
          if (!productSales[item.id]) {
            productSales[item.id] = {
              id: item.id,
              name: item.name,
              quantity: 0,
              revenue: 0,
            };
          }
          productSales[item.id].quantity += item.quantity || 1;
          productSales[item.id].revenue += (item.price || 0) * (item.quantity || 1);
        }
      }
    }

    // Convertir a array y ordenar por cantidad
    const topProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.quantity - a.quantity)
      .slice(0, 10)
      .map((p: any) => ({
        ...p,
        revenue: Math.round(p.revenue / 100),
        formattedRevenue: `$${(p.revenue / 100).toLocaleString('es-AR')}`,
      }));

    return c.json({ products: topProducts });
  } catch (error) {
    console.log("Error fetching top products:", error);
    return c.json({ error: "Error fetching top products" }, 500);
  }
});

// Órdenes recientes
app.get("/make-server-0dd48dc4/analytics/recent-orders", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const orders = await kv.getByPrefix("order:");
    
    // Ordenar por fecha de creación (más reciente primero)
    const sortedOrders = orders
      .filter((o: any) => o.createdAt)
      .sort((a: any, b: any) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 5); // Últimas 5 órdenes

    // Formatear órdenes
    const recentOrders = sortedOrders.map((order: any) => ({
      id: order.id || "N/A",
      customer: order.customerName || order.customerEmail || "Cliente",
      total: order.total ? order.total / 100 : 0, // Convertir de centavos a pesos
      status: order.status === "completed" ? "Completado" 
            : order.status === "pending" ? "Pendiente" 
            : order.status === "processing" ? "Procesando"
            : "Desconocido",
      createdAt: order.createdAt,
      items: order.items?.length || 0,
    }));

    return c.json({ orders: recentOrders });
  } catch (error) {
    console.log("Error fetching recent orders:", error);
    return c.json({ error: "Error fetching recent orders" }, 500);
  }
});

export default app;
