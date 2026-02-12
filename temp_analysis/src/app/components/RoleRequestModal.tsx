import { useState } from "react";
import { X, Shield, Edit3, Package, Crown, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface RoleRequestModalProps {
  user: any;
  session: any;
  onClose: () => void;
  myRequests?: any[];
}

export function RoleRequestModal({ user, session, onClose, myRequests = [] }: RoleRequestModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const currentRole = user?.user_metadata?.role || "cliente";
  const pendingRequest = myRequests.find((r: any) => r.status === "pending");

  const roles = [
    {
      id: "editor",
      name: "Editor",
      icon: Edit3,
      color: "from-blue-500 to-cyan-500",
      description: "Gestión de productos, categorías y contenido del sitio",
      permissions: [
        "Crear y editar productos",
        "Gestionar categorías y departamentos",
        "Modificar contenido del sitio",
        "Acceso a herramientas de marketing",
      ],
    },
    {
      id: "proveedor",
      name: "Proveedor",
      icon: Package,
      color: "from-green-500 to-emerald-500",
      description: "Gestión de inventario y productos propios",
      permissions: [
        "Gestionar inventario propio",
        "Subir productos al catálogo",
        "Ver reportes de ventas",
        "Gestionar órdenes de compra",
      ],
    },
    {
      id: "admin",
      name: "Administrador",
      icon: Crown,
      color: "from-orange-500 to-red-500",
      description: "Acceso total al sistema ODDY Market",
      permissions: [
        "Acceso completo al Dashboard Admin",
        "Gestión de usuarios y roles",
        "Control total del ERP y CRM",
        "Todas las integraciones y herramientas",
      ],
    },
  ];

  async function handleSubmit() {
    if (!selectedRole) {
      toast.error("Selecciona un rol");
      return;
    }

    if (!session || !session.access_token) {
      console.error("Session error:", session);
      toast.error("Error: No hay sesión activa. Por favor cierra sesión y vuelve a iniciar.");
      return;
    }

    setLoading(true);
    try {
      console.log("Sending role request:", { selectedRole, message });
      console.log("Project ID:", projectId);
      console.log("Has access token:", !!session.access_token);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/auth/request-role`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            requestedRole: selectedRole,
            message,
          }),
        }
      );

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        toast.success("Solicitud enviada. El administrador la revisará pronto.");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error(data.error || "Error al enviar solicitud");
      }
    } catch (error: any) {
      console.error("Error completo:", error);
      toast.error(error.message || "Error al procesar solicitud");
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Pendiente
          </div>
        );
      case "approved":
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Aprobada
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            <XCircle className="w-4 h-4" />
            Rechazada
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full p-6 my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Solicitar Rol Avanzado</h2>
              <p className="text-sm text-gray-600">
                Rol actual: <span className="font-medium capitalize">{currentRole}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Show pending request if exists */}
        {pendingRequest && (
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-yellow-900 mb-1">
                  Tienes una solicitud pendiente
                </p>
                <p className="text-sm text-yellow-800">
                  Rol solicitado:{" "}
                  <span className="font-semibold capitalize">{pendingRequest.requestedRole}</span>
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Enviada: {new Date(pendingRequest.createdAt).toLocaleString("es-UY")}
                </p>
              </div>
              {getStatusBadge(pendingRequest.status)}
            </div>
            {pendingRequest.message && (
              <p className="text-sm text-yellow-800 mt-2 italic">
                "{pendingRequest.message}"
              </p>
            )}
          </div>
        )}

        {/* Recent requests history */}
        {myRequests.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Historial de Solicitudes</h3>
            <div className="space-y-2">
              {myRequests.slice(0, 3).map((request: any) => (
                <div
                  key={request.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium capitalize">{request.requestedRole}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString("es-UY")}
                    </p>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Role selection */}
        {!pendingRequest && (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Selecciona el rol que necesitas</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  const isCurrentRole = currentRole === role.id;

                  return (
                    <button
                      key={role.id}
                      onClick={() => !isCurrentRole && setSelectedRole(role.id)}
                      disabled={isCurrentRole}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isCurrentRole
                          ? "border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed"
                          : isSelected
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/50"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${role.color} rounded-lg flex items-center justify-center mb-3`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-bold text-lg mb-1 flex items-center gap-2">
                        {role.name}
                        {isCurrentRole && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            Actual
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                      <ul className="space-y-1">
                        {role.permissions.map((perm, idx) => (
                          <li key={idx} className="text-xs text-gray-700 flex items-start gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                            {perm}
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message field */}
            {selectedRole && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje para el administrador (opcional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explica por qué necesitas este rol..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            )}

            {/* Info box */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>ℹ️ Proceso de aprobación:</strong> Tu solicitud será revisada por un
                administrador. Recibirás una notificación cuando sea aprobada o rechazada.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !selectedRole}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Enviar Solicitud"}
              </button>
            </div>
          </>
        )}

        {/* If has pending request, just show close button */}
        {pendingRequest && (
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}
