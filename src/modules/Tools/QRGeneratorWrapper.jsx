import React from 'react';

// Intentar cargar el componente real de QRGenerator
let QRGenerator;
try {
  const QRModule = require('@erp/qr-barcode/QRGenerator');
  QRGenerator = QRModule.QRGenerator || QRModule.default;
  if (!QRGenerator) {
    throw new Error('QRGenerator no exportado correctamente');
  }
} catch (error) {
  console.warn('⚠️ No se pudo cargar QRGenerator desde @erp/qr-barcode/QRGenerator:', error);
  // Componente fallback mejorado
  QRGenerator = () => (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h2 style={{ marginBottom: '1rem', color: '#212121' }}>Generador de Códigos QR</h2>
      <p style={{ marginBottom: '1rem', color: '#757575' }}>
        El módulo está en desarrollo. Próximamente podrás generar códigos QR y códigos de barras.
      </p>
      <p style={{ color: '#9e9e9e', fontSize: '14px', marginTop: '1rem' }}>
        Nota: El componente requiere dependencias de UI que no están disponibles en este momento.
      </p>
      {error && (
        <p style={{ color: '#f44336', fontSize: '12px', marginTop: '0.5rem' }}>
          Error: {error.message || 'Componente no encontrado'}
        </p>
      )}
    </div>
  );
}

const QRGeneratorWrapper = () => {
  return (
    <div style={{ minHeight: '100vh' }}>
      <QRGenerator />
    </div>
  );
};

export default QRGeneratorWrapper;
