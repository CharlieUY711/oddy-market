import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Loading } from '../../components/Loading';
import styles from './Login.module.css';

export const Login = () => {
  const navigate = useNavigate();
  const { login, register, loading } = useAuth();
  const { success, error } = useNotifications();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        success('¡Bienvenido de nuevo!');
        navigate('/admin-dashboard'); // Redirigir directamente al Dashboard
      } else {
        error(result.error || 'Error al iniciar sesión');
      }
    } else {
      if (!formData.name) {
        error('Por favor ingresa tu nombre');
        return;
      }
      const result = await register(formData.email, formData.password, formData.name);
      if (result.success) {
        success('¡Cuenta creada exitosamente!');
        navigate('/admin-dashboard'); // Redirigir directamente al Dashboard
      } else {
        error(result.error || 'Error al crear la cuenta');
      }
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardHeader>
          <CardTitle>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className={styles.form}>
            {!isLogin && (
              <div className={styles.formGroup}>
                <label htmlFor="name">Nombre</label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required={!isLogin}
                  placeholder="Tu nombre completo"
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="tu@email.com"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Contraseña</label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? <Loading size="sm" /> : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </Button>
          </form>

          <div className={styles.switch}>
            <p>
              {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className={styles.switchButton}
              >
                {isLogin ? 'Crear cuenta' : 'Iniciar sesión'}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
