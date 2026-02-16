import React, { useState, useEffect } from 'react';
import { supabase } from '@utils/supabase';
import { Button } from '@components/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@components/Card';
import styles from './Test.module.css';

export const Test = () => {
  const [status, setStatus] = useState('Verificando...');
  const [tests, setTests] = useState({
    supabaseConnection: '⏳ Pendiente',
    envVariables: '⏳ Pendiente',
    supabaseAuth: '⏳ Pendiente',
  });

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    const newTests = { ...tests };

    // Test 1: Variables de entorno
    try {
      const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
      const hasKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (hasUrl && hasKey) {
        newTests.envVariables = '✅ Configuradas correctamente';
      } else {
        newTests.envVariables = '❌ Faltan variables';
      }
    } catch (error) {
      newTests.envVariables = '❌ Error: ' + error.message;
    }

    // Test 2: Conexión a Supabase
    try {
      if (!supabase) {
        newTests.supabaseConnection = '❌ Cliente no inicializado';
        newTests.supabaseAuth = '⏭️ Omitido';
      } else {
        // Probar conexión simple
        const { data, error } = await supabase.from('_test_').select('*').limit(1);
        
        // Es normal que falle (tabla no existe), pero significa que conectó
        if (error && error.code === '42P01') {
          newTests.supabaseConnection = '✅ Conectado (tabla test no existe - esperado)';
        } else if (error) {
          newTests.supabaseConnection = '⚠️ Conectado pero con error: ' + error.message;
        } else {
          newTests.supabaseConnection = '✅ Conectado correctamente';
        }

        // Test 3: Auth service
        try {
          const { data: { session } } = await supabase.auth.getSession();
          newTests.supabaseAuth = session 
            ? '✅ Usuario autenticado' 
            : '✅ Auth disponible (sin sesión)';
        } catch (authError) {
          newTests.supabaseAuth = '❌ Error: ' + authError.message;
        }
      }
    } catch (error) {
      newTests.supabaseConnection = '❌ Error: ' + error.message;
      newTests.supabaseAuth = '⏭️ Omitido';
    }

    setTests(newTests);
    
    // Determinar estado general
    const allPassed = Object.values(newTests).every(t => t.startsWith('✅'));
    const anyFailed = Object.values(newTests).some(t => t.startsWith('❌'));
    
    if (allPassed) {
      setStatus('✅ Todo funcionando correctamente');
    } else if (anyFailed) {
      setStatus('❌ Algunos tests fallaron');
    } else {
      setStatus('⚠️ Tests completados con advertencias');
    }
  };

  return (
    <div className={styles.test}>
      <div className={styles.container}>
        <h1 className={styles.title}>🧪 Test de Configuración</h1>
        <p className={styles.subtitle}>Verificando conexión con servicios</p>

        <Card className={styles.statusCard}>
          <CardHeader>
            <CardTitle>Estado General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.status}>{status}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultados de Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.tests}>
              <div className={styles.testItem}>
                <span className={styles.testName}>Variables de Entorno:</span>
                <span className={styles.testResult}>{tests.envVariables}</span>
              </div>
              <div className={styles.testItem}>
                <span className={styles.testName}>Conexión Supabase:</span>
                <span className={styles.testResult}>{tests.supabaseConnection}</span>
              </div>
              <div className={styles.testItem}>
                <span className={styles.testName}>Supabase Auth:</span>
                <span className={styles.testResult}>{tests.supabaseAuth}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de Configuración</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.info}>
              <div className={styles.infoItem}>
                <strong>Supabase URL:</strong>
                <code>{import.meta.env.VITE_SUPABASE_URL || 'No configurado'}</code>
              </div>
              <div className={styles.infoItem}>
                <strong>Supabase Key:</strong>
                <code>
                  {import.meta.env.VITE_SUPABASE_ANON_KEY 
                    ? `${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...` 
                    : 'No configurado'}
                </code>
              </div>
              <div className={styles.infoItem}>
                <strong>Sentry DSN:</strong>
                <code>
                  {import.meta.env.VITE_SENTRY_DSN 
                    ? 'Configurado ✅' 
                    : 'No configurado'}
                </code>
              </div>
              <div className={styles.infoItem}>
                <strong>Environment:</strong>
                <code>{import.meta.env.MODE}</code>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className={styles.actions}>
          <Button variant="primary" onClick={runTests}>
            Ejecutar Tests Nuevamente
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Volver al Inicio
          </Button>
        </div>
      </div>
    </div>
  );
};
