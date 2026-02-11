import { Hono } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Helper to get user from token
async function getUserFromToken(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// ============== SECOND HAND LISTINGS ROUTES ==============

// Get all approved listings (public)
app.get("/make-server-0dd48dc4/secondhand/listings", async (c) => {
  try {
    const status = c.req.query("status") || "approved";
    const category = c.req.query("category");
    const condition = c.req.query("condition");
    const search = c.req.query("search");
    const sortBy = c.req.query("sortBy") || "createdAt";
    const order = c.req.query("order") || "desc";

    let listings = await kv.getByPrefix("secondhand:listing:");

    // Filter by status
    if (status) {
      listings = listings.filter((item: any) => item.status === status);
    }

    // Filter by category
    if (category && category !== "all") {
      listings = listings.filter((item: any) => item.category === category);
    }

    // Filter by condition
    if (condition && condition !== "all") {
      listings = listings.filter((item: any) => item.condition === condition);
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      listings = listings.filter((item: any) =>
        item.title?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.brand?.toLowerCase().includes(searchLower)
      );
    }

    // Sort listings
    listings.sort((a: any, b: any) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === "price") {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }

      if (order === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return c.json({ listings });
  } catch (error) {
    console.error("Error fetching second hand listings:", error);
    return c.json({ error: "Error fetching listings" }, 500);
  }
});

// Get single listing by ID
app.get("/make-server-0dd48dc4/secondhand/listings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const listing = await kv.get(`secondhand:listing:${id}`);

    if (!listing) {
      return c.json({ error: "Listing not found" }, 404);
    }

    // Increment view count
    const viewCount = (listing.viewCount || 0) + 1;
    await kv.set(`secondhand:listing:${id}`, { ...listing, viewCount });

    return c.json({ listing: { ...listing, viewCount } });
  } catch (error) {
    console.error("Error fetching listing:", error);
    return c.json({ error: "Error fetching listing" }, 500);
  }
});

// Get user's own listings
app.get("/make-server-0dd48dc4/secondhand/my-listings", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const allListings = await kv.getByPrefix("secondhand:listing:");
    const userListings = allListings.filter(
      (item: any) => item.sellerId === user.id
    );

    // Sort by creation date (newest first)
    userListings.sort((a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ listings: userListings });
  } catch (error) {
    console.error("Error fetching user listings:", error);
    return c.json({ error: "Error fetching user listings" }, 500);
  }
});

// Create new listing
app.post("/make-server-0dd48dc4/secondhand/listings", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const listingData = await c.req.json();
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const newListing = {
      id,
      ...listingData,
      sellerId: user.id,
      sellerName: user.user_metadata?.name || user.email,
      sellerEmail: user.email,
      status: "pending", // pending, approved, rejected, sold
      viewCount: 0,
      favoriteCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await kv.set(`secondhand:listing:${id}`, newListing);

    // Log action
    await kv.set(`audit:${Date.now()}:secondhand-create`, {
      action: "secondhand_listing_created",
      userId: user.id,
      userEmail: user.email,
      listingId: id,
      timestamp,
    });

    return c.json({ listing: newListing });
  } catch (error) {
    console.error("Error creating listing:", error);
    return c.json({ error: "Error creating listing" }, 500);
  }
});

// Update listing
app.put("/make-server-0dd48dc4/secondhand/listings/:id", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(`secondhand:listing:${id}`);

    if (!existing) {
      return c.json({ error: "Listing not found" }, 404);
    }

    // Check if user is the seller or admin
    const isAdmin = user.user_metadata?.role === "admin";
    if (existing.sellerId !== user.id && !isAdmin) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const updated = {
      ...existing,
      ...updates,
      id,
      sellerId: existing.sellerId, // Don't allow changing seller
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`secondhand:listing:${id}`, updated);

    return c.json({ listing: updated });
  } catch (error) {
    console.error("Error updating listing:", error);
    return c.json({ error: "Error updating listing" }, 500);
  }
});

// Delete listing
app.delete("/make-server-0dd48dc4/secondhand/listings/:id", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const existing = await kv.get(`secondhand:listing:${id}`);

    if (!existing) {
      return c.json({ error: "Listing not found" }, 404);
    }

    // Check if user is the seller or admin
    const isAdmin = user.user_metadata?.role === "admin";
    if (existing.sellerId !== user.id && !isAdmin) {
      return c.json({ error: "Forbidden" }, 403);
    }

    await kv.del(`secondhand:listing:${id}`);

    // Log action
    await kv.set(`audit:${Date.now()}:secondhand-delete`, {
      action: "secondhand_listing_deleted",
      userId: user.id,
      userEmail: user.email,
      listingId: id,
      timestamp: new Date().toISOString(),
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting listing:", error);
    return c.json({ error: "Error deleting listing" }, 500);
  }
});

