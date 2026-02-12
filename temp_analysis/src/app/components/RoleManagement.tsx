import { useState, useEffect } from "react";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  TrendingUp,
  Filter,
  Search,
  Crown,
  Edit3,
  Package,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { projectId } from "/utils/supabase/info";

interface RoleManagementProps {
  session: any;
}

export function RoleManagement({ session }: RoleManagementProps) {
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Check if session is valid
  if (!session || !session.access_token) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Error: No hay sesión activa</p>
          <p className="text-gray-600 text-sm">Por favor recarga la página</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [requestsRes, statsRes] = await Promise.all([
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/auth/role-requests`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        ),
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/auth/role-stats`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        ),
      ]);

      const requestsData = await requestsRes.json();
      const statsData = await statsRes.json();

      if (requestsRes.ok) {
        setRequests(requestsData.requests || []);
      }

      if (statsRes.ok) {
        setStats(statsData.stats || null);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(requestId: string) {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/auth/approve-role`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ requestId }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(`Solicitud aprobada: ${data.request.email} → ${data.request.requestedRole}`);
        loadData();
        setSelectedRequest(null);
      } else {
        toast.error(data.error || "Error al aprobar solicitud");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al procesar solicitud");
    }
  }

  async function handleReject(requestId: string) {
    if (!rejectionReason.trim()) {
      toast.error("Debes proporcionar un motivo de rechazo");
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/auth/reject-role`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ requestId, rejectionReason }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(`Solicitud rechazada: ${data.request.email}`);
        loadData();
        setSelectedRequest(null);
        setRejectionReason("");
      } else {
        toast.error(data.error || "Error al rechazar solicitud");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al procesar solicitud");
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return Crown;
      case "editor":
        return Edit3;
      case "proveedor":
        return Package;
      case "cliente":
        return ShoppingCart;
      default:
        return Users;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "from-orange-500 to-red-500";
      case "editor":
        return "from-blue-500 to-cyan-500";
      case "proveedor":
        return "from-green-500 to-emerald-500";
      case "cliente":
        return "from-gray-500 to-gray-600";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Pendiente
          </div>
        );
      case "approved":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Aprobada
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            <XCircle className="w-4 h-4" />
            Rechazada
          </div>
        );
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = filterStatus === "all" || req.status === filterStatus;
    const matchesSearch =
      searchQuery === "" ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Shield className="w-8 h-8 text-orange-600" />
            Gestión de Roles y Permisos
          </h2>
          <p className="text-gray-600 mt-1">
            Aprueba o rechaza solicitudes de roles de usuarios
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-yellow-600" />
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-900">{stats.pendingRequests}</p>
            <p className="text-sm text-yellow-700">Solicitudes Pendientes</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-900">{stats.approvedRequests}</p>
            <p className="text-sm text-green-700">Solicitudes Aprobadas</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-8 h-8 text-red-600" />
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-900">{stats.rejectedRequests}</p>
            <p className="text-sm text-red-700">Solicitudes Rechazadas</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-900">{stats.totalRequests}</p>
            <p className="text-sm text-blue-700">Total de Solicitudes</p>
          </div>
        </div>
      )}

      {/* Users by Role */}
      {stats?.usersByRole && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            Usuarios por Rol
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.usersByRole).map(([role, count]: [string, any]) => {
              const Icon = getRoleIcon(role);
              const color = getRoleColor(role);
              return (
                <div key={role} className="text-center">
                  <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-gray-600 capitalize">{role}s</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "all"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "pending"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFilterStatus("approved")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "approved"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Aprobadas
            </button>
            <button
              onClick={() => setFilterStatus("rejected")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === "rejected"
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Rechazadas
            </button>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No hay solicitudes</p>
            <p className="text-gray-500 text-sm">
              {searchQuery
                ? "No se encontraron resultados"
                : filterStatus === "pending"
                ? "No hay solicitudes pendientes"
                : "No hay solicitudes en esta categoría"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol Solicitado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => {
                  const CurrentIcon = getRoleIcon(request.currentRole);
                  const RequestedIcon = getRoleIcon(request.requestedRole);
                  const currentColor = getRoleColor(request.currentRole);
                  const requestedColor = getRoleColor(request.requestedRole);

                  return (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-gray-900">{request.name}</p>
                          <p className="text-sm text-gray-500">{request.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 bg-gradient-to-br ${currentColor} rounded-lg flex items-center justify-center`}
                          >
                            <CurrentIcon className="w-4 h-4 text-white" />
                          </div>
                          <span className="capitalize text-sm">{request.currentRole}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 bg-gradient-to-br ${requestedColor} rounded-lg flex items-center justify-center`}
                          >
                            <RequestedIcon className="w-4 h-4 text-white" />
                          </div>
                          <span className="capitalize text-sm font-medium">
                            {request.requestedRole}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString("es-UY")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {request.status === "pending" ? (
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                          >
                            Revisar
                          </button>
                        ) : (
                          <span className="text-gray-400">
                            {request.status === "approved" ? "Aprobada" : "Rechazada"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h3 className="text-2xl font-bold mb-4">Revisar Solicitud de Rol</h3>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Usuario</p>
                  <p className="font-medium">{selectedRequest.name}</p>
                  <p className="text-sm text-gray-500">{selectedRequest.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha de Solicitud</p>
                  <p className="font-medium">
                    {new Date(selectedRequest.createdAt).toLocaleString("es-UY")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Rol Actual</p>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    {(() => {
                      const Icon = getRoleIcon(selectedRequest.currentRole);
                      const color = getRoleColor(selectedRequest.currentRole);
                      return (
                        <>
                          <div
                            className={`w-10 h-10 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center`}
                          >
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="capitalize font-medium">
                            {selectedRequest.currentRole}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Rol Solicitado</p>
                  <div className="flex items-center gap-2 p-3 bg-orange-50 border-2 border-orange-200 rounded-lg">
                    {(() => {
                      const Icon = getRoleIcon(selectedRequest.requestedRole);
                      const color = getRoleColor(selectedRequest.requestedRole);
                      return (
                        <>
                          <div
                            className={`w-10 h-10 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center`}
                          >
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="capitalize font-medium">
                            {selectedRequest.requestedRole}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {selectedRequest.message && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Mensaje del Usuario</p>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900 italic">"{selectedRequest.message}"</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo de rechazo (si rechazas)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explica por qué se rechaza esta solicitud..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setRejectionReason("");
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleReject(selectedRequest.id)}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                <XCircle className="w-5 h-5 inline mr-2" />
                Rechazar
              </button>
              <button
                onClick={() => handleApprove(selectedRequest.id)}
                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                <CheckCircle className="w-5 h-5 inline mr-2" />
                Aprobar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
