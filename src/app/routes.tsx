/* =====================================================
   Charlie Marketplace Builder — Router Config (React Router v7)
   ===================================================== */
import { createBrowserRouter } from 'react-router';
import MensajePage             from './public/MensajePage';
import AdminDashboard          from './AdminDashboard';
import OddyStorefront          from './public/OddyStorefront';
import { ProtectedRoute }      from './components/auth/ProtectedRoute';

export const router = createBrowserRouter([
  /* ── Raíz — Frontstore (público) ───────────── */
  {
    path: '/',
    Component: OddyStorefront,
  },

  /* ── Tienda (Storefront) — alias ───────────── */
  {
    path: '/tienda',
    Component: OddyStorefront,
  },

  /* ── Admin — Requiere autenticación ─────────── */
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },

  /* ── Etiqueta Emotiva — pública ─────────────── */
  {
    path: '/m/:token',
    Component: MensajePage,
  },
]);