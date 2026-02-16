import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ==========================================
// WHEELS - Ruletas Promocionales
// ==========================================

// Create wheel
app.post("/make-server-0dd48dc4/wheel/wheels", async (c) => {
  try {
    const wheel = await c.req.json();
    const id = wheel.id || `wheel:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newWheel = {
      ...wheel,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      status: wheel.status || "draft", // draft, active, paused, completed
      type: wheel.type || "standard", // standard, scratch_card, slot_machine
      prizes: wheel.prizes || [],
      rules: {
        max_spins_per_user: wheel.max_spins_per_user || 1,
        require_email: wheel.require_email !== false,
        require_purchase: wheel.require_purchase || false,
        min_purchase_amount: wheel.min_purchase_amount || 0,
      },
      design: {
        colors: wheel.colors || ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A"],
        logo: wheel.logo || null,
        background: wheel.background || null,
      },
      stats: {
        total_spins: 0,
        total_winners: 0,
        prizes_claimed: 0,
        conversion_rate: 0,
      },
    };

    await kv.set(id, newWheel);
    return c.json({ wheel: newWheel });
  } catch (error) {
    return c.json({ error: "Error creating wheel" }, 500);
  }
});

// Get wheels
app.get("/make-server-0dd48dc4/wheel/wheels", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const status = c.req.query("status");
    const wheels = [];

    for await (const entry of kv.list({ prefix: "wheel:" })) {
      const wheel = entry.value as any;
      if (wheel.entity_id === entity_id) {
        if (status && wheel.status !== status) continue;
        wheels.push(wheel);
      }
    }

    return c.json({ wheels, total: wheels.length });
  } catch (error) {
    return c.json({ error: "Error fetching wheels" }, 500);
  }
});

// Get wheel by ID
app.get("/make-server-0dd48dc4/wheel/wheels/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const wheel = await kv.get(id);

    if (!wheel.value) {
      return c.json({ error: "Wheel not found" }, 404);
    }

    return c.json({ wheel: wheel.value });
  } catch (error) {
    return c.json({ error: "Error fetching wheel" }, 500);
  }
});

// ==========================================
// PRIZES - Premios
// ==========================================

// Add prize to wheel
app.post("/make-server-0dd48dc4/wheel/wheels/:id/prizes", async (c) => {
  try {
    const wheel_id = c.req.param("id");
    const prize = await c.req.json();
    const wheel = await kv.get(wheel_id);

    if (!wheel.value) {
      return c.json({ error: "Wheel not found" }, 404);
    }

    const newPrize = {
      id: `prize:${Date.now()}`,
      ...prize,
      probability: prize.probability || 10, // Percentage (0-100)
      quantity: prize.quantity || null, // null = unlimited
      claimed: 0,
    };

    wheel.value.prizes.push(newPrize);
    wheel.value.updated_at = new Date().toISOString();

    await kv.set(wheel_id, wheel.value);
    return c.json({ wheel: wheel.value, prize: newPrize });
  } catch (error) {
    return c.json({ error: "Error adding prize" }, 500);
  }
});

// ==========================================
// SPINS - Giros/Participaciones
// ==========================================

// Spin the wheel
app.post("/make-server-0dd48dc4/wheel/wheels/:id/spin", async (c) => {
  try {
    const wheel_id = c.req.param("id");
    const { user_id, user_email } = await c.req.json();
    const wheel = await kv.get(wheel_id);

    if (!wheel.value) {
      return c.json({ error: "Wheel not found" }, 404);
    }

    if (wheel.value.status !== "active") {
      return c.json({ error: "Wheel is not active" }, 400);
    }

    // Check user's previous spins
    const userSpins = [];
    for await (const entry of kv.list({ prefix: `spin:${wheel_id}:${user_id}` })) {
      userSpins.push(entry.value);
    }

    if (userSpins.length >= wheel.value.rules.max_spins_per_user) {
      return c.json({ error: "Maximum spins reached" }, 400);
    }

    // Select prize based on probability
    const prize = this.selectPrize(wheel.value.prizes);

    // Create spin record
    const spin_id = `spin:${wheel_id}:${user_id}:${Date.now()}`;
    const spin = {
      id: spin_id,
      wheel_id,
      user_id,
      user_email,
      prize_id: prize?.id || null,
      prize_name: prize?.name || "Better luck next time",
      won: !!prize,
      claimed: false,
      spun_at: new Date().toISOString(),
      claimed_at: null,
    };

    await kv.set(spin_id, spin);

    // Update wheel stats
    wheel.value.stats.total_spins = (wheel.value.stats.total_spins || 0) + 1;
    if (prize) {
      wheel.value.stats.total_winners = (wheel.value.stats.total_winners || 0) + 1;
      
      // Update prize claimed count
      const prizeInWheel = wheel.value.prizes.find((p: any) => p.id === prize.id);
      if (prizeInWheel) {
        prizeInWheel.claimed = (prizeInWheel.claimed || 0) + 1;
      }
    }
    wheel.value.stats.conversion_rate = 
      (wheel.value.stats.total_winners / wheel.value.stats.total_spins) * 100;

    await kv.set(wheel_id, wheel.value);

    return c.json({ spin, prize: prize || null });
  } catch (error) {
    return c.json({ error: "Error spinning wheel" }, 500);
  }
});

// Helper: Select prize based on probability
function selectPrize(prizes: any[]): any | null {
  // Filter available prizes
  const availablePrizes = prizes.filter((p) => 
    p.quantity === null || p.claimed < p.quantity
  );

  if (availablePrizes.length === 0) return null;

  // Calculate total probability
  const totalProbability = availablePrizes.reduce((sum, p) => sum + p.probability, 0);
  
  // Random selection
  const random = Math.random() * totalProbability;
  let cumulative = 0;

  for (const prize of availablePrizes) {
    cumulative += prize.probability;
    if (random <= cumulative) {
      return prize;
    }
  }

  return null;
}

// Get user spins
app.get("/make-server-0dd48dc4/wheel/spins/user/:user_id", async (c) => {
  try {
    const user_id = c.req.param("user_id");
    const spins = [];

    for await (const entry of kv.list({ prefix: `spin:` })) {
      const spin = entry.value as any;
      if (spin.user_id === user_id) {
        spins.push(spin);
      }
    }

    return c.json({ spins, total: spins.length });
  } catch (error) {
    return c.json({ error: "Error fetching user spins" }, 500);
  }
});

// Claim prize
app.post("/make-server-0dd48dc4/wheel/spins/:id/claim", async (c) => {
  try {
    const spin_id = c.req.param("id");
    const spin = await kv.get(spin_id);

    if (!spin.value) {
      return c.json({ error: "Spin not found" }, 404);
    }

    if (!spin.value.won) {
      return c.json({ error: "No prize to claim" }, 400);
    }

    if (spin.value.claimed) {
      return c.json({ error: "Prize already claimed" }, 400);
    }

    spin.value.claimed = true;
    spin.value.claimed_at = new Date().toISOString();

    await kv.set(spin_id, spin.value);

    // Update wheel stats
    const wheel = await kv.get(spin.value.wheel_id);
    if (wheel.value) {
      wheel.value.stats.prizes_claimed = (wheel.value.stats.prizes_claimed || 0) + 1;
      await kv.set(spin.value.wheel_id, wheel.value);
    }

    return c.json({ spin: spin.value, message: "Prize claimed successfully" });
  } catch (error) {
    return c.json({ error: "Error claiming prize" }, 500);
  }
});

// ==========================================
// ANALYTICS - Análisis de Ruletas
// ==========================================

// Get wheel analytics
app.get("/make-server-0dd48dc4/wheel/wheels/:id/analytics", async (c) => {
  try {
    const id = c.req.param("id");
    const wheel = await kv.get(id);

    if (!wheel.value) {
      return c.json({ error: "Wheel not found" }, 404);
    }

    const spins = [];
    for await (const entry of kv.list({ prefix: `spin:${id}:` })) {
      spins.push(entry.value);
    }

    const analytics = {
      wheel_id: id,
      wheel_name: wheel.value.name,
      stats: wheel.value.stats,
      prizes: wheel.value.prizes.map((p: any) => ({
        name: p.name,
        probability: p.probability,
        claimed: p.claimed || 0,
        remaining: p.quantity ? p.quantity - (p.claimed || 0) : "Unlimited",
      })),
      recent_winners: spins.filter((s: any) => s.won).slice(-10),
    };

    return c.json({ analytics });
  } catch (error) {
    return c.json({ error: "Error fetching analytics" }, 500);
  }
});

// Dashboard
app.get("/make-server-0dd48dc4/wheel/dashboard", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";

    const wheels = [];
    const spins = [];

    for await (const entry of kv.list({ prefix: "wheel:" })) {
      const wheel = entry.value as any;
      if (wheel.entity_id === entity_id) wheels.push(wheel);
    }

    for await (const entry of kv.list({ prefix: "spin:" })) {
      spins.push(entry.value);
    }

    return c.json({
      dashboard: {
        wheels: {
          total: wheels.length,
          active: wheels.filter((w) => w.status === "active").length,
        },
        spins: {
          total: spins.length,
          winners: spins.filter((s: any) => s.won).length,
          claimed: spins.filter((s: any) => s.claimed).length,
        },
        conversion_rate: spins.length > 0
          ? (spins.filter((s: any) => s.won).length / spins.length) * 100
          : 0,
      },
    });
  } catch (error) {
    return c.json({ error: "Error fetching dashboard" }, 500);
  }
});

export default app;
