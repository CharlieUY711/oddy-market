#!/bin/bash

# 🚀 Script de inicio automático para ODDY Market
# Ejecuta este script para levantar el proyecto automáticamente

echo "╔══════════════════════════════════════════════════════╗"
echo "║                                                      ║"
echo "║  🛍️  ODDY Market - E-commerce                       ║"
echo "║  🚀 Script de Inicio Automático                     ║"
echo "║                                                      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null
then
    echo "❌ Error: Node.js no está instalado"
    echo "📥 Por favor instala Node.js desde: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js detectado: $(node --version)"

# Verificar si pnpm está instalado
if ! command -v pnpm &> /dev/null
then
    echo "⚠️  pnpm no está instalado"
    echo "📥 Instalando pnpm globalmente..."
    npm install -g pnpm
    if [ $? -eq 0 ]; then
        echo "✅ pnpm instalado correctamente"
    else
        echo "❌ Error al instalar pnpm"
        exit 1
    fi
else
    echo "✅ pnpm detectado: $(pnpm --version)"
fi

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Instalando dependencias..."
    echo "⏳ Esto puede tardar 2-5 minutos la primera vez..."
    echo ""
    pnpm install
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Dependencias instaladas correctamente"
    else
        echo "❌ Error al instalar dependencias"
        exit 1
    fi
else
    echo "✅ Dependencias ya instaladas"
fi

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║                                                      ║"
echo "║  🚀 Iniciando ODDY Market...                        ║"
echo "║                                                      ║"
echo "║  📍 URL: http://localhost:5173                      ║"
echo "║                                                      ║"
echo "║  💡 Tip: Presiona Ctrl+C para detener              ║"
echo "║                                                      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Iniciar el servidor
pnpm run dev
