import React, { useState, useMemo } from "react";
import {
  FileText,
  Search,
  DollarSign,
  Receipt,
  Printer,
  AlertCircle,
} from "lucide-react";
import { usePos } from "../../context/PosContext";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { InvoiceModal } from "./InvoiceModal";

export const OrderList: React.FC = () => {
  const { orders, settings, activeInvoice, setActiveInvoice } = usePos();

  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // KPIs
  const kpis = useMemo(() => {
    let grossRevenue = 0;
    let collectedAmount = 0;
    let creditBalanceDue = 0;
    let totalPiecesSold = 0;

    orders.forEach((ord) => {
      grossRevenue += ord.total;
      collectedAmount += ord.amountPaid;
      creditBalanceDue += ord.balanceDue;
      ord.items.forEach((item) => {
        totalPiecesSold += item.totalPieces;
      });
    });

    return {
      grossRevenue,
      collectedAmount,
      creditBalanceDue,
      totalOrders: orders.length,
      totalPiecesSold,
    };
  }, [orders]);

  // Filtered orders
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;

      if (!search.trim()) return true;

      const q = search.toLowerCase();
      const matchNumber = o.orderNumber.toLowerCase().includes(q);
      const matchCompany = o.customerCompany.toLowerCase().includes(q);
      const matchCustomer = o.customerName.toLowerCase().includes(q);
      const matchItem = o.items.some(
        (it) =>
          it.product.name.toLowerCase().includes(q) ||
          it.product.sku.toLowerCase().includes(q)
      );

      return matchNumber || matchCompany || matchCustomer || matchItem;
    });
  }, [orders, statusFilter, search]);

  return (
    <div className="page-body">
      {/* Top Sales KPIs */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Gross Wholesale Revenue</div>
            <div className="stat-value">
              {formatCurrency(kpis.grossRevenue, settings.currencySymbol)}
            </div>
            <div className="stat-sub">
              <span>{kpis.totalPiecesSold.toLocaleString()} pieces delivered</span>
            </div>
          </div>
          <div className="stat-icon" style={{ background: "var(--accent-primary-subtle)", color: "var(--accent-primary)" }}>
            <DollarSign size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Settled / Collected</div>
            <div className="stat-value" style={{ color: "var(--color-success)" }}>
              {formatCurrency(kpis.collectedAmount, settings.currencySymbol)}
            </div>
            <div className="stat-sub">
              <span>Paid via Cash, Card & Wire</span>
            </div>
          </div>
          <div className="stat-icon" style={{ background: "var(--color-success-subtle)", color: "var(--color-success)" }}>
            <Receipt size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Accounts Receivable</div>
            <div className="stat-value" style={{ color: kpis.creditBalanceDue > 0 ? "var(--color-danger)" : "var(--color-success)" }}>
              {formatCurrency(kpis.creditBalanceDue, settings.currencySymbol)}
            </div>
            <div className="stat-sub">
              <span>Uncollected trade credit</span>
            </div>
          </div>
          <div className="stat-icon" style={{ background: "var(--color-danger-subtle)", color: "var(--color-danger)" }}>
            <AlertCircle size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Total Invoices</div>
            <div className="stat-value">{kpis.totalOrders}</div>
            <div className="stat-sub">
              <span>Avg: {formatCurrency(kpis.totalOrders > 0 ? kpis.grossRevenue / kpis.totalOrders : 0, settings.currencySymbol)}/order</span>
            </div>
          </div>
          <div className="stat-icon" style={{ background: "var(--color-purple-subtle)", color: "var(--color-purple)" }}>
            <FileText size={22} />
          </div>
        </div>
      </div>

      {/* Action & Filter Toolbar */}
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
              placeholder="Search by invoice #, company, item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid in Full</option>
            <option value="partial">Partial Payment</option>
            <option value="unpaid">Credit / Unpaid</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date & Terms</th>
              <th>Consignee / Customer</th>
              <th>Consignment Items</th>
              <th>Total Amount</th>
              <th>Balance Due</th>
              <th>Method</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                  No sales invoices found matching the criteria.
                </td>
              </tr>
            ) : (
              filtered.map((ord) => {
                const totalPieces = ord.items.reduce((s, it) => s + it.totalPieces, 0);

                return (
                  <tr key={ord.id}>
                    <td>
                      <span className="sku-code" style={{ fontWeight: 700, color: "var(--accent-primary)" }}>
                        {ord.orderNumber}
                      </span>
                    </td>

                    <td style={{ fontSize: "0.82rem" }}>
                      <div>{formatDate(ord.createdAt)}</div>
                      <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                        Due: {formatDate(ord.dueDate)}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                        {ord.customerCompany}
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                        Attn: {ord.customerName}
                      </div>
                    </td>

                    <td style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                      <div>{ord.items.length} line items</div>
                      <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                        {totalPieces.toLocaleString()} pieces
                      </div>
                    </td>

                    <td style={{ fontSize: "0.95rem", fontWeight: 800 }}>
                      {formatCurrency(ord.total, settings.currencySymbol)}
                    </td>

                    <td>
                      {ord.balanceDue > 0 ? (
                        <span style={{ fontWeight: 800, color: "var(--color-danger)" }}>
                          {formatCurrency(ord.balanceDue, settings.currencySymbol)}
                        </span>
                      ) : (
                        <span style={{ color: "var(--color-success)", fontWeight: 600 }}>$0.00</span>
                      )}
                    </td>

                    <td style={{ textTransform: "capitalize", fontSize: "0.82rem" }}>
                      {ord.paymentMethod.replace("_", " ")}
                    </td>

                    <td>
                      {ord.status === "paid" ? (
                        <span className="badge badge-green">Paid</span>
                      ) : ord.status === "partial" ? (
                        <span className="badge badge-amber">Partial</span>
                      ) : (
                        <span className="badge badge-red">Credit Owed</span>
                      )}
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "0.35rem 0.7rem", fontSize: "0.78rem" }}
                        onClick={() => setActiveInvoice(ord)}
                      >
                        <Printer size={14} />
                        <span>View / Print</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Invoice Modal */}
      {activeInvoice && (
        <InvoiceModal order={activeInvoice} onClose={() => setActiveInvoice(null)} />
      )}
    </div>
  );
};
