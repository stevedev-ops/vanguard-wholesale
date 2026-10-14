import React from "react";
import { Package, Box, Layers, Tag } from "lucide-react";
import { Product, UnitType } from "../../types";
import { usePos } from "../../context/PosContext";
import {
  formatCurrency,
  formatStockBreakdown,
  calculateWholesalePrice,
} from "../../utils/formatters";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, selectedCustomer, settings } = usePos();

  const isOutOfStock = product.stockPcs <= 0;
  const isLowStock = !isOutOfStock && product.stockPcs <= product.minStockPcs;

  const stockInfo = formatStockBreakdown(
    product.stockPcs,
    product.pcsPerPack,
    product.pcsPerCtn
  );

  const pcsPricing = calculateWholesalePrice(product, "pcs", 1, selectedCustomer.tier);
  const packPricing = calculateWholesalePrice(product, "pack", 1, selectedCustomer.tier);
  const ctnPricing = calculateWholesalePrice(product, "ctn", 1, selectedCustomer.tier);

  const handleAdd = (unit: UnitType, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, unit, 1);
  };

  return (
    <div className={`product-pos-card ${isOutOfStock ? "out-of-stock" : ""}`}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.4rem" }}>
          <span className="sku-code" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            {product.sku}
          </span>
          {isOutOfStock ? (
            <span className="badge badge-red">Out of Stock</span>
          ) : isLowStock ? (
            <span className="badge badge-amber">Low Stock ({product.stockPcs} pcs)</span>
          ) : (
            <span className="badge badge-green" style={{ fontSize: "0.7rem" }}>
              {stockInfo.cartons > 0 ? `${stockInfo.cartons} Ctns` : `${product.stockPcs} Pcs`}
            </span>
          )}
        </div>

        <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3, marginBottom: "0.35rem" }}>
          {product.name}
        </h2>

        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.76rem", color: "var(--text-secondary)" }}>
          <Tag size={12} color="var(--accent-primary)" />
          <span>{product.category}</span>
          <span>?</span>
          <span title="Pack breakdown">{product.pcsPerCtn} pcs/ctn</span>
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: "0.73rem",
            color: "var(--text-muted)",
            marginBottom: "0.45rem",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>Quick Add Unit:</span>
          {ctnPricing.isBulkTierApplied && (
            <span style={{ color: "var(--color-warning)", fontWeight: 600 }}>
              ? Bulk Rate Applied
            </span>
          )}
        </div>

        <div className="product-unit-buttons">
          {/* Piece Button */}
          <button
            type="button"
            className="unit-btn"
            disabled={isOutOfStock}
            onClick={(e) => handleAdd("pcs", e)}
            title={`Add 1 Piece @ ${formatCurrency(pcsPricing.unitPrice, settings.currencySymbol)}`}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
              <Package size={11} />
              <span>Piece</span>
            </div>
            <span className="unit-price">
              {formatCurrency(pcsPricing.unitPrice, settings.currencySymbol)}
            </span>
          </button>

          {/* Pack Button */}
          <button
            type="button"
            className="unit-btn"
            disabled={isOutOfStock || product.stockPcs < product.pcsPerPack}
            onClick={(e) => handleAdd("pack", e)}
            title={`Add 1 Pack (${product.pcsPerPack} pcs) @ ${formatCurrency(packPricing.unitPrice, settings.currencySymbol)}`}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
              <Box size={11} />
              <span>Pk ({product.pcsPerPack})</span>
            </div>
            <span className="unit-price">
              {formatCurrency(packPricing.unitPrice, settings.currencySymbol)}
            </span>
          </button>

          {/* Carton Button */}
          <button
            type="button"
            className="unit-btn"
            style={{
              borderColor: "var(--accent-primary-subtle)",
              background: "var(--accent-primary-subtle)",
              color: "var(--accent-primary)",
            }}
            disabled={isOutOfStock || product.stockPcs < product.pcsPerCtn}
            onClick={(e) => handleAdd("ctn", e)}
            title={`Add 1 Wholesale Carton (${product.pcsPerCtn} pcs) @ ${formatCurrency(ctnPricing.unitPrice, settings.currencySymbol)}`}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
              <Layers size={11} />
              <span>Ctn ({product.pcsPerCtn})</span>
            </div>
            <span className="unit-price" style={{ fontWeight: 700, color: "var(--accent-primary)" }}>
              {formatCurrency(ctnPricing.unitPrice, settings.currencySymbol)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
