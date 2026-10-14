import React from "react";
import {
  ShoppingCart,
  Boxes,
  Users,
  FileText,
  BarChart3,
  Settings,
  Layers,
  Sparkles,
} from "lucide-react";
import { usePos } from "../../context/PosContext";
import { ActiveTab } from "../../types";

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    cart,
    products,
    customers,
  } = usePos();

  const lowStockCount = products.filter(
    (p) => p.stockPcs <= p.minStockPcs && p.status === "active"
  ).length;

  const totalOwed = customers.reduce((sum, c) => sum + (c.currentBalance || 0), 0);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }[] = [
    {
      id: "pos",
      label: "POS Terminal",
      icon: <ShoppingCart size={20} />,
      badge: cart.length > 0 ? cart.length : undefined,
      badgeColor: "badge-blue",
    },
    {
      id: "inventory",
      label: "Inventory & Stock",
      icon: <Boxes size={20} />,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: "badge-amber",
    },
    {
      id: "customers",
      label: "Trade Customers",
      icon: <Users size={20} />,
      badge: totalOwed > 0 ? `$${(totalOwed / 1000).toFixed(1)}k` : undefined,
      badgeColor: "badge-red",
    },
    {
      id: "orders",
      label: "Sales & Invoices",
      icon: <FileText size={20} />,
    },
    {
      id: "analytics",
      label: "Wholesale Margins",
      icon: <BarChart3 size={20} />,
    },
    {
      id: "settings",
      label: "Store & Backup",
      icon: <Settings size={20} />,
    },
  ];

  return (
    <aside className="sidebar no-print">
      <div>
        <div className="brand-wrapper">
          <div className="brand-logo-icon">
            <Layers size={22} />
          </div>
          <div className="brand-info">
            <h1 className="brand-title">Vanguard</h1>
            <span className="brand-subtitle">Wholesale POS</span>
          </div>
        </div>

        <ul className="nav-menu">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  className={`nav-item ${isActive ? "active" : ""}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  {item.icon}
                  <span className="nav-label">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`badge ${item.badgeColor || "badge-blue"} badge-pill`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="sidebar-footer">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.6rem 0.75rem",
            background: "var(--bg-card)",
            borderRadius: "10px",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "var(--accent-primary-subtle)",
              color: "var(--accent-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.85rem",
            }}
          >
            A
          </div>
          <div className="footer-text" style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)" }}>
              Alex Mercer
            </span>
            <span style={{ fontSize: "0.7rem", color: "var(--color-success)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Sparkles size={11} /> Wholesale Terminal Active
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
