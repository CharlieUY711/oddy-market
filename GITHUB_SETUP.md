# 📦 Setup de GitHub - ODDY Market

## Opción A: Crear Repositorio desde GitHub.com

### 1. Crear el Repositorio

1. Ve a: https://github.com/new
2. **Repository name:** `oddy-market`
3. **Description:** "E-commerce moderno con React, Vite y Supabase"
4. **Visibility:** Private o Public (tu elección)
5. ❌ **NO marques** "Add a README file"
6. ❌ **NO agregues** .gitignore ni license
7. Click en **"Create repository"**

---

### 2. Conectar tu Proyecto Local

Copia estos comandos y ejecútalos en tu terminal:

```bash
# Reemplaza TU-USUARIO con tu usuario de GitHub
git remote add origin https://github.com/TU-USUARIO/oddy-market.git
git branch -M main
git push -u origin main
```

---

## Opción B: Crear Repositorio desde GitHub Desktop

### 1. Instalar GitHub Desktop

Descarga desde: https://desktop.github.com/

### 2. Publicar el Repositorio

1. Abre GitHub Desktop
2. File → Add Local Repository
3. Selecciona la carpeta `C:\ODDY_Market`
4. Click en "Publish repository"
5. Elige el nombre: `oddy-market`
6. Click en "Publish repository"

---

## Opción C: Usar GitHub CLI

### 1. Instalar GitHub CLI

```bash
winget install GitHub.cli
```

### 2. Autenticarte

```bash
gh auth login
```

### 3. Crear y Publicar el Repo

```bash
gh repo create oddy-market --private --source=. --remote=origin --push
```

---

## ✅ Verificación

Después de crear el repo, verifica que funciona:

```bash
git remote -v
```

Deberías ver:
```
origin  https://github.com/TU-USUARIO/oddy-market.git (fetch)
origin  https://github.com/TU-USUARIO/oddy-market.git (push)
```

---

## 🔄 Subir Cambios (Push)

Una vez configurado, cada vez que hagas cambios:

```bash
git add -A
git commit -m "descripción del cambio"
git push
```

---

## 🆘 Problemas Comunes

### Error: "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/TU-USUARIO/oddy-market.git
```

### Error: Authentication failed

1. Ve a: https://github.com/settings/tokens
2. Generate new token (classic)
3. Dale permisos: repo, workflow
4. Copia el token
5. Úsalo como password cuando hagas push

---

## 📝 Próximo Paso

Una vez que tu código esté en GitHub, continuaremos con:
1. ✅ GitHub configurado
2. 🔄 Conectar con Vercel
3. 🔄 Deploy automático
