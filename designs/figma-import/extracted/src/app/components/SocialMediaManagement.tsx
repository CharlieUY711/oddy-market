import { useState } from "react";
import {
  Share2,
  MessageSquare,
  LayoutDashboard,
  Facebook,
  Instagram,
  MessageCircle,
  Calendar,
} from "lucide-react";
import { motion } from "motion/react";
import { UnifiedDashboard } from "./social/UnifiedDashboard";
import { FacebookManagement } from "./social/FacebookManagement";
import { InstagramManagement } from "./social/InstagramManagement";
import { WhatsAppManagement } from "./social/WhatsAppManagement";
import { ContentCalendar } from "./social/ContentCalendar";

type SocialTab = "dashboard" | "facebook" | "instagram" | "whatsapp" | "calendar";

export function SocialMediaManagement() {
  const [activeTab, setActiveTab] = useState<SocialTab>("dashboard");

  const tabs = [
    { id: "dashboard", label: "Panel Unificado", icon: LayoutDashboard },
    { id: "facebook", label: "Facebook", icon: Facebook },
    { id: "instagram", label: "Instagram", icon: Instagram },
    { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
    { id: "calendar", label: "Calendario", icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Share2 className="w-8 h-8 text-primary" />
          Centro Operativo de Redes Sociales
        </h2>
        <p className="text-muted-foreground mt-1">
          Meta Business Suite - Gestión unificada de Facebook, Instagram y WhatsApp
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SocialTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "dashboard" && <UnifiedDashboard />}
        {activeTab === "facebook" && <FacebookManagement />}
        {activeTab === "instagram" && <InstagramManagement />}
        {activeTab === "whatsapp" && <WhatsAppManagement />}
        {activeTab === "calendar" && <ContentCalendar />}
      </motion.div>
    </div>
  );
}
