// ========================================
// SCRIPT PARA RESETEAR CONTRASEÑA
// ========================================
// Ejecuta este código desde la consola del navegador (F12)
// o desde tu servidor con Deno

async function resetearContrasena() {
  // ⚠️ CAMBIA ESTOS VALORES ⚠️
  const CONFIG = {
    email: "cvarlla@gmail.com",  // 👈 Tu email de Supabase
    nuevaContrasena: "admin123",  // 👈 Tu nueva contraseña (mínimo 6 caracteres)
    projectId: "TU_PROJECT_ID"    // 👈 Tu Project ID de Supabase
  };

  console.log("=== 🔐 Reseteo de Contraseña ===");
  console.log("Email:", CONFIG.email);
  console.log("Nueva contraseña: ********");
  console.log("");

  try {
    const response = await fetch(
      `https://${CONFIG.projectId}.supabase.co/functions/v1/make-server-0dd48dc4/auth/admin/reset-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // No requiere autenticación ya que usa SUPABASE_SERVICE_ROLE_KEY en el backend
        },
        body: JSON.stringify({
          email: CONFIG.email,
          newPassword: CONFIG.nuevaContrasena
        })
      }
    );

    const data = await response.json();
    console.log("Response status:", response.status);
    console.log("Response data:", data);

    if (response.ok) {
      console.log("");
      console.log("✅ ¡CONTRASEÑA ACTUALIZADA!");
      console.log("");
      console.log("📋 Tus nuevas credenciales:");
      console.log("   Email:", CONFIG.email);
      console.log("   Contraseña:", CONFIG.nuevaContrasena);
      console.log("");
      console.log("🔄 Ahora puedes iniciar sesión con estas credenciales en ODDY Market");
      return true;
    } else {
      console.error("❌ Error:", data.error);
      return false;
    }

  } catch (error) {
    console.error("❌ Error de red:", error);
    return false;
  }
}

// Ejecutar la función
resetearContrasena();
