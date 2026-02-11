import { useState, useEffect } from "react";
import {
  MessageCircle,
  Send,
  Phone,
  Settings,
  History,
  BarChart3,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Plus,
  Edit,
  Trash2,
  Save,
  Copy,
  Download,
  Inbox,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { motion, AnimatePresence } from "motion/react";

interface TwilioConfig {
  configured: boolean;
  accountSid?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  configuredAt?: string;
}

interface Message {
  to: string;
  message: string;
  type: "sms" | "whatsapp" | "email";
  status?: string;
  sentAt?: string;
  twilioSid?: string;
  mediaUrl?: string;
}

interface Template {
  id: string;
  name: string;
  content: string;
  variables?: string[];
  type: "sms" | "whatsapp" | "email";
  createdAt: string;
}

export function TwilioWhatsAppManager() {
  const [activeTab, setActiveTab] = useState<
    "config" | "send" | "history" | "inbox" | "templates" | "stats"
  >("config");
  const [config, setConfig] = useState<TwilioConfig>({ configured: false });
  const [loading, setLoading] = useState(false);
  
  // Configuration
  const [accountSid, setAccountSid] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  
  // Sending
  const [sendType, setSendType] = useState<"sms" | "whatsapp">("whatsapp");
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [sending, setSending] = useState(false);
  
  // History & Inbox
  const [history, setHistory] = useState<Message[]>([]);
  const [inbox, setInbox] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  
  // Templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (config.configured) {
      if (activeTab === "history") loadHistory();
      if (activeTab === "inbox") loadInbox();
      if (activeTab === "stats") loadStats();
      if (activeTab === "templates") loadTemplates();
    }
  }, [activeTab, config.configured]);

  async function loadConfig() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/integrations/twilio/config`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        if (data.phoneNumber) setPhoneNumber(data.phoneNumber);
        if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber);
      }
    } catch (error) {
      console.error("Error loading Twilio config:", error);
    }
  }

  async function saveConfig() {
    if (!accountSid || !authToken) {
      toast.error("Account SID y Auth Token son requeridos");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/integrations/twilio/configure`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            accountSid,
            authToken,
            phoneNumber,
            whatsappNumber,
          }),
        }
      );

      if (response.ok) {
        toast.success("Twilio configurado exitosamente");
        loadConfig();
        setAccountSid("");
        setAuthToken("");
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al configurar Twilio");
      }
    } catch (error) {
      console.error("Error saving Twilio config:", error);
      toast.error("Error al configurar Twilio");
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!recipient || !message) {
      toast.error("Destinatario y mensaje son requeridos");
      return;
    }

    setSending(true);
    try {
      const endpoint =
        sendType === "sms"
          ? "/integrations/twilio/send-sms"
          : "/integrations/whatsapp/send";

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            to: recipient,
            message,
            mediaUrl: sendType === "whatsapp" ? mediaUrl : undefined,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(`Mensaje enviado exitosamente (SID: ${data.messageSid})`);
        setRecipient("");
        setMessage("");
        setMediaUrl("");
        loadHistory();
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al enviar mensaje");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error al enviar mensaje");
    } finally {
      setSending(false);
    }
  }

  async function loadHistory() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/integrations/messaging/history?limit=100`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setHistory(data.messages || []);
      }
    } catch (error) {
      console.error("Error loading history:", error);
    }
  }

  async function loadInbox() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/integrations/messaging/inbox`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setInbox(data.messages || []);
      }
    } catch (error) {
      console.error("Error loading inbox:", error);
    }
  }

  async function loadStats() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/integrations/messaging/stats`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
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

  async function loadTemplates() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/integrations/messaging/templates`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
    }
  }

  async function saveTemplate(template: Partial<Template>) {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/integrations/messaging/templates`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(template),
        }
      );

      if (response.ok) {
        toast.success("Plantilla guardada");
        loadTemplates();
        setShowTemplateModal(false);
        setEditingTemplate(null);
      } else {
        toast.error("Error al guardar plantilla");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Error al guardar plantilla");
    }
  }

  async function processQueue() {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/integrations/messaging/process-queue`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(
          `Cola procesada: ${data.processed.emails} emails, ${data.processed.whatsapp} WhatsApp, ${data.processed.sms} SMS`
        );
        loadHistory();
      } else {
        toast.error("Error procesando cola");
      }
    } catch (error) {
      console.error("Error processing queue:", error);
      toast.error("Error procesando cola");
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { id: "config", label: "Configuración", icon: Settings },
    { id: "send", label: "Enviar", icon: Send },
    { id: "history", label: "Historial", icon: History },
    { id: "inbox", label: "Recibidos", icon: Inbox },
    { id: "templates", label: "Plantillas", icon: FileText },
    { id: "stats", label: "Estadísticas", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="w-8 h-8 text-green-600" />
            Twilio & WhatsApp Business
          </h2>
          <p className="text-muted-foreground">
            SMS, WhatsApp y mensajería integrada con colas y automatizaciones
          </p>
        </div>
        {config.configured && (
          <button
            onClick={processQueue}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Clock className="w-5 h-5" />
            )}
            Procesar Cola
          </button>
        )}
      </div>

      {/* Status Badge */}
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
          config.configured
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-yellow-50 text-yellow-700 border border-yellow-200"
        }`}
      >
        {config.configured ? (
          <>
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Twilio Configurado</span>
          </>
        ) : (
          <>
            <XCircle className="w-5 h-5" />
            <span className="font-medium">Twilio No Configurado</span>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Configuration Tab */}
      {activeTab === "config" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-border space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Credenciales de Twilio
            </h3>

            <div>
              <label className="block text-sm font-medium mb-1">Account SID</label>
              <input
                type="text"
                value={accountSid}
                onChange={(e) => setAccountSid(e.target.value)}
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Auth Token</label>
              <input
                type="password"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                placeholder="••••••••••••••••••••••••••••••••"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Número de Teléfono (SMS)
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Número de WhatsApp
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+1234567890"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              onClick={saveConfig}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Guardar Configuración
            </button>
          </div>

          <div className="space-y-6">
            {/* Current Config */}
            {config.configured && (
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="font-bold mb-4">Configuración Actual</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Account SID:</span>
                    <span className="font-mono">{config.accountSid}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Número SMS:</span>
                    <span className="font-mono">{config.phoneNumber || "No configurado"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Número WhatsApp:</span>
                    <span className="font-mono">
                      {config.whatsappNumber || "No configurado"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Configurado:</span>
                    <span>
                      {config.configuredAt
                        ? new Date(config.configuredAt).toLocaleDateString("es-AR")
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-bold mb-2">📝 Instrucciones</h3>
              <ol className="text-sm space-y-2 list-decimal list-inside">
                <li>Crea una cuenta en <a href="https://www.twilio.com" target="_blank" className="text-primary underline">Twilio</a></li>
                <li>Obtén tu Account SID y Auth Token del dashboard</li>
                <li>Compra un número de teléfono para SMS</li>
                <li>
                  Para WhatsApp, solicita acceso a{" "}
                  <a href="https://www.twilio.com/whatsapp" target="_blank" className="text-primary underline">
                    WhatsApp Business API
                  </a>
                </li>
                <li>Configura el webhook en Twilio apuntando a tu URL</li>
                <li>¡Comienza a enviar mensajes!</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Send Tab */}
      {activeTab === "send" && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-6 rounded-lg border border-border space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Send className="w-5 h-5" />
              Enviar Mensaje
            </h3>

            {!config.configured ? (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  ⚠️ Primero debes configurar Twilio en la pestaña "Configuración"
                </p>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSendType("whatsapp")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                      sendType === "whatsapp"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => setSendType("sms")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                      sendType === "sms"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <Phone className="w-5 h-5" />
                    SMS
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Número de Destinatario
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="+54911234567"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Incluye código de país (ej: +54 para Argentina)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Mensaje</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Escribe tu mensaje aquí..."
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {message.length} caracteres
                  </p>
                </div>

                {sendType === "whatsapp" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      URL de Imagen/Video (opcional)
                    </label>
                    <input
                      type="text"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                <button
                  onClick={sendMessage}
                  disabled={sending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  Enviar {sendType === "whatsapp" ? "WhatsApp" : "SMS"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Historial de Mensajes Enviados</h3>
            <button
              onClick={loadHistory}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <History className="w-4 h-4" />
              Actualizar
            </button>
          </div>

          {history.length === 0 ? (
            <div className="bg-white p-12 rounded-lg border border-border text-center">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No hay mensajes enviados aún</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-4 rounded-lg border border-border"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {msg.type === "whatsapp" ? (
                        <MessageCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      ) : msg.type === "sms" ? (
                        <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
                      ) : (
                        <Mail className="w-5 h-5 text-purple-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{msg.to}</p>
                        <p className="text-sm text-muted-foreground mt-1">{msg.message}</p>
                        {msg.mediaUrl && (
                          <p className="text-xs text-primary mt-1">📎 {msg.mediaUrl}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>
                        {msg.sentAt
                          ? new Date(msg.sentAt).toLocaleString("es-AR")
                          : "N/A"}
                      </p>
                      {msg.twilioSid && (
                        <p className="font-mono mt-1">{msg.twilioSid.slice(0, 10)}...</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Inbox Tab */}
      {activeTab === "inbox" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Mensajes Recibidos</h3>
            <button
              onClick={loadInbox}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <Inbox className="w-4 h-4" />
              Actualizar
            </button>
          </div>

          {inbox.length === 0 ? (
            <div className="bg-white p-12 rounded-lg border border-border text-center">
              <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No hay mensajes recibidos</p>
            </div>
          ) : (
            <div className="space-y-2">
              {inbox.map((msg, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border border-border">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">{msg.from}</p>
                        <p className="text-sm text-muted-foreground mt-1">{msg.body}</p>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs mt-2 ${
                            msg.type === "whatsapp"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {msg.type === "whatsapp" ? (
                            <MessageCircle className="w-3 h-3" />
                          ) : (
                            <Phone className="w-3 h-3" />
                          )}
                          {msg.type}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(msg.receivedAt).toLocaleString("es-AR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Plantillas de Mensajes</h3>
            <button
              onClick={() => {
                setEditingTemplate({
                  id: "",
                  name: "",
                  content: "",
                  type: "whatsapp",
                  createdAt: "",
                });
                setShowTemplateModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nueva Plantilla
            </button>
          </div>

          {templates.length === 0 ? (
            <div className="bg-white p-12 rounded-lg border border-border text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No hay plantillas creadas</p>
              <button
                onClick={() => {
                  setEditingTemplate({
                    id: "",
                    name: "",
                    content: "",
                    type: "whatsapp",
                    createdAt: "",
                  });
                  setShowTemplateModal(true);
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Crear Primera Plantilla
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white p-4 rounded-lg border border-border"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                          template.type === "whatsapp"
                            ? "bg-green-100 text-green-700"
                            : template.type === "sms"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {template.type}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setEditingTemplate(template);
                        setShowTemplateModal(true);
                      }}
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {template.content}
                  </p>
                  <button
                    onClick={() => {
                      setMessage(template.content);
                      setSendType(template.type as any);
                      setActiveTab("send");
                      toast.success("Plantilla cargada");
                    }}
                    className="w-full mt-3 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Usar Plantilla
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === "stats" && stats && (
        <div className="space-y-6">
          <h3 className="font-bold">Estadísticas de Mensajería</h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <MessageCircle className="w-8 h-8 text-green-600" />
                <span className="text-sm text-green-600 font-medium">WhatsApp</span>
              </div>
              <p className="text-3xl font-bold text-green-700">{stats.whatsapp.total}</p>
              <p className="text-sm text-green-600 mt-1">
                {stats.whatsapp.last30Days} en últimos 30 días
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <Phone className="w-8 h-8 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">SMS</span>
              </div>
              <p className="text-3xl font-bold text-blue-700">{stats.sms.total}</p>
              <p className="text-sm text-blue-600 mt-1">
                {stats.sms.last30Days} en últimos 30 días
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <Mail className="w-8 h-8 text-purple-600" />
                <span className="text-sm text-purple-600 font-medium">Emails</span>
              </div>
              <p className="text-3xl font-bold text-purple-700">{stats.email.total}</p>
              <p className="text-sm text-purple-600 mt-1">
                {stats.email.last30Days} en últimos 30 días
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && editingTemplate && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowTemplateModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-6 rounded-lg max-w-lg w-full"
          >
            <h3 className="font-bold mb-4">
              {editingTemplate.id ? "Editar" : "Nueva"} Plantilla
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={editingTemplate.name}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  value={editingTemplate.type}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      type: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Contenido</label>
                <textarea
                  value={editingTemplate.content}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, content: e.target.value })
                  }
                  rows={6}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => saveTemplate(editingTemplate)}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
