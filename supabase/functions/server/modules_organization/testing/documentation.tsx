import { Hono } from "npm:hono";
import { kv } from "./storage.tsx";

const app = new Hono();

// ==========================================
// DOCUMENTATION - Documentación y Manual
// ==========================================

// ==========================================
// 1. TECHNICAL DOCUMENTATION (HTML)
// ==========================================

// Get technical documentation
app.get("/make-server-0dd48dc4/docs/technical", async (c) => {
  try {
    const module = c.req.query("module"); // Specific module or all
    
    if (module) {
      const doc = await kv.get(`tech_doc:${module}`);
      if (!doc.value) {
        return c.json({ error: "Documentation not found" }, 404);
      }
      return c.html(this.renderTechnicalDoc(doc.value));
    }

    // Return index with all modules
    const modules = [];
    for await (const entry of kv.list({ prefix: "tech_doc:" })) {
      modules.push(entry.value);
    }
    
    return c.html(this.renderTechnicalIndex(modules));
  } catch (error) {
    return c.json({ error: "Error fetching technical documentation" }, 500);
  }
});

// Render technical documentation (HTML)
function renderTechnicalDoc(doc: any): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${doc.title} - Documentación Técnica ODDY Market</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f5f7fa;
      color: #333;
      line-height: 1.6;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      background: #2c3e50;
      color: white;
      padding: 20px;
      text-align: center;
      margin-bottom: 30px;
    }
    nav {
      background: white;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .nav-links a {
      margin: 0 10px;
      color: #3498db;
      text-decoration: none;
      font-weight: 500;
    }
    .nav-links a:hover { text-decoration: underline; }
    .content {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 { color: #2c3e50; margin-bottom: 20px; }
    h2 { color: #34495e; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #3498db; padding-bottom: 5px; }
    h3 { color: #7f8c8d; margin-top: 20px; margin-bottom: 10px; }
    pre {
      background: #2c3e50;
      color: #ecf0f1;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      margin: 15px 0;
    }
    code {
      background: #ecf0f1;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    table th, table td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    table th {
      background: #3498db;
      color: white;
    }
    .arrow-nav {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
    .arrow-nav a {
      padding: 10px 20px;
      background: #3498db;
      color: white;
      text-decoration: none;
      border-radius: 5px;
    }
    .arrow-nav a:hover { background: #2980b9; }
    .search-box {
      padding: 8px 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
      width: 250px;
    }
    .side-index {
      position: fixed;
      right: 20px;
      top: 120px;
      width: 200px;
      background: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .side-index h4 { margin-bottom: 10px; }
    .side-index a {
      display: block;
      color: #3498db;
      text-decoration: none;
      padding: 5px 0;
      font-size: 14px;
    }
    .side-index a:hover { text-decoration: underline; }
    @media (max-width: 768px) {
      .side-index { display: none; }
      .container { padding: 10px; }
    }
  </style>
</head>
<body>
  <header>
    <h1>📚 Documentación Técnica ODDY Market</h1>
    <p>Sistema ERP Multi-Territorio · White Label SaaS</p>
  </header>
  
  <div class="container">
    <nav>
      <div class="nav-links">
        <a href="/make-server-0dd48dc4/docs/technical">🏠 Inicio</a>
        <a href="/make-server-0dd48dc4/docs/manual">👤 Manual Usuario</a>
        <a href="/make-server-0dd48dc4/docs/feedback">💬 Comentarios</a>
      </div>
      <input type="text" class="search-box" placeholder="Buscar..." />
    </nav>

    <div class="content">
      <h1>${doc.title}</h1>
      <p><strong>Módulo:</strong> ${doc.module}</p>
      <p><strong>Versión:</strong> ${doc.version || '1.0.0'}</p>
      
      ${doc.content}
      
      <div class="arrow-nav">
        ${doc.prev_module ? `<a href="?module=${doc.prev_module}">⬅️ Anterior</a>` : '<span></span>'}
        ${doc.next_module ? `<a href="?module=${doc.next_module}">Siguiente ➡️</a>` : '<span></span>'}
      </div>
    </div>

    <div class="side-index">
      <h4>Índice de Secciones</h4>
      <a href="#overview">Descripción General</a>
      <a href="#architecture">Arquitectura</a>
      <a href="#endpoints">Endpoints</a>
      <a href="#examples">Ejemplos</a>
      <a href="#integration">Integración</a>
    </div>
  </div>
</body>
</html>`;
}

// Render technical index
function renderTechnicalIndex(modules: any[]): string {
  const modulesList = modules.map(m => 
    `<li><a href="?module=${m.module}">${m.title}</a></li>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Documentación Técnica - ODDY Market</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; background: #f5f7fa; }
    header { background: #2c3e50; color: white; padding: 30px; text-align: center; }
    .container { max-width: 900px; margin: 40px auto; padding: 20px; }
    .modules { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .modules h2 { margin-bottom: 20px; color: #2c3e50; }
    .modules ul { list-style: none; }
    .modules li { padding: 12px 0; border-bottom: 1px solid #eee; }
    .modules a { color: #3498db; text-decoration: none; font-size: 18px; }
    .modules a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <header>
    <h1>📚 Documentación Técnica ODDY Market</h1>
    <p>Seleccione un módulo para ver su documentación detallada</p>
  </header>
  <div class="container">
    <div class="modules">
      <h2>Módulos Disponibles (${modules.length})</h2>
      <ul>${modulesList}</ul>
    </div>
  </div>
</body>
</html>`;
}

// ==========================================
// 2. USER MANUAL (HTML)
// ==========================================

// Get user manual
app.get("/make-server-0dd48dc4/docs/manual", async (c) => {
  try {
    const module = c.req.query("module");
    
    if (module) {
      const manual = await kv.get(`user_manual:${module}`);
      if (!manual.value) {
        return c.json({ error: "Manual not found" }, 404);
      }
      return c.html(this.renderUserManual(manual.value));
    }

    // Return manual index
    const manuals = [];
    for await (const entry of kv.list({ prefix: "user_manual:" })) {
      manuals.push(entry.value);
    }
    
    return c.html(this.renderManualIndex(manuals));
  } catch (error) {
    return c.json({ error: "Error fetching user manual" }, 500);
  }
});

// Render user manual (HTML)
function renderUserManual(manual: any): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${manual.title} - Manual de Usuario ODDY Market</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f5f7fa;
      color: #333;
      line-height: 1.7;
    }
    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .container { max-width: 1000px; margin: 0 auto; padding: 20px; }
    nav {
      background: white;
      padding: 15px;
      margin: 20px 0;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
    }
    nav a { color: #667eea; text-decoration: none; margin: 0 15px; font-weight: 500; }
    nav a:hover { text-decoration: underline; }
    .content {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 { color: #667eea; margin-bottom: 20px; }
    h2 { color: #764ba2; margin-top: 30px; margin-bottom: 15px; }
    .step {
      background: #f8f9fa;
      padding: 15px;
      margin: 15px 0;
      border-left: 4px solid #667eea;
      border-radius: 4px;
    }
    .screenshot {
      margin: 20px 0;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 8px;
      text-align: center;
    }
    .screenshot img { max-width: 100%; border-radius: 5px; }
    .tip {
      background: #d4edda;
      border-left: 4px solid #28a745;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .warning {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .arrow-nav {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #eee;
    }
    .arrow-nav a {
      padding: 12px 24px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 25px;
      transition: all 0.3s;
    }
    .arrow-nav a:hover { background: #764ba2; transform: translateY(-2px); }
  </style>
</head>
<body>
  <header>
    <h1>👤 Manual de Usuario ODDY Market</h1>
    <p>Guía completa para aprovechar todas las funcionalidades</p>
  </header>
  
  <div class="container">
    <nav>
      <div>
        <a href="/make-server-0dd48dc4/docs/technical">📚 Doc. Técnica</a>
        <a href="/make-server-0dd48dc4/docs/manual">👤 Manual</a>
        <a href="/make-server-0dd48dc4/docs/feedback">💬 Comentarios</a>
      </div>
    </nav>

    <div class="content">
      <h1>${manual.title}</h1>
      
      ${manual.content}
      
      <div class="arrow-nav">
        ${manual.prev_module ? `<a href="?module=${manual.prev_module}">⬅️ Anterior</a>` : '<span></span>'}
        ${manual.next_module ? `<a href="?module=${manual.next_module}">Siguiente ➡️</a>` : '<span></span>'}
      </div>
    </div>
  </div>
</body>
</html>`;
}

// Render manual index
function renderManualIndex(manuals: any[]): string {
  const manualsList = manuals.map(m => 
    `<li><a href="?module=${m.module}">${m.title}</a><p>${m.description}</p></li>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Manual de Usuario - ODDY Market</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; background: #f5f7fa; }
    header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; }
    .container { max-width: 900px; margin: 40px auto; padding: 20px; }
    .manuals { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .manuals h2 { margin-bottom: 20px; color: #667eea; }
    .manuals ul { list-style: none; }
    .manuals li { padding: 20px; margin: 15px 0; background: #f8f9fa; border-radius: 8px; }
    .manuals a { color: #667eea; text-decoration: none; font-size: 20px; font-weight: 600; }
    .manuals a:hover { text-decoration: underline; }
    .manuals p { color: #666; margin-top: 8px; }
  </style>
</head>
<body>
  <header>
    <h1>👤 Manual de Usuario ODDY Market</h1>
    <p>Aprenda a usar todas las funcionalidades del sistema</p>
  </header>
  <div class="container">
    <div class="manuals">
      <h2>Módulos Disponibles (${manuals.length})</h2>
      <ul>${manualsList}</ul>
    </div>
  </div>
</body>
</html>`;
}

// ==========================================
// 3. FEEDBACK SYSTEM (Comments/Notes)
// ==========================================

// Submit feedback
app.post("/make-server-0dd48dc4/docs/feedback", async (c) => {
  try {
    const feedback = await c.req.json();
    const id = `feedback:${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newFeedback = {
      id,
      user_id: feedback.user_id,
      user_name: feedback.user_name,
      date: timestamp.split('T')[0],
      time: timestamp.split('T')[1].split('.')[0],
      subject: feedback.subject,
      comment: feedback.comment,
      module: feedback.module || "general", // Associated module
      type: feedback.type || "comment", // comment, suggestion, bug, improvement
      status: "pending", // pending, reviewed, resolved
      created_at: timestamp,
    };

    await kv.set(id, newFeedback);
    return c.json({ feedback: newFeedback, message: "Feedback submitted successfully" });
  } catch (error) {
    return c.json({ error: "Error submitting feedback" }, 500);
  }
});

// Get all feedback
app.get("/make-server-0dd48dc4/docs/feedback", async (c) => {
  try {
    const module = c.req.query("module");
    const type = c.req.query("type");
    const status = c.req.query("status");
    const feedback = [];

    for await (const entry of kv.list({ prefix: "feedback:" })) {
      const item = entry.value as any;
      if (module && item.module !== module) continue;
      if (type && item.type !== type) continue;
      if (status && item.status !== status) continue;
      feedback.push(item);
    }

    feedback.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return c.json({ feedback, total: feedback.length });
  } catch (error) {
    return c.json({ error: "Error fetching feedback" }, 500);
  }
});

// Feedback dashboard (HTML)
app.get("/make-server-0dd48dc4/docs/feedback/dashboard", async (c) => {
  try {
    const feedback = [];
    for await (const entry of kv.list({ prefix: "feedback:" })) {
      feedback.push(entry.value);
    }

    return c.html(this.renderFeedbackDashboard(feedback));
  } catch (error) {
    return c.json({ error: "Error fetching feedback dashboard" }, 500);
  }
});

// Render feedback dashboard
function renderFeedbackDashboard(feedback: any[]): string {
  const feedbackList = feedback.map(f => 
    `<tr>
      <td>${f.date} ${f.time}</td>
      <td>${f.user_name}</td>
      <td>${f.subject}</td>
      <td>${f.module}</td>
      <td><span class="badge ${f.type}">${f.type}</span></td>
      <td><span class="badge ${f.status}">${f.status}</span></td>
      <td><button onclick="viewFeedback('${f.id}')">Ver</button></td>
    </tr>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Dashboard de Feedback - ODDY Market</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; background: #f5f7fa; }
    header { background: #2c3e50; color: white; padding: 30px; text-align: center; }
    .container { max-width: 1200px; margin: 40px auto; padding: 20px; }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }
    .stat-card h3 { font-size: 36px; color: #3498db; }
    .stat-card p { color: #7f8c8d; margin-top: 5px; }
    table {
      width: 100%;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    table th, table td { padding: 15px; text-align: left; }
    table th { background: #3498db; color: white; }
    table tr:nth-child(even) { background: #f8f9fa; }
    .badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge.comment { background: #d4edda; color: #155724; }
    .badge.suggestion { background: #cce5ff; color: #004085; }
    .badge.bug { background: #f8d7da; color: #721c24; }
    .badge.improvement { background: #fff3cd; color: #856404; }
    .badge.pending { background: #fff3cd; color: #856404; }
    .badge.reviewed { background: #cce5ff; color: #004085; }
    .badge.resolved { background: #d4edda; color: #155724; }
    button {
      padding: 6px 16px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover { background: #2980b9; }
  </style>
</head>
<body>
  <header>
    <h1>💬 Dashboard de Feedback</h1>
    <p>Comentarios y sugerencias de los usuarios</p>
  </header>
  <div class="container">
    <div class="stats">
      <div class="stat-card">
        <h3>${feedback.length}</h3>
        <p>Total</p>
      </div>
      <div class="stat-card">
        <h3>${feedback.filter(f => f.status === 'pending').length}</h3>
        <p>Pendientes</p>
      </div>
      <div class="stat-card">
        <h3>${feedback.filter(f => f.type === 'bug').length}</h3>
        <p>Bugs</p>
      </div>
      <div class="stat-card">
        <h3>${feedback.filter(f => f.type === 'suggestion').length}</h3>
        <p>Sugerencias</p>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Fecha/Hora</th>
          <th>Usuario</th>
          <th>Asunto</th>
          <th>Módulo</th>
          <th>Tipo</th>
          <th>Estado</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>${feedbackList}</tbody>
    </table>
  </div>
  <script>
    function viewFeedback(id) {
      alert('Ver detalles del feedback: ' + id);
    }
  </script>
</body>
</html>`;
}

// Update feedback status
app.patch("/make-server-0dd48dc4/docs/feedback/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const feedback = await kv.get(id);

    if (!feedback.value) {
      return c.json({ error: "Feedback not found" }, 404);
    }

    const updatedFeedback = {
      ...feedback.value,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    await kv.set(id, updatedFeedback);
    return c.json({ feedback: updatedFeedback });
  } catch (error) {
    return c.json({ error: "Error updating feedback" }, 500);
  }
});

export default app;
