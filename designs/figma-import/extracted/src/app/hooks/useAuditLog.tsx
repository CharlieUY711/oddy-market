import { useCallback } from "react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

export interface LogParams {
  category: "access" | "error" | "transaction" | "auth" | "inventory" | "admin" | "user_profile" | "order_status" | "system" | "integration";
  severity: "info" | "warning" | "error" | "critical";
  action: string;
  details?: any;
}

export function useAuditLog(session?: any) {
  const log = useCallback(async (params: LogParams) => {
    try {
      const userAgent = navigator.userAgent;
      const timestamp = new Date().toISOString();

      // Prepare log data
      const logData = {
        ...params,
        userId: session?.user?.id,
        user: session?.user?.email || "Anonymous",
        userAgent,
        timestamp,
      };

      // Send to backend (fire and forget)
      fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/audit/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
        },
        body: JSON.stringify(logData),
      }).catch((error) => {
        console.error("Failed to send audit log:", error);
      });
    } catch (error) {
      console.error("Error creating audit log:", error);
    }
  }, [session]);

  return { log };
}

// Convenience functions
export function useAuditLogger(session?: any) {
  const { log } = useAuditLog(session);

  return {
    logAccess: (action: string, details?: any) => 
      log({ category: "access", severity: "info", action, details }),
    
    logError: (action: string, details?: any) => 
      log({ category: "error", severity: "error", action, details }),
    
    logTransaction: (action: string, details?: any) => 
      log({ category: "transaction", severity: "info", action, details }),
    
    logAuth: (action: string, success: boolean, details?: any) => 
      log({ 
        category: "auth", 
        severity: success ? "info" : "warning", 
        action, 
        details 
      }),
    
    logInventory: (action: string, details?: any) => 
      log({ category: "inventory", severity: "info", action, details }),
    
    logAdmin: (action: string, details?: any) => 
      log({ category: "admin", severity: "info", action, details }),
    
    logUserProfile: (action: string, details?: any) => 
      log({ category: "user_profile", severity: "info", action, details }),
    
    logOrderStatus: (action: string, details?: any) => 
      log({ category: "order_status", severity: "info", action, details }),
    
    logSystem: (action: string, severity: "info" | "warning" | "error" | "critical", details?: any) => 
      log({ category: "system", severity, action, details }),
    
    logIntegration: (action: string, success: boolean, details?: any) => 
      log({ 
        category: "integration", 
        severity: success ? "info" : "error", 
        action, 
        details 
      }),
  };
}
