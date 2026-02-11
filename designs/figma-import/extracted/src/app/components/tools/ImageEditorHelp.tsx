import { Info, ExternalLink, Key, CheckCircle } from "lucide-react";

export function ImageEditorHelp() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-lg font-bold mb-2">Configuración de APIs para Herramientas de IA</h3>
        <p className="text-sm text-muted-foreground">
          Para usar las funcionalidades de IA, necesitas configurar las siguientes API keys:
        </p>
      </div>

      {/* Remove.bg API */}
      <div className="bg-white p-6 rounded-lg border border-border space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Key className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold mb-1">Remove.bg API</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Para eliminar fondos de imágenes automáticamente con IA
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>1. Regístrate en Remove.bg</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>2. Obtén tu API key gratuita</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>3. Configura la variable de entorno REMOVE_BG_API_KEY</span>
              </div>
            </div>

            <a
              href="https://www.remove.bg/api"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              Obtener API Key
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm font-medium text-purple-900 mb-2">Plan Gratuito:</p>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• 50 imágenes por mes</li>
            <li>• Resolución hasta 0.25 megapíxeles</li>
            <li>• Procesamiento rápido</li>
          </ul>
        </div>
      </div>

      {/* Replicate API */}
      <div className="bg-white p-6 rounded-lg border border-border space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-pink-100 rounded-lg">
            <Key className="w-6 h-6 text-pink-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold mb-1">Replicate API</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Para generar imágenes con IA usando Stable Diffusion XL
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>1. Regístrate en Replicate</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>2. Obtén tu API token</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>3. Configura la variable de entorno REPLICATE_API_KEY</span>
              </div>
            </div>

            <a
              href="https://replicate.com/account/api-tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              Obtener API Token
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
          <p className="text-sm font-medium text-pink-900 mb-2">Modelo: Stable Diffusion XL</p>
          <ul className="text-sm text-pink-800 space-y-1">
            <li>• Resolución 1024x1024</li>
            <li>• Alta calidad y realismo</li>
            <li>• ~$0.0055 por generación (~30 segundos)</li>
          </ul>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-2">
              Información Importante:
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Las API keys se almacenan de forma segura como variables de entorno</li>
              <li>• Nunca se exponen en el código del cliente</li>
              <li>• Cada servicio tiene diferentes límites y precios</li>
              <li>• El editor funcionará sin las keys, pero sin funcionalidades de IA</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Alternative: Without API Keys */}
      <div className="bg-muted p-6 rounded-lg">
        <h4 className="font-bold mb-2">Usando el Editor sin API Keys</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Puedes usar el editor de imágenes sin configurar las API keys. Las siguientes funciones estarán disponibles:
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Recorte y redimensionamiento</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Rotación de imagen</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Ajustes de brillo, contraste y saturación</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Filtros preestablecidos</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Zoom y vista previa</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Descarga de imágenes editadas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
