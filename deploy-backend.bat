@echo off
echo ========================================
echo   DEPLOY BACKEND TO DENO DEPLOY
echo ========================================
echo.

cd supabase\functions

echo Deployando backend a Deno Deploy...
deno deploy --project=oddy-backend --entrypoint=server/index.tsx

echo.
echo ========================================
echo   DEPLOY COMPLETADO
echo ========================================
pause
