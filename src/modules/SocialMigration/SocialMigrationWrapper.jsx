import React from 'react';
import { SocialMediaMigration } from '@components/SocialMediaMigration';
import BarradeEncabezado_1 from '@components/BarradeEncabezado_1';
import { MenuBarRenderer } from '@utils/menuBarHelper';
import { useNavigate } from 'react-router-dom';

export const SocialMigrationWrapper = () => {
  const navigate = useNavigate();

  return (
    <div>
      <BarradeEncabezado_1 />
      <MenuBarRenderer
        onSearchChange={() => {}}
        onBackClick={() => navigate('/admin-dashboard/sistema')}
        rutaPrincipal="/admin-dashboard"
      />
      <div style={{ marginTop: '20px' }}>
        <SocialMediaMigration />
      </div>
    </div>
  );
};
