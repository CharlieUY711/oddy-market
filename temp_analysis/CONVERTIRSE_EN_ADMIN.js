// === SCRIPT PARA CONVERTIRTE EN ADMIN AUTOMÁTICAMENTE ===
// Copia y pega esto en la consola del navegador (F12)

async function hacermeAdmin() {
  try {
    console.log("🔧 Intentando convertir usuario en admin...");
    
    // Obtener token de sesión
    const authData = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}');
    const token = authData.currentSession?.access_token;
    
    if (!token) {
      console.error("❌ No hay sesión activa. Por favor inicia sesión primero.");
      return;
    }
    
    const email = authData.currentSession?.user?.email;
    console.log("📧 Email actual:", email);
    
    // Obtener project ID desde el DOM o configuración
    // CAMBIAR ESTO por tu Project ID real de Supabase
    const projectId = "TU_PROJECT_ID_AQUI";
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/auth/make-admin`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const data = await response.json();
    console.log("📥 Response status:", response.status);
    console.log("📥 Response data:", data);
    
    if (response.ok) {
      console.log("✅ ¡ÉXITO! Ahora eres administrador");
      console.log("🔄 Recargando página en 2 segundos...");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      console.error("❌ Error:", data.error);
    }
    
  } catch (error) {
    console.error("❌ Error completo:", error);
  }
}

// Ejecutar
hacermeAdmin();