// Approve listing (admin only)
app.post("/make-server-0dd48dc4/secondhand/listings/:id/approve", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user || user.user_metadata?.role !== "admin") {
      return c.json({ error: "Unauthorized - Admin only" }, 403);
    }

    const id = c.req.param("id");
    const existing = await kv.get(`secondhand:listing:${id}`);

    if (!existing) {
      return c.json({ error: "Listing not found" }, 404);
    }

    const updated = {
      ...existing,
      status: "approved",
      approvedBy: user.id,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`secondhand:listing:${id}`, updated);

    // Log action
    await kv.set(`audit:${Date.now()}:secondhand-approve`, {
      action: "secondhand_listing_approved",
      adminId: user.id,
      adminEmail: user.email,
      listingId: id,
      sellerId: existing.sellerId,
      timestamp: new Date().toISOString(),
    });

    return c.json({ listing: updated });
  } catch (error) {
    console.error("Error approving listing:", error);
    return c.json({ error: "Error approving listing" }, 500);
  }
});

// Reject listing (admin only)
app.post("/make-server-0dd48dc4/secondhand/listings/:id/reject", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user || user.user_metadata?.role !== "admin") {
      return c.json({ error: "Unauthorized - Admin only" }, 403);
    }

    const id = c.req.param("id");
    const { reason } = await c.req.json();
    const existing = await kv.get(`secondhand:listing:${id}`);

    if (!existing) {
      return c.json({ error: "Listing not found" }, 404);
    }

    const updated = {
      ...existing,
      status: "rejected",
      rejectedBy: user.id,
      rejectionReason: reason,
      rejectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`secondhand:listing:${id}`, updated);

    // Log action
    await kv.set(`audit:${Date.now()}:secondhand-reject`, {
      action: "secondhand_listing_rejected",
      adminId: user.id,
      adminEmail: user.email,
      listingId: id,
      sellerId: existing.sellerId,
      reason,
      timestamp: new Date().toISOString(),
    });

    return c.json({ listing: updated });
  } catch (error) {
    console.error("Error rejecting listing:", error);
    return c.json({ error: "Error rejecting listing" }, 500);
  }
});

// Mark as sold
app.post("/make-server-0dd48dc4/secondhand/listings/:id/mark-sold", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const existing = await kv.get(`secondhand:listing:${id}`);

    if (!existing) {
      return c.json({ error: "Listing not found" }, 404);
    }

    // Check if user is the seller
    if (existing.sellerId !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const updated = {
      ...existing,
      status: "sold",
      soldAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`secondhand:listing:${id}`, updated);

    return c.json({ listing: updated });
  } catch (error) {
    console.error("Error marking as sold:", error);
    return c.json({ error: "Error marking as sold" }, 500);
  }
});

// ============== OFFERS ROUTES ==============

// Get offers for a listing
app.get("/make-server-0dd48dc4/secondhand/offers/:listingId", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const listingId = c.req.param("listingId");
    const listing = await kv.get(`secondhand:listing:${listingId}`);

    if (!listing) {
      return c.json({ error: "Listing not found" }, 404);
    }

    // Only seller can see offers
    if (listing.sellerId !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const allOffers = await kv.getByPrefix(`secondhand:offer:${listingId}:`);
    
    // Sort by creation date (newest first)
    allOffers.sort((a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ offers: allOffers });
  } catch (error) {
    console.error("Error fetching offers:", error);
    return c.json({ error: "Error fetching offers" }, 500);
  }
});

// Create offer
app.post("/make-server-0dd48dc4/secondhand/offers", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { listingId, amount, message } = await c.req.json();
    const listing = await kv.get(`secondhand:listing:${listingId}`);

    if (!listing) {
      return c.json({ error: "Listing not found" }, 404);
    }

    if (listing.status !== "approved") {
      return c.json({ error: "Listing not available for offers" }, 400);
    }

    // Can't make offer on own listing
    if (listing.sellerId === user.id) {
      return c.json({ error: "Cannot make offer on your own listing" }, 400);
    }

    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const newOffer = {
      id,
      listingId,
      buyerId: user.id,
      buyerName: user.user_metadata?.name || user.email,
      buyerEmail: user.email,
      amount,
      message,
      status: "pending", // pending, accepted, rejected, expired
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await kv.set(`secondhand:offer:${listingId}:${id}`, newOffer);

    return c.json({ offer: newOffer });
  } catch (error) {
    console.error("Error creating offer:", error);
    return c.json({ error: "Error creating offer" }, 500);
  }
});

// Accept offer
app.post("/make-server-0dd48dc4/secondhand/offers/:offerId/accept", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const offerId = c.req.param("offerId");
    
    // Find the offer
    const allOffers = await kv.getByPrefix("secondhand:offer:");
    const offer = allOffers.find((o: any) => o.id === offerId);

    if (!offer) {
      return c.json({ error: "Offer not found" }, 404);
    }

    const listing = await kv.get(`secondhand:listing:${offer.listingId}`);

    if (!listing || listing.sellerId !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const updated = {
      ...offer,
      status: "accepted",
      acceptedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`secondhand:offer:${offer.listingId}:${offerId}`, updated);

    return c.json({ offer: updated });
  } catch (error) {
    console.error("Error accepting offer:", error);
    return c.json({ error: "Error accepting offer" }, 500);
  }
});

