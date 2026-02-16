import React from 'react';
import { useAuth } from '@context/AuthContext';
import StandardHeader from '@components/StandardHeader';
import styles from '../SharedModule.module.css';

// Importar el componente real de AuditLogs
let AuditLogs;
try {
  const AuditLogsModule = require('@erp/AuditLogs');
  AuditLogs = AuditLogsModule.AuditLogs || AuditLogsModule.default;
} catch (error) {
  console.warn('⚠️ No se pudo cargar AuditLogs desde @erp/AuditLogs:', error);
  // Componente fallback
  AuditLogs = ({ session }) => (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Auditoría y Logs</h2>
      <p>El módulo no está disponible en este momento.</p>
      <p style={{ fontSize: '14px', color: '#757575', marginTop: '1rem' }}>
        Error al cargar: {error?.message || 'Componente no encontrado'}
      </p>
    </div>
  );
}

/**
 * Wrapper para el módulo de Auditoría y Logs
 */
export const AuditLogsWrapper = () => {
  const { session } = useAuth();

  return (
    <div className={styles.container}>
      <StandardHeader
        title="Auditoría y Logs"
        subtitle="Historial de acciones del sistema"
        level={2}
      />
      <div style={{ padding: '1.5rem' }}>
        <AuditLogs session={session} />
      </div>
    </div>
  );
};
