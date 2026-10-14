import { UnitType, Product, CustomerTier } from "../types";

export const formatCurrency = (amount: number, symbol: string = "$"): string => {
  if (isNaN(amount)) return `${symbol}0.00`;
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (dateString: string): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatUnitName = (unit: UnitType, isPlural: boolean = false): string => {
  switch (unit) {
    case "pcs":
      return isPlural ? "Pieces" : "Piece";
    case "pack":
      return isPlural ? "Packs" : "Pack";
    case "ctn":
      return isPlural ? "Cartons" : "Carton";
    case "plt":
      return isPlural ? "Pallets" : "Pallet";
    default:
      return unit;
  }
};

export const formatStockBreakdown = (
  stockPcs: number,
  pcsPerPack: number,
  pcsPerCtn: number
): { cartons: number; packs: number; pieces: number; summary: string } => {
  if (stockPcs <= 0) {
    return { cartons: 0, packs: 0, pieces: 0, summary: "0 pcs (Out of Stock)" };
  }

  const cartons = Math.floor(stockPcs / pcsPerCtn);
  const remainderAfterCartons = stockPcs % pcsPerCtn;
  const packs = pcsPerPack > 0 ? Math.floor(remainderAfterCartons / pcsPerPack) : 0;
  const pieces = pcsPerPack > 0 ? remainderAfterCartons % pcsPerPack : remainderAfterCartons;

  const parts: string[] = [];
  if (cartons > 0) parts.push(`${cartons} ctn${cartons > 1 ? "s" : ""}`);
  if (packs > 0) parts.push(`${packs} pk${packs > 1 ? "s" : ""}`);
  if (pieces > 0 || parts.length === 0) parts.push(`${pieces} pc${pieces > 1 ? "s" : ""}`);

  return {
    cartons,
    packs,
    pieces,
    summary: `${parts.join(", ")} (${stockPcs} total pcs)`,
  };
};

/**
 * Calculates the unit price for a given product based on selected packaging unit,
 * order quantity, and wholesale customer tier.
 */
export const calculateWholesalePrice = (
  product: Product,
  unit: UnitType,
  quantity: number = 1,
  customerTier: CustomerTier = "wholesale"
): { unitPrice: number; isBulkTierApplied: boolean; retailEquivalent: number } => {
  const { pricing, pcsPerPack, pcsPerCtn } = product;

  let basePrice = 0;
  let piecesCount = 0;

  switch (unit) {
    case "pcs":
      basePrice = pricing.pcsPrice;
      piecesCount = quantity;
      break;
    case "pack":
      basePrice = pricing.packPrice;
      piecesCount = quantity * pcsPerPack;
      break;
    case "ctn":
      basePrice = pricing.ctnPrice;
      piecesCount = quantity * pcsPerCtn;
      break;
    case "plt":
      basePrice = (pricing.ctnPrice * (product.ctnPerPlt || 30)) * 0.92; // 8% pallet volume discount
      piecesCount = quantity * (product.ctnPerPlt || 30) * pcsPerCtn;
      break;
  }

  // Check if bulk tier price applies
  // 1. If unit is carton and quantity >= bulkTierMinUnits
  // 2. OR customer is VIP distributor
  const meetsQuantityTier =
    (unit === "ctn" && quantity >= pricing.bulkTierMinUnits) ||
    (unit === "pcs" && piecesCount >= pricing.bulkTierMinUnits * pcsPerCtn);

  let finalPrice = basePrice;
  let isBulkTierApplied = false;

  if (unit === "ctn" && (meetsQuantityTier || customerTier === "distributor")) {
    finalPrice = pricing.bulkTierPrice;
    isBulkTierApplied = true;
  } else if (unit === "pcs" && (meetsQuantityTier || customerTier === "distributor")) {
    // Pro-rated bulk carton price per piece
    finalPrice = Math.min(basePrice, Number((pricing.bulkTierPrice / pcsPerCtn).toFixed(2)));
    isBulkTierApplied = true;
  } else if (customerTier === "wholesale" && unit === "pcs") {
    // Wholesale buyer buying loose pieces gets carton rate per piece
    finalPrice = Math.min(basePrice, Number((pricing.ctnPrice / pcsPerCtn).toFixed(2)));
  }

  // Calculate equivalent retail price for savings calculation
  let retailEquivalent = 0;
  if (unit === "pcs") retailEquivalent = pricing.pcsPrice;
  else if (unit === "pack") retailEquivalent = pricing.pcsPrice * pcsPerPack;
  else if (unit === "ctn") retailEquivalent = pricing.pcsPrice * pcsPerCtn;
  else if (unit === "plt") retailEquivalent = pricing.pcsPrice * pcsPerCtn * (product.ctnPerPlt || 30);

  return {
    unitPrice: finalPrice,
    isBulkTierApplied,
    retailEquivalent,
  };
};
