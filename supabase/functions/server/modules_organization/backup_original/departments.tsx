import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ==========================================
// DEPARTMENTS - Gestión de Departamentos
// ==========================================

// Create department
app.post("/make-server-0dd48dc4/departments", async (c) => {
  try {
    const department = await c.req.json();
    const id = department.id || `department:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newDepartment = {
      ...department,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      parent_id: department.parent_id || null,
      manager_id: department.manager_id || null,
      employees: [],
      budget: department.budget || { annual: 0, currency: "USD", spent: 0 },
      status: department.status || "active",
    };

    await kv.set(id, newDepartment);
    return c.json({ department: newDepartment });
  } catch (error) {
    return c.json({ error: "Error creating department" }, 500);
  }
});

// Get all departments
app.get("/make-server-0dd48dc4/departments", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const parent_id = c.req.query("parent_id");
    const departments = [];

    for await (const entry of kv.list({ prefix: "department:" })) {
      const dept = entry.value as any;
      if (dept.entity_id === entity_id) {
        if (parent_id !== undefined) {
          if (dept.parent_id === parent_id) departments.push(dept);
        } else {
          departments.push(dept);
        }
      }
    }

    return c.json({ departments, total: departments.length });
  } catch (error) {
    return c.json({ error: "Error fetching departments" }, 500);
  }
});

// Get department hierarchy
app.get("/make-server-0dd48dc4/departments/hierarchy", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const departments = [];

    for await (const entry of kv.list({ prefix: "department:" })) {
      const dept = entry.value as any;
      if (dept.entity_id === entity_id) departments.push(dept);
    }

    // Build hierarchy tree
    const hierarchy = this.buildHierarchy(departments);

    return c.json({ hierarchy });
  } catch (error) {
    return c.json({ error: "Error fetching department hierarchy" }, 500);
  }
});

// Helper: Build hierarchy tree
function buildHierarchy(departments: any[]): any[] {
  const map = new Map();
  const roots: any[] = [];

  // Create map
  departments.forEach((dept) => {
    map.set(dept.id, { ...dept, children: [] });
  });

  // Build tree
  departments.forEach((dept) => {
    const node = map.get(dept.id);
    if (dept.parent_id) {
      const parent = map.get(dept.parent_id);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}

// Get department by ID
app.get("/make-server-0dd48dc4/departments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const department = await kv.get(id);

    if (!department.value) {
      return c.json({ error: "Department not found" }, 404);
    }

    return c.json({ department: department.value });
  } catch (error) {
    return c.json({ error: "Error fetching department" }, 500);
  }
});

// Update department
app.patch("/make-server-0dd48dc4/departments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const department = await kv.get(id);

    if (!department.value) {
      return c.json({ error: "Department not found" }, 404);
    }

    const updatedDepartment = {
      ...department.value,
      ...updates,
      id,
      updated_at: new Date().toISOString(),
    };

    await kv.set(id, updatedDepartment);
    return c.json({ department: updatedDepartment });
  } catch (error) {
    return c.json({ error: "Error updating department" }, 500);
  }
});

// ==========================================
// EMPLOYEES - Empleados por Departamento
// ==========================================

// Assign employee to department
app.post("/make-server-0dd48dc4/departments/:id/employees", async (c) => {
  try {
    const dept_id = c.req.param("id");
    const { employee_id, position, start_date } = await c.req.json();
    const department = await kv.get(dept_id);

    if (!department.value) {
      return c.json({ error: "Department not found" }, 404);
    }

    const assignment = {
      employee_id,
      position,
      start_date: start_date || new Date().toISOString(),
      end_date: null,
    };

    department.value.employees = department.value.employees || [];
    department.value.employees.push(assignment);
    department.value.updated_at = new Date().toISOString();

    await kv.set(dept_id, department.value);
    return c.json({ department: department.value, assignment });
  } catch (error) {
    return c.json({ error: "Error assigning employee" }, 500);
  }
});

// Get department employees
app.get("/make-server-0dd48dc4/departments/:id/employees", async (c) => {
  try {
    const id = c.req.param("id");
    const department = await kv.get(id);

    if (!department.value) {
      return c.json({ error: "Department not found" }, 404);
    }

    const employees = department.value.employees || [];
    return c.json({ employees, total: employees.length });
  } catch (error) {
    return c.json({ error: "Error fetching department employees" }, 500);
  }
});

// ==========================================
// POSITIONS - Cargos y Posiciones
// ==========================================

// Create position
app.post("/make-server-0dd48dc4/departments/positions", async (c) => {
  try {
    const position = await c.req.json();
    const id = position.id || `position:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newPosition = {
      ...position,
      id,
      created_at: timestamp,
      updated_at: timestamp,
      department_id: position.department_id,
      level: position.level || "junior", // junior, mid, senior, lead, manager, director
      salary_range: position.salary_range || { min: 0, max: 0, currency: "USD" },
      requirements: position.requirements || [],
      status: position.status || "active",
    };

    await kv.set(id, newPosition);
    return c.json({ position: newPosition });
  } catch (error) {
    return c.json({ error: "Error creating position" }, 500);
  }
});

// Get positions
app.get("/make-server-0dd48dc4/departments/positions", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";
    const department_id = c.req.query("department_id");
    const positions = [];

    for await (const entry of kv.list({ prefix: "position:" })) {
      const pos = entry.value as any;
      if (pos.entity_id === entity_id) {
        if (department_id && pos.department_id !== department_id) continue;
        positions.push(pos);
      }
    }

    return c.json({ positions, total: positions.length });
  } catch (error) {
    return c.json({ error: "Error fetching positions" }, 500);
  }
});

// ==========================================
// DASHBOARD - Dashboard de Departamentos
// ==========================================

app.get("/make-server-0dd48dc4/departments/dashboard", async (c) => {
  try {
    const entity_id = c.req.query("entity_id") || "default";

    const departments = [];
    const positions = [];

    for await (const entry of kv.list({ prefix: "department:" })) {
      const dept = entry.value as any;
      if (dept.entity_id === entity_id) departments.push(dept);
    }

    for await (const entry of kv.list({ prefix: "position:" })) {
      const pos = entry.value as any;
      if (pos.entity_id === entity_id) positions.push(pos);
    }

    const totalEmployees = departments.reduce((sum, d) => sum + (d.employees?.length || 0), 0);

    const dashboard = {
      entity_id,
      departments: {
        total: departments.length,
        active: departments.filter((d) => d.status === "active").length,
      },
      positions: {
        total: positions.length,
        active: positions.filter((p) => p.status === "active").length,
      },
      employees: {
        total: totalEmployees,
      },
      budget: {
        total: departments.reduce((sum, d) => sum + (d.budget?.annual || 0), 0),
        spent: departments.reduce((sum, d) => sum + (d.budget?.spent || 0), 0),
      },
    };

    return c.json({ dashboard });
  } catch (error) {
    return c.json({ error: "Error fetching departments dashboard" }, 500);
  }
});

export default app;
