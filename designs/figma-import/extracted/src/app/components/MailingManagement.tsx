import { useState } from "react";
import {
  Mail,
  Users,
  BarChart3,
  Target,
  TestTube2,
  List,
} from "lucide-react";
import { motion } from "motion/react";
import { SubscribersManagement } from "./mailing/SubscribersManagement";
import { CampaignsManagement } from "./mailing/CampaignsManagement";
import { SegmentationManagement } from "./mailing/SegmentationManagement";
import { ABTestingManagement } from "./mailing/ABTestingManagement";
import { EmailAnalytics } from "./mailing/EmailAnalytics";

type MailingTab = "campaigns" | "subscribers" | "segments" | "abtesting" | "analytics";

export function MailingManagement() {
  const [activeTab, setActiveTab] = useState<MailingTab>("campaigns");

  const tabs = [
    { id: "campaigns", label: "Campañas", icon: Mail },
    { id: "subscribers", label: "Suscriptores", icon: Users },
    { id: "segments", label: "Segmentación", icon: Target },
    { id: "abtesting", label: "A/B Testing", icon: TestTube2 },
    { id: "analytics", label: "Analíticas", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Mail className="w-8 h-8 text-primary" />
          Sistema de Mailing Avanzado
        </h2>
        <p className="text-muted-foreground mt-1">
          Gestión completa de campañas, segmentación y analíticas
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as MailingTab)}
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
        {activeTab === "campaigns" && <CampaignsManagement />}
        {activeTab === "subscribers" && <SubscribersManagement />}
        {activeTab === "segments" && <SegmentationManagement />}
        {activeTab === "abtesting" && <ABTestingManagement />}
        {activeTab === "analytics" && <EmailAnalytics />}
      </motion.div>
    </div>
  );
}
