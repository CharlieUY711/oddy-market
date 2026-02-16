import React from 'react';
import StandardHeader from '@components/StandardHeader';
import styles from '../SharedModule.module.css';

// Importar el componente real de SystemAudit
let SystemAudit;
try {
  SystemAudit = require('SystemAudit').default;
} catch (error) {
  console.warn('⚠️ No se pudo cargar SystemAudit desde @erp/SystemAudit:', error);
  // Componente fallback
  SystemAudit = () => (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Auditoría del Sistema</h2>
      <p>El módulo no está disponible en este momento.</p>
      <p style={{ fontSize: '14px', color: '#757575', marginTop: '1rem' }}>
        Error al cargar: {error?.message || 'Componente no encontrado'}
      </p>
    </div>
  );
}

/**
 * Wrapper para el módulo de Auditoría del Sistema
 */
export const SystemAuditWrapper = () => {
  return (
    <div className={styles.container}>
      <StandardHeader
        title="Auditoría del Sistema"
        subtitle="Análisis y evaluación del sistema"
        level={2}
      />
      <div style={{ padding: '1.5rem' }}>
        <SystemAudit />
      </div>
    </div>
  );
};
