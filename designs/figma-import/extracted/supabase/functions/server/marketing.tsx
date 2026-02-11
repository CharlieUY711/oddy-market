import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const marketingApp = new Hono();

// ============== SPIN WHEELS ==============

marketingApp.get("/make-server-0dd48dc4/marketing/spin-wheels", async (c) => {
  try {
    const wheels = await kv.getByPrefix("spin-wheel:");
    return c.json({ wheels: wheels || [] });
  } catch (error) {
    console.log("Error loading spin wheels:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

marketingApp.post("/make-server-0dd48dc4/marketing/spin-wheels", async (c) => {
  try {
    const wheel = await c.req.json();
    await kv.set(`spin-wheel:${wheel.id}`, wheel);
    return c.json({ success: true, wheel });
  } catch (error) {
    console.log("Error saving spin wheel:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

marketingApp.post("/make-server-0dd48dc4/marketing/spin-wheels/:id/spin", async (c) => {
  try {
    const wheelId = c.req.param("id");
    const { email } = await c.req.json();

    const wheel = await kv.get(`spin-wheel:${wheelId}`);
    if (!wheel) {
      return c.json({ error: "Wheel not found" }, 404);
    }

    // Record spin
    const spinRecord = {
      wheelId,
      email,
      timestamp: new Date().toISOString(),
    };

    await kv.set(`spin-record:${Date.now()}`, spinRecord);

    return c.json({ success: true });
  } catch (error) {
    console.log("Error recording spin:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============== GOOGLE ADS ==============

marketingApp.get("/make-server-0dd48dc4/marketing/google-ads/campaigns", async (c) => {
  try {
    const campaigns = await kv.getByPrefix("google-ads-campaign:");
    
    // Mock data for demo
    const mockCampaigns = [
      {
        id: "1",
        name: "Campaña Primavera 2026",
        status: "active",
        budget: 500,
        spent: 342.50,
        impressions: 12450,
        clicks: 487,
        conversions: 85,
        ctr: 3.91,
        cpc: 0.70,
        roas: 4.2,
        startDate: "2026-02-01",
      },
      {
        id: "2",
        name: "Productos Destacados",
        status: "active",
        budget: 300,
        spent: 198.75,
        impressions: 8920,
        clicks: 356,
        conversions: 52,
        ctr: 3.99,
        cpc: 0.56,
        roas: 3.8,
        startDate: "2026-01-15",
      },
    ];

    return c.json({ campaigns: campaigns.length > 0 ? campaigns : mockCampaigns });
  } catch (error) {
    console.log("Error loading Google Ads campaigns:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

marketingApp.put(
  "/make-server-0dd48dc4/marketing/google-ads/campaigns/:id/status",
  async (c) => {
    try {
      const campaignId = c.req.param("id");
      const { status } = await c.req.json();

      const campaign = await kv.get(`google-ads-campaign:${campaignId}`);
      if (!campaign) {
        return c.json({ error: "Campaign not found" }, 404);
      }

      campaign.status = status;
      await kv.set(`google-ads-campaign:${campaignId}`, campaign);

      return c.json({ success: true, campaign });
    } catch (error) {
      console.log("Error updating campaign status:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// ============== COUPONS ==============

marketingApp.get("/make-server-0dd48dc4/marketing/coupons", async (c) => {
  try {
    const coupons = await kv.getByPrefix("coupon:");
    
    // Mock data
    const mockCoupons = [
      {
        id: "1",
        code: "ODDYWELCOME10",
        type: "percentage",
        value: 10,
        minPurchase: 0,
        maxUses: 1000,
        used: 245,
        startDate: "2026-02-01",
        endDate: "2026-03-31",
        active: true,
        description: "Bienvenida - 10% OFF primera compra",
      },
      {
        id: "2",
        code: "FREESHIP50",
        type: "free-shipping",
        value: 0,
        minPurchase: 50,
        maxUses: 500,
        used: 89,
        startDate: "2026-02-01",
        endDate: "2026-02-28",
        active: true,
        description: "Envío gratis en compras +$50",
      },
    ];

    return c.json({ coupons: coupons.length > 0 ? coupons : mockCoupons });
  } catch (error) {
    console.log("Error loading coupons:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

marketingApp.post("/make-server-0dd48dc4/marketing/coupons", async (c) => {
  try {
    const coupon = await c.req.json();
    await kv.set(`coupon:${coupon.id}`, coupon);
    return c.json({ success: true, coupon });
  } catch (error) {
    console.log("Error saving coupon:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

marketingApp.delete("/make-server-0dd48dc4/marketing/coupons/:id", async (c) => {
  try {
    const couponId = c.req.param("id");
    await kv.del(`coupon:${couponId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting coupon:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

marketingApp.post("/make-server-0dd48dc4/marketing/coupons/:code/validate", async (c) => {
  try {
    const code = c.req.param("code");
    const { cartTotal } = await c.req.json();

    const coupons = await kv.getByPrefix("coupon:");
    const coupon = coupons.find((c: any) => c.code === code && c.active);

    if (!coupon) {
      return c.json({ valid: false, error: "Cupón no válido" }, 400);
    }

    if (coupon.used >= coupon.maxUses) {
      return c.json({ valid: false, error: "Cupón agotado" }, 400);
    }

    if (cartTotal < coupon.minPurchase) {
      return c.json({
        valid: false,
        error: `Compra mínima: $${coupon.minPurchase}`,
      }, 400);
    }

    const now = new Date();
    const start = new Date(coupon.startDate);
    const end = new Date(coupon.endDate);

    if (now < start || now > end) {
      return c.json({ valid: false, error: "Cupón expirado" }, 400);
    }

    let discount = 0;
    if (coupon.type === "percentage") {
      discount = (cartTotal * coupon.value) / 100;
    } else if (coupon.type === "fixed") {
      discount = coupon.value;
    }

    return c.json({
      valid: true,
      coupon,
      discount,
      finalTotal: cartTotal - discount,
    });
  } catch (error) {
    console.log("Error validating coupon:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============== LOYALTY PROGRAM ==============

marketingApp.get("/make-server-0dd48dc4/marketing/loyalty/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    let loyaltyData = await kv.get(`loyalty:${userId}`);

    if (!loyaltyData) {
      loyaltyData = {
        userId,
        points: 0,
        tier: "bronze",
        totalSpent: 0,
        purchases: 0,
        joinedDate: new Date().toISOString(),
      };
      await kv.set(`loyalty:${userId}`, loyaltyData);
    }

    return c.json(loyaltyData);
  } catch (error) {
    console.log("Error loading loyalty data:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

marketingApp.post("/make-server-0dd48dc4/marketing/loyalty/:userId/add-points", async (c) => {
  try {
    const userId = c.req.param("userId");
    const { points, orderId } = await c.req.json();

    const loyaltyData = await kv.get(`loyalty:${userId}`);
    if (!loyaltyData) {
      return c.json({ error: "User not found" }, 404);
    }

    loyaltyData.points += points;
    loyaltyData.purchases += 1;

    // Update tier based on points
    if (loyaltyData.points >= 5000) {
      loyaltyData.tier = "platinum";
    } else if (loyaltyData.points >= 2000) {
      loyaltyData.tier = "gold";
    } else if (loyaltyData.points >= 500) {
      loyaltyData.tier = "silver";
    } else {
      loyaltyData.tier = "bronze";
    }

    await kv.set(`loyalty:${userId}`, loyaltyData);

    // Record transaction
    await kv.set(`loyalty-transaction:${Date.now()}`, {
      userId,
      points,
      orderId,
      timestamp: new Date().toISOString(),
    });

    return c.json({ success: true, loyaltyData });
  } catch (error) {
    console.log("Error adding loyalty points:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============== CAMPAIGNS ==============

marketingApp.get("/make-server-0dd48dc4/marketing/campaigns", async (c) => {
  try {
    const campaigns = await kv.getByPrefix("campaign:");
    return c.json({ campaigns: campaigns || [] });
  } catch (error) {
    console.log("Error loading campaigns:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

marketingApp.post("/make-server-0dd48dc4/marketing/campaigns", async (c) => {
  try {
    const campaign = await c.req.json();
    await kv.set(`campaign:${campaign.id}`, campaign);
    return c.json({ success: true, campaign });
  } catch (error) {
    console.log("Error saving campaign:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default marketingApp;
