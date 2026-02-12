import { useState, useEffect } from "react";
import { getSupabaseClient } from "../lib/supabase";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  LogOut,
  Lock,
  CreditCard,
  Package,
  Heart,
  Bell,
  Shield,
  Crown,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { RoleRequestModal } from "./RoleRequestModal";

interface UserProfileProps {
  user: any;
  session: any;
  onClose: () => void;
  onLogout: () => void;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  avatar_url?: string;
  preferences?: {
    notifications: boolean;
    newsletter: boolean;
    marketing: boolean;
  };
  created_at: string;
}

export function UserProfile({ user, session, onClose, onLogout }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "favorites" | "security">("profile");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [showRoleRequest, setShowRoleRequest] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    country: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadProfile();
    loadMyRequests();
  }, [user]);

  async function loadMyRequests() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/auth/my-requests`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMyRequests(data.requests || []);
      }
    } catch (error) {
      console.error("Error loading requests:", error);
    }
  }

  async function loadProfile() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setFormData({
          name: data.profile.name || "",
          phone: data.profile.phone || "",
          address: data.profile.address || "",
          city: data.profile.city || "",
          country: data.profile.country || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }

  async function saveProfile() {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/auth/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        toast.success("Perfil actualizado");
        loadProfile();
        setEditing(false);
      } else {
        toast.error("Error al actualizar perfil");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Error al actualizar perfil");
    } finally {
      setLoading(false);
    }
  }

  async function changePassword() {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      toast.success("Contraseña actualizada");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Error al cambiar contraseña");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      onLogout();
      toast.success("Sesión cerrada");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error al cerrar sesión");
    }
  }

  const tabs = [
    { id: "profile", label: "Mi Perfil", icon: User },
    { id: "orders", label: "Mis Pedidos", icon: Package },
    { id: "favorites", label: "Favoritos", icon: Heart },
    { id: "security", label: "Seguridad", icon: Shield },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg max-w-4xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Mi Cuenta</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border overflow-x-auto">
          <div className="flex gap-1 px-6 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold">
                    {formData.name.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{formData.name || "Usuario"}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Miembro desde {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                )}
              </div>

              {/* Profile Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre completo</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Dirección</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Ciudad</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">País</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {editing && (
                <div className="flex gap-3">
                  <button
                    onClick={saveProfile}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? "Guardando..." : "Guardar Cambios"}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 border border-border py-3 rounded-lg hover:bg-muted transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              {/* Preferences */}
              <div className="pt-6 border-t border-border">
                <h4 className="font-bold mb-4">Preferencias de Notificaciones</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                    />
                    <div>
                      <p className="font-medium">Notificaciones de pedidos</p>
                      <p className="text-sm text-muted-foreground">
                        Recibe actualizaciones sobre tus pedidos
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                    />
                    <div>
                      <p className="font-medium">Newsletter</p>
                      <p className="text-sm text-muted-foreground">
                        Recibe nuestras novedades y ofertas
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                    />
                    <div>
                      <p className="font-medium">Ofertas personalizadas</p>
                      <p className="text-sm text-muted-foreground">
                        Recibe promociones basadas en tus intereses
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">No hay pedidos aún</h3>
              <p className="text-muted-foreground">
                Cuando realices tu primer pedido aparecerá aquí
              </p>
            </div>
          )}

          {activeTab === "favorites" && (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">Sin favoritos</h3>
              <p className="text-muted-foreground">
                Guarda tus productos favoritos aquí
              </p>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-4">Cambiar Contraseña</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="••••••••"
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="••••••••"
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <button
                    onClick={changePassword}
                    disabled={loading}
                    className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
                  >
                    {loading ? "Actualizando..." : "Actualizar Contraseña"}
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <h3 className="text-lg font-bold mb-4">Información de Seguridad</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Email verificado</p>
                      <p className="text-sm text-green-700">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted border border-border rounded-lg">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Última sesión</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date().toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Role Management Section */}
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <Crown className="w-6 h-6 text-orange-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold text-orange-900 mb-1">
                          Rol de Usuario: <span className="capitalize">{user.user_metadata?.role || "cliente"}</span>
                        </p>
                        
                        {/* Show role description */}
                        {user.user_metadata?.role === "admin" && (
                          <p className="text-sm text-orange-700 mb-2">
                            ✅ Acceso completo al panel de administración
                          </p>
                        )}
                        {user.user_metadata?.role === "editor" && (
                          <p className="text-sm text-orange-700 mb-2">
                            ✅ Gestión de productos, categorías y contenido
                          </p>
                        )}
                        {user.user_metadata?.role === "proveedor" && (
                          <p className="text-sm text-orange-700 mb-2">
                            ✅ Gestión de inventario y productos propios
                          </p>
                        )}
                        {(!user.user_metadata?.role || user.user_metadata?.role === "cliente") && (
                          <p className="text-sm text-orange-700 mb-2">
                            👤 Acceso básico - Compras y perfil personal
                          </p>
                        )}

                        {/* Dashboard Access Buttons */}
                        <div className="space-y-2 mb-3">
                          <a
                            href="#dashboard"
                            onClick={(e) => {
                              e.preventDefault();
                              onClose();
                              window.location.hash = "client-dashboard";
                            }}
                            className="block w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-center"
                          >
                            📊 Mi Dashboard de Cliente
                          </a>

                          {user.user_metadata?.role === "proveedor" && (
                            <a
                              href="#provider-dashboard"
                              onClick={(e) => {
                                e.preventDefault();
                                onClose();
                                window.location.hash = "provider-dashboard";
                              }}
                              className="block w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-center"
                            >
                              🏪 Dashboard de Proveedor
                            </a>
                          )}

                          {(user.user_metadata?.role === "editor" || user.user_metadata?.role === "admin") && (
                            <a
                              href="#editor-dashboard"
                              onClick={(e) => {
                                e.preventDefault();
                                onClose();
                                window.location.hash = "editor-dashboard";
                              }}
                              className="block w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-center"
                            >
                              ✏️ Dashboard de Editor
                            </a>
                          )}

                          {user.user_metadata?.role === "admin" && (
                            <a
                              href="#admin"
                              onClick={(e) => {
                                e.preventDefault();
                                onClose();
                                window.location.hash = "admin";
                              }}
                              className="block w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-center"
                            >
                              🛡️ Dashboard de Administrador
                            </a>
                          )}
                        </div>

                        {/* Show pending request if exists */}
                        {myRequests.find((r: any) => r.status === "pending") && (
                          <div className="mb-3 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                            <p className="text-sm text-yellow-900 font-medium">
                              ⏳ Tienes una solicitud de rol pendiente
                            </p>
                            <p className="text-xs text-yellow-800 mt-1">
                              El administrador la revisará pronto
                            </p>
                          </div>
                        )}

                        {/* Show last approved/rejected request */}
                        {myRequests.find((r: any) => r.status === "approved") && !myRequests.find((r: any) => r.status === "pending") && (
                          <div className="mb-3 p-3 bg-green-100 border border-green-300 rounded-lg">
                            <p className="text-sm text-green-900 font-medium">
                              ✅ Tu última solicitud fue aprobada
                            </p>
                          </div>
                        )}

                        {myRequests.find((r: any) => r.status === "rejected") && !myRequests.find((r: any) => r.status === "pending") && (
                          <div className="mb-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                            <p className="text-sm text-red-900 font-medium">
                              ❌ Tu última solicitud fue rechazada
                            </p>
                            {myRequests.find((r: any) => r.status === "rejected")?.rejectionReason && (
                              <p className="text-xs text-red-800 mt-1">
                                Motivo: {myRequests.find((r: any) => r.status === "rejected").rejectionReason}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Request role button (only if not admin and no pending request) */}
                        {user.user_metadata?.role !== "admin" && !myRequests.find((r: any) => r.status === "pending") && (
                          <button
                            onClick={() => setShowRoleRequest(true)}
                            className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                          >
                            🔓 Solicitar Rol Avanzado
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Role Request Modal */}
      {showRoleRequest && (
        <RoleRequestModal
          user={user}
          session={session}
          myRequests={myRequests}
          onClose={() => {
            setShowRoleRequest(false);
            loadMyRequests();
          }}
        />
      )}
    </div>
  );
}
