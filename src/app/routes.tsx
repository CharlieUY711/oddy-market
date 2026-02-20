/* =====================================================
   Charlie Marketplace Builder — Router Config (React Router v7)
   ===================================================== */
import { createBrowserRouter } from 'react-router';
import StorefrontLayout        from './storefront/StorefrontLayout';
import StorefrontHomePage      from './storefront/StorefrontHomePage';
import StorefrontProductPage   from './storefront/StorefrontProductPage';
import StorefrontCartPage      from './storefront/StorefrontCartPage';
import StorefrontCheckoutPage  from './storefront/StorefrontCheckoutPage';
import StorefrontSecondHandPage from './storefront/StorefrontSecondHandPage';
import StorefrontPublishPage   from './storefront/StorefrontPublishPage';
import StorefrontAccountPage   from './storefront/StorefrontAccountPage';
import MensajePage             from './storefront/MensajePage';
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

  /* ── Storefront ─────────────────────────────── */
  {
    path: '/',
    Component: StorefrontLayout,
    children: [
      { index: true,                    Component: StorefrontHomePage },
      { path: 'product/:id',            Component: StorefrontProductPage },
      { path: 'cart',                   Component: StorefrontCartPage },
      { path: 'checkout',               Component: StorefrontCheckoutPage },
      { path: 'secondhand',             Component: StorefrontSecondHandPage },
      { path: 'secondhand/publish',     Component: StorefrontPublishPage },
      { path: 'account',               Component: StorefrontAccountPage },
    ],
  },
]);