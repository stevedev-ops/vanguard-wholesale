import React, { useEffect } from "react";
import { PosProvider, usePos } from "./context/PosContext";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { PosTerminal } from "./components/pos/PosTerminal";
import { InventoryList } from "./components/inventory/InventoryList";
import { CustomerList } from "./components/customers/CustomerList";
import { OrderList } from "./components/orders/OrderList";
import { AnalyticsDashboard } from "./components/analytics/AnalyticsDashboard";
import { SettingsModal } from "./components/settings/SettingsModal";
import { ShortcutsModal } from "./components/common/ShortcutsModal";
import { Toast } from "./components/common/Toast";

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, setIsShortcutsOpen, isShortcutsOpen } = usePos();

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle shortcuts with ? or F1
      if ((e.key === "?" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) || e.key === "F1") {
        e.preventDefault();
        setIsShortcutsOpen(!isShortcutsOpen);
      }

      // Quick tab navigation 1-6 with Alt + key
      if (e.altKey && e.key >= "1" && e.key <= "6") {
        e.preventDefault();
        const tabs: ("pos" | "inventory" | "customers" | "orders" | "analytics" | "settings")[] = [
          "pos",
          "inventory",
          "customers",
          "orders",
          "analytics",
          "settings",
        ];
        const target = tabs[parseInt(e.key, 10) - 1];
        if (target) setActiveTab(target);
      }

      // Close modals with Escape
      if (e.key === "Escape") {
        setIsShortcutsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isShortcutsOpen, setIsShortcutsOpen, setActiveTab]);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        {activeTab === "pos" && <PosTerminal />}
        {activeTab === "inventory" && <InventoryList />}
        {activeTab === "customers" && <CustomerList />}
        {activeTab === "orders" && <OrderList />}
        {activeTab === "analytics" && <AnalyticsDashboard />}
        {activeTab === "settings" && <SettingsModal />}
      </div>

      <ShortcutsModal />
      <Toast />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <PosProvider>
      <AppContent />
    </PosProvider>
  );
};

export default App;
