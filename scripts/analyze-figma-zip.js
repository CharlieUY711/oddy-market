/**
 * Script para analizar un archivo .zip de Figma y extraer valores de diseño
 * 
 * Uso: node scripts/analyze-figma-zip.js [ruta-al-zip]
 * 
 * Este script intenta extraer información de diseño del .zip de Figma
 * y sugiere valores para figma-config.json
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ruta por defecto
const defaultZipPath = path.join(__dirname, '../designs/figma-import/figma-project.zip');
const extractPath = path.join(__dirname, '../designs/figma-import/extracted');

// Obtener ruta del .zip desde argumentos o usar la por defecto
const zipPath = process.argv[2] || defaultZipPath;

console.log('🔍 Analizando archivo de Figma...\n');

// Verificar que el archivo existe
if (!fs.existsSync(zipPath)) {
  console.error('❌ No se encontró el archivo .zip');
  console.error(`   Buscado en: ${zipPath}`);
  console.error('\n💡 Coloca tu archivo .zip en: designs/figma-import/figma-project.zip');
  console.error('   O especifica la ruta: node scripts/analyze-figma-zip.js [ruta]');
  process.exit(1);
}

// Crear carpeta de extracción si no existe
if (!fs.existsSync(extractPath)) {
  fs.mkdirSync(extractPath, { recursive: true });
}

// Intentar extraer (requiere herramienta de extracción)
console.log('📦 Extrayendo archivo...');

try {
  // Intentar con PowerShell (Windows)
  if (process.platform === 'win32') {
    execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${extractPath}' -Force"`, {
      stdio: 'inherit'
    });
  } else {
    // Linux/Mac
    execSync(`unzip -o "${zipPath}" -d "${extractPath}"`, {
      stdio: 'inherit'
    });
  }
  console.log('✅ Archivo extraído\n');
} catch (error) {
  console.error('⚠️  No se pudo extraer automáticamente');
  console.error('   Por favor, extrae el .zip manualmente a: designs/figma-import/extracted/');
  console.error('   Luego revisa los archivos para encontrar valores de diseño\n');
}

// Analizar archivos extraídos
console.log('🔍 Buscando valores de diseño...\n');

const extractedFiles = [];
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });
  return fileList;
}

if (fs.existsSync(extractPath)) {
  const files = findFiles(extractPath);
  
  // Buscar archivos relevantes
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  const cssFiles = files.filter(f => f.endsWith('.css'));
  const imageFiles = files.filter(f => /\.(png|jpg|svg)$/i.test(f));
  
  console.log(`📄 Archivos encontrados:`);
  console.log(`   - JSON: ${jsonFiles.length}`);
  console.log(`   - CSS: ${cssFiles.length}`);
  console.log(`   - Imágenes: ${imageFiles.length}\n`);
  
  // Intentar leer archivos JSON para encontrar valores
  if (jsonFiles.length > 0) {
    console.log('📋 Analizando archivos JSON...\n');
    
    jsonFiles.slice(0, 5).forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const data = JSON.parse(content);
        
        // Buscar colores, fuentes, etc.
        const jsonStr = JSON.stringify(data);
        
        // Buscar patrones de color HEX
        const colorMatches = jsonStr.match(/#[0-9A-Fa-f]{6}/g);
        if (colorMatches && colorMatches.length > 0) {
          const uniqueColors = [...new Set(colorMatches)];
          console.log(`   🎨 Colores encontrados en ${path.basename(file)}:`);
          uniqueColors.slice(0, 10).forEach(color => {
            console.log(`      - ${color}`);
          });
          if (uniqueColors.length > 10) {
            console.log(`      ... y ${uniqueColors.length - 10} más`);
          }
          console.log('');
        }
      } catch (e) {
        // Ignorar errores de parsing
      }
    });
  }
}

console.log('✅ Análisis completado\n');
console.log('📝 Próximos pasos:');
console.log('   1. Revisa los valores encontrados arriba');
console.log('   2. Actualiza designs/figma-config.json con los valores correctos');
console.log('   3. Ejecuta: npm run sync-figma');
console.log('   4. Revisa designs/MY_FIGMA_VALUES.md para documentar cambios\n');

console.log('💡 Tip: Si el .zip no contiene valores de diseño directamente,');
console.log('   extrae manualmente los valores desde Figma usando:');
console.log('   - designs/FIGMA_SYNC_GUIDE.md\n');
