import React, { useState, useMemo } from "react";
import {
  Users,
  Plus,
  Search,
  DollarSign,
  Building,
  History,
  Edit,
  Trash2,
  ShieldAlert,
} from "lucide-react";
import { Customer } from "../../types";
import { usePos } from "../../context/PosContext";
import { formatCurrency } from "../../utils/formatters";
import { CustomerModal } from "./CustomerModal";
import { LedgerModal } from "./LedgerModal";

export const CustomerList: React.FC = () => {
  const { customers, deleteCustomer, settings } = usePos();

  const [search, setSearch] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<string>("All");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [ledgerCustomer, setLedgerCustomer] = useState<Customer | null>(null);

  // KPIs
  const kpis = useMemo(() => {
    let totalReceivable = 0;
    let totalCreditExtended = 0;
    let accountsWithDebt = 0;
    let distributorCount = 0;

    customers.forEach((c) => {
      totalReceivable += c.currentBalance || 0;
      totalCreditExtended += c.creditLimit || 0;
      if (c.currentBalance > 0) accountsWithDebt++;
      if (c.tier === "distributor") distributorCount++;
    });

    return {
      totalReceivable,
      totalCreditExtended,
      accountsWithDebt,
      distributorCount,
    };
  }, [customers]);

  // Filtered
  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (tierFilter !== "All" && c.tier !== tierFilter) return false;

      if (!search.trim()) return true;

      const q = search.toLowerCase();
      return (
        c.companyName.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.taxId && c.taxId.toLowerCase().includes(q))
      );
    });
  }, [customers, tierFilter, search]);

  const handleDelete = (c: Customer) => {
    if (c.id === "cust-walkin") {
      alert("Cannot delete the default walk-in customer profile.");
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to remove ${c.companyName}? Any transaction history will be preserved.`
      )
    ) {
      deleteCustomer(c.id);
    }
  };

  return (
    <div className="page-body">
      {/* Top Trade Credit KPIs */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Accounts Receivable</div>
            <div className="stat-value" style={{ color: kpis.totalReceivable > 0 ? "var(--color-danger)" : "var(--color-success)" }}>
              {formatCurrency(kpis.totalReceivable, settings.currencySymbol)}
            </div>
            <div className="stat-sub">
              <span>{kpis.accountsWithDebt} trade accounts have balances due</span>
            </div>
          </div>
          <div className="stat-icon" style={{ background: "var(--color-danger-subtle)", color: "var(--color-danger)" }}>
            <DollarSign size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Total Credit Facility</div>
            <div className="stat-value">
              {formatCurrency(kpis.totalCreditExtended, settings.currencySymbol)}
            </div>
            <div className="stat-sub">
              <span>Extended across {customers.length} business accounts</span>
            </div>
          </div>
          <div className="stat-icon" style={{ background: "var(--accent-primary-subtle)", color: "var(--accent-primary)" }}>
            <Building size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">VIP Distributors</div>
            <div className="stat-value">{kpis.distributorCount}</div>
            <div className="stat-sub">
              <span>Tier-1 bulk contracts</span>
            </div>
          </div>
          <div className="stat-icon" style={{ background: "var(--color-purple-subtle)", color: "var(--color-purple)" }}>
            <Users size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Trade Accounts</div>
            <div className="stat-value">{customers.length}</div>
            <div className="stat-sub">
              <span>Registered wholesale clients</span>
            </div>
          </div>
          <div className="stat-icon" style={{ background: "var(--color-success-subtle)", color: "var(--color-success)" }}>
            <Users size={22} />
          </div>
        </div>
      </div>

      {/* Action & Filter Toolbar */}
      <div
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          padding: "1rem 1.25rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: "280px" }}>
          <div className="search-box" style={{ maxWidth: "340px" }}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search companies, contacts, TIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
          >
            <option value="All">All Wholesale Tiers</option>
            <option value="distributor">VIP Distributors</option>
            <option value="wholesale">Standard Wholesale</option>
            <option value="retail">Sample / Retail</option>
          </select>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setIsNewModalOpen(true)}
        >
          <Plus size={18} />
          <span>New Trade Customer</span>
        </button>
      </div>

      {/* Customer Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Business / Company</th>
              <th>Contact Details</th>
              <th>Wholesale Tier</th>
              <th>Credit Terms</th>
              <th>Credit Limit</th>
              <th>Outstanding Balance</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                  No customer accounts found matching criteria.
                </td>
              </tr>
            ) : (
              filtered.map((cust) => {
                const isOverLimit = cust.creditLimit > 0 && cust.currentBalance > cust.creditLimit;

                return (
                  <tr key={cust.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                        {cust.companyName}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", gap: "0.4rem", marginTop: "0.15rem" }}>
                        <span>Attn: {cust.name}</span>
                        {cust.taxId && <span>? TIN: {cust.taxId}</span>}
                      </div>
                    </td>

                    <td style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                      <div>{cust.phone}</div>
                      <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>{cust.email}</div>
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          cust.tier === "distributor"
                            ? "badge-purple"
                            : cust.tier === "wholesale"
                            ? "badge-blue"
                            : "badge-amber"
                        }`}
                        style={{ textTransform: "uppercase" }}
                      >
                        {cust.tier}
                      </span>
                    </td>

                    <td style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                      {cust.paymentTerms.toUpperCase()}
                    </td>

                    <td style={{ fontSize: "0.88rem", fontWeight: 700 }}>
                      {cust.creditLimit > 0 ? (
                        formatCurrency(cust.creditLimit, settings.currencySymbol)
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>No Credit (Cash Only)</span>
                      )}
                    </td>

                    <td>
                      {cust.currentBalance > 0 ? (
                        <div>
                          <span
                            style={{
                              fontWeight: 800,
                              fontSize: "0.95rem",
                              color: "var(--color-danger)",
                            }}
                          >
                            {formatCurrency(cust.currentBalance, settings.currencySymbol)}
                          </span>
                          {isOverLimit && (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--color-danger)", fontSize: "0.7rem", fontWeight: 600 }}>
                              <ShieldAlert size={12} /> Exceeds Limit!
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "var(--color-success)", fontWeight: 600, fontSize: "0.85rem" }}>
                          Clear ($0.00)
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                        <button
                          className="btn-icon"
                          style={{ width: "32px", height: "32px" }}
                          title="View Statement & Record Payment"
                          onClick={() => setLedgerCustomer(cust)}
                        >
                          <History size={16} color="var(--accent-primary)" />
                        </button>
                        <button
                          className="btn-icon"
                          style={{ width: "32px", height: "32px" }}
                          title="Edit Customer"
                          onClick={() => setEditingCustomer(cust)}
                        >
                          <Edit size={16} />
                        </button>
                        {cust.id !== "cust-walkin" && (
                          <button
                            className="btn-icon"
                            style={{ width: "32px", height: "32px" }}
                            title="Delete Customer"
                            onClick={() => handleDelete(cust)}
                          >
                            <Trash2 size={16} color="var(--color-danger)" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {isNewModalOpen && <CustomerModal onClose={() => setIsNewModalOpen(false)} />}
      {editingCustomer && (
        <CustomerModal customer={editingCustomer} onClose={() => setEditingCustomer(null)} />
      )}
      {ledgerCustomer && (
        <LedgerModal customer={ledgerCustomer} onClose={() => setLedgerCustomer(null)} />
      )}
    </div>
  );
};
