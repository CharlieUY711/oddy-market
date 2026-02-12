import { useState, useEffect } from "react";
import {
  Plus,
  Package,
  DollarSign,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { SecondHandListingForm } from "./SecondHandListingForm";
import { SecondHandListingCard } from "./SecondHandListingCard";
import { IdentityVerification } from "../IdentityVerification";

interface SecondHandSellerProps {
  user: any;
  session: any;
  onClose: () => void;
}

const STATUS_INFO: any = {
  pending: {
    icon: Clock,
    label: "Pendiente",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    description: "Tu publicación está en revisión",
  },
  approved: {
    icon: CheckCircle,
    label: "Aprobado",
    color: "text-green-600",
    bgColor: "bg-green-100",
    description: "Publicación visible en el marketplace",
  },
  rejected: {
    icon: XCircle,
    label: "Rechazado",
    color: "text-red-600",
    bgColor: "bg-red-100",
    description: "Publicación rechazada",
  },
  sold: {
    icon: Package,
    label: "Vendido",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    description: "Producto vendido",
  },
};

export function SecondHandSeller({ user, session, onClose }: SecondHandSellerProps) {
  const [listings, setListings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingListing, setEditingListing] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [showIdentityVerification, setShowIdentityVerification] = useState(false);
  const [identityVerified, setIdentityVerified] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(true);

  useEffect(() => {
    checkIdentityVerification();
    loadListings();
    loadStats();
  }, []);

  async function checkIdentityVerification() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/verification/status?userId=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIdentityVerified(data.verified);
      }
    } catch (error) {
      console.error("Error checking verification:", error);
    } finally {
      setCheckingVerification(false);
    }
  }

  function handleNewListing() {
    if (!identityVerified) {
      setShowIdentityVerification(true);
    } else {
      setShowForm(true);
    }
  }

  function handleVerificationComplete() {
    setIdentityVerified(true);
    setShowIdentityVerification(false);
    setShowForm(true);
    toast.success("Identidad verificada. Ahora puedes publicar.");
  }

  async function loadListings() {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/secondhand/my-listings`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setListings(data.listings || []);
      }
    } catch (error) {
      console.error("Error loading listings:", error);
      toast.error("Error al cargar tus publicaciones");
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/secondhand/seller-stats`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }

  async function handleDelete(listing: any) {
    if (!confirm("¿Estás seguro de eliminar esta publicación?")) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/secondhand/listings/${listing.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Publicación eliminada");
        loadListings();
        loadStats();
      } else {
        toast.error("Error al eliminar publicación");
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error("Error al eliminar publicación");
    }
  }

  async function handleMarkAsSold(listing: any) {
    if (!confirm("¿Marcar este producto como vendido?")) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/secondhand/listings/${listing.id}/mark-sold`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        toast.success("¡Felicitaciones por tu venta! 🎉");
        loadListings();
        loadStats();
      } else {
        toast.error("Error al marcar como vendido");
      }
    } catch (error) {
      console.error("Error marking as sold:", error);
      toast.error("Error al marcar como vendido");
    }
  }

  function handleEdit(listing: any) {
    setEditingListing(listing);
    setShowForm(true);
  }

  function handleFormClose() {
    setShowForm(false);
    setEditingListing(null);
  }

  function handleFormSuccess() {
    setShowForm(false);
    setEditingListing(null);
    loadListings();
    loadStats();
  }

  const filteredListings =
    filterStatus === "all"
      ? listings
      : listings.filter((l) => l.status === filterStatus);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                🏪 Mi Panel de Vendedor
              </h1>
              <p className="text-orange-100">
                Gestiona tus publicaciones de segunda mano
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              Volver al Marketplace
            </button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5" />
                  <span className="text-sm">Total</span>
                </div>
                <div className="text-3xl font-bold">{stats.totalListings}</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm">Pendientes</span>
                </div>
                <div className="text-3xl font-bold">
                  {stats.pendingListings}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-5 h-5" />
                  <span className="text-sm">Vistas</span>
                </div>
                <div className="text-3xl font-bold">{stats.totalViews}</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-sm">Vendidos</span>
                </div>
                <div className="text-3xl font-bold">{stats.soldListings}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === "all"
                  ? "bg-orange-500 text-white"
                  : "bg-white border-2 border-gray-200 text-gray-700"
              }`}
            >
              Todos ({listings.length})
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === "pending"
                  ? "bg-yellow-500 text-white"
                  : "bg-white border-2 border-gray-200 text-gray-700"
              }`}
            >
              Pendientes ({stats?.pendingListings || 0})
            </button>
            <button
              onClick={() => setFilterStatus("approved")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === "approved"
                  ? "bg-green-500 text-white"
                  : "bg-white border-2 border-gray-200 text-gray-700"
              }`}
            >
              Aprobados ({stats?.approvedListings || 0})
            </button>
            <button
              onClick={() => setFilterStatus("sold")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === "sold"
                  ? "bg-purple-500 text-white"
                  : "bg-white border-2 border-gray-200 text-gray-700"
              }`}
            >
              Vendidos ({stats?.soldListings || 0})
            </button>
          </div>

          <button
            onClick={handleNewListing}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Nueva Publicación
          </button>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <strong>💡 Consejo:</strong> Las publicaciones con buenas fotos,
            descripciones detalladas y precios competitivos reciben más vistas y
            se venden más rápido.
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando tus publicaciones...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredListings.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {filterStatus === "all"
                ? "No tienes publicaciones"
                : `No tienes publicaciones ${
                    filterStatus === "pending"
                      ? "pendientes"
                      : filterStatus === "approved"
                      ? "aprobadas"
                      : "vendidas"
                  }`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filterStatus === "all"
                ? "Crea tu primera publicación para empezar a vender"
                : "Cambia el filtro para ver otras publicaciones"}
            </p>
            {filterStatus === "all" && (
              <button
                onClick={handleNewListing}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Crear Primera Publicación
              </button>
            )}
          </div>
        )}

        {/* Listings Grid */}
        {!loading && filteredListings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="relative">
                <SecondHandListingCard
                  listing={listing}
                  onView={setSelectedListing}
                  showStatus={true}
                />

                {/* Action Buttons */}
                <div className="mt-3 flex gap-2">
                  {listing.status === "approved" && (
                    <button
                      onClick={() => handleMarkAsSold(listing)}
                      className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Marcar Vendido
                    </button>
                  )}

                  {listing.status !== "sold" && (
                    <button
                      onClick={() => handleEdit(listing)}
                      className="flex-1 px-3 py-2 bg-cyan-500 text-white rounded-lg text-sm font-medium hover:bg-cyan-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(listing)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Rejection Reason */}
                {listing.status === "rejected" && listing.rejectionReason && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs font-medium text-red-900 mb-1">
                      Razón del rechazo:
                    </p>
                    <p className="text-xs text-red-700">
                      {listing.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Identity Verification Modal */}
      <AnimatePresence>
        {showIdentityVerification && (
          <IdentityVerification
            userId={user.id}
            reason="publish_secondhand"
            onVerified={handleVerificationComplete}
            onCancel={() => setShowIdentityVerification(false)}
          />
        )}
      </AnimatePresence>

      {/* Listing Form Modal */}
      <AnimatePresence>
        {showForm && (
          <SecondHandListingForm
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
            editingListing={editingListing}
          />
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedListing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setSelectedListing(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedListing.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    {STATUS_INFO[selectedListing.status] && (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          STATUS_INFO[selectedListing.status].bgColor
                        } ${STATUS_INFO[selectedListing.status].color}`}
                      >
                        {STATUS_INFO[selectedListing.status].label}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedListing(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {selectedListing.images && selectedListing.images.length > 0 && (
                  <img
                    src={selectedListing.images[0]}
                    alt={selectedListing.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}

                <div>
                  <h3 className="font-semibold mb-1">Precio</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    ${parseFloat(selectedListing.price).toLocaleString()}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">Descripción</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedListing.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-1">Categoría</h3>
                    <p className="text-gray-700">{selectedListing.category}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Estado</h3>
                    <p className="text-gray-700">{selectedListing.condition}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">Estadísticas</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                      <Eye className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedListing.viewCount || 0}
                      </p>
                      <p className="text-xs text-blue-600">Vistas</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg text-center">
                      <TrendingUp className="w-5 h-5 mx-auto mb-1 text-red-600" />
                      <p className="text-2xl font-bold text-red-600">
                        {selectedListing.favoriteCount || 0}
                      </p>
                      <p className="text-xs text-red-600">Favoritos</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg text-center">
                      <Clock className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                      <p className="text-xs text-purple-600">
                        {new Date(
                          selectedListing.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
