import { useState } from "react";
import { MessageCircle, Send, Users, Package, Zap, Phone } from "lucide-react";
import { toast } from "sonner";

export function WhatsAppManagement() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#25D366]/10 to-[#25D366]/5 p-4 rounded-lg border border-[#25D366]/20">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-5 h-5 text-[#25D366]" />
            <span className="text-sm font-medium">3.9K</span>
          </div>
          <div className="text-xs text-muted-foreground">Contactos</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Send className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium">156</span>
          </div>
          <div className="text-xs text-muted-foreground">Conversaciones</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium">94%</span>
          </div>
          <div className="text-xs text-muted-foreground">Tasa Respuesta</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">245</span>
          </div>
          <div className="text-xs text-muted-foreground">Catálogo</div>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="bg-white p-12 rounded-lg border border-border text-center">
        <div className="w-20 h-20 bg-[#25D366]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-10 h-10 text-[#25D366]" />
        </div>
        <h3 className="text-2xl font-bold mb-2">WhatsApp Business API</h3>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Gestión profesional de WhatsApp Business con mensajería masiva, chatbot y catálogo de productos
        </p>
        <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="p-4 border border-border rounded-lg">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <h4 className="font-bold mb-1">Mensajería</h4>
            <p className="text-sm text-muted-foreground">Chats y broadcasts</p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <Package className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <h4 className="font-bold mb-1">Catálogo</h4>
            <p className="text-sm text-muted-foreground">Productos y ventas</p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <h4 className="font-bold mb-1">Automatización</h4>
            <p className="text-sm text-muted-foreground">Respuestas automáticas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
