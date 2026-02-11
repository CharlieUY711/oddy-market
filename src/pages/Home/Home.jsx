import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import styles from './Home.module.css';

export const Home = () => {
  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Bienvenido a ODDY Market</h1>
        <p className={styles.subtitle}>
          Tu tienda departamental moderna con las mejores ofertas
        </p>
        <div className={styles.actions}>
          <Button variant="primary" size="lg">
            Explorar Productos
          </Button>
          <Button variant="outline" size="lg">
            Ver Ofertas
          </Button>
        </div>
      </section>

      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Características</h2>
        <div className={styles.cardsGrid}>
          <Card>
            <CardHeader>
              <CardTitle>Envío Rápido</CardTitle>
              <CardDescription>
                Recibe tus productos en tiempo récord
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Entrega garantizada en 24-48 horas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pago Seguro</CardTitle>
              <CardDescription>
                Múltiples métodos de pago disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Tarjetas, transferencias y más</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atención 24/7</CardTitle>
              <CardDescription>
                Soporte disponible cuando lo necesites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Estamos aquí para ayudarte</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};
