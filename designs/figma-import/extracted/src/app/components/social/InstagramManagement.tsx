import { useState } from "react";
import { Instagram, Heart, MessageCircle, ShoppingBag, Image } from "lucide-react";
import { toast } from "sonner";

export function InstagramManagement() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#E4405F]/10 to-[#C13584]/10 p-4 rounded-lg border border-[#E4405F]/20">
          <div className="flex items-center gap-2 mb-2">
            <Instagram className="w-5 h-5 text-[#E4405F]" />
            <span className="text-sm font-medium">22.8K</span>
          </div>
          <div className="text-xs text-muted-foreground">Seguidores</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium">9.8%</span>
          </div>
          <div className="text-xs text-muted-foreground">Engagement</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium">63</span>
          </div>
          <div className="text-xs text-muted-foreground">DMs</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium">245</span>
          </div>
          <div className="text-xs text-muted-foreground">Productos</div>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="bg-white p-12 rounded-lg border border-border text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-[#E4405F]/20 to-[#C13584]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Instagram className="w-10 h-10 text-[#E4405F]" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Instagram Management</h3>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Gestión completa de Instagram incluyendo feed, stories, reels, mensajes directos y shopping tag
        </p>
        <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="p-4 border border-border rounded-lg">
            <Image className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <h4 className="font-bold mb-1">Feed & Stories</h4>
            <p className="text-sm text-muted-foreground">Publicar y programar contenido</p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <h4 className="font-bold mb-1">Mensajes Directos</h4>
            <p className="text-sm text-muted-foreground">Gestionar DMs y respuestas</p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <h4 className="font-bold mb-1">Instagram Shopping</h4>
            <p className="text-sm text-muted-foreground">Etiquetar productos y ventas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
