import { useState } from "react";
import {
  Printer,
  Download,
  FileText,
  Package,
  QrCode,
  Barcode,
  Tags,
  Receipt,
  FileBarChart,
  Settings,
  Eye,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

interface PrintModuleProps {
  onClose: () => void;
}

export function PrintModule({ onClose }: PrintModuleProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);

  const templates = [
    {
      id: "shipping_label",
      name: "Etiqueta de Envío",
      description: "Etiqueta estándar con dirección y código de barras",
      icon: Package,
      color: "bg-blue-50 text-blue-600 border-blue-200",
    },
    {
      id: "barcode",
      name: "Código de Barras",
      description: "Etiqueta con código de barras para productos",
      icon: Barcode,
      color: "bg-purple-50 text-purple-600 border-purple-200",
    },
    {
      id: "qr_label",
      name: "Etiqueta QR",
      description: "Etiqueta con código QR para inventario",
      icon: QrCode,
      color: "bg-green-50 text-green-600 border-green-200",
    },
    {
      id: "price_tag",
      name: "Etiqueta de Precio",
      description: "Etiqueta de precio para productos",
      icon: Tags,
      color: "bg-orange-50 text-orange-600 border-orange-200",
    },
    {
      id: "invoice",
      name: "Factura",
      description: "Factura de venta completa",
      icon: FileText,
      color: "bg-red-50 text-red-600 border-red-200",
    },
    {
      id: "receipt",
      name: "Recibo",
      description: "Recibo de compra simplificado",
      icon: Receipt,
      color: "bg-cyan-50 text-cyan-600 border-cyan-200",
    },
    {
      id: "packing_slip",
      name: "Remito",
      description: "Documento de envío con detalle de productos",
      icon: FileBarChart,
      color: "bg-indigo-50 text-indigo-600 border-indigo-200",
    },
  ];

  function handlePrint(templateId: string) {
    setSelectedTemplate(templateId);
    // Mock preview data
    setPreviewData({
      orderNumber: "ORD-2024-001",
      date: new Date().toLocaleDateString(),
      customerName: "Juan Pérez",
      customerAddress: "Av. 18 de Julio 1234",
      city: "Montevideo",
      phone: "+598 99 123 456",
      items: [
        { name: "Producto 1", quantity: 2, price: 1500 },
        { name: "Producto 2", quantity: 1, price: 2500 },
      ],
      subtotal: 4000,
      tax: 880,
      total: 4880,
    });
  }

  function generatePDF() {
    toast.success("Generando PDF...");
    // Here would integrate with a PDF library like jsPDF or similar
    setTimeout(() => {
      toast.success("PDF generado exitosamente");
    }, 1500);
  }

  function printDocument() {
    window.print();
    toast.success("Enviando a impresora...");
  }

  if (selectedTemplate) {
    return (
      <PrintPreview
        template={selectedTemplate}
        data={previewData}
        onBack={() => setSelectedTemplate(null)}
        onPrint={printDocument}
        onDownload={generatePDF}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Impresión de Documentos</h2>
        <p className="text-muted-foreground">
          Selecciona el tipo de documento o etiqueta que deseas imprimir
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <motion.button
            key={template.id}
            onClick={() => handlePrint(template.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-6 rounded-lg border-2 ${template.color} text-left transition-all hover:shadow-lg`}
          >
            <template.icon className="w-10 h-10 mb-4" />
            <h3 className="font-bold text-lg mb-2">{template.name}</h3>
            <p className="text-sm opacity-80">{template.description}</p>
          </motion.button>
        ))}
      </div>

      {/* Quick Settings */}
      <div className="bg-white p-6 rounded-lg border border-border">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configuración Rápida
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tamaño de Papel</label>
            <select className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option>A4 (21 x 29.7 cm)</option>
              <option>Carta (21.6 x 27.9 cm)</option>
              <option>10 x 15 cm (Etiquetas)</option>
              <option>5 x 7.5 cm (Etiquetas pequeñas)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Orientación</label>
            <select className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option>Vertical</option>
              <option>Horizontal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Calidad</label>
            <select className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option>Alta (300 DPI)</option>
              <option>Media (150 DPI)</option>
              <option>Borrador (72 DPI)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recent Prints */}
      <div className="bg-white p-6 rounded-lg border border-border">
        <h3 className="font-bold mb-4">Impresiones Recientes</h3>
        <div className="space-y-2">
          {[
            { type: "Etiqueta de Envío", date: "Hoy, 14:30", items: "3 etiquetas" },
            { type: "Factura", date: "Hoy, 12:15", items: "Factura #001" },
            { type: "Remito", date: "Ayer, 18:45", items: "Remito #045" },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Printer className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{item.type}</p>
                  <p className="text-xs text-muted-foreground">{item.items}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{item.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Print Preview Component
function PrintPreview({
  template,
  data,
  onBack,
  onPrint,
  onDownload,
}: {
  template: string;
  data: any;
  onBack: () => void;
  onPrint: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            ←
          </button>
          <div>
            <h2 className="text-2xl font-bold">Vista Previa</h2>
            <p className="text-muted-foreground">
              Revisa antes de imprimir o descargar
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onDownload}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Download className="w-5 h-5" />
            Descargar PDF
          </button>
          <button
            onClick={onPrint}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Printer className="w-5 h-5" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="bg-muted p-8 rounded-lg">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg print:shadow-none">
          {template === "shipping_label" && <ShippingLabelTemplate data={data} />}
          {template === "invoice" && <InvoiceTemplate data={data} />}
          {template === "receipt" && <ReceiptTemplate data={data} />}
          {template === "packing_slip" && <PackingSlipTemplate data={data} />}
          {template === "barcode" && <BarcodeTemplate data={data} />}
          {template === "qr_label" && <QRLabelTemplate data={data} />}
          {template === "price_tag" && <PriceTagTemplate data={data} />}
        </div>
      </div>
    </div>
  );
}

// Template Components
function ShippingLabelTemplate({ data }: { data: any }) {
  return (
    <div className="border-2 border-black p-6 space-y-4">
      <div className="text-center border-b-2 border-black pb-4">
        <h1 className="text-2xl font-bold">ODDY Market</h1>
        <p className="text-sm">Etiqueta de Envío</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-bold mb-1">DESDE:</p>
          <p className="text-sm">ODDY Market</p>
          <p className="text-sm">Av. Principal 123</p>
          <p className="text-sm">Montevideo, Uruguay</p>
        </div>
        <div>
          <p className="text-xs font-bold mb-1">PARA:</p>
          <p className="text-sm font-bold">{data.customerName}</p>
          <p className="text-sm">{data.customerAddress}</p>
          <p className="text-sm">{data.city}</p>
          <p className="text-sm">{data.phone}</p>
        </div>
      </div>

      <div className="border-t-2 border-black pt-4">
        <div className="bg-black text-white text-center py-2 text-2xl font-mono font-bold">
          {data.orderNumber}
        </div>
        <div className="text-center mt-2">
          <svg className="mx-auto" width="200" height="50">
            <rect width="2" height="50" x="10" fill="black" />
            <rect width="4" height="50" x="15" fill="black" />
            <rect width="2" height="50" x="22" fill="black" />
            <rect width="3" height="50" x="27" fill="black" />
            <rect width="2" height="50" x="33" fill="black" />
            <rect width="4" height="50" x="38" fill="black" />
            <rect width="2" height="50" x="45" fill="black" />
          </svg>
        </div>
      </div>

      <div className="border-t border-black pt-2 text-xs">
        <p>Fecha: {data.date}</p>
        <p>Peso: 2.5 kg | Dimensiones: 30x20x15 cm</p>
      </div>
    </div>
  );
}

function InvoiceTemplate({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">FACTURA</h1>
          <p className="text-sm text-muted-foreground mt-1">#{data.orderNumber}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-xl">ODDY Market</p>
          <p className="text-sm">RUT: 12-345678-001</p>
          <p className="text-sm">Av. Principal 123</p>
          <p className="text-sm">Montevideo, Uruguay</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 bg-muted p-4 rounded-lg">
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-1">CLIENTE</p>
          <p className="font-medium">{data.customerName}</p>
          <p className="text-sm">{data.customerAddress}</p>
          <p className="text-sm">{data.city}</p>
          <p className="text-sm">{data.phone}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-muted-foreground mb-1">DETALLES</p>
          <p className="text-sm">Fecha: {data.date}</p>
          <p className="text-sm">Vencimiento: {data.date}</p>
          <p className="text-sm">Forma de Pago: Contado</p>
        </div>
      </div>

      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-3 text-sm font-bold">Descripción</th>
            <th className="text-center p-3 text-sm font-bold">Cant.</th>
            <th className="text-right p-3 text-sm font-bold">Precio</th>
            <th className="text-right p-3 text-sm font-bold">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item: any, index: number) => (
            <tr key={index} className="border-b border-border">
              <td className="p-3">{item.name}</td>
              <td className="p-3 text-center">{item.quantity}</td>
              <td className="p-3 text-right">${item.price}</td>
              <td className="p-3 text-right font-medium">
                ${item.quantity * item.price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>${data.subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>IVA (22%):</span>
            <span>${data.tax}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t-2 border-black pt-2">
            <span>TOTAL:</span>
            <span>${data.total}</span>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground border-t border-border pt-4">
        <p>Gracias por su compra</p>
        <p>www.oddymarket.com | contacto@oddymarket.com | +598 2XXX XXXX</p>
      </div>
    </div>
  );
}

function ReceiptTemplate({ data }: { data: any }) {
  return (
    <div className="max-w-sm mx-auto space-y-4 text-sm">
      <div className="text-center border-b-2 border-dashed border-black pb-3">
        <h2 className="text-xl font-bold">ODDY Market</h2>
        <p className="text-xs">Ticket de Compra</p>
        <p className="text-xs">#{data.orderNumber}</p>
      </div>

      <div className="text-xs space-y-1">
        <p>Fecha: {data.date}</p>
        <p>Cliente: {data.customerName}</p>
      </div>

      <div className="border-t border-b border-dashed border-black py-2 space-y-2">
        {data.items.map((item: any, index: number) => (
          <div key={index} className="flex justify-between">
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.quantity} x ${item.price}
              </p>
            </div>
            <span className="font-medium">${item.quantity * item.price}</span>
          </div>
        ))}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>Subtotal:</span>
          <span>${data.subtotal}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>IVA:</span>
          <span>${data.tax}</span>
        </div>
        <div className="flex justify-between font-bold border-t-2 border-black pt-2">
          <span>TOTAL:</span>
          <span>${data.total}</span>
        </div>
      </div>

      <div className="text-center text-xs border-t-2 border-dashed border-black pt-3">
        <p>¡Gracias por tu compra!</p>
        <p className="text-muted-foreground">www.oddymarket.com</p>
      </div>
    </div>
  );
}

function PackingSlipTemplate({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start border-b-2 border-black pb-4">
        <div>
          <h1 className="text-3xl font-bold">REMITO</h1>
          <p className="text-sm mt-1">#{data.orderNumber}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-xl">ODDY Market</p>
          <p className="text-sm">Fecha: {data.date}</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold mb-2">DESTINATARIO:</p>
        <p className="font-medium">{data.customerName}</p>
        <p className="text-sm">{data.customerAddress}</p>
        <p className="text-sm">{data.city}</p>
        <p className="text-sm">{data.phone}</p>
      </div>

      <table className="w-full border border-black">
        <thead className="bg-black text-white">
          <tr>
            <th className="text-left p-3">Ítem</th>
            <th className="text-center p-3">Cantidad</th>
            <th className="text-left p-3">Descripción</th>
            <th className="text-center p-3">✓</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item: any, index: number) => (
            <tr key={index} className="border-b border-black">
              <td className="p-3">{index + 1}</td>
              <td className="p-3 text-center font-bold">{item.quantity}</td>
              <td className="p-3">{item.name}</td>
              <td className="p-3 text-center">☐</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-2 border-black p-4 space-y-2">
        <p className="text-xs font-bold">NOTAS:</p>
        <div className="h-20 border-b border-black" />
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-xs mb-2">Recibido por:</p>
            <div className="border-b border-black" />
          </div>
          <div>
            <p className="text-xs mb-2">Firma:</p>
            <div className="border-b border-black" />
          </div>
        </div>
      </div>
    </div>
  );
}

function BarcodeTemplate({ data }: { data: any }) {
  return (
    <div className="text-center space-y-4 p-6">
      <p className="font-bold">ODDY Market</p>
      <div className="bg-white p-4 border-2 border-black rounded">
        <svg width="200" height="100" className="mx-auto">
          <rect width="3" height="80" x="20" fill="black" />
          <rect width="6" height="80" x="27" fill="black" />
          <rect width="3" height="80" x="37" fill="black" />
          <rect width="4" height="80" x="44" fill="black" />
          <rect width="3" height="80" x="52" fill="black" />
          <rect width="6" height="80" x="59" fill="black" />
          <rect width="3" height="80" x="69" fill="black" />
          <rect width="4" height="80" x="76" fill="black" />
          <rect width="3" height="80" x="84" fill="black" />
          <rect width="6" height="80" x="91" fill="black" />
          <rect width="3" height="80" x="101" fill="black" />
          <rect width="4" height="80" x="108" fill="black" />
          <rect width="3" height="80" x="116" fill="black" />
          <rect width="6" height="80" x="123" fill="black" />
          <rect width="3" height="80" x="133" fill="black" />
          <rect width="4" height="80" x="140" fill="black" />
          <rect width="3" height="80" x="148" fill="black" />
          <rect width="6" height="80" x="155" fill="black" />
        </svg>
        <p className="font-mono font-bold text-xl mt-2">{data.orderNumber}</p>
      </div>
      <p className="text-sm">{data.customerName}</p>
    </div>
  );
}

function QRLabelTemplate({ data }: { data: any }) {
  return (
    <div className="text-center space-y-4 p-6">
      <p className="font-bold text-lg">ODDY Market</p>
      <div className="bg-white p-4 border-2 border-black rounded inline-block">
        <div className="w-32 h-32 bg-black flex items-center justify-center text-white text-xs">
          QR CODE
          <br />
          PLACEHOLDER
        </div>
      </div>
      <p className="font-mono font-bold">{data.orderNumber}</p>
      <p className="text-sm">{data.customerName}</p>
    </div>
  );
}

function PriceTagTemplate({ data }: { data: any }) {
  return (
    <div className="border-2 border-black p-4 max-w-xs mx-auto">
      <div className="text-center space-y-2">
        <p className="text-xs font-bold">ODDY Market</p>
        <p className="font-medium">{data.items[0]?.name || "Producto"}</p>
        <div className="bg-black text-white py-2 px-4 rounded">
          <p className="text-3xl font-bold">
            ${data.items[0]?.price || "0"}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">IVA incluido</p>
      </div>
    </div>
  );
}
