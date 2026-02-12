@echo off
REM Script de inicio automático para Windows - ODDY Market

echo ================================================================
echo.
echo   ODDY Market - E-commerce
echo   Script de Inicio Automatico
echo.
echo ================================================================
echo.

REM Verificar si Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Error: Node.js no esta instalado
    echo [i] Por favor instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js detectado
node --version

REM Verificar si pnpm está instalado
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] pnpm no esta instalado
    echo [i] Instalando pnpm globalmente...
    call npm install -g pnpm
    if %errorlevel% neq 0 (
        echo [X] Error al instalar pnpm
        pause
        exit /b 1
    )
    echo [OK] pnpm instalado correctamente
) else (
    echo [OK] pnpm detectado
    pnpm --version
)

REM Verificar si node_modules existe
if not exist "node_modules\" (
    echo.
    echo [i] Instalando dependencias...
    echo [i] Esto puede tardar 2-5 minutos la primera vez...
    echo.
    call pnpm install
    if %errorlevel% neq 0 (
        echo [X] Error al instalar dependencias
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencias instaladas correctamente
) else (
    echo [OK] Dependencias ya instaladas
)

echo.
echo ================================================================
echo.
echo   Iniciando ODDY Market...
echo.
echo   URL: http://localhost:5173
echo.
echo   Tip: Presiona Ctrl+C para detener
echo.
echo ================================================================
echo.

REM Iniciar el servidor
call pnpm run dev
