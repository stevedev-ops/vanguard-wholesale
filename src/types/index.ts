export type UnitType = "pcs" | "pack" | "ctn" | "plt";

export type CustomerTier = "retail" | "wholesale" | "distributor";
export type PaymentTerms = "immediate" | "net15" | "net30" | "net60";
export type PaymentMethod = "cash" | "card" | "bank_transfer" | "credit" | "split";
export type SaleOrderStatus = "paid" | "partial" | "unpaid";
export type StockMovementType = "sale" | "restock" | "damage" | "adjustment" | "return";

export interface TierPricing {
  pcsPrice: number;        // Retail single piece price
  packPrice: number;       // Pack price (e.g. 6 pcs)
  ctnPrice: number;        // Standard wholesale carton price (e.g. 24 pcs)
  bulkTierMinUnits: number; // e.g. 5 cartons or 120 pcs
  bulkTierPrice: number;   // Special distributor/bulk price per carton or unit
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  costPrice: number;       // Base purchase cost per piece
  pcsPerPack: number;      // e.g. 6 pcs per inner pack
  pcsPerCtn: number;       // e.g. 24 pcs per carton
  ctnPerPlt?: number;      // e.g. 40 cartons per pallet
  pricing: TierPricing;
  stockPcs: number;        // Total stock counted in pieces
  minStockPcs: number;     // Low stock reorder threshold
  batchNumber?: string;    // Batch / Lot #
  expiryDate?: string;     // YYYY-MM-DD
  location?: string;       // Warehouse aisle / bin location (e.g. Aisle 3-B)
  supplier?: string;
  description?: string;
  status: "active" | "archived";
}

export interface Customer {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  taxId?: string;          // VAT / TIN / Tax registration
  address: string;
  tier: CustomerTier;
  creditLimit: number;
  currentBalance: number;  // Amount customer currently owes
  paymentTerms: PaymentTerms;
  notes?: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  selectedUnit: UnitType;
  unitMultiplier: number;  // e.g., 1 for pcs, pcsPerPack for pack, pcsPerCtn for ctn
  quantity: number;        // Quantity in selected unit
  unitPrice: number;       // Price per selected unit
  totalPieces: number;     // quantity * unitMultiplier
  discountPercent: number; // Discount % applied
  lineTotal: number;       // (unitPrice * quantity) * (1 - discountPercent/100)
}

export interface SaleOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerCompany: string;
  items: CartItem[];
  subtotal: number;
  wholesaleSavings: number; // Difference from retail price
  taxRate: number;
  taxAmount: number;
  shippingFee: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  paymentMethod: PaymentMethod;
  splitDetails?: {
    cashAmount?: number;
    cardAmount?: number;
    transferAmount?: number;
    creditAmount?: number;
  };
  status: SaleOrderStatus;
  createdAt: string;
  dueDate: string;
  cashierName: string;
  notes?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantityPcs: number;     // +/- pieces moved
  unit: UnitType;
  unitQuantity: number;
  previousStockPcs: number;
  newStockPcs: number;
  reference: string;       // Order number, PO number, or adjustment note
  createdAt: string;
  costPerPiece?: number;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  currency: string;
  currencySymbol: string;
  defaultTaxRate: number;
  invoicePrefix: string;
  footerMessage: string;
  enableStockAlerts: boolean;
}

export type ActiveTab = "pos" | "inventory" | "customers" | "orders" | "analytics" | "settings";
