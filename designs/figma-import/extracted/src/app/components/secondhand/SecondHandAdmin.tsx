import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { projectId } from "/utils/supabase/info";

interface SecondHandAdminProps {
  session: any;
  onClose: () => void;
}

export function SecondHandAdmin({ session, onClose }: SecondHandAdminProps) {
  const [pendingListings, setPendingListings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPendingListings();
    loadStats();
  }, []);

  async function loadPendingListings() {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/secondhand/pending-review`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPendingListings(data.listings || []);
      }
    } catch (error) {
      console.error("Error loading pending listings:", error);
      toast.error("Error al cargar publicaciones pendientes");
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/secondhand/admin-stats`,
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

  async function handleApprove(listing: any) {
    if (!confirm(`¿Aprobar la publicación "${listing.title}"?`)) {
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/secondhand/listings/${listing.id}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        toast.success("Publicación aprobada correctamente");
        loadPendingListings();
        loadStats();
        setSelectedListing(null);
      } else {
        toast.error("Error al aprobar publicación");
      }
    } catch (error) {
      console.error("Error approving listing:", error);
      toast.error("Error al aprobar publicación");
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject() {
    if (!rejectionReason.trim()) {
      toast.error("Debes indicar la razón del rechazo");
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/secondhand/listings/${selectedListing.id}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: rejectionReason }),
        }
      );

      if (response.ok) {
        toast.success("Publicación rechazada");
        loadPendingListings();
        loadStats();
        setSelectedListing(null);
        setShowRejectModal(false);
        setRejectionReason("");
      } else {
        toast.error("Error al rechazar publicación");
      }
    } catch (error) {
      console.error("Error rejecting listing:", error);
      toast.error("Error al rechazar publicación");
    } finally {
      setProcessing(false);
    }
  }

  function handleNextImage() {
    if (selectedListing?.images) {
      setCurrentImageIndex((prev) =>
        prev === selectedListing.images.length - 1 ? 0 : prev + 1
      );
    }
  }

  function handlePrevImage() {
    if (selectedListing?.images) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedListing.images.length - 1 : prev - 1
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                🛡️ Panel de Moderación
              </h1>
              <p className="text-purple-100">
                Revisa y aprueba publicaciones de Second Hand
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm">Pendientes</span>
                </div>
                <div className="text-3xl font-bold">
                  {stats.pendingApproval}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">Aprobados</span>
                </div>
                <div className="text-3xl font-bold">{stats.approved}</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5" />
                  <span className="text-sm">Vendedores</span>
                </div>
                <div className="text-3xl font-bold">{stats.activeSellers}</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-sm">Vendidos</span>
                </div>
                <div className="text-3xl font-bold">{stats.sold}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Alert if pending reviews */}
        {pendingListings.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-900">
              <strong>⚠️ Atención:</strong> Tienes {pendingListings.length}{" "}
              publicación{pendingListings.length !== 1 ? "es" : ""} pendiente
              {pendingListings.length !== 1 ? "s" : ""} de revisión.
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando publicaciones...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && pendingListings.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2">
              ¡Todo revisado!
            </h3>
            <p className="text-gray-600">
              No hay publicaciones pendientes de aprobación
            </p>
          </div>
        )}

        {/* Pending Listings */}
        {!loading && pendingListings.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Publicaciones Pendientes ({pendingListings.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingListings.map((listing) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border-2 border-yellow-300 shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-100">
                    {listing.images && listing.images[0] ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Sin imagen
                      </div>
                    )}

                    {/* Pending Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pendiente
                      </span>
                    </div>

                    {/* Images Count */}
                    {listing.images && listing.images.length > 1 && (
                      <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded-full">
                        📷 {listing.images.length}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">
                      {listing.title}
                    </h3>

                    <div className="mb-3">
                      <span className="text-2xl font-bold text-purple-600">
                        ${parseFloat(listing.price).toLocaleString()}
                      </span>
                    </div>

                    <div className="mb-3 text-sm text-gray-600">
                      <p>
                        <strong>Categoría:</strong> {listing.category}
                      </p>
                      <p>
                        <strong>Estado:</strong> {listing.condition}
                      </p>
                      <p>
                        <strong>Vendedor:</strong> {listing.sellerName}
                      </p>
                      <p>
                        <strong>Publicado:</strong>{" "}
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedListing(listing)}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail & Review Modal */}
      <AnimatePresence>
        {selectedListing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) =>
              e.target === e.currentTarget && setSelectedListing(null)
            }
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 h-full max-h-[90vh]">
                {/* Image Gallery */}
                <div className="relative bg-gray-100">
                  <button
                    onClick={() => setSelectedListing(null)}
                    className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  {selectedListing.images &&
                  selectedListing.images.length > 0 ? (
                    <>
                      <img
                        src={selectedListing.images[currentImageIndex]}
                        alt={selectedListing.title}
                        className="w-full h-full object-cover"
                      />

                      {selectedListing.images.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <button
                            onClick={handleNextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>

                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {selectedListing.images.map(
                              (_: any, index: number) => (
                                <button
                                  key={index}
                                  onClick={() => setCurrentImageIndex(index)}
                                  className={`w-2 h-2 rounded-full transition-all ${
                                    index === currentImageIndex
                                      ? "bg-white w-6"
                                      : "bg-white/50"
                                  }`}
                                />
                              )
                            )}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Sin imagen
                    </div>
                  )}
                </div>

                {/* Details & Actions */}
                <div className="p-6 overflow-y-auto">
                  <h2 className="text-3xl font-bold mb-4">
                    {selectedListing.title}
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-sm text-gray-500">Precio</label>
                      <p className="text-3xl font-bold text-purple-600">
                        ${parseFloat(selectedListing.price).toLocaleString()}
                        {selectedListing.negotiable && (
                          <span className="text-sm text-cyan-600 ml-2">
                            Negociable
                          </span>
                        )}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-500">
                        Descripción
                      </label>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedListing.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-500">
                          Categoría
                        </label>
                        <p className="font-medium">
                          {selectedListing.category}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Estado</label>
                        <p className="font-medium">
                          {selectedListing.condition}
                        </p>
                      </div>
                    </div>

                    {selectedListing.brand && (
                      <div>
                        <label className="text-sm text-gray-500">Marca</label>
                        <p className="font-medium">{selectedListing.brand}</p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm text-gray-500">
                        Ubicación
                      </label>
                      <p className="font-medium">{selectedListing.location}</p>
                    </div>

                    {selectedListing.tags && selectedListing.tags.length > 0 && (
                      <div>
                        <label className="text-sm text-gray-500 block mb-2">
                          Etiquetas
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {selectedListing.tags.map(
                            (tag: string, index: number) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                              >
                                {tag}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <label className="text-sm text-gray-500 block mb-2">
                        Vendedor
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                          {selectedListing.sellerName?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="font-medium">
                            {selectedListing.sellerName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {selectedListing.sellerEmail}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review Actions */}
                  <div className="border-t pt-6 space-y-3">
                    <h3 className="font-bold text-lg mb-3">
                      Revisar publicación
                    </h3>

                    <button
                      onClick={() => handleApprove(selectedListing)}
                      disabled={processing}
                      className="w-full px-6 py-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {processing ? "Procesando..." : "Aprobar Publicación"}
                    </button>

                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={processing}
                      className="w-full px-6 py-4 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Rechazar Publicación
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Reason Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={(e) =>
              e.target === e.currentTarget && setShowRejectModal(false)
            }
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
            >
              <h3 className="text-2xl font-bold mb-4">Rechazar publicación</h3>
              <p className="text-gray-600 mb-4">
                Indica la razón del rechazo. Esto se enviará al vendedor.
              </p>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ej: Las imágenes no son claras, la descripción es insuficiente, el precio parece incorrecto..."
                rows={5}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none mb-4"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing || !rejectionReason.trim()}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? "Procesando..." : "Confirmar Rechazo"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
