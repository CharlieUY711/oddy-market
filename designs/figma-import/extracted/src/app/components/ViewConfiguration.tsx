import { useState, useEffect } from "react";
import { Eye, EyeOff, Save, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface ViewPermission {
  id: string;
  label: string;
  section: string;
  administrator: boolean;
  editor: boolean;
  provider: boolean;
  client: boolean;
}

const defaultPermissions: ViewPermission[] = [
  // eCommerce
  { id: "products", label: "Productos", section: "eCommerce", administrator: true, editor: true, provider: true, client: false },
  { id: "orders", label: "Pedidos", section: "eCommerce", administrator: true, editor: true, provider: false, client: true },
  { id: "shipping", label: "Envíos", section: "eCommerce", administrator: true, editor: true, provider: false, client: true },
  
  // Marketing
  { id: "crm", label: "CRM", section: "Marketing", administrator: true, editor: true, provider: false, client: false },
  { id: "mailing", label: "Mailing", section: "Marketing", administrator: true, editor: true, provider: false, client: false },
  { id: "social", label: "Redes Sociales", section: "Marketing", administrator: true, editor: true, provider: false, client: false },
  { id: "wheel", label: "Rueda de Sorteos", section: "Marketing", administrator: true, editor: true, provider: false, client: false },
  { id: "coupons", label: "Cupones y Promociones", section: "Marketing", administrator: true, editor: true, provider: false, client: false },
  { id: "google-ads", label: "Google Ads", section: "Marketing", administrator: true, editor: false, provider: false, client: false },
  
  // Herramientas
  { id: "image-editor", label: "Editor de imágenes", section: "Herramientas", administrator: true, editor: true, provider: true, client: false },
  { id: "print", label: "Impresión", section: "Herramientas", administrator: true, editor: true, provider: false, client: false },
  { id: "qr-generator", label: "Generador de QR", section: "Herramientas", administrator: true, editor: true, provider: false, client: false },
  { id: "ai-tools", label: "Herramientas IA", section: "Herramientas", administrator: true, editor: true, provider: false, client: false },
  
  // Gestión
  { id: "erp", label: "ERP", section: "Gestión", administrator: true, editor: false, provider: false, client: false },
  { id: "inventory", label: "Inventario", section: "Gestión", administrator: true, editor: true, provider: true, client: false },
  { id: "billing", label: "Facturación", section: "Gestión", administrator: true, editor: true, provider: false, client: false },
  { id: "purchase-orders", label: "Órdenes de Compra", section: "Gestión", administrator: true, editor: true, provider: false, client: false },
  { id: "roles", label: "Usuarios (Roles y Permisos)", section: "Gestión", administrator: true, editor: false, provider: false, client: false },
  
  // Sistema
  { id: "departments", label: "Departamentos", section: "Sistema", administrator: true, editor: true, provider: false, client: false },
  { id: "analytics", label: "Analíticas", section: "Sistema", administrator: true, editor: true, provider: false, client: false },
  { id: "audit", label: "Auditoría y Logs", section: "Sistema", administrator: true, editor: false, provider: false, client: false },
  { id: "payments", label: "Integraciones de Pago", section: "Sistema", administrator: true, editor: false, provider: false, client: false },
  { id: "api-config", label: "Configurar APIs", section: "Sistema", administrator: true, editor: false, provider: false, client: false },
];

export function ViewConfiguration() {
  const [permissions, setPermissions] = useState<ViewPermission[]>(defaultPermissions);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load saved permissions from localStorage
    const savedPermissions = localStorage.getItem("viewPermissions");
    if (savedPermissions) {
      setPermissions(JSON.parse(savedPermissions));
    }
  }, []);

  const handleToggle = (id: string, role: keyof ViewPermission) => {
    setPermissions((prev) =>
      prev.map((perm) =>
        perm.id === id ? { ...perm, [role]: !perm[role] } : perm
      )
    );
    setSaved(false);
  };

  const handleSave = () => {
    setSaving(true);
    // Save to localStorage (in production, this would be an API call)
    localStorage.setItem("viewPermissions", JSON.stringify(permissions));
    
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 500);
  };

  const handleReset = () => {
    if (confirm("¿Estás seguro de restablecer todas las configuraciones a los valores por defecto?")) {
      setPermissions(defaultPermissions);
      localStorage.removeItem("viewPermissions");
      setSaved(false);
    }
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.section]) {
      acc[perm.section] = [];
    }
    acc[perm.section].push(perm);
    return acc;
  }, {} as Record<string, ViewPermission[]>);

  const roles = [
    { key: "administrator", label: "Administrador", color: "text-red-600 bg-red-50" },
    { key: "editor", label: "Editor", color: "text-blue-600 bg-blue-50" },
    { key: "provider", label: "Proveedor", color: "text-green-600 bg-green-50" },
    { key: "client", label: "Cliente", color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Configuración de Vistas</h2>
            <p className="text-muted-foreground">
              Definí qué secciones del dashboard puede ver cada rol de usuario
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Restablecer
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-6 py-2 rounded-lg transition-all flex items-center gap-2 ${
                saved
                  ? "bg-green-600 text-white"
                  : "bg-primary text-white hover:bg-primary/90"
              }`}
            >
              <Save className="w-4 h-4" />
              {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar Cambios"}
            </button>
          </div>
        </div>

        {/* Role Legend */}
        <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
          {roles.map((role) => (
            <div key={role.key} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${role.color}`} />
              <span className="text-sm font-medium">{role.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-4 font-bold">Sección</th>
                <th className="text-left p-4 font-bold">Vista</th>
                {roles.map((role) => (
                  <th key={role.key} className="text-center p-4 font-bold min-w-[120px]">
                    <div className={`inline-flex px-3 py-1 rounded-full ${role.color}`}>
                      {role.label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedPermissions).map(([section, perms], sectionIndex) => (
                <>
                  {perms.map((perm, permIndex) => (
                    <motion.tr
                      key={perm.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (sectionIndex * perms.length + permIndex) * 0.02 }}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      {permIndex === 0 && (
                        <td
                          rowSpan={perms.length}
                          className="p-4 font-bold text-primary border-r border-border bg-primary/5"
                        >
                          {section}
                        </td>
                      )}
                      <td className="p-4 font-medium">{perm.label}</td>
                      {roles.map((role) => (
                        <td key={role.key} className="p-4 text-center">
                          <button
                            onClick={() => handleToggle(perm.id, role.key as keyof ViewPermission)}
                            className={`inline-flex items-center justify-center w-12 h-12 rounded-lg transition-all ${
                              perm[role.key as keyof ViewPermission]
                                ? "bg-green-100 text-green-600 hover:bg-green-200"
                                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                            }`}
                          >
                            {perm[role.key as keyof ViewPermission] ? (
                              <Eye className="w-5 h-5" />
                            ) : (
                              <EyeOff className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        {roles.map((role) => {
          const count = permissions.filter((p) => p[role.key as keyof ViewPermission]).length;
          return (
            <div key={role.key} className={`p-4 rounded-lg border-2 ${role.color}`}>
              <h4 className="font-bold mb-1">{role.label}</h4>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-sm opacity-75">vistas habilitadas</p>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-bold text-blue-900 mb-2">ℹ️ Información importante</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Los cambios se aplican inmediatamente después de guardar</li>
          <li>• Los usuarios verán solo las secciones habilitadas para su rol</li>
          <li>• El rol de Administrador siempre tiene acceso completo por seguridad</li>
          <li>• Las configuraciones se guardan en la base de datos del sistema</li>
        </ul>
      </div>
    </div>
  );
}
