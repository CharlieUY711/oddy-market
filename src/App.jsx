import React from 'react';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/Card';
import './styles/global.css';

function App() {
  const [inputValue, setInputValue] = React.useState('');

  return (
    <div className="container">
      <header style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h1>ODDY Market</h1>
        <p>Proyecto en desarrollo - Enfoque Híbrido</p>
      </header>
      
      <main>
        <div style={{ display: 'grid', gap: 'var(--spacing-lg)', maxWidth: '600px' }}>
          <Card>
            <CardHeader>
              <CardTitle>Componentes Base</CardTitle>
              <CardDescription>
                Componentes adaptados del proyecto del ZIP, usando nuestra estructura limpia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <Input
                  placeholder="Escribe algo..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
                
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Estado del Proyecto</CardTitle>
              <CardDescription>Fases completadas</CardDescription>
            </CardHeader>
            <CardContent>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li>✅ Fase 1: Git inicializado, Framework configurado</li>
                <li>✅ Fase 2: ZIP analizado, valores de diseño extraídos</li>
                <li>✅ Fase 3: Componentes base creados (Button, Input, Card)</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default App;
