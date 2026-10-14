import React, { useState, useMemo } from "react";
import {
  Boxes,
  Plus,
  Search,
  PackageCheck,
  Edit,
  Trash2,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  MapPin,
  Calendar,
} from "lucide-react";
import { Product } from "../../types";
import { usePos } from "../../context/PosContext";
import {
  formatCurrency,
  formatStockBreakdown,
  formatDate,
} from "../../utils/formatters";
import { ProductModal } from "./ProductModal";
import { StockAdjustModal } from "./StockAdjustModal";

export const InventoryList: React.FC = () => {
  const { products, deleteProduct, settings } = usePos();

  const [search, setSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);

  // Categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return ["All", ...Array.from(set)];
  }, [products]);

  // KPIs
  const kpiData = useMemo(() => {
    let totalCostVal = 0;
    let totalWholesaleVal = 0;
    let totalPcs = 0;
    let lowCount = 0;
    let outCount = 0;

    products.forEach((p) => {
      if (p.status !== "active") return;
      totalPcs += p.stockPcs;
      totalCostVal += p.stockPcs * p.costPrice;
      const pieceSellingRate = p.pricing.ctnPrice / p.pcsPerCtn;
      totalWholesaleVal += p.stockPcs * pieceSellingRate;

      if (p.stockPcs <= 0) outCount++;
      else if (p.stockPcs <= p.minStockPcs) lowCount++;
    });

    const potentialProfit = Math.max(0, totalWholesaleVal - totalCostVal);
    const avgMarginPercent =
      totalWholesaleVal > 0 ? ((potentialProfit / totalWholesaleVal) * 100).toFixed(1) : "0";

    return {
      totalSkus: products.filter((p) => p.status === "active").length,
      totalPcs,
      totalCostVal,
      totalWholesaleVal,
      potentialProfit,
      avgMarginPercent,
      lowCount,
      outCount,
    };
  }, [products]);

  // Filtered products
  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (p.status !== "active") return false;

      if (categoryFilter !== "All" && p.category !== categoryFilter) return false;

      if (stockFilter === "low" && (p.stockPcs > p.minStockPcs || p.stockPcs <= 0)) return false;
      if (stockFilter === "out" && p.stockPcs > 0) return false;

      if (!search.trim()) return true;

      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        (p.supplier && p.supplier.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q))
      );
    });
  }, [products, categoryFilter, stockFilter, search]);

  const handleDelete = (prod: Product) => {
    if (window.confirm(`Are you sure you want to remove "${prod.name}" from inventory?`)) {
      deleteProduct(prod.id);
    }
  };

  return (
    <div className="page-body">
      {/* Top Inventory KPIs */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Active SKUs</div>
            <div className="stat-value">{kpiData.totalSkus}</div>
            <div className="stat-sub">
              <span>{kpiData.totalPcs.toLocaleString()} total units on hand</span>
            </div>
          </div>
          <div className="stat-icon" style={{ background: "var(--accent-primary-subtle)", color: "var(--accent-primary)" }}>
            <Boxes size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Stock Value (Cost)</div>
            <div className="stat-value">
              {formatCurrency(kpiData.totalCostVal, settings.currencySymbol)}
            </div>
            <div className="stat-sub">
              <span>Wholesale Value: {formatCurrency(kpiData.totalWholesaleVal, settings.currencySymbol)}</span>
            </div>
          </div>
          <div className="stat-icon" style={{ background: "var(--color-success-subtle)", color: "var(--color-success)" }}>
            <DollarSign size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Expected Margin</div>
            <div className="stat-value">{kpiData.avgMarginPercent}%</div>
            <div className="stat-sub" style={{ color: "var(--color-success)" }}>
              <TrendingUp size={14} />
              <span>+{formatCurrency(kpiData.potentialProfit, settings.currencySymbol)} potential profit</span>
            </div>
          </div>
          <div className="stat-icon" style={{ background: "var(--color-purple-subtle)", color: "var(--color-purple)" }}>
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Stock Health</div>
            <div className="stat-value" style={{ color: kpiData.lowCount + kpiData.outCount > 0 ? "var(--color-warning)" : "var(--color-success)" }}>
              {kpiData.lowCount + kpiData.outCount} Alerts
            </div>
            <div className="stat-sub">
              <span>{kpiData.lowCount} low stock ? {kpiData.outCount} depleted</span>
            </div>
          </div>
          <div className="stat-icon" style={{ background: "var(--color-warning-subtle)", color: "var(--color-warning)" }}>
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Filter / Action Toolbar */}
      <div
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          padding: "1rem 1.25rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: "280px" }}>
          <div className="search-box" style={{ maxWidth: "340px" }}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Filter by SKU, name, aisle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
          >
            <option value="all">All Stock Statuses</option>
            <option value="low">Low Stock Warning</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setIsNewModalOpen(true)}
        >
          <Plus size={18} />
          <span>New Wholesale Product</span>
        </button>
      </div>

      {/* Inventory Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU / Product Info</th>
              <th>Packaging Specs</th>
              <th>Cost vs Wholesale Price</th>
              <th>Current On-Hand</th>
              <th>Warehouse & Expiry</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                  No inventory products found matching the criteria.
                </td>
              </tr>
            ) : (
              filtered.map((prod) => {
                const stock = formatStockBreakdown(prod.stockPcs, prod.pcsPerPack, prod.pcsPerCtn);
                const isOut = prod.stockPcs <= 0;
                const isLow = !isOut && prod.stockPcs <= prod.minStockPcs;
                const pieceRate = prod.pricing.ctnPrice / prod.pcsPerCtn;
                const marginPercent = (((pieceRate - prod.costPrice) / pieceRate) * 100).toFixed(0);

                return (
                  <tr key={prod.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{prod.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", gap: "0.5rem", marginTop: "0.15rem" }}>
                        <span className="sku-code">{prod.sku}</span>
                        <span>?</span>
                        <span>{prod.category}</span>
                      </div>
                    </td>

                    <td style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                      <div>{prod.pcsPerCtn} pcs/ctn</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{prod.pcsPerPack} pcs/pack</div>
                    </td>

                    <td>
                      <div style={{ fontSize: "0.86rem", fontWeight: 700 }}>
                        {formatCurrency(prod.pricing.ctnPrice, settings.currencySymbol)}/ctn
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                        Cost: {formatCurrency(prod.costPrice, settings.currencySymbol)}/pc ?{" "}
                        <span style={{ color: "var(--color-success)", fontWeight: 600 }}>{marginPercent}% margin</span>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                        {stock.cartons > 0 ? `${stock.cartons} ctns` : `${prod.stockPcs} pcs`}
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                        {prod.stockPcs} total pcs (Min: {prod.minStockPcs})
                      </div>
                    </td>

                    <td style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <MapPin size={13} color="var(--accent-primary)" />
                        <span>{prod.location || "General Warehouse"}</span>
                      </div>
                      {prod.expiryDate && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.15rem", color: "var(--text-muted)" }}>
                          <Calendar size={13} />
                          <span>Exp: {formatDate(prod.expiryDate)}</span>
                        </div>
                      )}
                    </td>

                    <td>
                      {isOut ? (
                        <span className="badge badge-red">Depleted</span>
                      ) : isLow ? (
                        <span className="badge badge-amber">Low Stock</span>
                      ) : (
                        <span className="badge badge-green">In Stock</span>
                      )}
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                        <button
                          className="btn-icon"
                          style={{ width: "32px", height: "32px" }}
                          title="Restock / Adjust Stock"
                          onClick={() => setAdjustingProduct(prod)}
                        >
                          <PackageCheck size={16} color="var(--accent-primary)" />
                        </button>
                        <button
                          className="btn-icon"
                          style={{ width: "32px", height: "32px" }}
                          title="Edit Product"
                          onClick={() => setEditingProduct(prod)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn-icon"
                          style={{ width: "32px", height: "32px" }}
                          title="Delete Product"
                          onClick={() => handleDelete(prod)}
                        >
                          <Trash2 size={16} color="var(--color-danger)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {isNewModalOpen && <ProductModal onClose={() => setIsNewModalOpen(false)} />}
      {editingProduct && (
        <ProductModal product={editingProduct} onClose={() => setEditingProduct(null)} />
      )}
      {adjustingProduct && (
        <StockAdjustModal product={adjustingProduct} onClose={() => setAdjustingProduct(null)} />
      )}
    </div>
  );
};
