import React, { useState, useRef } from "react";
import {
  Save,
  Download,
  Upload,
  RotateCcw,
  Building,
  DollarSign,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { usePos } from "../../context/PosContext";

export const SettingsModal: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportDatabase,
    importDatabase,
    resetToDemoData,
    products,
    customers,
    orders,
  } = usePos();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [storeName, setStoreName] = useState(settings.storeName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [taxId, setTaxId] = useState(settings.taxId);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [currency, setCurrency] = useState(settings.currency);
  const [defaultTaxRate, setDefaultTaxRate] = useState(settings.defaultTaxRate);
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoicePrefix);
  const [footerMessage, setFooterMessage] = useState(settings.footerMessage);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName,
      tagline,
      address,
      phone,
      email,
      taxId,
      currencySymbol,
      currency,
      defaultTaxRate,
      invoicePrefix,
      footerMessage,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDatabase(content);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="page-body">
      <div style={{ maxWidth: "860px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Header */}
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)" }}>
            Store Configuration & Data Management
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            Manage commercial letterhead information, tax rates, JSON backups, and Vercel cloud synchronization.
          </p>
        </div>

        {/* Store Settings Form */}
        <form onSubmit={handleSaveSettings} className="card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--accent-primary)", display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <Building size={18} /> Company Profile & Commercial Invoicing
          </h3>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Wholesale Business Name *</label>
              <input
                type="text"
                className="form-input"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tagline / Business Subtitle</label>
              <input
                type="text"
                className="form-input"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ gridColumn: "span 2" }}>
              <label className="form-label">Warehouse Logistics Address</label>
              <input
                type="text"
                className="form-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone / Dispatch Line</label>
              <input
                type="text"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Orders Email</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tax ID / EIN / VAT Registration #</label>
              <input
                type="text"
                className="form-input font-mono"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Invoice Number Prefix</label>
              <input
                type="text"
                className="form-input font-mono"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
              />
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--accent-primary)", marginBottom: "0.85rem", display: "flex", alignItems: "center", gap: "0.45rem" }}>
              <DollarSign size={18} /> Currency & Wholesale Tax Rules
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Currency Symbol:</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ textAlign: "center", fontWeight: 700 }}
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Currency Code:</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ textTransform: "uppercase" }}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Wholesale Tax Rate (%):</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="form-input"
                  value={defaultTaxRate}
                  onChange={(e) => setDefaultTaxRate(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Invoice Footer & Terms Note:</label>
            <input
              type="text"
              className="form-input"
              value={footerMessage}
              onChange={(e) => setFooterMessage(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="btn btn-primary" style={{ padding: "0.65rem 1.4rem" }}>
              <Save size={18} />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>

        {/* Database Backup & Export Card */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <Globe size={18} color="var(--accent-primary)" />
            <span>Database Backup & Vercel Data Portability</span>
          </h3>

          <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            This MVP stores your wholesale catalog, customers, and invoice records securely in local storage.
            You can export your complete database anytime to transfer between devices or backup your records.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.85rem",
              background: "var(--bg-surface)",
              padding: "1rem",
              borderRadius: "10px",
              border: "1px solid var(--border-subtle)",
              textAlign: "center",
            }}
          >
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Catalog Items:</span>
              <div style={{ fontSize: "1.25rem", fontWeight: 800 }}>{products.length} SKUs</div>
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Trade Customers:</span>
              <div style={{ fontSize: "1.25rem", fontWeight: 800 }}>{customers.length} Accounts</div>
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Sales Invoices:</span>
              <div style={{ fontSize: "1.25rem", fontWeight: 800 }}>{orders.length} Records</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
            <button type="button" className="btn btn-secondary" onClick={exportDatabase}>
              <Download size={18} />
              <span>Export Full Database (JSON)</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={18} />
              <span>Restore Database (Upload JSON)</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ color: "var(--color-danger)", marginLeft: "auto" }}
              onClick={resetToDemoData}
            >
              <RotateCcw size={18} />
              <span>Reset to Sample Wholesale Data</span>
            </button>
          </div>
        </div>

        {/* Vercel Deployment Guide Banner */}
        <div
          className="card"
          style={{
            background: "linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%)",
            borderColor: "rgba(59, 130, 246, 0.3)",
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle2 size={20} color="var(--accent-primary)" />
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Ready for 1-Click Vercel Deployment
            </h4>
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            This application is configured with a custom <code>vercel.json</code>, zero server-side dependencies,
            and offline-first client architecture. When you push to GitHub and connect to Vercel, it deploys automatically in under 30 seconds with global CDN performance!
          </p>
        </div>
      </div>
    </div>
  );
};
