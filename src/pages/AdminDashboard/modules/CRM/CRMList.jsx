import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Target, Users, Calendar, TrendingUp } from 'lucide-react';
import BarradeEncabezado_1 from '../../../../components/BarradeEncabezado_1';
import Toolbar from '../../../../components/Dashboard/Toolbar';
import { MenuBarRenderer } from '../../../../utils/menuBarHelper';
import { getMenuBarType } from '../../../../utils/viewConfig';
import { PipelineBoard } from './PipelineBoard';
import { CustomersManagement } from './CustomersManagement';
import { TasksManagement } from './TasksManagement';
import { SalesAnalytics } from './SalesAnalytics';
import styles from './CRM.module.css';

export const CRMList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('pipeline');
  const [searchTerm, setSearchTerm] = useState('');

  // Obtener configuración de la barra de menú
  const currentPath = location.pathname;
  const menuBarType = getMenuBarType(currentPath);

  const tabs = [
    { id: 'pipeline', label: 'Pipeline de Ventas', icon: Target },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'tasks', label: 'Tareas y Seguimientos', icon: Calendar },
    { id: 'analytics', label: 'Analíticas', icon: TrendingUp },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pipeline':
        return <PipelineBoard searchTerm={searchTerm} />;
      case 'customers':
        return <CustomersManagement searchTerm={searchTerm} />;
      case 'tasks':
        return <TasksManagement searchTerm={searchTerm} />;
      case 'analytics':
        return <SalesAnalytics />;
      default:
        return <PipelineBoard searchTerm={searchTerm} />;
    }
  };

  return (
    <div className={styles.container}>
      {/* HEADER ESTANDARIZADO */}
      <BarradeEncabezado_1
        OpMenúPrincipalDasboard="Marketing"
        OpdelMenu="CRM"
        OpDepartamentos=""
        Categoria=""
        rutaPrincipal="/admin-dashboard/marketing"
      />

      {/* BARRA DE MENÚ - Se muestra si está configurada en Pre-Armados */}
      <MenuBarRenderer
        onSearchChange={setSearchTerm}
        onBackClick={() => navigate('/admin-dashboard/marketing')}
        rutaPrincipal="/admin-dashboard/marketing"
      />

      {/* TOOLBAR ESTANDARIZADA - Solo se muestra si NO hay barra de menú configurada */}
      {!menuBarType && (
        <Toolbar config={{
          showViewToggle: false,
          showSearch: true,
          searchValue: searchTerm,
          onSearchChange: setSearchTerm,
          searchPlaceholder: 'Buscar en CRM...',
          onNew: null,
          onEdit: () => {},
          onToggleSelection: () => {},
          onActions: () => {},
          isSelectionMode: false,
          selectedCount: 0,
          showBack: false
        }} />
      )}

      {/* TABS NAVIGATION */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className={styles.tabContent}>
        {renderTabContent()}
      </div>
    </div>
  );
};
