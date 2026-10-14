# Vanguard Wholesale POS & Inventory ERP (MVP)

A modern, high-performance **Point of Sale (POS) and Inventory Management System** purpose-built for wholesale distributors, B2B stockists, and bulk supply shops. Engineered for rapid 1-click deployment on **Vercel** with zero-configuration client-side persistence.

---

## ?? Key Wholesale Capabilities

### 1. Multi-Unit Packaging & Dynamic Bulk Tier Pricing
- **Flexible Packaging Ratios**: Seamlessly sell and track products in **Loose Pieces (`pcs`)**, **Inner Packs (`pack`)**, **Master Cartons (`ctn`)**, and **Bulk Pallets (`plt`)**.
- **Wholesale Bulk Tier Rules**: Automatic volume discount triggers when order quantities meet threshold tiers (e.g. 5+ cartons or 120+ pcs).
- **Customer Pricing Tiers**: Distinct pricing for **Sample/Retail**, **Standard Wholesale**, and **VIP Distributor** trade accounts.
- **Instant Wholesale Savings Indicator**: Computes and highlights real-time savings versus retail piece rates.

### 2. Trade Customer Credit & Accounts Receivable Ledger
- **B2B Payment Terms**: Support for **Immediate**, **Net 15**, **Net 30**, and **Net 60 Days** credit agreements.
- **Credit Limit & Debt Auditing**: Tracks customer balances, flags credit limit exceedance, and maintains debt statements.
- **Debt Repayment Postings**: Record partial or full balance settlements via Bank Wire, Cash Deposit, or Corporate Cheque.

### 3. Fast POS Settlement & Invoicing
- **Multi-Channel Settlement**: Cash (with tender presets & live change calculator), Credit/Debit Card, Bank Wire Transfer (with ref code), Trade Credit (On Account), and Split Deposits.
- **Dual Invoice Formats**:
  - **A4 / Letterhead Commercial Tax Invoice**: Ready for official B2B logistics delivery and tax filing.
  - **80mm Thermal Receipt**: Formatted for standard POS thermal slip receipt printers.

### 4. Inventory Management & Warehouse Logistics
- **Stock Multipliers**: Real-time conversion between pieces and cartons on hand (e.g., "40 Ctns (480 Pcs)").
- **Low Stock & Depleted Alerts**: Visual warnings when stock falls below reorder thresholds.
- **Inward Receiving & Stock Adjustments**: Fast stock intake from suppliers, damage write-offs, and physical audit corrections.
- **Lot / Batch & Expiry Tracking**: Essential for food, beverage, chemicals, and FMCG wholesale lines.
- **Bin & Aisle Mapping**: Warehouse locations for rapid order picking.

### 5. Wholesale Analytics & Margins
- **Gross Revenue vs. COGS**: Accurate gross profit and percentage margin calculations.
- **Top Performing SKUs**: Track bestsellers by revenue and carton volume.
- **Category Sales Breakdown**: Visual distribution of turnover across dry goods, beverages, packaging, and cleaning.
- **Warehouse Audit Trail**: Chronological log of all stock movements.

### 6. Offline-First & Vercel Ready
- **Zero Server Setup Needed**: Persists all changes to browser `localStorage` with initial FMCG demo seed data.
- **Full Database Portability**: 1-click JSON backup export & restore for zero risk of data loss.
- **Reset to Sample Wholesale Data**: Quickly reset anytime for demonstration purposes.

---

## ? Deployment to Vercel

This repository includes a pre-configured [`vercel.json`](./vercel.json) optimized for Vite SPA routing and asset caching.

### Option 1: Vercel Web Dashboard (Recommended)
1. Push this project to your GitHub, GitLab, or Bitbucket account.
2. In the [Vercel Dashboard](https://vercel.com/new), select **Add New Project**.
3. Import this repository.
4. Framework Preset will be automatically detected as **Vite**.
5. Click **Deploy**. Your wholesale POS MVP will be live globally in ~30 seconds!

### Option 2: Deploy via Vercel CLI
```bash
npm install -g vercel
vercel
# Follow the interactive prompts and confirm deployment
```

---

## ?? Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run TypeScript compilation and build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## ?? Hotkeys & Shortcuts
- **`F2`**: Quick checkout / order settlement modal.
- **`?` or `F1`**: Open shortcuts reference dialog.
- **`/`**: Focus global product search bar.
- **`Esc`**: Close active modals or clear search.
- **`Alt + 1` through `Alt + 6`**: Jump directly between POS, Inventory, Customers, Orders, Analytics, and Settings tabs.
