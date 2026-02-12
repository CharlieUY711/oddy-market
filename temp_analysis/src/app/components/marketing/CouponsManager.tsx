import { useState, useEffect } from "react";
import { Tag, Plus, Copy, Trash2, Edit, Check, X, Download } from "lucide-react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { copyToClipboardWithToast } from "/src/utils/clipboard";

interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed" | "free-shipping";
  value: number;
  minPurchase: number;
  maxUses: number;
  used: number;
  startDate: string;
  endDate: string;
  active: boolean;
  description: string;
}

export function CouponsManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/marketing/coupons`,
        { headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setCoupons(data.coupons || []);
      }
    } catch (error) {
      console.error("Error loading coupons:", error);
    }
  }

  async function saveCoupon(coupon: Coupon) {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/marketing/coupons`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(coupon),
        }
      );

      if (response.ok) {
        toast.success("Cupón guardado");
        loadCoupons();
        setShowModal(false);
        setEditingCoupon(null);
      }
    } catch (error) {
      console.error("Error saving coupon:", error);
      toast.error("Error al guardar cupón");
    }
  }

  async function deleteCoupon(id: string) {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/marketing/coupons/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (response.ok) {
        toast.success("Cupón eliminado");
        loadCoupons();
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Error al eliminar cupón");
    }
  }

  async function copyCouponCode(code: string) {
    await copyToClipboardWithToast(code, "Código copiado");
  }

  function generateCouponCode() {
    return "ODDY" + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="w-8 h-8 text-green-600" />
            Gestión de Cupones
          </h2>
          <p className="text-muted-foreground">Crea y administra cupones de descuento</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cupón
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-border">
          <p className="text-2xl font-bold">{coupons.length}</p>
          <p className="text-sm text-muted-foreground">Cupones totales</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-border">
          <p className="text-2xl font-bold">{coupons.filter((c) => c.active).length}</p>
          <p className="text-sm text-muted-foreground">Activos</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-border">
          <p className="text-2xl font-bold">
            {coupons.reduce((sum, c) => sum + c.used, 0)}
          </p>
          <p className="text-sm text-muted-foreground">Usos totales</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-border">
          <p className="text-2xl font-bold text-green-600">$12,450</p>
          <p className="text-sm text-muted-foreground">Ventas generadas</p>
        </div>
      </div>

      {/* Coupons List */}
      <div className="bg-white rounded-lg border border-border">
        <div className="divide-y divide-border">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-lg">{coupon.code}</h4>
                    {coupon.active ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{coupon.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span>
                      <strong>Descuento:</strong>{" "}
                      {coupon.type === "percentage"
                        ? `${coupon.value}%`
                        : coupon.type === "fixed"
                        ? `$${coupon.value}`
                        : "Envío gratis"}
                    </span>
                    <span>
                      <strong>Usos:</strong> {coupon.used}/{coupon.maxUses}
                    </span>
                    <span>
                      <strong>Válido hasta:</strong> {new Date(coupon.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => copyCouponCode(coupon.code)}
                    className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
                    title="Copiar código"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingCoupon(coupon);
                      setShowModal(true);
                    }}
                    className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteCoupon(coupon.id)}
                    className="p-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <CouponModal
          coupon={editingCoupon}
          onSave={saveCoupon}
          onClose={() => {
            setShowModal(false);
            setEditingCoupon(null);
          }}
          generateCode={generateCouponCode}
        />
      )}
    </div>
  );
}

function CouponModal({
  coupon,
  onSave,
  onClose,
  generateCode,
}: {
  coupon: Coupon | null;
  onSave: (coupon: Coupon) => void;
  onClose: () => void;
  generateCode: () => string;
}) {
  const [formData, setFormData] = useState<Coupon>(
    coupon || {
      id: Date.now().toString(),
      code: generateCode(),
      type: "percentage",
      value: 10,
      minPurchase: 0,
      maxUses: 100,
      used: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      active: true,
      description: "",
    }
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">
          {coupon ? "Editar Cupón" : "Nuevo Cupón"}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Código del Cupón</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <button
                onClick={() => setFormData({ ...formData, code: generateCode() })}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Generar
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descuento de primavera"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as Coupon["type"] })
                }
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="percentage">Porcentaje</option>
                <option value="fixed">Monto fijo</option>
                <option value="free-shipping">Envío gratis</option>
              </select>
            </div>

            {formData.type !== "free-shipping" && (
              <div>
                <label className="block text-sm font-medium mb-1">Valor</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Compra mínima ($)</label>
              <input
                type="number"
                value={formData.minPurchase}
                onChange={(e) =>
                  setFormData({ ...formData, minPurchase: parseFloat(e.target.value) })
                }
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Usos máximos</label>
              <input
                type="number"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fecha inicio</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fecha fin</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Activar cupón inmediatamente</span>
          </label>

          <div className="flex gap-2 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave(formData)}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Guardar Cupón
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
