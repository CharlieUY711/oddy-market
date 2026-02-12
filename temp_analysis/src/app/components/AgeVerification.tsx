import { useState } from "react";
import { Calendar, Shield, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AgeVerificationProps {
  onVerified: () => void;
  onCancel: () => void;
  departmentName?: string;
}

export function AgeVerification({ onVerified, onCancel, departmentName }: AgeVerificationProps) {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");

  function calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  function handleVerify() {
    setError("");

    // Validar campos
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (!day || !month || !year) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (dayNum < 1 || dayNum > 31) {
      setError("Día inválido");
      return;
    }

    if (monthNum < 1 || monthNum > 12) {
      setError("Mes inválido");
      return;
    }

    if (yearNum < 1900 || yearNum > new Date().getFullYear()) {
      setError("Año inválido");
      return;
    }

    // Crear fecha de nacimiento
    const birthDate = new Date(yearNum, monthNum - 1, dayNum);
    
    // Validar que la fecha sea válida
    if (
      birthDate.getDate() !== dayNum ||
      birthDate.getMonth() !== monthNum - 1 ||
      birthDate.getFullYear() !== yearNum
    ) {
      setError("Fecha inválida");
      return;
    }

    // Calcular edad
    const age = calculateAge(birthDate);

    if (age < 18) {
      setError("Debes ser mayor de 18 años para acceder a este contenido");
      return;
    }

    // Guardar verificación en sessionStorage (solo para esta sesión)
    sessionStorage.setItem("age_verified", "true");
    sessionStorage.setItem("age_verified_date", new Date().toISOString());
    
    onVerified();
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
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-2">
            Verificación de Edad
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {departmentName ? (
              <>El departamento <strong>{departmentName}</strong> contiene contenido para mayores de 18 años</>
            ) : (
              "Este contenido es para mayores de 18 años"
            )}
          </p>

          {/* Warning */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-800">
              <p className="font-medium mb-1">Contenido Restringido</p>
              <p>Debes tener al menos 18 años para acceder. Para comprar o publicar, necesitarás verificar tu identidad con MetaMap.</p>
            </div>
          </div>

          {/* Date input */}
          <div className="space-y-4 mb-6">
            <label className="block">
              <span className="text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha de Nacimiento
              </span>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <div>
                  <input
                    type="number"
                    placeholder="DD"
                    value={day}
                    onChange={(e) => setDay(e.target.value.slice(0, 2))}
                    min="1"
                    max="31"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-center"
                  />
                  <span className="text-xs text-muted-foreground block text-center mt-1">Día</span>
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="MM"
                    value={month}
                    onChange={(e) => setMonth(e.target.value.slice(0, 2))}
                    min="1"
                    max="12"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-center"
                  />
                  <span className="text-xs text-muted-foreground block text-center mt-1">Mes</span>
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="AAAA"
                    value={year}
                    onChange={(e) => setYear(e.target.value.slice(0, 4))}
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-center"
                  />
                  <span className="text-xs text-muted-foreground block text-center mt-1">Año</span>
                </div>
              </div>
            </label>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm text-red-800"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}
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
              onClick={handleVerify}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Verificar Edad
            </button>
          </div>

          {/* Privacy notice */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            Esta verificación solo se guarda durante tu sesión actual
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
