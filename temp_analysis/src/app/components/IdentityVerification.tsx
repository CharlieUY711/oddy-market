import { useState, useEffect } from "react";
import { Shield, CheckCircle2, AlertTriangle, Loader2, X, FileText, Camera } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { toast } from "sonner";

interface IdentityVerificationProps {
  userId: string;
  reason: "purchase_adult" | "publish_secondhand" | "general";
  onVerified: (verificationData: any) => void;
  onCancel: () => void;
}

export function IdentityVerification({ userId, reason, onVerified, onCancel }: IdentityVerificationProps) {
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verified" | "failed" | null>(null);
  const [metamapButton, setMetamapButton] = useState<any>(null);

  useEffect(() => {
    checkVerificationStatus();
    loadMetaMapSDK();
  }, []);

  async function checkVerificationStatus() {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/verification/status?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.verified) {
          setVerificationStatus("verified");
          // Si ya está verificado, llamar directamente a onVerified
          setTimeout(() => onVerified(data), 1000);
        } else {
          setVerificationStatus("pending");
        }
      }
    } catch (error) {
      console.error("Error checking verification status:", error);
    } finally {
      setLoading(false);
    }
  }

  function loadMetaMapSDK() {
    // Cargar el SDK de MetaMap
    if (document.getElementById("metamap-sdk")) {
      initializeMetaMap();
      return;
    }

    const script = document.createElement("script");
    script.id = "metamap-sdk";
    script.src = "https://button.getmati.com/button.js";
    script.async = true;
    script.onload = () => {
      initializeMetaMap();
    };
    document.body.appendChild(script);
  }

  async function initializeMetaMap() {
    try {
      // Obtener configuración de MetaMap del backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/verification/metamap-config?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        toast.error("MetaMap no está configurado");
        return;
      }

      const config = await response.json();

      // Inicializar MetaMap Button
      if (window.MatiButton) {
        const button = new window.MatiButton({
          clientId: config.clientId,
          flowId: config.flowId,
          metadata: {
            userId: userId,
            reason: reason,
          },
        });

        button.on("finish", async (data: any) => {
          console.log("MetaMap verification finished:", data);
          await handleVerificationComplete(data);
        });

        button.on("error", (error: any) => {
          console.error("MetaMap error:", error);
          setVerificationStatus("failed");
          toast.error("Error en la verificación de identidad");
        });

        setMetamapButton(button);
      }
    } catch (error) {
      console.error("Error initializing MetaMap:", error);
      toast.error("Error al inicializar verificación");
    }
  }

  async function handleVerificationComplete(metamapData: any) {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/verification/complete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            metamapData,
            reason,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setVerificationStatus("verified");
        toast.success("¡Identidad verificada exitosamente!");
        setTimeout(() => onVerified(data), 1500);
      } else {
        setVerificationStatus("failed");
        toast.error("No se pudo completar la verificación");
      }
    } catch (error) {
      console.error("Error completing verification:", error);
      setVerificationStatus("failed");
      toast.error("Error al procesar verificación");
    } finally {
      setLoading(false);
    }
  }

  function startVerification() {
    if (metamapButton) {
      metamapButton.open();
    } else {
      toast.error("El sistema de verificación aún no está listo");
    }
  }

  function getReasonText() {
    switch (reason) {
      case "purchase_adult":
        return "Para comprar en departamentos de contenido adulto, necesitas verificar tu identidad.";
      case "publish_secondhand":
        return "Para publicar artículos en Second Hand, necesitas verificar tu identidad.";
      default:
        return "Necesitas verificar tu identidad para continuar.";
    }
  }

  if (loading && verificationStatus !== "verified") {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8"
          >
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Cargando verificación...</p>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (verificationStatus === "verified") {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">¡Identidad Verificada!</h3>
              <p className="text-muted-foreground">
                Tu identidad ha sido verificada exitosamente
              </p>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative"
        >
          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-2">
            Verificación de Identidad
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {getReasonText()}
          </p>

          {/* Info boxes */}
          <div className="space-y-3 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Documentos necesarios</p>
                <p>Cédula de identidad, pasaporte o licencia de conducir vigente</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-3">
              <Camera className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">Proceso seguro</p>
                <p>Utilizamos MetaMap, líder mundial en verificación KYC</p>
              </div>
            </div>

            {verificationStatus === "failed" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-1">Verificación fallida</p>
                  <p>Hubo un problema con la verificación. Por favor, intenta nuevamente.</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Steps */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium mb-3">Pasos del proceso:</p>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-medium text-foreground">1.</span>
                <span>Toma una foto de tu documento de identidad</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-foreground">2.</span>
                <span>Toma una selfie para verificar que eres tú</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-foreground">3.</span>
                <span>Espera la validación automática (toma menos de 1 minuto)</span>
              </li>
            </ol>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={startVerification}
              disabled={!metamapButton}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {metamapButton ? "Iniciar Verificación" : "Preparando..."}
            </button>
          </div>

          {/* Privacy notice */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            Tus datos están protegidos y encriptados según normativas internacionales
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Declarar el tipo global para MetaMap
declare global {
  interface Window {
    MatiButton: any;
  }
}
