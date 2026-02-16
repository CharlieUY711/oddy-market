import React from 'react';

const AIToolsWrapper = () => {
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
          <h2 style={{ marginBottom: '1rem', color: '#212121' }}>Herramientas de IA</h2>
          <p style={{ marginBottom: '1.5rem', color: '#757575' }}>
            Las herramientas de inteligencia artificial están en desarrollo. Próximamente podrás usar IA para optimizar descripciones, generar contenido y más.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIToolsWrapper;
