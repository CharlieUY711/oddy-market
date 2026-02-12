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
import './styles/global.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <AppProvider>
            <Router>
              <div className="app">
                <ToastContainer />
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/test" element={<Test />} />
                            <Route path="/second-hand" element={<SecondHand />} />
                            <Route path="/admin" element={<Admin />} />
                            <Route path="/about" element={<div className="container"><h1>Nosotros</h1><p>Página en construcción</p></div>} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </Router>
          </AppProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
