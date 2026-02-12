import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, TrendingUp, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';

interface SystemHealthProps {
  onViewFullAudit?: () => void;
}

export default function SystemHealthWidget({ onViewFullAudit }: SystemHealthProps) {
  const systemScore = 8.4;
  const categories = [
    { name: 'Core E-commerce', score: 8.8, status: 'excellent' },
    { name: 'Seguridad', score: 9.2, status: 'excellent' },
    { name: 'Pagos', score: 7.8, status: 'good' },
    { name: 'ERP', score: 8.7, status: 'excellent' },
    { name: 'CRM', score: 8.3, status: 'excellent' },
    { name: 'Marketing', score: 8.5, status: 'excellent' },
  ];

  const criticalIssues = [
    { issue: '2FA para Administradores', priority: 'critical' },
    { issue: 'Integración con Carriers', priority: 'high' },
    { issue: 'Google Shopping Feed', priority: 'high' },
    { issue: 'Rate Limiting', priority: 'high' },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-600';
    if (score >= 7) return 'text-blue-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 9) return 'bg-green-500';
    if (score >= 7) return 'bg-blue-500';
    if (score >= 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Estado del Sistema</CardTitle>
              <CardDescription>Evaluación automática de funcionalidades</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-5xl font-bold ${getScoreColor(systemScore)}`}>{systemScore}</div>
            <div className="text-sm text-muted-foreground">/10</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Principal */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Puntuación General</span>
            <span className="text-sm text-muted-foreground">84%</span>
          </div>
          <div className="relative">
            <Progress value={systemScore * 10} className="h-3" />
            <div
              className={`absolute top-0 left-0 h-3 rounded-full ${getProgressColor(systemScore)} transition-all`}
              style={{ width: `${systemScore * 10}%` }}
            />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-xs text-green-600 font-semibold">+12% desde última evaluación</span>
          </div>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">117</div>
            <div className="text-xs text-muted-foreground">Completas</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-center mb-1">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">31</div>
            <div className="text-xs text-muted-foreground">Parciales</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center justify-center mb-1">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">25</div>
            <div className="text-xs text-muted-foreground">Faltantes</div>
          </div>
        </div>

        {/* Top Categories */}
        <div>
          <h4 className="font-semibold mb-3 text-sm">Categorías Principales</h4>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <span className="text-sm">{cat.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(cat.score)}`}
                      style={{ width: `${cat.score * 10}%` }}
                    />
                  </div>
                  <span className={`text-sm font-semibold ${getScoreColor(cat.score)} w-8 text-right`}>
                    {cat.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Issues */}
        {criticalIssues.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Atención Requerida ({criticalIssues.length})
            </h4>
            <div className="space-y-2">
              {criticalIssues.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{item.issue}</span>
                  <Badge
                    variant={item.priority === 'critical' ? 'destructive' : 'default'}
                    className="text-xs"
                  >
                    {item.priority === 'critical' ? 'CRÍTICO' : 'ALTO'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button onClick={onViewFullAudit} className="w-full" size="lg">
          Ver Auditoría Completa
          <TrendingUp className="ml-2 h-4 w-4" />
        </Button>

        <div className="text-center text-xs text-muted-foreground">
          Última actualización: Hoy a las {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </CardContent>
    </Card>
  );
}
