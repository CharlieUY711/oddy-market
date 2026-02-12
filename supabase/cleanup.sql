-- ========================================
-- LIMPIEZA COMPLETA - Ejecutar PRIMERO
-- ========================================
-- Este script elimina todas las tablas y políticas
-- para poder recrearlas desde cero

-- Eliminar tablas en orden (por las foreign keys)
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.favorites CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;

-- Eliminar función de trigger si existe
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ✅ Listo para ejecutar schema.sql
