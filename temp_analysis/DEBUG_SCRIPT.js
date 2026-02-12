// DEBUG SCRIPT - Copia esto en la consola del navegador para verificar el estado

console.clear();
console.log("=== 🔍 ODDY MARKET DEBUG ===\n");

// 1. Verificar localStorage
const authData = localStorage.getItem('supabase.auth.token');
console.log("1️⃣ LocalStorage Auth:", !!authData ? "✅ Presente" : "❌ Falta");

if (authData) {
  try {
    const parsed = JSON.parse(authData);
    console.log("   User ID:", parsed.currentSession?.user?.id);
    console.log("   Email:", parsed.currentSession?.user?.email);
    console.log("   Rol:", parsed.currentSession?.user?.user_metadata?.role || "cliente");
    console.log("   Access Token:", parsed.currentSession?.access_token ? "✅ Presente" : "❌ Falta");
  } catch (e) {
    console.log("   ❌ Error parsing auth data:", e);
  }
}

// 2. Test de conectividad
console.log("\n2️⃣ Probando conexión al servidor...");

(async () => {
  try {
    const authData = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}');
    const token = authData.currentSession?.access_token;
    
    if (!token) {
      console.log("   ❌ No hay token disponible");
      return;
    }

    const response = await fetch(
      'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-0dd48dc4/auth/test',
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const data = await response.json();
    console.log("   Status:", response.status);
    console.log("   Response:", data);
    
    if (response.ok) {
      console.log("   ✅ Servidor funcionando correctamente");
    } else {
      console.log("   ❌ Error del servidor");
    }

  } catch (error) {
    console.log("   ❌ Error de red:", error);
  }
})();

// 3. Intentar solicitar rol
console.log("\n3️⃣ Para probar solicitud de rol, ejecuta:");
console.log(`
async function testRoleRequest() {
  const authData = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}');
  const token = authData.currentSession?.access_token;
  
  const response = await fetch(
    'https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-0dd48dc4/auth/request-role',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${token}\`
      },
      body: JSON.stringify({
        requestedRole: 'admin',
        message: 'Test desde consola'
      })
    }
  );
  
  const data = await response.json();
  console.log('Response:', response.status, data);
}

testRoleRequest();
`);

console.log("\n=== 🔍 FIN DEBUG ===");
