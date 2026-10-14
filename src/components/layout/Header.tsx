import React from "react";
import {
  Search,
  Sun,
  Moon,
  HelpCircle,
  AlertTriangle,
  Receipt,
  UserCheck,
} from "lucide-react";
import { usePos } from "../../context/PosContext";
import { formatCurrency } from "../../utils/formatters";

export const Header: React.FC = () => {
  const {
    theme,
    toggleTheme,
    settings,
    searchQuery,
    setSearchQuery,
    selectedCustomer,
    products,
    orders,
    setIsShortcutsOpen,
  } = usePos();

  const lowStockCount = products.filter(
    (p) => p.stockPcs <= p.minStockPcs && p.status === "active"
  ).length;

  const todayOrders = orders.filter((o) => {
    const today = new Date().toISOString().slice(0, 10);
    return o.createdAt.startsWith(today);
  });

  return (
    <header className="top-header no-print">
      <div className="header-left">
        <div className="search-box">
          <Search size={18} className="text-secondary" />
          <input
            type="text"
            placeholder="Search by SKU, product name, barcode, or category... (or press /)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "0.8rem",
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="header-actions">
        {/* Active Customer Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.4rem 0.85rem",
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "10px",
            fontSize: "0.82rem",
          }}
          title="Active Wholesale Customer"
        >
          <UserCheck size={16} color="var(--accent-primary)" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
              {selectedCustomer.companyName}
            </span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              {selectedCustomer.tier.toUpperCase()} ? Balance:{" "}
              <strong
                style={{
                  color:
                    selectedCustomer.currentBalance > 0
                      ? "var(--color-danger)"
                      : "var(--color-success)",
                }}
              >
                {formatCurrency(selectedCustomer.currentBalance, settings.currencySymbol)}
              </strong>
            </span>
          </div>
        </div>

        {/* Low Stock Badge */}
        {lowStockCount > 0 && (
          <div
            className="badge badge-amber"
            title={`${lowStockCount} items at or below reorder threshold`}
          >
            <AlertTriangle size={14} />
            <span>{lowStockCount} Low Stock</span>
          </div>
        )}

        {/* Orders Today */}
        <div
          className="badge badge-blue"
          title={`${todayOrders.length} wholesale orders processed today`}
        >
          <Receipt size={14} />
          <span>{todayOrders.length} Today</span>
        </div>

        {/* Shortcuts Guide Button */}
        <button
          className="btn-icon"
          onClick={() => setIsShortcutsOpen(true)}
          title="Keyboard Shortcuts (? or F1)"
        >
          <HelpCircle size={18} />
        </button>

        {/* Theme Toggle Button */}
        <button
          className="btn-icon"
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};
