/**
 * Utilidades para obtener configuración de vistas desde Pre-Armados
 */

/**
 * Obtiene el nivel del menú basado en la ruta actual
 * @param {string} pathname - Ruta actual
 * @returns {number} Nivel del menú (1-5)
 */
export const getMenuLevel = (pathname) => {
  if (!pathname) return 1;
  
  // Contar el número de segmentos después de /admin-dashboard
  const segments = pathname.split('/').filter(segment => segment);
  
  // /admin-dashboard = nivel 1
  // /admin-dashboard/ecommerce = nivel 1
  // /admin-dashboard/modules/articles = nivel 2
  // /admin-dashboard/modules/articles/departments = nivel 3
  // etc.
  
  if (segments.length <= 2) return 1; // Dashboard o sección principal
  if (segments[1] === 'modules') {
    // Contar niveles adicionales después de /modules
    const moduleSegments = segments.slice(2);
    return Math.min(moduleSegments.length + 1, 5);
  }
  
  return 1;
};

/**
 * Obtiene variables contextuales desde localStorage (Pre-Armados)
 * @param {string} pathname - Ruta actual
 * @returns {object} Variables contextuales
 */
export const getContextualVariables = (pathname) => {
  try {
    const preArmados = JSON.parse(localStorage.getItem('preArmados') || '{}');
    
    // Buscar la vista que coincida con la ruta
    const view = findViewByPath(preArmados, pathname);
    
    if (view) {
      return {
        OpMenúPrincipalDasboard: view.OpMenúPrincipalDasboard || '',
        OpdelMenu: view.OpdelMenu || '',
        OpDepartamentos: view.OpDepartamentos || '',
        Categoria: view.Categoria || '',
        Subcategoria: view.Subcategoria || ''
      };
    }
    
    // Valores por defecto basados en la ruta
    const segments = pathname.split('/').filter(s => s);
    if (segments[1] === 'ecommerce') {
      return { OpMenúPrincipalDasboard: 'eCommerce', OpdelMenu: 'eCommerce' };
    }
    if (segments[1] === 'marketing') {
      return { OpMenúPrincipalDasboard: 'Marketing', OpdelMenu: 'Marketing' };
    }
    if (segments[1] === 'gestion') {
      return { OpMenúPrincipalDasboard: 'Gestión', OpdelMenu: 'Gestión' };
    }
    if (segments[1] === 'herramientas') {
      return { OpMenúPrincipalDasboard: 'Herramientas', OpdelMenu: 'Herramientas' };
    }
    if (segments[1] === 'sistema') {
      return { OpMenúPrincipalDasboard: 'Sistema', OpdelMenu: 'Sistema' };
    }
    
    return {};
  } catch (error) {
    console.error('Error loading contextual variables:', error);
    return {};
  }
};

/**
 * Busca una vista en Pre-Armados por su ruta
 */
const findViewByPath = (preArmados, pathname) => {
  if (!preArmados || !preArmados.views) return null;
  
  // Normalizar la ruta
  const normalizedPath = pathname.replace(/\/$/, '');
  
  // Buscar coincidencia exacta
  const exactMatch = preArmados.views.find(v => v.ruta === normalizedPath);
  if (exactMatch) return exactMatch;
  
  // Buscar coincidencia parcial (para rutas dinámicas)
  return preArmados.views.find(v => {
    if (!v.ruta) return false;
    const viewPath = v.ruta.replace(/\/$/, '');
    return normalizedPath.startsWith(viewPath);
  });
};

/**
 * Obtiene el tipo de barra de menú desde Pre-Armados
 * @param {string} pathname - Ruta actual
 * @returns {string|null} Tipo de barra de menú
 */
export const getMenuBarType = (pathname) => {
  try {
    const preArmados = JSON.parse(localStorage.getItem('preArmados') || '{}');
    const view = findViewByPath(preArmados, pathname);
    return view?.menuBarType || null;
  } catch (error) {
    console.error('Error loading menu bar type:', error);
    return null;
  }
};

/**
 * Obtiene el contexto completo de la vista desde Pre-Armados
 * @param {string} pathname - Ruta actual
 * @returns {object} Contexto de la vista
 */
export const getViewContext = (pathname) => {
  try {
    const preArmados = JSON.parse(localStorage.getItem('preArmados') || '{}');
    const view = findViewByPath(preArmados, pathname);
    
    if (view) {
      return {
        name: view.name || '',
        tipoVista: view.tipoVista || 'list',
        permisos: view.permisos || 'admin'
      };
    }
    
    return {
      name: '',
      tipoVista: 'list',
      permisos: 'admin'
    };
  } catch (error) {
    console.error('Error loading view context:', error);
    return {
      name: '',
      tipoVista: 'list',
      permisos: 'admin'
    };
  }
};
