import React, { useState } from "react";
import { X, Printer, FileText } from "lucide-react";
import { SaleOrder } from "../../types";
import { usePos } from "../../context/PosContext";
import { formatCurrency, formatDate, formatDateTime } from "../../utils/formatters";

interface InvoiceModalProps {
  order: SaleOrder;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const { settings } = usePos();
  const [printFormat, setPrintFormat] = useState<"commercial" | "thermal">("commercial");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: printFormat === "thermal" ? "420px" : "800px" }}
      >
        <div className="modal-header no-print">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FileText size={20} color="var(--accent-primary)" />
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Wholesale Tax Invoice: {order.orderNumber}
              </h2>
              <span style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>
                Status:{" "}
                <strong
                  style={{
                    color:
                      order.status === "paid"
                        ? "var(--color-success)"
                        : order.status === "partial"
                        ? "var(--color-warning)"
                        : "var(--color-danger)",
                  }}
                >
                  {order.status.toUpperCase()}
                </strong>
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ display: "flex", background: "var(--bg-card)", borderRadius: "8px", padding: "0.2rem" }}>
              <button
                type="button"
                className={`btn btn-secondary ${printFormat === "commercial" ? "btn-primary" : ""}`}
                style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", borderRadius: "6px" }}
                onClick={() => setPrintFormat("commercial")}
              >
                Commercial (A4)
              </button>
              <button
                type="button"
                className={`btn btn-secondary ${printFormat === "thermal" ? "btn-primary" : ""}`}
                style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", borderRadius: "6px" }}
                onClick={() => setPrintFormat("thermal")}
              >
                80mm Slip
              </button>
            </div>

            <button className="btn btn-primary" style={{ padding: "0.45rem 0.9rem" }} onClick={handlePrint}>
              <Printer size={16} />
              <span>Print</span>
            </button>

            <button className="btn-icon" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Body */}
        <div className="modal-body printable-invoice-container" style={{ background: "white", color: "#111827", padding: "2rem" }}>
          {printFormat === "commercial" ? (
            /* Commercial Standard Tax Invoice */
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", fontFamily: "sans-serif" }}>
              {/* Header: Company & Invoice Info */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #e5e7eb", paddingBottom: "1.25rem" }}>
                <div>
                  <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: "#1e3a8a", margin: 0, textTransform: "uppercase" }}>
                    {settings.storeName}
                  </h1>
                  <p style={{ fontSize: "0.82rem", color: "#4b5563", marginTop: "0.25rem", margin: 0 }}>
                    {settings.tagline}
                  </p>
                  <p style={{ fontSize: "0.78rem", color: "#6b7280", margin: "0.2rem 0" }}>
                    {settings.address}
                  </p>
                  <p style={{ fontSize: "0.78rem", color: "#6b7280", margin: 0 }}>
                    Tel: {settings.phone} ? Email: {settings.email} ? Tax ID: {settings.taxId}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827" }}>
                    TAX INVOICE
                  </div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#2563eb", marginTop: "0.2rem" }}>
                    {order.orderNumber}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.3rem" }}>
                    Date: <strong>{formatDate(order.createdAt)}</strong>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                    Due Date: <strong>{formatDate(order.dueDate)}</strong>
                  </div>
                </div>
              </div>

              {/* Bill To & Logistics Consignee */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", background: "#f8fafc", padding: "1rem", borderRadius: "8px" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, color: "#6b7280" }}>
                    Consignee / B2B Client:
                  </span>
                  <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#111827", marginTop: "0.2rem" }}>
                    {order.customerCompany}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#374151" }}>
                    Attn: {order.customerName}
                  </div>
                  {order.notes && (
                    <div style={{ fontSize: "0.78rem", color: "#4b5563", marginTop: "0.35rem" }}>
                      Notes: {order.notes}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, color: "#6b7280" }}>
                    Settlement Status:
                  </span>
                  <div style={{ fontSize: "1.05rem", fontWeight: 800, color: order.status === "paid" ? "#059669" : "#dc2626", marginTop: "0.2rem" }}>
                    {order.status === "paid" ? "PAID IN FULL" : order.status === "partial" ? "PARTIAL PAYMENT" : "TRADE CREDIT OWED"}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#374151" }}>
                    Payment Method: {order.paymentMethod.toUpperCase()}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#374151" }}>
                    Issued by: {order.cashierName}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.86rem" }}>
                <thead>
                  <tr style={{ background: "#1e3a8a", color: "white" }}>
                    <th style={{ padding: "0.6rem 0.8rem", textAlign: "left" }}>Item & SKU</th>
                    <th style={{ padding: "0.6rem 0.8rem", textAlign: "center" }}>Unit</th>
                    <th style={{ padding: "0.6rem 0.8rem", textAlign: "right" }}>Qty</th>
                    <th style={{ padding: "0.6rem 0.8rem", textAlign: "right" }}>Total Pcs</th>
                    <th style={{ padding: "0.6rem 0.8rem", textAlign: "right" }}>Unit Price</th>
                    <th style={{ padding: "0.6rem 0.8rem", textAlign: "right" }}>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "0.65rem 0.8rem" }}>
                        <div style={{ fontWeight: 600, color: "#111827" }}>{item.product.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{item.product.sku}</div>
                      </td>
                      <td style={{ padding: "0.65rem 0.8rem", textAlign: "center", textTransform: "uppercase", fontWeight: 600, fontSize: "0.8rem" }}>
                        {item.selectedUnit}
                      </td>
                      <td style={{ padding: "0.65rem 0.8rem", textAlign: "right", fontWeight: 600 }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: "0.65rem 0.8rem", textAlign: "right", color: "#4b5563" }}>
                        {item.totalPieces}
                      </td>
                      <td style={{ padding: "0.65rem 0.8rem", textAlign: "right" }}>
                        {formatCurrency(item.unitPrice, settings.currencySymbol)}
                      </td>
                      <td style={{ padding: "0.65rem 0.8rem", textAlign: "right", fontWeight: 700 }}>
                        {formatCurrency(item.lineTotal, settings.currencySymbol)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ width: "320px", display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.88rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#4b5563" }}>Subtotal:</span>
                    <span>{formatCurrency(order.subtotal, settings.currencySymbol)}</span>
                  </div>

                  {order.wholesaleSavings > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#b45309", fontWeight: 600 }}>
                      <span>Wholesale Savings:</span>
                      <span>-{formatCurrency(order.wholesaleSavings, settings.currencySymbol)}</span>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#4b5563" }}>Wholesale Tax ({order.taxRate}%):</span>
                    <span>{formatCurrency(order.taxAmount, settings.currencySymbol)}</span>
                  </div>

                  {order.shippingFee > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#4b5563" }}>Freight / Logistics:</span>
                      <span>{formatCurrency(order.shippingFee, settings.currencySymbol)}</span>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      borderTop: "2px solid #111827",
                      paddingTop: "0.5rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    <span>Total Amount:</span>
                    <span style={{ color: "#1e3a8a" }}>
                      {formatCurrency(order.total, settings.currencySymbol)}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", color: "#059669", fontWeight: 600 }}>
                    <span>Amount Paid:</span>
                    <span>{formatCurrency(order.amountPaid, settings.currencySymbol)}</span>
                  </div>

                  {order.balanceDue > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: "#dc2626",
                        fontWeight: 800,
                        fontSize: "0.98rem",
                        background: "#fef2f2",
                        padding: "0.4rem 0.5rem",
                        borderRadius: "6px",
                      }}
                    >
                      <span>Balance Due (Trade Credit):</span>
                      <span>{formatCurrency(order.balanceDue, settings.currencySymbol)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Terms */}
              <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1rem", fontSize: "0.75rem", color: "#6b7280", textAlign: "center" }}>
                <p>{settings.footerMessage}</p>
                <p style={{ marginTop: "0.2rem" }}>
                  Goods once inspected and delivered are subject to Vanguard Wholesale return terms. System generated tax receipt.
                </p>
              </div>
            </div>
          ) : (
            /* 80mm POS Thermal Receipt */
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "12px",
                lineHeight: "1.4",
                color: "#000",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ textAlign: "center", borderBottom: "1px dashed #000", paddingBottom: "8px" }}>
                <div style={{ fontWeight: 800, fontSize: "14px" }}>{settings.storeName}</div>
                <div>{settings.address}</div>
                <div>Tel: {settings.phone}</div>
                <div>Tax ID: {settings.taxId}</div>
              </div>

              <div style={{ borderBottom: "1px dashed #000", paddingBottom: "6px" }}>
                <div>INV: {order.orderNumber}</div>
                <div>Date: {formatDateTime(order.createdAt)}</div>
                <div>Customer: {order.customerCompany}</div>
                <div>Payment: {order.paymentMethod.toUpperCase()}</div>
              </div>

              <div style={{ borderBottom: "1px dashed #000", paddingBottom: "6px" }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: "4px" }}>
                    <div style={{ fontWeight: 600 }}>{item.product.name}</div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>
                        {item.quantity} {item.selectedUnit} ({item.totalPieces} pcs) x ${item.unitPrice.toFixed(2)}
                      </span>
                      <span>${item.lineTotal.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Subtotal:</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Tax ({order.taxRate}%):</span>
                  <span>${order.taxAmount.toFixed(2)}</span>
                </div>
                {order.shippingFee > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Freight:</span>
                    <span>${order.shippingFee.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "14px", borderTop: "1px dashed #000", paddingTop: "4px" }}>
                  <span>TOTAL:</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Paid:</span>
                  <span>${order.amountPaid.toFixed(2)}</span>
                </div>
                {order.balanceDue > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                    <span>BALANCE DUE:</span>
                    <span>${order.balanceDue.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div style={{ textAlign: "center", borderTop: "1px dashed #000", paddingTop: "8px", fontSize: "11px" }}>
                <div>THANK YOU FOR YOUR BUSINESS!</div>
                <div>{settings.tagline}</div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer no-print">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
