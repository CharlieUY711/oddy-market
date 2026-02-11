import { useState } from "react";
import { MessageSquare, Plus, Eye, Edit, Trash2, Settings } from "lucide-react";
import { toast } from "sonner";

interface Popup {
  id: string;
  name: string;
  title: string;
  message: string;
  type: "center" | "bottom-right" | "top-banner" | "exit-intent";
  trigger: "immediate" | "scroll" | "exit" | "timer";
  delay: number;
  buttonText: string;
  buttonLink: string;
  active: boolean;
  views: number;
  clicks: number;
}

export function PopupBannerManager() {
  const [popups, setPopups] = useState<Popup[]>([
    {
      id: "1",
      name: "Bienvenida",
      title: "¡Bienvenido a ODDY Market!",
      message: "Obtén 10% OFF en tu primera compra",
      type: "center",
      trigger: "immediate",
      delay: 3000,
      buttonText: "Obtener descuento",
      buttonLink: "/productos",
      active: true,
      views: 1240,
      clicks: 156,
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState<Popup | null>(null);

  function PopupPreview({ popup }: { popup: Popup }) {
    const styles: Record<string, string> = {
      center: "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md w-full mx-4",
      "bottom-right": "fixed bottom-4 right-4 max-w-sm",
      "top-banner": "fixed top-0 left-0 right-0",
      "exit-intent": "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-lg w-full mx-4",
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`bg-white rounded-lg shadow-2xl p-6 ${styles[popup.type]}`}>
          <h3 className="text-xl font-bold mb-2">{popup.title}</h3>
          <p className="text-muted-foreground mb-4">{popup.message}</p>
          <button className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium">
            {popup.buttonText}
          </button>
          <button
            onClick={() => setPreview(null)}
            className="absolute top-2 right-2 p-2 hover:bg-muted rounded-lg"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-yellow-600" />
            Pop-ups & Banners
          </h2>
          <p className="text-muted-foreground">Captura la atención de tus visitantes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Pop-up
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-border">
          <p className="text-2xl font-bold">{popups.reduce((sum, p) => sum + p.views, 0).toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Visualizaciones totales</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-border">
          <p className="text-2xl font-bold">{popups.reduce((sum, p) => sum + p.clicks, 0)}</p>
          <p className="text-sm text-muted-foreground">Clicks totales</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-border">
          <p className="text-2xl font-bold">12.5%</p>
          <p className="text-sm text-muted-foreground">CTR promedio</p>
        </div>
      </div>

      {/* Popups List */}
      <div className="bg-white rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h3 className="font-bold">Pop-ups Configurados</h3>
        </div>
        <div className="divide-y divide-border">
          {popups.map((popup) => (
            <div key={popup.id} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold">{popup.name}</h4>
                    {popup.active ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        Pausado
                      </span>
                    )}
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {popup.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{popup.title}</p>
                  <div className="flex gap-4 text-sm">
                    <span><strong>Vistas:</strong> {popup.views}</span>
                    <span><strong>Clicks:</strong> {popup.clicks}</span>
                    <span><strong>CTR:</strong> {((popup.clicks / popup.views) * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => setPreview(popup)}
                    className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
                    title="Vista previa"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setPopups(popups.filter((p) => p.id !== popup.id));
                      toast.success("Pop-up eliminado");
                    }}
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

      {preview && <PopupPreview popup={preview} />}

      {/* Tips */}
      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
        <h3 className="font-bold text-yellow-900 mb-3">💡 Consejos para Pop-ups Efectivos</h3>
        <ul className="text-sm text-yellow-800 space-y-2">
          <li>• <strong>No seas intrusivo:</strong> Usa delays apropiados (3-5 segundos)</li>
          <li>• <strong>Exit-intent:</strong> Captura visitantes antes de que se vayan</li>
          <li>• <strong>Mobile-friendly:</strong> Asegúrate que se vean bien en móviles</li>
          <li>• <strong>A/B Testing:</strong> Prueba diferentes mensajes y diseños</li>
        </ul>
      </div>
    </div>
  );
}
