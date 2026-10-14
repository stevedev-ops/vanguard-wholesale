import React, { useState } from "react";
import { X, ArrowUpRight, AlertTriangle, RotateCcw, PackageCheck } from "lucide-react";
import { Product, UnitType, StockMovementType } from "../../types";
import { usePos } from "../../context/PosContext";
import { formatUnitName, formatStockBreakdown } from "../../utils/formatters";

interface StockAdjustModalProps {
  product: Product;
  onClose: () => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({ product, onClose }) => {
  const { adjustStock } = usePos();

  const [type, setType] = useState<StockMovementType>("restock");
  const [unit, setUnit] = useState<UnitType>("ctn");
  const [quantity, setQuantity] = useState<number>(1);
  const [reference, setReference] = useState<string>("");

  const stockInfo = formatStockBreakdown(product.stockPcs, product.pcsPerPack, product.pcsPerCtn);

  const getMultiplier = (u: UnitType) => {
    switch (u) {
      case "pcs":
        return 1;
      case "pack":
        return product.pcsPerPack;
      case "ctn":
        return product.pcsPerCtn;
      case "plt":
        return (product.ctnPerPlt || 30) * product.pcsPerCtn;
    }
  };

  const calculatedPieces = quantity * getMultiplier(unit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    const refText = reference.trim() || `${type.toUpperCase()} manual adjustment`;
    const success = adjustStock(product.id, type, quantity, unit, refText);
    if (success) onClose();
  };

  return (
    <div className="modal-backdrop no-print" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "540px" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
          <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <PackageCheck size={20} color="var(--accent-primary)" />
            <div>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Stock Adjustment & Inward Receiving
              </h2>
              <span style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>
                {product.name} ({product.sku})
              </span>
            </div>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
            {/* Current Stock Banner */}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "10px",
                padding: "0.85rem 1.1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>Current On-Hand Stock:</span>
                <div style={{ fontWeight: 800, fontSize: "1.15rem", color: "var(--text-primary)" }}>
                  {stockInfo.summary}
                </div>
              </div>
              <div style={{ textAlign: "right", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Location: <strong>{product.location || "General Warehouse"}</strong>
              </div>
            </div>

            {/* Adjustment Type Selector */}
            <div className="form-group">
              <label className="form-label">Movement Type:</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="unit-btn"
                  style={{
                    padding: "0.6rem",
                    borderColor: type === "restock" ? "var(--color-success)" : "var(--border-subtle)",
                    background: type === "restock" ? "var(--color-success-subtle)" : "var(--bg-card)",
                    color: type === "restock" ? "var(--color-success)" : "var(--text-secondary)",
                  }}
                  onClick={() => setType("restock")}
                >
                  <ArrowUpRight size={16} />
                  <span>Receive Stock</span>
                </button>

                <button
                  type="button"
                  className="unit-btn"
                  style={{
                    padding: "0.6rem",
                    borderColor: type === "damage" ? "var(--color-danger)" : "var(--border-subtle)",
                    background: type === "damage" ? "var(--color-danger-subtle)" : "var(--bg-card)",
                    color: type === "damage" ? "var(--color-danger)" : "var(--text-secondary)",
                  }}
                  onClick={() => setType("damage")}
                >
                  <AlertTriangle size={16} />
                  <span>Damaged / Loss</span>
                </button>

                <button
                  type="button"
                  className="unit-btn"
                  style={{
                    padding: "0.6rem",
                    borderColor: type === "return" ? "var(--color-warning)" : "var(--border-subtle)",
                    background: type === "return" ? "var(--color-warning-subtle)" : "var(--bg-card)",
                    color: type === "return" ? "var(--color-warning)" : "var(--text-secondary)",
                  }}
                  onClick={() => setType("return")}
                >
                  <RotateCcw size={16} />
                  <span>Supplier Return</span>
                </button>
              </div>
            </div>

            {/* Unit & Quantity */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Packaging Unit:</label>
                <select
                  className="form-select"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as UnitType)}
                >
                  <option value="ctn">Master Cartons ({product.pcsPerCtn} pcs/ctn)</option>
                  <option value="pack">Inner Packs ({product.pcsPerPack} pcs/pack)</option>
                  <option value="pcs">Loose Pieces (1 pc)</option>
                  <option value="plt">Pallets ({product.ctnPerPlt || 30} ctns)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Quantity in {formatUnitName(unit, true)}:</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  style={{ fontWeight: 700 }}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                  required
                />
              </div>
            </div>

            {/* Calculated Impact Preview */}
            <div
              style={{
                fontSize: "0.82rem",
                color: "var(--text-secondary)",
                padding: "0.6rem 0.85rem",
                background: "var(--bg-card)",
                borderRadius: "8px",
                border: "1px solid var(--border-subtle)",
              }}
            >
              Impact:{" "}
              <strong style={{ color: type === "restock" ? "var(--color-success)" : "var(--color-danger)" }}>
                {type === "restock" ? "+" : "-"}
                {calculatedPieces} total pieces
              </strong>{" "}
              ({quantity} {formatUnitName(unit, quantity > 1)})
            </div>

            {/* Reason / Reference */}
            <div className="form-group">
              <label className="form-label">Reference / PO # / Reason:</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. PO-2026-94, Water damage in transit, Physical inventory audit"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Stock Movement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
