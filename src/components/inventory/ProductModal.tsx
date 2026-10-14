import React, { useState } from "react";
import { X, Box, Save } from "lucide-react";
import { Product } from "../../types";
import { usePos } from "../../context/PosContext";

interface ProductModalProps {
  product?: Product;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addProduct, updateProduct } = usePos();

  const isEditing = Boolean(product);

  const [name, setName] = useState<string>(product?.name || "");
  const [sku, setSku] = useState<string>(
    product?.sku || `VWS-SKU-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [barcode, setBarcode] = useState<string>(
    product?.barcode || `789${Math.floor(100000000 + Math.random() * 900000000)}`
  );
  const [category, setCategory] = useState<string>(product?.category || "General Goods");
  const [costPrice, setCostPrice] = useState<number>(product?.costPrice || 5.0);
  const [pcsPerPack, setPcsPerPack] = useState<number>(product?.pcsPerPack || 6);
  const [pcsPerCtn, setPcsPerCtn] = useState<number>(product?.pcsPerCtn || 24);
  const [ctnPerPlt, setCtnPerPlt] = useState<number>(product?.ctnPerPlt || 30);

  // Pricing
  const [pcsPrice, setPcsPrice] = useState<number>(product?.pricing.pcsPrice || 8.0);
  const [packPrice, setPackPrice] = useState<number>(product?.pricing.packPrice || 45.0);
  const [ctnPrice, setCtnPrice] = useState<number>(product?.pricing.ctnPrice || 160.0);
  const [bulkTierMinUnits, setBulkTierMinUnits] = useState<number>(
    product?.pricing.bulkTierMinUnits || 5
  );
  const [bulkTierPrice, setBulkTierPrice] = useState<number>(
    product?.pricing.bulkTierPrice || 145.0
  );

  // Stock
  const [stockPcs, setStockPcs] = useState<number>(product?.stockPcs || 240);
  const [minStockPcs, setMinStockPcs] = useState<number>(product?.minStockPcs || 48);

  // Logistics
  const [batchNumber, setBatchNumber] = useState<string>(product?.batchNumber || "");
  const [expiryDate, setExpiryDate] = useState<string>(product?.expiryDate || "");
  const [location, setLocation] = useState<string>(product?.location || "Aisle A-01");
  const [supplier, setSupplier] = useState<string>(product?.supplier || "");
  const [description] = useState<string>(product?.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) return;

    const prodData = {
      name: name.trim(),
      sku: sku.trim(),
      barcode: barcode.trim(),
      category: category.trim(),
      costPrice,
      pcsPerPack,
      pcsPerCtn,
      ctnPerPlt,
      pricing: {
        pcsPrice,
        packPrice,
        ctnPrice,
        bulkTierMinUnits,
        bulkTierPrice,
      },
      stockPcs,
      minStockPcs,
      batchNumber: batchNumber.trim() || undefined,
      expiryDate: expiryDate.trim() || undefined,
      location: location.trim() || undefined,
      supplier: supplier.trim() || undefined,
      description: description.trim() || undefined,
      status: "active" as const,
    };

    if (isEditing && product) {
      updateProduct(product.id, prodData);
    } else {
      addProduct(prodData);
    }

    onClose();
  };

  return (
    <div className="modal-backdrop no-print" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "780px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Box size={20} color="var(--accent-primary)" />
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {isEditing ? "Edit Wholesale Product" : "New Wholesale Product Entry"}
              </h2>
              <span style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>
                Configure unit packaging multipliers, wholesale tiers, and warehouse parameters
              </span>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Section 1: Basic Product Identity */}
            <div className="form-grid-2">
              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <label className="form-label">Product Name / Description *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Pure Colombian Roast Coffee Beans (1kg)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">SKU / Item Code *</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Barcode / UPC</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Beverages, Dry Goods, Cleaning"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Base Purchase Cost ($ / Piece)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={costPrice}
                  onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Section 2: Multi-Unit Packaging Ratios */}
            <div
              style={{
                background: "var(--bg-card)",
                padding: "1rem",
                borderRadius: "10px",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-primary)", marginBottom: "0.75rem" }}>
                Wholesale Packaging Multipliers
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Pcs per Inner Pack:</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={pcsPerPack}
                    onChange={(e) => setPcsPerPack(parseInt(e.target.value, 10) || 1)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pcs per Master Carton:</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={pcsPerCtn}
                    onChange={(e) => setPcsPerCtn(parseInt(e.target.value, 10) || 1)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cartons per Pallet:</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={ctnPerPlt}
                    onChange={(e) => setCtnPerPlt(parseInt(e.target.value, 10) || 1)}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Tier Pricing */}
            <div
              style={{
                background: "var(--bg-card)",
                padding: "1rem",
                borderRadius: "10px",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-primary)", marginBottom: "0.75rem" }}>
                Selling Price Tiers
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "0.75rem" }}>
                <div className="form-group">
                  <label className="form-label">Piece Price ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={pcsPrice}
                    onChange={(e) => setPcsPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pack Price ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={packPrice}
                    onChange={(e) => setPackPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Wholesale Carton Price ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    style={{ fontWeight: 700, borderColor: "var(--accent-primary)" }}
                    value={ctnPrice}
                    onChange={(e) => setCtnPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Bulk Tier Min Cartons:</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={bulkTierMinUnits}
                    onChange={(e) => setBulkTierMinUnits(parseInt(e.target.value, 10) || 1)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bulk Tier Price ($ / Ctn):</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={bulkTierPrice}
                    onChange={(e) => setBulkTierPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Stock & Warehouse Logistics */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Current Stock (Total Pieces):</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  style={{ fontWeight: 700 }}
                  value={stockPcs}
                  onChange={(e) => setStockPcs(parseInt(e.target.value, 10) || 0)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reorder Min Alert (Pieces):</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={minStockPcs}
                  onChange={(e) => setMinStockPcs(parseInt(e.target.value, 10) || 0)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Warehouse Bin / Aisle Location:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Aisle B-04 / Rack 2"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Supplier Name:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Global Grains Exporters"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Batch / Lot Number:</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder="e.g. LOT-2026-X1"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expiry Date (YYYY-MM-DD):</label>
                <input
                  type="date"
                  className="form-input"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={18} />
              <span>{isEditing ? "Update Product" : "Save Product"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
