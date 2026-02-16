import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import StandardHeader from './StandardHeader';

/**
 * BarradeEncabezado_1 - Componente de encabezado estandarizado
 * Compatible con el sistema de Pre-Armados
 * 
 * @param {string} OpMenúPrincipalDasboard - Título principal del menú (ej: "Marketing")
 * @param {string} OpdelMenu - Nombre del módulo actual (ej: "CRM")
 * @param {string} OpDepartamentos - Departamento (opcional)
 * @param {string} Categoria - Categoría (opcional)
 * @param {string} rutaPrincipal - Ruta principal para navegación (opcional)
 */
const BarradeEncabezado_1 = ({
  OpMenúPrincipalDasboard = '',
  OpdelMenu = '',
  OpDepartamentos = '',
  Categoria = '',
  rutaPrincipal = '/admin-dashboard',
}) => {
  const navigate = useNavigate();

  // Construir el título completo
  const title = OpdelMenu || OpMenúPrincipalDasboard || 'Dashboard';
  
  // Construir el subtítulo con breadcrumbs
  const subtitleParts = [];
  if (OpMenúPrincipalDasboard && OpdelMenu && OpMenúPrincipalDasboard !== OpdelMenu) {
    subtitleParts.push(OpMenúPrincipalDasboard);
  }
  if (OpDepartamentos) {
    subtitleParts.push(OpDepartamentos);
  }
  if (Categoria) {
    subtitleParts.push(Categoria);
  }
  const subtitle = subtitleParts.length > 0 ? subtitleParts.join(' > ') : undefined;

  // Determinar el nivel basado en la profundidad
  let level = 1;
  if (OpMenúPrincipalDasboard && OpdelMenu) level = 2;
  if (OpDepartamentos) level = 3;
  if (Categoria) level = 4;

  // Icono basado en el módulo
  const getIcon = () => {
    const iconSize = 40;
    const iconColor = 'white';
    
    // Mapeo de módulos a iconos (puedes expandir esto)
    const moduleIcons = {
      'CRM': '👥',
      'Mailing': '📧',
      'Marketing': '📊',
      'Wheel': '🎡',
      'Coupons': '🎫',
      'Social': '📱',
    };

    const emoji = moduleIcons[OpdelMenu] || moduleIcons[OpMenúPrincipalDasboard] || '📋';
    
    return (
      <div style={{ fontSize: iconSize, lineHeight: 1 }}>
        {emoji}
      </div>
    );
  };

  return (
    <StandardHeader
      title={title}
      subtitle={subtitle}
      icon={getIcon()}
      level={level}
    />
  );
};

export default BarradeEncabezado_1;
