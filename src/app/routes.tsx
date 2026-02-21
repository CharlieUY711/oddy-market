/* =====================================================
   Charlie Marketplace Builder — Router Config (React Router v7)
   ===================================================== */
import { createBrowserRouter } from 'react-router';
import MensajePage             from './public/MensajePage';
import AdminDashboard          from './AdminDashboard';

export const router = createBrowserRouter([
  /* ── Admin ─────────────────────────────────── */
  {
    path: '/admin',
    Component: AdminDashboard,
  },

  /* ── Etiqueta Emotiva — pública ─────────────── */
  {
    path: '/m/:token',
    Component: MensajePage,
  },
]);