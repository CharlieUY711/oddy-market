import { toast } from "sonner";

/**
 * Copia texto al portapapeles de forma segura con fallback
 * para navegadores que bloquean el Clipboard API
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Intenta usar el Clipboard API moderno
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback: método tradicional usando textarea
    return fallbackCopyToClipboard(text);
  } catch (error) {
    // Solo loguear en desarrollo para evitar spam en consola
    if (import.meta.env.DEV) {
      console.debug("Usando método fallback para copiar al portapapeles");
    }
    return fallbackCopyToClipboard(text);
  }
}

/**
 * Método fallback para copiar al portapapeles
 * usando un textarea temporal
 */
function fallbackCopyToClipboard(text: string): boolean {
  try {
    // Crear textarea temporal
    const textarea = document.createElement("textarea");
    textarea.value = text;
    
    // Hacer el textarea invisible pero accesible
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.width = "2em";
    textarea.style.height = "2em";
    textarea.style.padding = "0";
    textarea.style.border = "none";
    textarea.style.outline = "none";
    textarea.style.boxShadow = "none";
    textarea.style.background = "transparent";
    textarea.style.opacity = "0";
    
    // Agregar al DOM
    document.body.appendChild(textarea);
    
    // Seleccionar el texto
    textarea.focus();
    textarea.select();
    
    // Para iOS
    textarea.setSelectionRange(0, text.length);
    
    // Ejecutar comando de copiar
    const success = document.execCommand("copy");
    
    // Limpiar
    document.body.removeChild(textarea);
    
    return success;
  } catch (error) {
    console.error("Error en fallback de clipboard:", error);
    return false;
  }
}

/**
 * Hook para copiar al portapapeles con toast automático
 */
export async function copyToClipboardWithToast(
  text: string,
  successMessage: string = "Copiado al portapapeles",
  errorMessage: string = "No se pudo copiar"
): Promise<void> {
  const success = await copyToClipboard(text);
  
  if (success) {
    toast.success(successMessage);
  } else {
    toast.error(errorMessage);
  }
}
