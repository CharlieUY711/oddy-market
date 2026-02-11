/**
 * Script para sincronizar valores de Figma con variables CSS
 * 
 * Uso: node scripts/sync-figma.js
 * 
 * Este script lee designs/figma-config.json y actualiza
 * src/styles/variables.css con los valores de Figma
 */

const fs = require('fs');
const path = require('path');

// Leer configuración de Figma
const configPath = path.join(__dirname, '../designs/figma-config.json');
const variablesPath = path.join(__dirname, '../src/styles/variables.css');

try {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  // Generar contenido de variables.css
  let cssContent = `/* Variables de diseño - Sincronizado con Figma */
/* Última actualización: ${new Date().toLocaleString('es-ES')} */

:root {
  /* ===== COLORES ===== */\n`;
  
  // Colores
  Object.entries(config.colors).forEach(([key, value]) => {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    cssContent += `  --color-${cssKey}: ${value};\n`;
  });
  
  cssContent += `\n  /* ===== TIPOGRAFÍA ===== */\n`;
  
  // Familias de fuentes
  Object.entries(config.typography.fontFamilies).forEach(([key, value]) => {
    cssContent += `  --font-family-${key}: ${value};\n`;
  });
  
  cssContent += `\n  /* Tamaños de fuente */\n`;
  Object.entries(config.typography.fontSizes).forEach(([key, value]) => {
    cssContent += `  --font-size-${key}: ${value};\n`;
  });
  
  cssContent += `\n  /* Pesos de fuente */\n`;
  Object.entries(config.typography.fontWeights).forEach(([key, value]) => {
    cssContent += `  --font-weight-${key}: ${value};\n`;
  });
  
  cssContent += `\n  /* Alturas de línea */\n`;
  Object.entries(config.typography.lineHeights).forEach(([key, value]) => {
    cssContent += `  --line-height-${key}: ${value};\n`;
  });
  
  cssContent += `\n  /* ===== ESPACIADO ===== */\n`;
  cssContent += `  --spacing-base: ${config.spacing.base}px;\n`;
  Object.entries(config.spacing.values).forEach(([key, value]) => {
    cssContent += `  --spacing-${key}: ${value}px;\n`;
  });
  
  cssContent += `\n  /* ===== BORDER RADIUS ===== */\n`;
  Object.entries(config.borderRadius).forEach(([key, value]) => {
    const remValue = key === 'full' ? '9999px' : `${value}px`;
    cssContent += `  --border-radius-${key}: ${remValue};\n`;
  });
  
  cssContent += `\n  /* ===== SOMBRAS ===== */\n`;
  Object.entries(config.shadows).forEach(([key, value]) => {
    cssContent += `  --shadow-${key}: ${value};\n`;
  });
  
  cssContent += `\n  /* ===== BREAKPOINTS ===== */\n`;
  Object.entries(config.breakpoints).forEach(([key, value]) => {
    cssContent += `  --breakpoint-${key}: ${value}px;\n`;
  });
  
  cssContent += `}\n`;
  
  // Escribir archivo
  fs.writeFileSync(variablesPath, cssContent, 'utf8');
  
  console.log('✅ Variables CSS actualizadas exitosamente desde Figma!');
  console.log(`📁 Archivo actualizado: ${variablesPath}`);
  console.log(`\n💡 Revisa src/styles/variables.css para ver los cambios`);
  
} catch (error) {
  console.error('❌ Error al sincronizar:', error.message);
  console.error('\n💡 Asegúrate de que:');
  console.error('   1. El archivo designs/figma-config.json existe');
  console.error('   2. El archivo tiene un formato JSON válido');
  console.error('   3. Has actualizado los valores con los de tu Figma');
  process.exit(1);
}
