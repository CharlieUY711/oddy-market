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
import { Wheel } from './pages/Wheel';
import { WheelPro } from './pages/WheelPro';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminDashboardLayout } from './pages/AdminDashboard/AdminDashboardLayout';
import { ECommerce } from './pages/AdminDashboard/sections/ECommerce';
import { Marketing } from './pages/AdminDashboard/sections/Marketing';
import { Herramientas } from './pages/AdminDashboard/sections/Herramientas';
import { Gestion } from './pages/AdminDashboard/sections/Gestion';
import { Sistema } from './pages/AdminDashboard/sections/Sistema';
import { PruebasDiseno } from './pages/AdminDashboard/sections/PruebasDiseno';
import { Nuevo1 } from './pages/AdminDashboard/sections/Nuevo1';
import { Nuevo2 } from './pages/AdminDashboard/sections/Nuevo2';
import { ProtectedRoute } from './components/ProtectedRoute';
// Módulos
import { ArticlesList, ArticleForm } from '@modules/Articles';
import { OrdersList } from '@modules/Orders';
import { InventoryList } from '@modules/Inventory';
import { CRMList } from '@modules/CRM';
import { WheelList } from '@modules/Wheel';
import { DepartmentsList } from '@modules/Departments';
import { GraphicsDefinitionsList, GraphicsPreview } from '@modules/GraphicsDefinitions';
import { LibraryModule } from '@modules/Library';
import { 
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
import { AuditLogsWrapper } from '@modules/Audit/AuditLogsWrapper';
import { SystemAuditWrapper } from '@modules/Audit/SystemAuditWrapper';
import { SocialMigrationWrapper } from '@modules/SocialMigration';
import { 
  ImageEditorWrapper, 
  PrintModuleWrapper, 
  QRGeneratorWrapper, 
  AIToolsWrapper,
 
} from '@modules/Tools';
import { DataSeeder } from '@modules/DataSeeder';
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
                  <Route path="pruebas-diseno" element={<PruebasDiseno />} />
                  <Route path="nuevo-1" element={<Nuevo1 />} />
                  <Route path="nuevo-2" element={<Nuevo2 />} />
                  
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
                  <Route path="modules/wheel" element={<WheelList />} />
                  <Route path="modules/coupons" element={<CouponsModule />} />
                  <Route path="modules/billing" element={<BillingModule />} />
                  <Route path="modules/users" element={<UsersModule />} />
                  <Route path="modules/audit" element={<AuditModule />} />
                  <Route path="modules/analytics" element={<AnalyticsModule />} />
                  <Route path="modules/integrations" element={<IntegrationsModule />} />
                  <Route path="modules/documents" element={<DocumentsModule />} />
                  <Route path="modules/departments" element={<DepartmentsList />} />
                  <Route path="modules/graphics" element={<GraphicsDefinitionsList />} />
                  <Route path="modules/graphics/preview/:gridId" element={<GraphicsPreview />} />
                  
                  {/* Módulos de Herramientas */}
                  <Route path="modules/editor" element={<ImageEditorWrapper />} />
                  <Route path="modules/printing" element={<PrintModuleWrapper />} />
                  <Route path="modules/qr" element={<QRGeneratorWrapper />} />
                  <Route path="modules/ai" element={<AIToolsWrapper />} />
                  
                  
                  {/* Módulos de Auditoría */}
                  <Route path="modules/logs" element={<AuditLogsWrapper />} />
                  <Route path="modules/system-audit" element={<SystemAuditWrapper />} />
                  
                  {/* Módulos de Migración */}
                  <Route path="modules/social-migration" element={<SocialMigrationWrapper />} />
                  
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
                        <Route path="/wheel" element={<Wheel />} />
                        <Route path="/wheel-pro" element={<WheelPro />} />
                        <Route path="/rueda" element={<Wheel />} />
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
