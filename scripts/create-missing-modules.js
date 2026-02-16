/*
 scripts/create-missing-modules.js
 Crea solo los módulos faltantes referenciados con @modules/... en src.
 Guardar en: C:\ODDY_Market\scripts\create-missing-modules.js
*/
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');
const MODULES_DIR = path.join(SRC_DIR, 'modules');

function importsFromDir(dir) {
  const results = new Set();
  const items = fs.readdirSync(dir, { withFileTypes: true });
  items.forEach(item => {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      importsFromDir(full).forEach(i => results.add(i));
    } else if (item.isFile() && /\.(jsx|js|tsx|ts)$/.test(item.name)) {
      const content = fs.readFileSync(full, 'utf8');
      const re = /@modules\/([A-Za-z0-9_\\-\\/]+)/g;
      let m;
      while ((m = re.exec(content)) !== null) {
        const mod = m[1].split('/')[0];
        results.add(mod);
      }
    }
  });
  return results;
}

function ensureModulePlaceholder(modName) {
  const modDir = path.join(MODULES_DIR, modName);
  const indexFile = path.join(modDir, 'index.jsx');

  if (!fs.existsSync(modDir)) {
    fs.mkdirSync(modDir, { recursive: true });
    const content = `import React from 'react';

export function ${modName}Module() {
  return (
    <div style={{ padding: '1rem' }}>
      <h2>${modName} Module</h2>
      <p>Placeholder: módulo pendiente de implementación.</p>
    </div>
  );
}

export default ${modName}Module;
`;
    fs.writeFileSync(indexFile, content, 'utf8');
    console.log('Created placeholder for module:', modName);
  } else if (!fs.existsSync(indexFile)) {
    const content = `import React from 'react';

export function ${modName}Module() {
  return (
    <div style={{ padding: '1rem' }}>
      <h2>${modName} Module</h2>
      <p>Placeholder: módulo pendiente de implementación.</p>
    </div>
  );
}

export default ${modName}Module;
`;
    fs.writeFileSync(indexFile, content, 'utf8');
    console.log('Created index.jsx for existing folder:', modName);
  }
}

function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error('No src directory found. Abort.');
    process.exit(1);
  }
  if (!fs.existsSync(MODULES_DIR)) {
    fs.mkdirSync(MODULES_DIR, { recursive: true });
  }

  const mods = importsFromDir(SRC_DIR);
  if (mods.size === 0) {
    console.log('No @modules imports found.');
    return;
  }

  mods.forEach(mod => ensureModulePlaceholder(mod));
  console.log('Done.');
}

main();
