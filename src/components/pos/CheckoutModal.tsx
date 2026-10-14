import React, { useState } from "react";
import {
  X,
  CreditCard,
  Banknote,
  Building,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  Receipt,
  Layers,
} from "lucide-react";
import { usePos } from "../../context/PosContext";
import { PaymentMethod } from "../../types";
import { formatCurrency } from "../../utils/formatters";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const {
    cartTotals,
    selectedCustomer,
    processCheckout,
    settings,
  } = usePos();

  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [tenderedAmount, setTenderedAmount] = useState<number>(cartTotals.grandTotal);
  const [transferRef, setTransferRef] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Split details
  const [cashDeposit, setCashDeposit] = useState<number>(Math.round(cartTotals.grandTotal / 2));
  const [creditBalance, setCreditBalance] = useState<number>(
    Number((cartTotals.grandTotal - Math.round(cartTotals.grandTotal / 2)).toFixed(2))
  );

  if (!isOpen) return null;

  const total = cartTotals.grandTotal;

  // Calculate change for cash
  const changeDue = method === "cash" ? Math.max(0, tenderedAmount - total) : 0;

  // Determine amount paid towards order
  let amountPaid = total;
  if (method === "credit") {
    amountPaid = 0;
  } else if (method === "split") {
    amountPaid = Number(cashDeposit);
  }

  const handleCashTenderPreset = (val: number) => {
    setTenderedAmount(val);
  };

  const handleSplitDepositChange = (dep: number) => {
    setCashDeposit(dep);
    setCreditBalance(Math.max(0, Number((total - dep).toFixed(2))));
  };

  const handleConfirm = () => {
    let orderNotes = notes;
    let splitDetails;

    if (method === "bank_transfer" && transferRef) {
      orderNotes = `Wire Ref: ${transferRef}. ${orderNotes}`.trim();
    } else if (method === "split") {
      splitDetails = {
        cashAmount: cashDeposit,
        creditAmount: creditBalance,
      };
      orderNotes = `Split: $${cashDeposit} cash deposit, $${creditBalance} on ${selectedCustomer.paymentTerms.toUpperCase()} credit. ${orderNotes}`.trim();
    } else if (method === "credit") {
      orderNotes = `Trade Credit Terms: ${selectedCustomer.paymentTerms.toUpperCase()}. ${orderNotes}`.trim();
    }

    const order = processCheckout(method, amountPaid, orderNotes, splitDetails);
    if (order) {
      onClose();
    }
  };

  const willExceedCredit =
    (method === "credit" || method === "split") &&
    selectedCustomer.creditLimit > 0 &&
    selectedCustomer.currentBalance + (total - amountPaid) > selectedCustomer.creditLimit;

  return (
    <div className="modal-backdrop no-print" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Receipt size={22} color="var(--accent-primary)" />
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Wholesale Order Settlement
              </h2>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                Customer: <strong>{selectedCustomer.companyName}</strong> ({selectedCustomer.paymentTerms.toUpperCase()})
              </span>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Order Total Hero */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "12px",
              padding: "1.25rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Total Payable Amount
              </span>
              <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-primary)" }}>
                {formatCurrency(total, settings.currencySymbol)}
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              <div>{cartTotals.totalPieces} total pieces</div>
              <div style={{ color: "var(--color-warning)", fontWeight: 600 }}>
                Wholesale Savings: {formatCurrency(cartTotals.wholesaleSavings, settings.currencySymbol)}
              </div>
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div>
            <label className="form-label" style={{ marginBottom: "0.5rem", display: "block" }}>
              Select Settlement Method:
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem" }}>
              <button
                type="button"
                className={`unit-btn ${method === "cash" ? "active" : ""}`}
                style={{
                  padding: "0.65rem 0.4rem",
                  borderColor: method === "cash" ? "var(--accent-primary)" : "var(--border-subtle)",
                  background: method === "cash" ? "var(--accent-primary-subtle)" : "var(--bg-card)",
                  color: method === "cash" ? "var(--accent-primary)" : "var(--text-secondary)",
                }}
                onClick={() => setMethod("cash")}
              >
                <Banknote size={18} />
                <span style={{ marginTop: "0.2rem" }}>Cash</span>
              </button>

              <button
                type="button"
                className={`unit-btn ${method === "card" ? "active" : ""}`}
                style={{
                  padding: "0.65rem 0.4rem",
                  borderColor: method === "card" ? "var(--accent-primary)" : "var(--border-subtle)",
                  background: method === "card" ? "var(--accent-primary-subtle)" : "var(--bg-card)",
                  color: method === "card" ? "var(--accent-primary)" : "var(--text-secondary)",
                }}
                onClick={() => setMethod("card")}
              >
                <CreditCard size={18} />
                <span style={{ marginTop: "0.2rem" }}>Card</span>
              </button>

              <button
                type="button"
                className={`unit-btn ${method === "bank_transfer" ? "active" : ""}`}
                style={{
                  padding: "0.65rem 0.4rem",
                  borderColor: method === "bank_transfer" ? "var(--accent-primary)" : "var(--border-subtle)",
                  background: method === "bank_transfer" ? "var(--accent-primary-subtle)" : "var(--bg-card)",
                  color: method === "bank_transfer" ? "var(--accent-primary)" : "var(--text-secondary)",
                }}
                onClick={() => setMethod("bank_transfer")}
              >
                <Building size={18} />
                <span style={{ marginTop: "0.2rem" }}>Wire Transfer</span>
              </button>

              <button
                type="button"
                className={`unit-btn ${method === "credit" ? "active" : ""}`}
                style={{
                  padding: "0.65rem 0.4rem",
                  borderColor: method === "credit" ? "var(--accent-primary)" : "var(--border-subtle)",
                  background: method === "credit" ? "var(--accent-primary-subtle)" : "var(--bg-card)",
                  color: method === "credit" ? "var(--accent-primary)" : "var(--text-secondary)",
                }}
                onClick={() => setMethod("credit")}
              >
                <FileCheck size={18} />
                <span style={{ marginTop: "0.2rem" }}>On Account</span>
              </button>

              <button
                type="button"
                className={`unit-btn ${method === "split" ? "active" : ""}`}
                style={{
                  padding: "0.65rem 0.4rem",
                  borderColor: method === "split" ? "var(--accent-primary)" : "var(--border-subtle)",
                  background: method === "split" ? "var(--accent-primary-subtle)" : "var(--bg-card)",
                  color: method === "split" ? "var(--accent-primary)" : "var(--text-secondary)",
                }}
                onClick={() => setMethod("split")}
              >
                <Layers size={18} />
                <span style={{ marginTop: "0.2rem" }}>Split / Deposit</span>
              </button>
            </div>
          </div>

          {/* Method Details */}
          {method === "cash" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div className="form-group">
                <label className="form-label">Tendered Cash Amount:</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  style={{ fontSize: "1.15rem", fontWeight: 700 }}
                  value={tenderedAmount}
                  onChange={(e) => setTenderedAmount(parseFloat(e.target.value) || 0)}
                />
              </div>

              {/* Quick Cash Buttons */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}
                  onClick={() => handleCashTenderPreset(total)}
                >
                  Exact ({formatCurrency(total, settings.currencySymbol)})
                </button>
                {[50, 100, 200, 500, 1000, 2000]
                  .filter((v) => v >= total)
                  .slice(0, 4)
                  .map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}
                      onClick={() => handleCashTenderPreset(preset)}
                    >
                      ${preset}
                    </button>
                  ))}
              </div>

              {/* Change Calculator */}
              <div
                style={{
                  padding: "0.85rem",
                  background: changeDue > 0 ? "var(--color-success-subtle)" : "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>Change Due to Customer:</span>
                <span
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    color: changeDue > 0 ? "var(--color-success)" : "var(--text-primary)",
                  }}
                >
                  {formatCurrency(changeDue, settings.currencySymbol)}
                </span>
              </div>
            </div>
          )}

          {method === "bank_transfer" && (
            <div className="form-group">
              <label className="form-label">Wire / Bank Transfer Reference Number:</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. TX-984102 / Chase Ref #4928"
                value={transferRef}
                onChange={(e) => setTransferRef(e.target.value)}
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Reference code will appear on the commercial invoice audit line.
              </span>
            </div>
          )}

          {method === "credit" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div
                style={{
                  padding: "0.85rem",
                  background: "var(--accent-primary-subtle)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  borderRadius: "10px",
                  fontSize: "0.84rem",
                  lineHeight: 1.4,
                }}
              >
                <strong>B2B Trade Credit Terms: {selectedCustomer.paymentTerms.toUpperCase()}</strong>
                <p style={{ marginTop: "0.3rem", color: "var(--text-secondary)" }}>
                  Full balance of {formatCurrency(total, settings.currencySymbol)} will be charged to{" "}
                  {selectedCustomer.companyName}&apos;s trade account ledger.
                </p>
              </div>

              {willExceedCredit && (
                <div
                  style={{
                    padding: "0.75rem",
                    background: "var(--color-danger-subtle)",
                    border: "1px solid var(--color-danger)",
                    borderRadius: "10px",
                    color: "var(--color-danger)",
                    fontSize: "0.82rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <AlertCircle size={16} />
                  <span>
                    Warning: This order will exceed the customer&apos;s trade credit limit of{" "}
                    {formatCurrency(selectedCustomer.creditLimit, settings.currencySymbol)}!
                  </span>
                </div>
              )}
            </div>
          )}

          {method === "split" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Cash Deposit Tendered:</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={cashDeposit}
                    onChange={(e) => handleSplitDepositChange(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Remaining on Trade Credit:</label>
                  <input
                    type="number"
                    disabled
                    className="form-input"
                    style={{ background: "var(--bg-surface)", fontWeight: 700 }}
                    value={creditBalance}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Order Notes / Delivery PO Reference:</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Deliver to Dock 3, PO #9482, Buyer vehicle pickup"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: "0.7rem 1.4rem" }}
            onClick={handleConfirm}
          >
            <CheckCircle2 size={18} />
            <span>Confirm & Print Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
};
