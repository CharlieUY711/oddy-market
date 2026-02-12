@echo off
echo ========================================
echo   ODDY Market API Server
echo ========================================
echo.
echo Iniciando servidor en http://localhost:8000
echo.
echo Presiona Ctrl+C para detener
echo.

cd supabase\functions
deno run --allow-all --watch server/index.tsx
