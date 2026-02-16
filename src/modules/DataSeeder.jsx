import React, { useState } from 'react';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';
import styles from './DataSeeder.module.css';

/**
 * Componente para inicializar datos de prueba en el backend
 * Solo se ejecuta una vez para poblar el sistema
 */
export const DataSeeder = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const API_BASE = import.meta.env.VITE_API_URL + (import.meta.env.VITE_API_PREFIX || '');

  const seedData = async () => {
    setLoading(true);
    setResults([]);

    try {
      // 1. Crear Artículos de Prueba
      const articles = [
        {
          entity_id: 'default',
          basic: {
            name: 'Notebook Lenovo ThinkPad',
            sku: 'NB-LEN-001',
            barcode: '7798001234567',
            price: 45000,
            cost: 38000,
            stock: 15,
            description: 'Notebook profesional Intel i7, 16GB RAM, 512GB SSD',
            category_id: 'cat-tech',
            status: 'active'
          },
          intermediate: {
            variants: [],
            traceability: {
              batch: 'LOTE-2024-001',
              purchase_date: '2024-02-01',
              supplier_id: 'SUP-001'
            },
            mercadolibre: { sync_enabled: true }
          }
        },
        {
          entity_id: 'default',
          basic: {
            name: 'Mouse Logitech MX Master 3',
            sku: 'MOU-LOG-001',
            barcode: '7798001234568',
            price: 8500,
            cost: 6800,
            stock: 45,
            description: 'Mouse ergonómico inalámbrico para profesionales',
            category_id: 'cat-peripherals',
            status: 'active'
          }
        },
        {
          entity_id: 'default',
          basic: {
            name: 'Teclado Mecánico RGB',
            sku: 'KEY-RGB-001',
            barcode: '7798001234569',
            price: 12000,
            cost: 9500,
            stock: 8,
            description: 'Teclado mecánico gaming con iluminación RGB',
            category_id: 'cat-peripherals',
            status: 'active'
          }
        },
        {
          entity_id: 'default',
          basic: {
            name: 'Monitor Samsung 27" 4K',
            sku: 'MON-SAM-001',
            barcode: '7798001234570',
            price: 32000,
            cost: 26000,
            stock: 5,
            description: 'Monitor profesional 27 pulgadas resolución 4K UHD',
            category_id: 'cat-monitors',
            status: 'active'
          }
        },
        {
          entity_id: 'default',
          basic: {
            name: 'Webcam Logitech C920',
            sku: 'WEB-LOG-001',
            barcode: '7798001234571',
            price: 6500,
            cost: 5200,
            stock: 22,
            description: 'Webcam HD 1080p para videoconferencias',
            category_id: 'cat-peripherals',
            status: 'active'
          }
        }
      ];

      for (const article of articles) {
        try {
          const response = await fetch(`${API_BASE}/articles?entity_id=default`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(article)
          });
          const data = await response.json();
          if (data.article) {
            setResults(prev => [...prev, { type: 'success', message: `✅ Artículo creado: ${article.basic.name}` }]);
          } else {
            setResults(prev => [...prev, { type: 'error', message: `❌ Error: ${article.basic.name}` }]);
          }
        } catch (error) {
          setResults(prev => [...prev, { type: 'error', message: `❌ Error: ${article.basic.name}` }]);
        }
      }

      // 2. Crear Pedidos de Prueba
      const orders = [
        {
          entity_id: 'default',
          customer: {
            email: 'juan.perez@example.com',
            name: 'Juan Pérez'
          },
          items: [
            { product_id: 'art-001', name: 'Notebook Lenovo', quantity: 1, price: 45000 }
          ],
          totals: {
            subtotal: 45000,
            tax: 9450,
            shipping: 0,
            discount: 0,
            grand_total: 54450
          },
          status: 'pending',
          tracking_number: 'ODY' + Math.random().toString(36).substring(2, 11).toUpperCase()
        },
        {
          entity_id: 'default',
          customer: {
            email: 'maria.gonzalez@example.com',
            name: 'María González'
          },
          items: [
            { product_id: 'art-002', name: 'Mouse Logitech', quantity: 2, price: 8500 }
          ],
          totals: {
            subtotal: 17000,
            tax: 3570,
            shipping: 500,
            discount: 0,
            grand_total: 21070
          },
          status: 'processing',
          tracking_number: 'ODY' + Math.random().toString(36).substring(2, 11).toUpperCase()
        },
        {
          entity_id: 'default',
          customer: {
            email: 'carlos.rodriguez@example.com',
            name: 'Carlos Rodríguez'
          },
          items: [
            { product_id: 'art-004', name: 'Monitor Samsung', quantity: 1, price: 32000 }
          ],
          totals: {
            subtotal: 32000,
            tax: 6720,
            shipping: 800,
            discount: 1600,
            grand_total: 37920
          },
          status: 'delivered',
          tracking_number: 'ODY' + Math.random().toString(36).substring(2, 11).toUpperCase()
        }
      ];

      for (const order of orders) {
        try {
          const response = await fetch(`${API_BASE}/orders?entity_id=default`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
          });
          const data = await response.json();
          if (data.order) {
            setResults(prev => [...prev, { type: 'success', message: `✅ Pedido creado: ${order.customer.name}` }]);
          } else {
            setResults(prev => [...prev, { type: 'error', message: `❌ Error: Pedido ${order.customer.name}` }]);
          }
        } catch (error) {
          setResults(prev => [...prev, { type: 'error', message: `❌ Error: Pedido ${order.customer.name}` }]);
        }
      }

      // 3. Crear Leads CRM
      const leads = [
        {
          entity_id: 'default',
          name: 'Ana Martínez',
          email: 'ana.martinez@empresa.com',
          phone: '+598 99 123 456',
          stage: 'lead',
          deal_value: 75000,
          source: 'website'
        },
        {
          entity_id: 'default',
          name: 'Roberto Silva',
          email: 'roberto.silva@tech.com',
          phone: '+598 99 234 567',
          stage: 'qualified',
          deal_value: 120000,
          source: 'referral'
        },
        {
          entity_id: 'default',
          name: 'Laura Fernández',
          email: 'laura.fernandez@startup.uy',
          phone: '+598 99 345 678',
          stage: 'proposal',
          deal_value: 250000,
          source: 'linkedin'
        },
        {
          entity_id: 'default',
          name: 'Diego Costa',
          email: 'diego.costa@corp.com',
          phone: '+598 99 456 789',
          stage: 'won',
          deal_value: 180000,
          source: 'event'
        }
      ];

      for (const lead of leads) {
        try {
          const response = await fetch(`${API_BASE}/crm/leads?entity_id=default`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lead)
          });
          const data = await response.json();
          if (data.lead) {
            setResults(prev => [...prev, { type: 'success', message: `✅ Lead CRM creado: ${lead.name}` }]);
          } else {
            setResults(prev => [...prev, { type: 'error', message: `❌ Error: Lead ${lead.name}` }]);
          }
        } catch (error) {
          setResults(prev => [...prev, { type: 'error', message: `❌ Error: Lead ${lead.name}` }]);
        }
      }

      // 4. Crear Inventario
      const inventoryItems = [
        {
          entity_id: 'default',
          product_id: 'art-001',
          product_name: 'Notebook Lenovo ThinkPad',
          current_stock: 15,
          min_stock: 5,
          max_stock: 50,
          warehouse: 'Almacén Principal'
        },
        {
          entity_id: 'default',
          product_id: 'art-002',
          product_name: 'Mouse Logitech MX Master 3',
          current_stock: 45,
          min_stock: 20,
          max_stock: 100,
          warehouse: 'Almacén Principal'
        },
        {
          entity_id: 'default',
          product_id: 'art-003',
          product_name: 'Teclado Mecánico RGB',
          current_stock: 8,
          min_stock: 10,
          max_stock: 40,
          warehouse: 'Almacén Principal'
        }
      ];

      for (const item of inventoryItems) {
        try {
          const response = await fetch(`${API_BASE}/inventory/stock?entity_id=default`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
          });
          const data = await response.json();
          if (data.stock) {
            setResults(prev => [...prev, { type: 'success', message: `✅ Inventario: ${item.product_name}` }]);
          } else {
            setResults(prev => [...prev, { type: 'error', message: `❌ Error: Inv ${item.product_name}` }]);
          }
        } catch (error) {
          setResults(prev => [...prev, { type: 'error', message: `❌ Error: Inv ${item.product_name}` }]);
        }
      }

      setResults(prev => [...prev, { type: 'success', message: '🎉 ¡Datos de prueba creados exitosamente!' }]);

    } catch (error) {
      console.error('Error seeding data:', error);
      setResults(prev => [...prev, { type: 'error', message: '❌ Error general al crear datos' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>🌱 Inicializar Datos de Prueba</h2>
        <p className={styles.description}>
          Crea datos de ejemplo para probar todos los módulos del sistema.
          Esto incluye: Artículos, Pedidos, Leads CRM, e Inventario.
        </p>

        <button 
          className={styles.btnPrimary}
          onClick={seedData}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader className={styles.spin} size={20} />
              Creando datos...
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              Inicializar Sistema
            </>
          )}
        </button>

        {results.length > 0 && (
          <div className={styles.results}>
            <h3>Resultados:</h3>
            <div className={styles.resultsList}>
              {results.map((result, index) => (
                <div 
                  key={index} 
                  className={`${styles.result} ${styles[result.type]}`}
                >
                  {result.type === 'success' ? (
                    <CheckCircle size={16} />
                  ) : (
                    <AlertCircle size={16} />
                  )}
                  <span>{result.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
