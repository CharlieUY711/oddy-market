import { useState } from "react";
import { 
  Sparkles, Wand2, TrendingUp, Shield, DollarSign, 
  FileText, Image as ImageIcon, Zap, Brain, Target,
  BarChart3, AlertTriangle, CheckCircle, Loader2
} from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { toast } from "sonner";
import { copyToClipboardWithToast } from "/src/utils/clipboard";

interface AIToolsProps {
  session: any;
}

export function AITools({ session }: AIToolsProps) {
  const [activeTab, setActiveTab] = useState("generate");
  const [loading, setLoading] = useState(false);
  
  // Product Description Generator
  const [productData, setProductData] = useState({
    name: "",
    category: "",
    features: "",
    targetAudience: "",
  });
  const [generatedDescription, setGeneratedDescription] = useState("");

  // Price Optimizer
  const [priceData, setPriceData] = useState({
    productId: "",
    currentPrice: "",
    cost: "",
    category: "",
  });
  const [priceRecommendation, setPriceRecommendation] = useState<any>(null);

  // Fraud Detection
  const [fraudAnalysis, setFraudAnalysis] = useState<any>(null);

  // Sales Prediction
  const [predictionData, setPredictionData] = useState<any>(null);

  async function generateDescription() {
    if (!productData.name || !productData.category) {
      toast.error("Por favor completa al menos el nombre y categoría");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/ai/generate-description`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
          body: JSON.stringify(productData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setGeneratedDescription(data.description);
        toast.success("Descripción generada exitosamente");
      } else {
        toast.error("Error al generar descripción");
      }
    } catch (error) {
      console.error("Error generating description:", error);
      toast.error("Error al generar descripción");
    } finally {
      setLoading(false);
    }
  }

  async function optimizePrice() {
    if (!priceData.productId || !priceData.currentPrice) {
      toast.error("Por favor completa los datos del producto");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/ai/optimize-price`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
          body: JSON.stringify(priceData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPriceRecommendation(data);
        toast.success("Análisis de precio completado");
      } else {
        toast.error("Error al optimizar precio");
      }
    } catch (error) {
      console.error("Error optimizing price:", error);
      toast.error("Error al optimizar precio");
    } finally {
      setLoading(false);
    }
  }

  async function analyzeFraud() {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/ai/fraud-detection`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFraudAnalysis(data);
        toast.success("Análisis de fraude completado");
      } else {
        toast.error("Error al analizar fraudes");
      }
    } catch (error) {
      console.error("Error analyzing fraud:", error);
      toast.error("Error al analizar fraudes");
    } finally {
      setLoading(false);
    }
  }

  async function predictSales() {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0dd48dc4/ai/predict-sales`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session?.access_token || publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPredictionData(data);
        toast.success("Predicción de ventas completada");
      } else {
        toast.error("Error al predecir ventas");
      }
    } catch (error) {
      console.error("Error predicting sales:", error);
      toast.error("Error al predecir ventas");
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { id: "generate", label: "Generar Contenido", icon: Wand2 },
    { id: "price", label: "Optimizar Precios", icon: DollarSign },
    { id: "fraud", label: "Detectar Fraude", icon: Shield },
    { id: "predict", label: "Predicción Ventas", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
          <Brain className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Herramientas de IA</h2>
          <p className="text-muted-foreground">
            Potencia tu ecommerce con inteligencia artificial
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-primary to-secondary text-white"
                : "bg-muted hover:bg-muted-foreground/10"
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Generate Content Tab */}
      {activeTab === "generate" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-purple-900 mb-1">
                  Generador de Descripciones
                </h3>
                <p className="text-sm text-purple-700">
                  Crea descripciones de productos atractivas y optimizadas para SEO usando IA
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={productData.name}
                  onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                  placeholder="Ej: Zapatillas deportivas Nike Air Max"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Categoría *
                </label>
                <input
                  type="text"
                  value={productData.category}
                  onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                  placeholder="Ej: Calzado deportivo"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Características Principales
                </label>
                <textarea
                  value={productData.features}
                  onChange={(e) => setProductData({ ...productData, features: e.target.value })}
                  placeholder="Ej: Amortiguación Air, suela de goma, diseño moderno..."
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Público Objetivo
                </label>
                <input
                  type="text"
                  value={productData.targetAudience}
                  onChange={(e) => setProductData({ ...productData, targetAudience: e.target.value })}
                  placeholder="Ej: Atletas, jóvenes activos, runners..."
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                onClick={generateDescription}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generar Descripción
                  </>
                )}
              </button>

              {generatedDescription && (
                <div className="bg-white border-2 border-purple-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-purple-900">Descripción Generada:</p>
                    <button
                      onClick={async () => {
                        await copyToClipboardWithToast(generatedDescription, "Copiado al portapapeles");
                      }}
                      className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                    >
                      Copiar
                    </button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{generatedDescription}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Price Optimizer Tab */}
      {activeTab === "price" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-green-900 mb-1">
                  Optimizador de Precios
                </h3>
                <p className="text-sm text-green-700">
                  Usa machine learning para encontrar el precio óptimo que maximice tus ventas
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  ID del Producto *
                </label>
                <input
                  type="text"
                  value={priceData.productId}
                  onChange={(e) => setPriceData({ ...priceData, productId: e.target.value })}
                  placeholder="Ej: prod_12345"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Precio Actual *
                  </label>
                  <input
                    type="number"
                    value={priceData.currentPrice}
                    onChange={(e) => setPriceData({ ...priceData, currentPrice: e.target.value })}
                    placeholder="50000"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Costo del Producto
                  </label>
                  <input
                    type="number"
                    value={priceData.cost}
                    onChange={(e) => setPriceData({ ...priceData, cost: e.target.value })}
                    placeholder="30000"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                onClick={optimizePrice}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5" />
                    Optimizar Precio
                  </>
                )}
              </button>

              {priceRecommendation && (
                <div className="bg-white border-2 border-green-300 rounded-lg p-4 space-y-3">
                  <p className="font-bold text-green-900">Recomendación de IA:</p>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-700 mb-1">Precio Actual</p>
                      <p className="text-xl font-bold text-green-900">
                        ${priceRecommendation.currentPrice?.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="text-center p-3 bg-green-100 rounded-lg">
                      <p className="text-xs text-green-700 mb-1">Precio Óptimo</p>
                      <p className="text-xl font-bold text-green-900">
                        ${priceRecommendation.optimalPrice?.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-700 mb-1">Aumento Esperado</p>
                      <p className="text-xl font-bold text-green-900">
                        +{priceRecommendation.expectedIncrease}%
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Análisis:</strong> {priceRecommendation.analysis}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fraud Detection Tab */}
      {activeTab === "fraud" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <Shield className="w-6 h-6 text-red-600 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-red-900 mb-1">
                  Detección de Fraude
                </h3>
                <p className="text-sm text-red-700">
                  Machine learning para identificar transacciones sospechosas en tiempo real
                </p>
              </div>
            </div>

            <button
              onClick={analyzeFraud}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center justify-center gap-2 disabled:opacity-50 mb-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Analizar Transacciones
                </>
              )}
            </button>

            {fraudAnalysis && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white border border-border rounded-lg p-4 text-center">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold text-green-900">{fraudAnalysis.safe}</p>
                    <p className="text-xs text-muted-foreground">Seguras</p>
                  </div>
                  
                  <div className="bg-white border border-border rounded-lg p-4 text-center">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                    <p className="text-2xl font-bold text-yellow-900">{fraudAnalysis.suspicious}</p>
                    <p className="text-xs text-muted-foreground">Sospechosas</p>
                  </div>
                  
                  <div className="bg-white border border-border rounded-lg p-4 text-center">
                    <Shield className="w-8 h-8 mx-auto mb-2 text-red-600" />
                    <p className="text-2xl font-bold text-red-900">{fraudAnalysis.blocked}</p>
                    <p className="text-xs text-muted-foreground">Bloqueadas</p>
                  </div>
                </div>

                {fraudAnalysis.suspiciousTransactions?.length > 0 && (
                  <div className="bg-white border-2 border-yellow-300 rounded-lg p-4">
                    <p className="font-bold text-yellow-900 mb-3">Transacciones Sospechosas:</p>
                    <div className="space-y-2">
                      {fraudAnalysis.suspiciousTransactions.map((tx: any, idx: number) => (
                        <div key={idx} className="p-3 bg-yellow-50 rounded-lg flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">Orden #{tx.orderId}</p>
                            <p className="text-xs text-muted-foreground">{tx.reason}</p>
                            <p className="text-xs text-yellow-700 mt-1">
                              Riesgo: {Math.round(tx.riskScore * 100)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sales Prediction Tab */}
      {activeTab === "predict" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-blue-900 mb-1">
                  Predicción de Ventas
                </h3>
                <p className="text-sm text-blue-700">
                  Algoritmos de machine learning para predecir ventas futuras y optimizar inventario
                </p>
              </div>
            </div>

            <button
              onClick={predictSales}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center justify-center gap-2 disabled:opacity-50 mb-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Prediciendo...
                </>
              ) : (
                <>
                  <BarChart3 className="w-5 h-5" />
                  Generar Predicción
                </>
              )}
            </button>

            {predictionData && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Próximos 7 días</p>
                    <p className="text-2xl font-bold text-blue-900">
                      ${predictionData.next7Days?.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      ↑ {predictionData.growth7Days}% vs semana anterior
                    </p>
                  </div>
                  
                  <div className="bg-white border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Próximos 30 días</p>
                    <p className="text-2xl font-bold text-blue-900">
                      ${predictionData.next30Days?.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      ↑ {predictionData.growth30Days}% vs mes anterior
                    </p>
                  </div>
                </div>

                <div className="bg-white border-2 border-blue-300 rounded-lg p-4">
                  <p className="font-bold text-blue-900 mb-3">Productos con Mayor Potencial:</p>
                  <div className="space-y-2">
                    {predictionData.topProducts?.map((product: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <span className="text-sm font-medium">{product.name}</span>
                        <span className="text-sm text-blue-700">+{product.expectedGrowth}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Zap className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900 mb-1">Recomendaciones:</p>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        {predictionData.recommendations?.map((rec: string, idx: number) => (
                          <li key={idx}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
