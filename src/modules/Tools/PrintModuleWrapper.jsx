import React from 'react';

const PrintModuleWrapper = () => {
  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ padding: '2rem' }}>
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: '2rem', 
          backgroundColor: '#f9f9f9', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h2 style={{ marginBottom: '1rem', color: '#212121' }}>Módulo de Impresión</h2>
          <p style={{ marginBottom: '1.5rem', color: '#757575' }}>
            El módulo de impresión está en desarrollo. Próximamente podrás imprimir documentos, etiquetas y códigos de barras.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrintModuleWrapper;
