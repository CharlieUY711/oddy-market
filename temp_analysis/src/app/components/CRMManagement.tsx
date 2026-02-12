import { useState } from "react";
import {
  Users,
  TrendingUp,
  Target,
  CheckCircle,
  Calendar,
  DollarSign,
} from "lucide-react";
import { motion } from "motion/react";
import { PipelineBoard } from "./crm/PipelineBoard";
import { CustomersManagement } from "./crm/CustomersManagement";
import { TasksManagement } from "./crm/TasksManagement";
import { SalesAnalytics } from "./crm/SalesAnalytics";

type CRMTab = "pipeline" | "customers" | "tasks" | "analytics";

export function CRMManagement() {
  const [activeTab, setActiveTab] = useState<CRMTab>("pipeline");

  const tabs = [
    { id: "pipeline", label: "Pipeline de Ventas", icon: Target },
    { id: "customers", label: "Clientes", icon: Users },
    { id: "tasks", label: "Tareas y Seguimientos", icon: Calendar },
    { id: "analytics", label: "Analíticas", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-8 h-8 text-primary" />
          CRM - Gestión de Clientes y Ventas
        </h2>
        <p className="text-muted-foreground mt-1">
          Pipeline de ventas, seguimientos y análisis de clientes
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CRMTab)}
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
        {activeTab === "pipeline" && <PipelineBoard />}
        {activeTab === "customers" && <CustomersManagement />}
        {activeTab === "tasks" && <TasksManagement />}
        {activeTab === "analytics" && <SalesAnalytics />}
      </motion.div>
    </div>
  );
}
