import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DollarSign } from 'lucide-react';
import StandardHeader from '@components/StandardHeader';
import { getMenuLevel, getContextualVariables } from '@utils/viewConfig';
import styles from '../Articles/Articles.module.css';

export const SalesList = () => {
  const location = useLocation();
  const [menuLevel, setMenuLevel] = useState(2);
  const [contextualVars, setContextualVars] = useState({});

  useEffect(() => {
    const level = getMenuLevel(location.pathname);
    setMenuLevel(level);
    const vars = getContextualVariables(location.pathname);
    setContextualVars(vars);
  }, [location.pathname]);

  const getTitle = () => {
    const baseTitle = "Ventas";
    const parentSection = contextualVars.OpMenúPrincipalDasboard || 'eCommerce';
    return `${parentSection} - ${baseTitle}`;
  };

  const getSubtitle = () => {
    return contextualVars.OpMenúPrincipalDasboard || 'Gestión de ventas';
  };

  return (
    <div className={styles.articlesContainer} style={{ paddingTop: '142px', background: 'transparent' }}>
      <StandardHeader
        title={getTitle()}
        subtitle={getSubtitle()}
        icon={<DollarSign size={40} color="white" />}
        level={menuLevel}
      />
      <div className={styles.gridContainer} style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: '24px', 
        color: '#757575',
        border: '2px dashed #e0e0e0'
      }}>
        Módulo de Ventas Vacío
      </div>
    </div>
  );
};
