import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import styles from './Products.module.css';

export const Products = () => {
  return (
    <div className={styles.products}>
      <h1 className={styles.title}>Productos</h1>
      <p className={styles.subtitle}>Explora nuestro catálogo completo</p>
      
      <div className={styles.grid}>
        <Card>
          <CardHeader>
            <CardTitle>Producto 1</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Descripción del producto...</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Producto 2</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Descripción del producto...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
