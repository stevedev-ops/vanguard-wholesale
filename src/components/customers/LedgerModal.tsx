import React, { useState, useMemo } from "react";
import { X, DollarSign, Receipt, CheckCircle2, History } from "lucide-react";
import { Customer } from "../../types";
import { usePos } from "../../context/PosContext";
import { formatCurrency, formatDate } from "../../utils/formatters";

interface LedgerModalProps {
  customer: Customer;
  onClose: () => void;
}

export const LedgerModal: React.FC<LedgerModalProps> = ({ customer, onClose }) => {
  const { orders, recordCustomerPayment, settings, setActiveInvoice } = usePos();

  const [paymentAmount, setPaymentAmount] = useState<number>(customer.currentBalance);
  const [paymentMethod, setPaymentMethod] = useState<string>("Bank Wire Transfer");
  const [reference, setReference] = useState<string>("");

  // Customer Invoices
  const customerOrders = useMemo(() => {
    return orders.filter((o) => o.customerId === customer.id);
  }, [orders, customer.id]);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) return;

    recordCustomerPayment(
      customer.id,
      paymentAmount,
      paymentMethod,
      reference || `Payment on Account`
    );
    onClose();
  };

  const utilization =
    customer.creditLimit > 0
      ? Math.min(100, Math.round((customer.currentBalance / customer.creditLimit) * 100))
      : 0;

  return (
    <div className="modal-backdrop no-print" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "720px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <History size={20} color="var(--accent-primary)" />
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Trade Credit Ledger & Statement
              </h2>
              <span style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>
                {customer.companyName} ({customer.paymentTerms.toUpperCase()})
              </span>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Credit Health Banner */}
          <div
            style={{
              background: "var(--bg-card)",
              borderRadius: "12px",
              padding: "1.25rem",
              border: "1px solid var(--border-subtle)",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1rem",
            }}
          >
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Current Balance Owed</span>
              <div
                style={{
                  fontSize: "1.45rem",
                  fontWeight: 800,
                  color: customer.currentBalance > 0 ? "var(--color-danger)" : "var(--color-success)",
                }}
              >
                {formatCurrency(customer.currentBalance, settings.currencySymbol)}
              </div>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Credit Limit</span>
              <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-primary)" }}>
                {formatCurrency(customer.creditLimit, settings.currencySymbol)}
              </div>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Credit Utilization</span>
              <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-primary)" }}>
                {utilization}%
              </div>
            </div>
          </div>

          {/* Record Debt Repayment Form */}
          {customer.currentBalance > 0 && (
            <form
              onSubmit={handleRecordPayment}
              style={{
                background: "var(--bg-card)",
                padding: "1.1rem",
                borderRadius: "10px",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-success)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <DollarSign size={16} /> Record Debt Repayment
              </h3>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Payment Amount ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={customer.currentBalance}
                    className="form-input"
                    style={{ fontWeight: 700, fontSize: "1.05rem" }}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method:</label>
                  <select
                    className="form-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="Bank Wire Transfer">Bank Wire Transfer</option>
                    <option value="Cash Deposit">Cash Deposit</option>
                    <option value="Corporate Cheque">Corporate Cheque</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Transaction Reference / Cheque #:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Wire Ref #894120, Cheque #00492"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" className="btn btn-success" style={{ padding: "0.55rem 1.1rem" }}>
                  <CheckCircle2 size={16} />
                  <span>Post Repayment</span>
                </button>
              </div>
            </form>
          )}

          {/* Customer Orders History Table */}
          <div>
            <h3 style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.6rem" }}>
              Invoices & Transaction History ({customerOrders.length})
            </h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Balance Due</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>View</th>
                  </tr>
                </thead>
                <tbody>
                  {customerOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-muted)" }}>
                        No orders recorded for this customer yet.
                      </td>
                    </tr>
                  ) : (
                    customerOrders.map((ord) => (
                      <tr key={ord.id}>
                        <td className="sku-code" style={{ fontWeight: 700 }}>
                          {ord.orderNumber}
                        </td>
                        <td>{formatDate(ord.createdAt)}</td>
                        <td style={{ fontWeight: 600 }}>
                          {formatCurrency(ord.total, settings.currencySymbol)}
                        </td>
                        <td
                          style={{
                            fontWeight: 700,
                            color: ord.balanceDue > 0 ? "var(--color-danger)" : "var(--color-success)",
                          }}
                        >
                          {formatCurrency(ord.balanceDue, settings.currencySymbol)}
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
                            className="btn-icon"
                            style={{ width: "28px", height: "28px" }}
                            onClick={() => {
                              onClose();
                              setActiveInvoice(ord);
                            }}
                            title="View Invoice"
                          >
                            <Receipt size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
