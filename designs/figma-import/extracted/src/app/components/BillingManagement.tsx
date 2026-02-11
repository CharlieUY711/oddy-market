import { useState, useEffect } from "react";
import { FileText, Plus, Download, Eye, X, Check, Search, Filter, Calendar } from "lucide-react";
import { motion } from "motion/react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId?: string;
  customer: {
    name: string;
    email: string;
    documentNumber: string;
  };
  totals: {
    total: number;
  };
  status: string;
  createdAt: string;
  pdfUrl?: string;
}

interface Remito {
  id: string;
  remitoNumber: string;
  orderId?: string;
  customer: {
    name: string;
    email: string;
  };
  status: string;
  createdAt: string;
  pdfUrl?: string;
  deliveryDate?: string;
}

interface BillingStats {
  totalInvoices: number;
  totalRemitos: number;
  activeInvoices: number;
  cancelledInvoices: number;
  totalBilled: number;
  monthlyInvoices: number;
  monthlyBilled: number;
}

export function BillingManagement() {
  const [activeTab, setActiveTab] = useState<"facturas" | "remitos">("facturas");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [remitos, setRemitos] = useState<Remito[]>([]);
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Invoice | Remito | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4`;
  const authToken = localStorage.getItem("supabase_token") || publicAnonKey;

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, docsRes] = await Promise.all([
        fetch(`${baseUrl}/billing/stats`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        fetch(`${baseUrl}/billing/${activeTab}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      ]);

      const statsData = await statsRes.json();
      const docsData = await docsRes.json();

      setStats(statsData);
      
      if (activeTab === "facturas") {
        setInvoices(docsData.invoices || []);
      } else {
        setRemitos(docsData.remitos || []);
      }
    } catch (error) {
      console.error("Error loading billing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (id: string) => {
    try {
      const response = await fetch(`${baseUrl}/billing/${activeTab}/${id}/pdf`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      
      const data = await response.json();
      
      if (data.pdfUrl) {
        window.open(data.pdfUrl, "_blank");
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  const handleCancelInvoice = async (id: string, motivo: string) => {
    try {
      const response = await fetch(`${baseUrl}/billing/facturas/${id}/anular`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ motivo }),
      });

      if (response.ok) {
        loadData();
        setSelectedDoc(null);
      }
    } catch (error) {
      console.error("Error cancelling invoice:", error);
    }
  };

  const filteredDocs = () => {
    const docs = activeTab === "facturas" ? invoices : remitos;
    
    return docs.filter((doc: any) => {
      const matchesSearch = 
        doc.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activeTab === "facturas" ? doc.invoiceNumber : doc.remitoNumber)
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "UYU",
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-UY", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "emitida":
      case "emitido":
        return "bg-green-100 text-green-700";
      case "anulada":
      case "anulado":
        return "bg-red-100 text-red-700";
      case "pendiente":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Facturación Electrónica</h2>
        <p className="text-muted-foreground">
          Sistema de facturación electrónica con Fixed - Cumplimiento DGI Uruguay
        </p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg border border-border"
          >
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold">{stats.totalInvoices}</span>
            </div>
            <p className="text-sm text-muted-foreground">Facturas Totales</p>
            <p className="text-xs text-green-600 mt-1">
              {stats.activeInvoices} activas
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg border border-border"
          >
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-secondary" />
              <span className="text-2xl font-bold">{stats.totalRemitos}</span>
            </div>
            <p className="text-sm text-muted-foreground">Remitos Totales</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg border border-border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-green-600">$</span>
              <span className="text-2xl font-bold">
                {formatCurrency(stats.totalBilled)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Facturado Total</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-lg border border-border"
          >
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold">{stats.monthlyInvoices}</span>
            </div>
            <p className="text-sm text-muted-foreground">Facturas este mes</p>
            <p className="text-xs text-primary mt-1">
              {formatCurrency(stats.monthlyBilled)}
            </p>
          </motion.div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-border">
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("facturas")}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === "facturas"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Facturas Electrónicas
          </button>
          <button
            onClick={() => setActiveTab("remitos")}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === "remitos"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Remitos
          </button>
        </div>

        {/* Filters and Search */}
        <div className="p-4 border-b border-border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por número o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Todos los estados</option>
                <option value="emitida">Emitidas</option>
                <option value="emitido">Emitidos</option>
                <option value="anulada">Anuladas</option>
                <option value="anulado">Anulados</option>
              </select>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden md:inline">
                  Nueva {activeTab === "facturas" ? "Factura" : "Remito"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Número
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Cliente
                </th>
                {activeTab === "facturas" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-border">
              {filteredDocs().map((doc: any) => (
                <tr key={doc.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium">
                      {activeTab === "facturas" ? doc.invoiceNumber : doc.remitoNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{doc.customer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.customer.email}
                      </p>
                    </div>
                  </td>
                  {activeTab === "facturas" && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-primary">
                        {formatCurrency(doc.totals.total)}
                      </span>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(doc.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        doc.status
                      )}`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(doc.id)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="Descargar PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredDocs().length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No hay {activeTab === "facturas" ? "facturas" : "remitos"}
              </h3>
              <p className="text-muted-foreground mb-4">
                Comenzá creando tu primer documento
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Crear {activeTab === "facturas" ? "Factura" : "Remito"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Document Details Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">
                  {activeTab === "facturas"
                    ? (selectedDoc as Invoice).invoiceNumber
                    : (selectedDoc as Remito).remitoNumber}
                </h3>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedDoc.customer.name}</p>
                  <p className="text-sm">{selectedDoc.customer.email}</p>
                </div>

                {activeTab === "facturas" && "totals" in selectedDoc && (
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(selectedDoc.totals.total)}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                      selectedDoc.status
                    )}`}
                  >
                    {selectedDoc.status}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Fecha de emisión</p>
                  <p className="font-medium">{formatDate(selectedDoc.createdAt)}</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleDownloadPDF(selectedDoc.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Descargar PDF
                  </button>
                  
                  {activeTab === "facturas" && selectedDoc.status === "emitida" && (
                    <button
                      onClick={() => {
                        if (confirm("¿Estás seguro de anular esta factura?")) {
                          const motivo = prompt("Motivo de anulación:");
                          if (motivo) {
                            handleCancelInvoice(selectedDoc.id, motivo);
                          }
                        }
                      }}
                      className="flex items-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X className="w-5 h-5" />
                      Anular
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">
                  Crear {activeTab === "facturas" ? "Factura" : "Remito"}
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-medium mb-2">
                  Formulario de creación
                </h4>
                <p className="text-muted-foreground mb-4">
                  Esta funcionalidad se completará en la siguiente iteración.
                  Por ahora, las facturas y remitos se generan automáticamente
                  desde las órdenes completadas.
                </p>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Entendido
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
