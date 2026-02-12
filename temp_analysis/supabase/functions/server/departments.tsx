import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const departmentsApp = new Hono();

// ============== DEPARTMENTS CRUD ==============

// Get all departments
departmentsApp.get("/make-server-0dd48dc4/departments", async (c) => {
  try {
    const departments = await kv.getByPrefix("department:");
    
    // Sort by order
    const sortedDepartments = departments.sort((a: any, b: any) => {
      return (a.order || 0) - (b.order || 0);
    });

    return c.json({ departments: sortedDepartments });
  } catch (error) {
    console.log("Error fetching departments:", error);
    return c.json({ error: "Error fetching departments" }, 500);
  }
});

// Get single department
departmentsApp.get("/make-server-0dd48dc4/departments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const department = await kv.get(`department:${id}`);

    if (!department) {
      return c.json({ error: "Department not found" }, 404);
    }

    return c.json({ department });
  } catch (error) {
    console.log("Error fetching department:", error);
    return c.json({ error: "Error fetching department" }, 500);
  }
});

// Create department
departmentsApp.post("/make-server-0dd48dc4/departments", async (c) => {
  try {
    const data = await c.req.json();
    // Use provided ID if exists (for initial departments), otherwise generate new one
    const id = data.id || crypto.randomUUID();
    const timestamp = new Date().toISOString();

    // Check if department already exists
    const existing = await kv.get(`department:${id}`);
    if (existing) {
      // If it exists, return the existing one without creating duplicates
      return c.json({ department: existing });
    }

    const department = {
      id,
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await kv.set(`department:${id}`, department);
    return c.json({ department });
  } catch (error) {
    console.log("Error creating department:", error);
    return c.json({ error: "Error creating department" }, 500);
  }
});

// Update department
departmentsApp.put("/make-server-0dd48dc4/departments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const existing = await kv.get(`department:${id}`);

    if (!existing) {
      return c.json({ error: "Department not found" }, 404);
    }

    const updated = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`department:${id}`, updated);
    return c.json({ department: updated });
  } catch (error) {
    console.log("Error updating department:", error);
    return c.json({ error: "Error updating department" }, 500);
  }
});

// Check if department has associated products
departmentsApp.get("/make-server-0dd48dc4/departments/:id/check-products", async (c) => {
  try {
    const id = c.req.param("id");
    
    // Get all products and check if any belong to this department
    const products = await kv.getByPrefix("product:");
    const associatedProducts = products.filter((p: any) => p.department === id);
    
    return c.json({ 
      hasProducts: associatedProducts.length > 0,
      count: associatedProducts.length 
    });
  } catch (error) {
    console.log("Error checking products:", error);
    return c.json({ error: "Error checking products" }, 500);
  }
});

// Delete department
departmentsApp.delete("/make-server-0dd48dc4/departments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const existing = await kv.get(`department:${id}`);

    if (!existing) {
      return c.json({ error: "Department not found" }, 404);
    }

    // Check for associated products before deleting
    const products = await kv.getByPrefix("product:");
    const associatedProducts = products.filter((p: any) => p.department === id);
    
    if (associatedProducts.length > 0) {
      return c.json({ 
        error: "Cannot delete department with associated products",
        count: associatedProducts.length 
      }, 400);
    }

    await kv.del(`department:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting department:", error);
    return c.json({ error: "Error deleting department" }, 500);
  }
});

// Initialize departments with a list (batch operation)
departmentsApp.post("/make-server-0dd48dc4/departments/initialize", async (c) => {
  try {
    const { departments } = await c.req.json();
    
    if (!Array.isArray(departments)) {
      return c.json({ error: "departments must be an array" }, 400);
    }

    const timestamp = new Date().toISOString();
    const savedDepartments = [];

    for (const dept of departments) {
      const id = dept.id || crypto.randomUUID();
      
      // Check if already exists
      const existing = await kv.get(`department:${id}`);
      if (existing) {
        savedDepartments.push(existing);
        continue;
      }

      const department = {
        id,
        ...dept,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await kv.set(`department:${id}`, department);
      savedDepartments.push(department);
    }

    return c.json({ 
      success: true, 
      count: savedDepartments.length,
      departments: savedDepartments 
    });
  } catch (error) {
    console.log("Error initializing departments:", error);
    return c.json({ error: "Error initializing departments" }, 500);
  }
});

// ============== CATEGORIES WITHIN DEPARTMENTS ==============

// Get categories for a department
departmentsApp.get("/make-server-0dd48dc4/departments/:id/categories", async (c) => {
  try {
    const id = c.req.param("id");
    const department = await kv.get(`department:${id}`);

    if (!department) {
      return c.json({ error: "Department not found" }, 404);
    }

    return c.json({ categories: department.categories || [] });
  } catch (error) {
    console.log("Error fetching categories:", error);
    return c.json({ error: "Error fetching categories" }, 500);
  }
});

// Add category to department
departmentsApp.post("/make-server-0dd48dc4/departments/:id/categories", async (c) => {
  try {
    const id = c.req.param("id");
    const categoryData = await c.req.json();
    const department = await kv.get(`department:${id}`);

    if (!department) {
      return c.json({ error: "Department not found" }, 404);
    }

    const newCategory = {
      id: crypto.randomUUID(),
      ...categoryData,
      subcategories: categoryData.subcategories || [],
    };

    const updatedDepartment = {
      ...department,
      categories: [...(department.categories || []), newCategory],
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`department:${id}`, updatedDepartment);
    return c.json({ category: newCategory });
  } catch (error) {
    console.log("Error adding category:", error);
    return c.json({ error: "Error adding category" }, 500);
  }
});

export default departmentsApp;
