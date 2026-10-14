import React from "react";
import { X, Keyboard } from "lucide-react";
import { usePos } from "../../context/PosContext";

export const ShortcutsModal: React.FC = () => {
  const { isShortcutsOpen, setIsShortcutsOpen } = usePos();

  if (!isShortcutsOpen) return null;

  const shortcuts = [
    { key: "F2", action: "Open Checkout / Settlement modal for current cart" },
    { key: "/", action: "Focus search bar to find product SKU or name" },
    { key: "Esc", action: "Close open modal dialogs or clear search input" },
    { key: "Tab 1-6", action: "Quick navigate between POS, Inventory, Customers, Orders, Analytics, Settings" },
    { key: "Barcode Scan", action: "Hardware barcode scanner auto-adds matched item" },
  ];

  return (
    <div className="modal-backdrop no-print" onClick={() => setIsShortcutsOpen(false)}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Keyboard size={20} color="var(--accent-primary)" />
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Keyboard Hotkeys & Scanner Support
            </h2>
          </div>
          <button className="btn-icon" onClick={() => setIsShortcutsOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {shortcuts.map((s, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.65rem 0.85rem",
                  background: "var(--bg-card)",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  {s.action}
                </span>
                <kbd
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-strong)",
                    padding: "0.25rem 0.55rem",
                    borderRadius: "6px",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    color: "var(--accent-primary)",
                    fontFamily: "monospace",
                  }}
                >
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsShortcutsOpen(false)}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
