// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer } from './components/ToastContainer';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Frontend pages (mantengo las básicas)
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';

// Admin Dashboard (layout + secciones mínimas)
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminDashboardLayout } from './pages/AdminDashboard/AdminDashboardLayout';
import { ECommerce } from './pages/AdminDashboard/sections/ECommerce';

// Módulos presentes en tu carpeta src/modules (según la captura)
import { ArticlesList, ArticleForm } from '@modules/Articles';
import { OrdersList } from '@modules/Orders';
import { InventoryList } from '@modules/Inventory';
import { CRMList } from '@modules/CRM';
import { DepartmentsList } from '@modules/Departments';
import { GraphicsDefinitionsList, GraphicsPreview } from '@modules/GraphicsDefinitions';
import { LibraryModule } from '@modules/Library';
import { MailingModule } from '@modules/Mailing';
import { WheelList } from '@modules/Wheel';
import { SocialMigrationWrapper } from '@modules/SocialMigration';
import { DataSeeder } from '@modules/DataSeeder';

// Audit (wrappers si existen)
import { AuditLogsWrapper } from '@modules/Audit/AuditLogsWrapper';
import { SystemAuditWrapper } from '@modules/Audit/SystemAuditWrapper';

// Tools (wrappers mínimos si existen)
import {
  ImageEditorWrapper,
  PrintModuleWrapper,
  QRGeneratorWrapper,
  AIToolsWrapper
} from '@modules/Tools';

import './styles/global.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <AppProvider>
            <Router>
              <ToastContainer />

              <Routes>
                {/* Admin Dashboard */}
                <Route
                  path="/admin-dashboard"
                  element={
                    <ProtectedRoute>
                      <AdminDashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="ecommerce" element={<ECommerce />} />

                  {/* Módulos disponibles según carpeta */}
                  <Route path="modules/articles" element={<ArticlesList />} />
                  <Route path="modules/articles/new" element={<ArticleForm />} />
                  <Route path="modules/articles/:id/edit" element={<ArticleForm />} />

                  <Route path="modules/orders" element={<OrdersList />} />
                  <Route path="modules/inventory" element={<InventoryList />} />
                  <Route path="modules/crm" element={<CRMList />} />
                  <Route path="modules/library" element={<LibraryModule />} />
                  <Route path="modules/mailing" element={<MailingModule />} />
                  <Route path="modules/wheel" element={<WheelList />} />
                  <Route path="modules/departments" element={<DepartmentsList />} />
                  <Route path="modules/graphics" element={<GraphicsDefinitionsList />} />
                  <Route path="modules/graphics/preview/:gridId" element={<GraphicsPreview />} />

                  {/* Tools (placeholders si existen) */}
                  <Route path="modules/editor" element={<ImageEditorWrapper />} />
                  <Route path="modules/printing" element={<PrintModuleWrapper />} />
                  <Route path="modules/qr" element={<QRGeneratorWrapper />} />
                  <Route path="modules/ai" element={<AIToolsWrapper />} />

                  {/* Audit */}
                  <Route path="modules/logs" element={<AuditLogsWrapper />} />
                  <Route path="modules/system-audit" element={<SystemAuditWrapper />} />

                  {/* Migration */}
                  <Route path="modules/social-migration" element={<SocialMigrationWrapper />} />

                  {/* Seeder */}
                  <Route path="seed-data" element={<DataSeeder />} />
                </Route>

                {/* Frontend público */}
                <Route
                  path="/*"
                  element={
                    <div className="app">
                      <Header />
                      <main>
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/products" element={<Products />} />
                          <Route path="/products/:id" element={<ProductDetail />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/checkout" element={<Checkout />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/profile" element={<Profile />} />
                        </Routes>
                      </main>
                      <Footer />
                    </div>
                  }
                />
              </Routes>
            </Router>
          </AppProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;