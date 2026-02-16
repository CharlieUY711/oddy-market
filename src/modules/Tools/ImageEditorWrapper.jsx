import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ImageEditor } from '@components/image-editor';

const ImageEditorWrapper = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  const handleClose = () => {
    // Navegación manejada por el componente ImageEditor si es necesario
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ padding: '2rem' }}>
        <ImageEditor 
          projectId={projectId || undefined}
          onClose={handleClose}
        />
      </div>
    </div>
  );
};

export default ImageEditorWrapper;
