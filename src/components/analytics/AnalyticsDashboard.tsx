import React, { useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Boxes,
  AlertTriangle,
  History,
} from "lucide-react";
import { usePos } from "../../context/PosContext";
import { formatCurrency, formatDate } from "../../utils/formatters";

export const AnalyticsDashboard: React.FC = () => {
  const { orders, movements, settings } = usePos();

  const metrics = useMemo(() => {
    let grossRevenue = 0;
    let totalCogs = 0;
    let totalPieces = 0;
    let accountsReceivable = 0;

    // Track product sales volume
    const productStats: Record<
      string,
      { name: string; sku: string; category: string; cartonsSold: number; piecesSold: number; revenue: number; profit: number }
    > = {};

    // Category revenue
    const categoryStats: Record<string, { revenue: number; pieces: number }> = {};

    orders.forEach((ord) => {
      grossRevenue += ord.total;
      accountsReceivable += ord.balanceDue;

      ord.items.forEach((item) => {
        totalPieces += item.totalPieces;
        const cogsForItem = item.totalPieces * item.product.costPrice;
        totalCogs += cogsForItem;
        const profitForItem = item.lineTotal - cogsForItem;

        if (!productStats[item.productId]) {
          productStats[item.productId] = {
            name: item.product.name,
            sku: item.product.sku,
            category: item.product.category,
            cartonsSold: 0,
            piecesSold: 0,
            revenue: 0,
            profit: 0,
          };
        }

        const cartons = item.selectedUnit === "ctn" ? item.quantity : Math.floor(item.totalPieces / item.product.pcsPerCtn);
        productStats[item.productId].cartonsSold += cartons;
        productStats[item.productId].piecesSold += item.totalPieces;
        productStats[item.productId].revenue += item.lineTotal;
        productStats[item.productId].profit += profitForItem;

        const cat = item.product.category;
        if (!categoryStats[cat]) {
          categoryStats[cat] = { revenue: 0, pieces: 0 };
        }
        categoryStats[cat].revenue += item.lineTotal;
        categoryStats[cat].pieces += item.totalPieces;
      });
    });

    const grossProfit = Math.max(0, grossRevenue - totalCogs);
    const profitMargin = grossRevenue > 0 ? ((grossProfit / grossRevenue) * 100).toFixed(1) : "0.0";

    const topProducts = Object.values(productStats).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    const categoriesList = Object.entries(categoryStats).map(([category, data]) => ({
      category,
      revenue: data.revenue,
      pieces: data.pieces,
      percent: grossRevenue > 0 ? Math.round((data.revenue / grossRevenue) * 100) : 0,
    })).sort((a, b) => b.revenue - a.revenue);

    return {
      grossRevenue,
      totalCogs,
      grossProfit,
      profitMargin,
      accountsReceivable,
      totalPieces,
      topProducts,
      categoriesList,
    };
  }, [orders]);

  return (
    <div className="page-body">
      {/* Analytics KPIs */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Wholesale Revenue</div>
            <div className="stat-value">
              {formatCurrency(metrics.grossRevenue, settings.currencySymbol)}
            </div>
            <div className="stat-sub" style={{ color: "var(--color-success)" }}>
              <TrendingUp size={14} />
              <span>COGS: {formatCurrency(metrics.totalCogs, settings.currencySymbol)}</span>
            </div>
          </div>
          <div className="stat-icon" style={{ background: "var(--accent-primary-subtle)", color: "var(--accent-primary)" }}>
            <DollarSign size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Gross Net Margin</div>
            <div className="stat-value" style={{ color: "var(--color-success)" }}>
              {formatCurrency(metrics.grossProfit, settings.currencySymbol)}
            </div>
            <div className="stat-sub">
              <span>{metrics.profitMargin}% average profit margin</span>
            </div>
          </div>
          <div className="stat-icon" style={{ background: "var(--color-success-subtle)", color: "var(--color-success)" }}>
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Trade Receivables (Owed)</div>
            <div className="stat-value" style={{ color: metrics.accountsReceivable > 0 ? "var(--color-danger)" : "var(--color-success)" }}>
              {formatCurrency(metrics.accountsReceivable, settings.currencySymbol)}
            </div>
            <div className="stat-sub">
              <span>Active client credit balances</span>
            </div>
          </div>
          <div className="stat-icon" style={{ background: "var(--color-danger-subtle)", color: "var(--color-danger)" }}>
            <AlertTriangle size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Units Dispatched</div>
            <div className="stat-value">{metrics.totalPieces.toLocaleString()}</div>
            <div className="stat-sub">
              <span>Total wholesale volume pieces</span>
            </div>
          </div>
          <div className="stat-icon" style={{ background: "var(--color-purple-subtle)", color: "var(--color-purple)" }}>
            <Boxes size={22} />
          </div>
        </div>
      </div>

      {/* Grid: Top Products + Category Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Top Wholesale Products */}
        <div className="card">
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <BarChart3 size={18} color="var(--accent-primary)" />
            <span>Top Performing Wholesale Products</span>
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {metrics.topProducts.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", padding: "1rem 0" }}>
                No completed wholesale orders yet.
              </p>
            ) : (
              metrics.topProducts.map((p, idx) => (
                <div
                  key={p.sku}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem",
                    background: "var(--bg-surface)",
                    borderRadius: "10px",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "8px",
                        background: idx === 0 ? "var(--color-warning-subtle)" : "var(--bg-card)",
                        color: idx === 0 ? "var(--color-warning)" : "var(--text-secondary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                      }}
                    >
                      #{idx + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text-primary)" }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                        {p.cartonsSold} ctns ({p.piecesSold} pcs) ? {p.category}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "var(--text-primary)" }}>
                      {formatCurrency(p.revenue, settings.currencySymbol)}
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "var(--color-success)", fontWeight: 600 }}>
                      +{formatCurrency(p.profit, settings.currencySymbol)} net
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Volume Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Boxes size={18} color="var(--accent-primary)" />
            <span>Revenue by Product Category</span>
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {metrics.categoriesList.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", padding: "1rem 0" }}>
                No category sales recorded yet.
              </p>
            ) : (
              metrics.categoriesList.map((cat) => (
                <div key={cat.category} style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem" }}>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{cat.category}</span>
                    <span style={{ fontWeight: 700 }}>
                      {formatCurrency(cat.revenue, settings.currencySymbol)} ({cat.percent}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      background: "var(--bg-muted)",
                      borderRadius: "9999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${cat.percent}%`,
                        background: "var(--accent-gradient)",
                        borderRadius: "9999px",
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Stock Audit Trail / Movements Table */}
      <div className="card">
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <History size={18} color="var(--accent-primary)" />
          <span>Warehouse Stock Movement Ledger</span>
        </h3>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Stock Level</th>
                <th>Reference / Reason</th>
              </tr>
            </thead>
            <tbody>
              {movements.slice(0, 10).map((mov) => (
                <tr key={mov.id}>
                  <td style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    {formatDate(mov.createdAt)}
                  </td>
                  <td style={{ fontWeight: 600 }}>{mov.productName}</td>
                  <td>
                    <span
                      className={`badge ${
                        mov.type === "restock"
                          ? "badge-green"
                          : mov.type === "damage"
                          ? "badge-red"
                          : mov.type === "sale"
                          ? "badge-blue"
                          : "badge-amber"
                      }`}
                      style={{ textTransform: "uppercase" }}
                    >
                      {mov.type}
                    </span>
                  </td>
                  <td
                    style={{
                      fontWeight: 700,
                      color: mov.quantityPcs > 0 ? "var(--color-success)" : "var(--color-danger)",
                    }}
                  >
                    {mov.quantityPcs > 0 ? "+" : ""}
                    {mov.quantityPcs} pcs ({mov.unitQuantity} {mov.unit})
                  </td>
                  <td style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                    {mov.previousStockPcs} ? <strong>{mov.newStockPcs} pcs</strong>
                  </td>
                  <td style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    {mov.reference}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