// Get seller statistics
app.get("/make-server-0dd48dc4/secondhand/seller-stats", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const allListings = await kv.getByPrefix("secondhand:listing:");
    const userListings = allListings.filter(
      (item: any) => item.sellerId === user.id
    );

    const stats = {
      totalListings: userListings.length,
      pendingListings: userListings.filter((l: any) => l.status === "pending").length,
      approvedListings: userListings.filter((l: any) => l.status === "approved").length,
      rejectedListings: userListings.filter((l: any) => l.status === "rejected").length,
      soldListings: userListings.filter((l: any) => l.status === "sold").length,
      totalViews: userListings.reduce((sum: number, l: any) => sum + (l.viewCount || 0), 0),
      totalRevenue: userListings
        .filter((l: any) => l.status === "sold")
        .reduce((sum: number, l: any) => sum + (parseFloat(l.price) || 0), 0),
    };

    return c.json({ stats });
  } catch (error) {
    console.error("Error fetching seller stats:", error);
    return c.json({ error: "Error fetching seller stats" }, 500);
  }
});

// Get admin statistics
app.get("/make-server-0dd48dc4/secondhand/admin-stats", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user || user.user_metadata?.role !== "admin") {
      return c.json({ error: "Unauthorized - Admin only" }, 403);
    }

    const allListings = await kv.getByPrefix("secondhand:listing:");

    const stats = {
      totalListings: allListings.length,
      pendingApproval: allListings.filter((l: any) => l.status === "pending").length,
      approved: allListings.filter((l: any) => l.status === "approved").length,
      rejected: allListings.filter((l: any) => l.status === "rejected").length,
      sold: allListings.filter((l: any) => l.status === "sold").length,
      totalViews: allListings.reduce((sum: number, l: any) => sum + (l.viewCount || 0), 0),
      totalRevenue: allListings
        .filter((l: any) => l.status === "sold")
        .reduce((sum: number, l: any) => sum + (parseFloat(l.price) || 0), 0),
      activeSellers: new Set(allListings.map((l: any) => l.sellerId)).size,
    };

    return c.json({ stats });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return c.json({ error: "Error fetching admin stats" }, 500);
  }
});

// Get pending listings for admin review
app.get("/make-server-0dd48dc4/secondhand/pending-review", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user || user.user_metadata?.role !== "admin") {
      return c.json({ error: "Unauthorized - Admin only" }, 403);
    }

    const allListings = await kv.getByPrefix("secondhand:listing:");
    const pendingListings = allListings.filter(
      (item: any) => item.status === "pending"
    );

    // Sort by creation date (oldest first for review)
    pendingListings.sort((a: any, b: any) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return c.json({ listings: pendingListings });
  } catch (error) {
    console.error("Error fetching pending listings:", error);
    return c.json({ error: "Error fetching pending listings" }, 500);
  }
});

// Toggle favorite
app.post("/make-server-0dd48dc4/secondhand/listings/:id/favorite", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const listing = await kv.get(`secondhand:listing:${id}`);

    if (!listing) {
      return c.json({ error: "Listing not found" }, 404);
    }

    // Get or create user favorites
    const favKey = `secondhand:favorites:${user.id}`;
    const favorites = (await kv.get(favKey)) || { listingIds: [] };

    const isFavorited = favorites.listingIds.includes(id);
    
    if (isFavorited) {
      // Remove from favorites
      favorites.listingIds = favorites.listingIds.filter((fid: string) => fid !== id);
      listing.favoriteCount = Math.max(0, (listing.favoriteCount || 0) - 1);
    } else {
      // Add to favorites
      favorites.listingIds.push(id);
      listing.favoriteCount = (listing.favoriteCount || 0) + 1;
    }

    await kv.set(favKey, favorites);
    await kv.set(`secondhand:listing:${id}`, listing);

    return c.json({ favorited: !isFavorited, favoriteCount: listing.favoriteCount });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return c.json({ error: "Error toggling favorite" }, 500);
  }
});

// Get user favorites
app.get("/make-server-0dd48dc4/secondhand/favorites", async (c) => {
  try {
    const user = await getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const favKey = `secondhand:favorites:${user.id}`;
    const favorites = (await kv.get(favKey)) || { listingIds: [] };

    // Get full listing data for each favorite
    const listings = await Promise.all(
      favorites.listingIds.map(async (id: string) => {
        return await kv.get(`secondhand:listing:${id}`);
      })
    );

    // Filter out null values (deleted listings)
    const validListings = listings.filter((l) => l !== null);

    return c.json({ listings: validListings });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return c.json({ error: "Error fetching favorites" }, 500);
  }
});

export default app;
