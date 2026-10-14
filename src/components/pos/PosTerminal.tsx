import React, { useMemo } from "react";
import { ProductCard } from "./ProductCard";
import { CartPanel } from "./CartPanel";
import { usePos } from "../../context/PosContext";
import { AlertCircle } from "lucide-react";

export const PosTerminal: React.FC = () => {
  const {
    products,
    searchQuery,
    selectedCategory,
    setSelectedCategory,
  } = usePos();

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.status === "active") set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [products]);

  // Filter products by search query and category
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (prod.status !== "active") return false;

      const matchesCat = selectedCategory === "All" || prod.category === selectedCategory;

      if (!matchesCat) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        prod.name.toLowerCase().includes(q) ||
        prod.sku.toLowerCase().includes(q) ||
        prod.barcode.toLowerCase().includes(q) ||
        prod.category.toLowerCase().includes(q) ||
        (prod.location && prod.location.toLowerCase().includes(q))
      );
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="pos-layout">
      {/* Left: Products & Categories */}
      <div className="pos-catalog-panel">
        {/* Category Pills Bar */}
        <div className="pos-filters-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div
            style={{
              height: "300px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              color: "var(--text-muted)",
              background: "var(--bg-card)",
              borderRadius: "14px",
              border: "1px dashed var(--border-subtle)",
            }}
          >
            <AlertCircle size={32} />
            <p style={{ fontSize: "0.95rem", fontWeight: 600 }}>
              No wholesale products match your search or filter
            </p>
            <span style={{ fontSize: "0.8rem" }}>
              Try searching by SKU, barcode, or select &quot;All&quot; categories.
            </span>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>

      {/* Right: Cart & Settlement Panel */}
      <CartPanel />
    </div>
  );
};
