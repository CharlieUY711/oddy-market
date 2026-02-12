import { useState, useEffect, ReactNode } from "react";
import { AgeVerification } from "./AgeVerification";

interface DepartmentGuardProps {
  departmentId?: string;
  departmentName?: string;
  isAdultContent: boolean;
  children: ReactNode;
}

export function DepartmentGuard({ 
  departmentId, 
  departmentName, 
  isAdultContent, 
  children 
}: DepartmentGuardProps) {
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);

  useEffect(() => {
    if (isAdultContent) {
      // Verificar si ya se verificó la edad en esta sesión
      const verified = sessionStorage.getItem("age_verified");
      if (verified) {
        setAgeVerified(true);
      } else {
        setShowAgeVerification(true);
      }
    } else {
      setAgeVerified(true);
    }
  }, [isAdultContent]);

  function handleAgeVerified() {
    setAgeVerified(true);
    setShowAgeVerification(false);
  }

  function handleCancel() {
    setShowAgeVerification(false);
    // Opcional: redirigir a la página principal
    window.history.back();
  }

  if (isAdultContent && !ageVerified) {
    return (
      <>
        {showAgeVerification && (
          <AgeVerification
            onVerified={handleAgeVerified}
            onCancel={handleCancel}
            departmentName={departmentName}
          />
        )}
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔞</span>
            </div>
            <h2 className="text-xl font-bold mb-2">Contenido Restringido</h2>
            <p className="text-muted-foreground">
              Este departamento requiere verificación de edad
            </p>
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
}
