import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer } from './components/ToastContainer';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Login } from './pages/Login';
import { Test } from './pages/Test';
import { SecondHand } from './pages/SecondHand';
import { Admin } from './pages/Admin';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminDashboardLayout } from './pages/AdminDashboard/AdminDashboardLayout';
import { ECommerce } from './pages/AdminDashboard/sections/ECommerce';
import { Marketing } from './pages/AdminDashboard/sections/Marketing';
import { Herramientas } from './pages/AdminDashboard/sections/Herramientas';
import { Gestion } from './pages/AdminDashboard/sections/Gestion';
import { Sistema } from './pages/AdminDashboard/sections/Sistema';
import { ProtectedRoute } from './components/ProtectedRoute';
// Módulos
import { ArticlesList, ArticleForm } from './pages/AdminDashboard/modules/Articles';
import { OrdersList } from './pages/AdminDashboard/modules/Orders';
import { InventoryList } from './pages/AdminDashboard/modules/Inventory';
import { CRMList } from './pages/AdminDashboard/modules/CRM';
import { DepartmentsList } from './pages/AdminDashboard/modules/Departments';
import { GraphicsDefinitionsList, GraphicsPreview } from './pages/AdminDashboard/modules/GraphicsDefinitions';
import { 
  LibraryModule,
  ShippingModule,
  MailingModule,
  SocialModule,
  WheelModule,
  CouponsModule,
  BillingModule,
  UsersModule,
  AuditModule,
  AnalyticsModule,
  IntegrationsModule,
  DocumentsModule,
  ERPModule,
  PurchaseModule
} from './pages/AdminDashboard/modules/GenericModule';
import { DataSeeder } from './pages/AdminDashboard/modules/DataSeeder';
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
                {/* Admin Dashboard - Sin Header/Footer - Protegido */}
                <Route path="/admin-dashboard" element={
                  <ProtectedRoute>
                    <AdminDashboardLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="ecommerce" element={<ECommerce />} />
                  <Route path="marketing" element={<Marketing />} />
                  <Route path="herramientas" element={<Herramientas />} />
                  <Route path="gestion" element={<Gestion />} />
                  <Route path="sistema" element={<Sistema />} />
                  
                  {/* Módulos Funcionales */}
                  <Route path="modules/articles" element={<ArticlesList />} />
                  <Route path="modules/articles/new" element={<ArticleForm />} />
                  <Route path="modules/articles/:id/edit" element={<ArticleForm />} />
                  <Route path="modules/orders" element={<OrdersList />} />
                  <Route path="modules/inventory" element={<InventoryList />} />
                  <Route path="modules/crm" element={<CRMList />} />
                  <Route path="modules/library" element={<LibraryModule />} />
                  <Route path="modules/shipping" element={<ShippingModule />} />
                  <Route path="modules/mailing" element={<MailingModule />} />
                  <Route path="modules/social" element={<SocialModule />} />
                  <Route path="modules/wheel" element={<WheelModule />} />
                  <Route path="modules/coupons" element={<CouponsModule />} />
                  <Route path="modules/billing" element={<BillingModule />} />
                  <Route path="modules/users" element={<UsersModule />} />
                  <Route path="modules/audit" element={<AuditModule />} />
                  <Route path="modules/analytics" element={<AnalyticsModule />} />
                  <Route path="modules/integrations" element={<IntegrationsModule />} />
                  <Route path="modules/documents" element={<DocumentsModule />} />
                  <Route path="modules/erp" element={<ERPModule />} />
                  <Route path="modules/purchase" element={<PurchaseModule />} />
                  <Route path="modules/departments" element={<DepartmentsList />} />
                  <Route path="modules/graphics" element={<GraphicsDefinitionsList />} />
                  <Route path="modules/graphics/preview/:gridId" element={<GraphicsPreview />} />
                  
                  {/* Data Seeder - Inicializar datos de prueba */}
                  <Route path="seed-data" element={<DataSeeder />} />
                </Route>

                {/* Frontend - Con Header/Footer */}
                <Route path="/*" element={
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
                        <Route path="/test" element={<Test />} />
                        <Route path="/second-hand" element={<SecondHand />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/about" element={<div className="container"><h1>Nosotros</h1><p>Página en construcción</p></div>} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                } />
              </Routes>
            </Router>
          </AppProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
