import React, { useState } from "react";
import { X, Building, Save } from "lucide-react";
import { Customer, CustomerTier, PaymentTerms } from "../../types";
import { usePos } from "../../context/PosContext";

interface CustomerModalProps {
  customer?: Customer;
  onClose: () => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({ customer, onClose }) => {
  const { addCustomer, updateCustomer } = usePos();

  const isEditing = Boolean(customer);

  const [companyName, setCompanyName] = useState<string>(customer?.companyName || "");
  const [name, setName] = useState<string>(customer?.name || "");
  const [phone, setPhone] = useState<string>(customer?.phone || "");
  const [email, setEmail] = useState<string>(customer?.email || "");
  const [taxId, setTaxId] = useState<string>(customer?.taxId || "");
  const [address, setAddress] = useState<string>(customer?.address || "");
  const [tier, setTier] = useState<CustomerTier>(customer?.tier || "wholesale");
  const [creditLimit, setCreditLimit] = useState<number>(customer?.creditLimit || 5000);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>(
    customer?.paymentTerms || "net30"
  );
  const [notes, setNotes] = useState<string>(customer?.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    const data = {
      companyName: companyName.trim(),
      name: name.trim() || companyName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      taxId: taxId.trim() || undefined,
      address: address.trim(),
      tier,
      creditLimit,
      paymentTerms,
      notes: notes.trim() || undefined,
    };

    if (isEditing && customer) {
      updateCustomer(customer.id, data);
    } else {
      addCustomer(data);
    }

    onClose();
  };

  return (
    <div className="modal-backdrop no-print" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "620px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Building size={20} color="var(--accent-primary)" />
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {isEditing ? "Edit Trade Customer" : "New Wholesale Trade Account"}
              </h2>
              <span style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>
                Configure credit limit, B2B payment terms, and tax identification
              </span>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid-2">
              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <label className="form-label">Business / Company Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Apex Hypermarket LLC"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Person Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. David Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tax ID / TIN / VAT #</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder="e.g. US-EIN-9481920"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="purchasing@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Address / Logistics Dock</label>
              <input
                type="text"
                className="form-input"
                placeholder="Street address, Dock number, City, State"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Credit Terms & Wholesale Tier */}
            <div
              style={{
                background: "var(--bg-card)",
                padding: "1rem",
                borderRadius: "10px",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-primary)", marginBottom: "0.75rem" }}>
                Commercial Credit & Pricing Terms
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Wholesale Tier:</label>
                  <select
                    className="form-select"
                    value={tier}
                    onChange={(e) => setTier(e.target.value as CustomerTier)}
                  >
                    <option value="retail">Sample / Retail</option>
                    <option value="wholesale">Standard Wholesale</option>
                    <option value="distributor">VIP Distributor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Terms:</label>
                  <select
                    className="form-select"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value as PaymentTerms)}
                  >
                    <option value="immediate">Immediate / Spot</option>
                    <option value="net15">Net 15 Days</option>
                    <option value="net30">Net 30 Days</option>
                    <option value="net60">Net 60 Days</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Credit Limit ($):</label>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    className="form-input"
                    style={{ fontWeight: 700 }}
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Account Notes:</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Logistics preferences, dock hours, special pricing agreements..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={18} />
              <span>{isEditing ? "Update Account" : "Save Trade Account"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
