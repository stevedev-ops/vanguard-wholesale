import React, { useState } from "react";
import {
  Trash2,
  Plus,
  Minus,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Building,
  Truck,
  Percent,
} from "lucide-react";
import { usePos } from "../../context/PosContext";
import { UnitType } from "../../types";
import { formatCurrency, formatUnitName } from "../../utils/formatters";
import { CheckoutModal } from "./CheckoutModal";

export const CartPanel: React.FC = () => {
  const {
    cart,
    customers,
    selectedCustomer,
    setSelectedCustomer,
    updateCartItemQuantity,
    updateCartItemUnit,
    updateCartItemDiscount,
    removeFromCart,
    clearCart,
    cartTotals,
    shippingFee,
    setShippingFee,
    settings,
  } = usePos();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  return (
    <div className="pos-cart-panel">
      {/* Customer Trade Selector */}
      <div className="cart-customer-selector">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <Building size={14} color="var(--accent-primary)" />
            <span>Wholesale Trade Account:</span>
          </label>
          <span className="badge badge-purple" style={{ textTransform: "uppercase", fontSize: "0.68rem" }}>
            {selectedCustomer.tier} Tier
          </span>
        </div>

        <select
          className="form-select"
          style={{ width: "100%", padding: "0.45rem 0.65rem", fontSize: "0.85rem" }}
          value={selectedCustomer.id}
          onChange={(e) => {
            const found = customers.find((c) => c.id === e.target.value);
            if (found) setSelectedCustomer(found);
          }}
        >
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.companyName} ({c.name}) - {c.paymentTerms.toUpperCase()}
            </option>
          ))}
        </select>

        {selectedCustomer.creditLimit > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.74rem",
              color: "var(--text-muted)",
              marginTop: "0.1rem",
            }}
          >
            <span>
              Credit Limit:{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                {formatCurrency(selectedCustomer.creditLimit, settings.currencySymbol)}
              </strong>
            </span>
            <span>
              Balance Owed:{" "}
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
        )}
      </div>

      {/* Cart Items List */}
      <div className="cart-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ShoppingBag size={18} color="var(--accent-primary)" />
          <span style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--text-primary)" }}>
            Current Order ({cart.length})
          </span>
        </div>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-danger)",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Clear All
          </button>
        )}
      </div>

      <div className="cart-items-scroll">
        {cart.length === 0 ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
              gap: "0.75rem",
              padding: "2rem 1rem",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--bg-card)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px dashed var(--border-strong)",
              }}
            >
              <ShoppingBag size={24} />
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--text-secondary)" }}>
                Order is empty
              </p>
              <p style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>
                Select products and units from catalog to build wholesale consignment.
              </p>
            </div>
          </div>
        ) : (
          cart.map((item) => (
            <div key={`${item.productId}-${item.selectedUnit}`} className="cart-item-row">
              <div className="cart-item-top">
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.86rem", color: "var(--text-primary)", lineHeight: 1.25 }}>
                    {item.product.name}
                  </div>
                  <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                    {item.product.sku} ? {item.totalPieces} total pcs
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(item.productId, item.selectedUnit)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: "0.2rem",
                  }}
                  title="Remove item"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="cart-item-controls">
                {/* Unit Switcher */}
                <select
                  className="form-select"
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.76rem" }}
                  value={item.selectedUnit}
                  onChange={(e) =>
                    updateCartItemUnit(item.productId, item.selectedUnit, e.target.value as UnitType)
                  }
                >
                  <option value="pcs">Piece (1)</option>
                  <option value="pack">Pack ({item.product.pcsPerPack})</option>
                  <option value="ctn">Carton ({item.product.pcsPerCtn})</option>
                  <option value="plt">Pallet ({item.product.ctnPerPlt || 30} ctns)</option>
                </select>

                {/* Quantity Stepper */}
                <div className="qty-counter">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() =>
                      updateCartItemQuantity(item.productId, item.selectedUnit, item.quantity - 1)
                    }
                  >
                    <Minus size={12} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    className="qty-input"
                    value={item.quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        updateCartItemQuantity(item.productId, item.selectedUnit, val);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() =>
                      updateCartItemQuantity(item.productId, item.selectedUnit, item.quantity + 1)
                    }
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Line Total */}
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--text-primary)" }}>
                    {formatCurrency(item.lineTotal, settings.currencySymbol)}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    {formatCurrency(item.unitPrice, settings.currencySymbol)}/{formatUnitName(item.selectedUnit)}
                  </div>
                </div>
              </div>

              {/* Line Discount Input */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                <Percent size={12} />
                <span>Line Disc %:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  style={{
                    width: "48px",
                    padding: "0.15rem 0.35rem",
                    borderRadius: "5px",
                    border: "1px solid var(--border-subtle)",
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    fontSize: "0.75rem",
                  }}
                  value={item.discountPercent || 0}
                  onChange={(e) => {
                    const d = parseFloat(e.target.value) || 0;
                    updateCartItemDiscount(item.productId, item.selectedUnit, d);
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Summary & Checkout */}
      <div className="cart-summary">
        {cartTotals.wholesaleSavings > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.45rem 0.75rem",
              background: "var(--color-warning-subtle)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "8px",
              fontSize: "0.8rem",
              color: "var(--color-warning)",
              fontWeight: 600,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Sparkles size={14} /> Wholesale Savings:
            </span>
            <span>-{formatCurrency(cartTotals.wholesaleSavings, settings.currencySymbol)}</span>
          </div>
        )}

        <div className="summary-row">
          <span>Subtotal ({cartTotals.totalPieces} pcs):</span>
          <span>{formatCurrency(cartTotals.subtotal, settings.currencySymbol)}</span>
        </div>

        <div className="summary-row">
          <span>Wholesale Tax ({cartTotals.taxRate}%):</span>
          <span>{formatCurrency(cartTotals.taxAmount, settings.currencySymbol)}</span>
        </div>

        <div className="summary-row" style={{ alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Truck size={14} /> Freight / Delivery:
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{settings.currencySymbol}</span>
            <input
              type="number"
              min="0"
              style={{
                width: "60px",
                padding: "0.2rem 0.4rem",
                borderRadius: "5px",
                border: "1px solid var(--border-subtle)",
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                fontSize: "0.82rem",
                textAlign: "right",
              }}
              value={shippingFee || ""}
              placeholder="0.00"
              onChange={(e) => setShippingFee(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="summary-row total-row">
          <span>Grand Total:</span>
          <span style={{ color: "var(--accent-primary)" }}>
            {formatCurrency(cartTotals.grandTotal, settings.currencySymbol)}
          </span>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: "100%", padding: "0.85rem", fontSize: "0.98rem", marginTop: "0.4rem" }}
          disabled={cart.length === 0}
          onClick={() => setIsCheckoutOpen(true)}
        >
          <CreditCard size={18} />
          <span>Checkout Order (F2)</span>
        </button>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
      )}
    </div>
  );
};
