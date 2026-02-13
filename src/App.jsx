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
