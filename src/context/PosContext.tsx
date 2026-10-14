import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import confetti from "canvas-confetti";
import {
  Product,
  Customer,
  SaleOrder,
  StockMovement,
  StoreSettings,
  CartItem,
  UnitType,
  PaymentMethod,
  ActiveTab,
  StockMovementType,
} from "../types";
import {
  initialSettings,
  initialProducts,
  initialCustomers,
  initialOrders,
  initialMovements,
} from "../data/initialData";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "../utils/storage";
import { calculateWholesalePrice } from "../utils/formatters";

export interface ToastNotification {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface PosContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;

  // Products & Inventory
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (
    productId: string,
    type: StockMovementType,
    unitQuantity: number,
    unit: UnitType,
    reference: string
  ) => boolean;

  // Customers
  customers: Customer[];
  selectedCustomer: Customer;
  setSelectedCustomer: (customer: Customer) => void;
  addCustomer: (customer: Omit<Customer, "id" | "currentBalance">) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  recordCustomerPayment: (
    customerId: string,
    amount: number,
    method: string,
    reference: string
  ) => void;

  // Cart & POS
  cart: CartItem[];
  addToCart: (product: Product, unit?: UnitType, quantity?: number) => void;
  updateCartItemUnit: (productId: string, oldUnit: UnitType, newUnit: UnitType) => void;
  updateCartItemQuantity: (productId: string, unit: UnitType, quantity: number) => void;
  updateCartItemDiscount: (productId: string, unit: UnitType, discountPercent: number) => void;
  removeFromCart: (productId: string, unit: UnitType) => void;
  clearCart: () => void;
  cartTotals: {
    subtotal: number;
    wholesaleSavings: number;
    taxRate: number;
    taxAmount: number;
    shippingFee: number;
    grandTotal: number;
    totalPieces: number;
    itemCount: number;
  };
  shippingFee: number;
  setShippingFee: (fee: number) => void;

  // Checkout & Orders
  orders: SaleOrder[];
  activeInvoice: SaleOrder | null;
  setActiveInvoice: (order: SaleOrder | null) => void;
  processCheckout: (
    paymentMethod: PaymentMethod,
    amountPaid: number,
    notes?: string,
    splitDetails?: SaleOrder["splitDetails"]
  ) => SaleOrder | null;

  // Stock Movements
  movements: StockMovement[];

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;

  // Toasts & Modals
  toasts: ToastNotification[];
  showToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
  removeToast: (id: string) => void;
  isShortcutsOpen: boolean;
  setIsShortcutsOpen: (open: boolean) => void;

  // Backup & Reset
  exportDatabase: () => void;
  importDatabase: (jsonData: string) => boolean;
  resetToDemoData: () => void;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

export const PosProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("pos");
  const [theme, setTheme] = useState<"dark" | "light">(() =>
    loadFromStorage<"dark" | "light">(STORAGE_KEYS.THEME, "dark")
  );

  const [settings, setSettings] = useState<StoreSettings>(() =>
    loadFromStorage<StoreSettings>(STORAGE_KEYS.SETTINGS, initialSettings)
  );

  const [products, setProducts] = useState<Product[]>(() =>
    loadFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts)
  );

  const [customers, setCustomers] = useState<Customer[]>(() =>
    loadFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, initialCustomers)
  );

  const [orders, setOrders] = useState<SaleOrder[]>(() =>
    loadFromStorage<SaleOrder[]>(STORAGE_KEYS.ORDERS, initialOrders)
  );

  const [movements, setMovements] = useState<StockMovement[]>(() =>
    loadFromStorage<StockMovement[]>(STORAGE_KEYS.MOVEMENTS, initialMovements)
  );

  // Cart & POS State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(() => {
    const list = loadFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, initialCustomers);
    return list[0] || initialCustomers[0];
  });
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [activeInvoice, setActiveInvoice] = useState<SaleOrder | null>(null);

  // Search / Category Filter
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Toasts & Shortcuts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  // Save to LocalStorage on updates
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
  }, [products]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
  }, [customers]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ORDERS, orders);
  }, [orders]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.MOVEMENTS, movements);
  }, [movements]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast("Settings updated successfully", "success");
  };

  // Helper to calculate pieces for a given unit
  const getMultiplier = (prod: Product, unit: UnitType): number => {
    switch (unit) {
      case "pcs":
        return 1;
      case "pack":
        return prod.pcsPerPack;
      case "ctn":
        return prod.pcsPerCtn;
      case "plt":
        return (prod.ctnPerPlt || 30) * prod.pcsPerCtn;
    }
  };

  // Cart operations
  const addToCart = (product: Product, unit: UnitType = "ctn", quantity: number = 1) => {
    if (product.stockPcs <= 0) {
      showToast(`${product.name} is out of stock!`, "error");
      return;
    }

    const multiplier = getMultiplier(product, unit);

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.selectedUnit === unit
      );

      let newQuantity = quantity;
      if (existingIndex > -1) {
        newQuantity = prev[existingIndex].quantity + quantity;
      }

      const totalRequiredPieces = newQuantity * multiplier;
      if (totalRequiredPieces > product.stockPcs) {
        showToast(
          `Requested total exceeds available stock (${product.stockPcs} pcs available)`,
          "warning"
        );
      }

      const priceResult = calculateWholesalePrice(
        product,
        unit,
        newQuantity,
        selectedCustomer.tier
      );

      const updatedItem: CartItem = {
        productId: product.id,
        product,
        selectedUnit: unit,
        unitMultiplier: multiplier,
        quantity: newQuantity,
        unitPrice: priceResult.unitPrice,
        totalPieces: newQuantity * multiplier,
        discountPercent: existingIndex > -1 ? prev[existingIndex].discountPercent : 0,
        lineTotal:
          newQuantity *
          priceResult.unitPrice *
          (1 - (existingIndex > -1 ? prev[existingIndex].discountPercent : 0) / 100),
      };

      if (existingIndex > -1) {
        const nextCart = [...prev];
        nextCart[existingIndex] = updatedItem;
        return nextCart;
      } else {
        return [...prev, updatedItem];
      }
    });

    showToast(`Added ${quantity} ${unit} of ${product.name} to cart`, "success");
  };

  const updateCartItemUnit = (productId: string, oldUnit: UnitType, newUnit: UnitType) => {
    setCart((prev) => {
      const index = prev.findIndex(
        (item) => item.productId === productId && item.selectedUnit === oldUnit
      );
      if (index === -1) return prev;

      const item = prev[index];
      const product = item.product;
      const multiplier = getMultiplier(product, newUnit);
      const priceResult = calculateWholesalePrice(
        product,
        newUnit,
        item.quantity,
        selectedCustomer.tier
      );

      const nextItem: CartItem = {
        ...item,
        selectedUnit: newUnit,
        unitMultiplier: multiplier,
        unitPrice: priceResult.unitPrice,
        totalPieces: item.quantity * multiplier,
        lineTotal:
          item.quantity * priceResult.unitPrice * (1 - item.discountPercent / 100),
      };

      const nextCart = [...prev];
      nextCart[index] = nextItem;
      return nextCart;
    });
  };

  const updateCartItemQuantity = (productId: string, unit: UnitType, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, unit);
      return;
    }

    setCart((prev) => {
      return prev.map((item) => {
        if (item.productId === productId && item.selectedUnit === unit) {
          const priceResult = calculateWholesalePrice(
            item.product,
            unit,
            quantity,
            selectedCustomer.tier
          );
          return {
            ...item,
            quantity,
            unitPrice: priceResult.unitPrice,
            totalPieces: quantity * item.unitMultiplier,
            lineTotal: quantity * priceResult.unitPrice * (1 - item.discountPercent / 100),
          };
        }
        return item;
      });
    });
  };

  const updateCartItemDiscount = (
    productId: string,
    unit: UnitType,
    discountPercent: number
  ) => {
    const validDiscount = Math.min(100, Math.max(0, discountPercent));
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.selectedUnit === unit) {
          return {
            ...item,
            discountPercent: validDiscount,
            lineTotal: item.quantity * item.unitPrice * (1 - validDiscount / 100),
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string, unit: UnitType) => {
    setCart((prev) =>
      prev.filter((item) => !(item.productId === productId && item.selectedUnit === unit))
    );
  };

  const clearCart = () => {
    setCart([]);
    setShippingFee(0);
  };

  // Recalculate cart prices when customer tier changes
  useEffect(() => {
    setCart((prev) =>
      prev.map((item) => {
        const priceResult = calculateWholesalePrice(
          item.product,
          item.selectedUnit,
          item.quantity,
          selectedCustomer.tier
        );
        return {
          ...item,
          unitPrice: priceResult.unitPrice,
          lineTotal:
            item.quantity * priceResult.unitPrice * (1 - item.discountPercent / 100),
        };
      })
    );
  }, [selectedCustomer.tier]);

  // Cart Totals calculation
  const cartTotals = useMemo(() => {
    let subtotal = 0;
    let totalRetail = 0;
    let totalPieces = 0;

    cart.forEach((item) => {
      subtotal += item.lineTotal;
      totalPieces += item.totalPieces;
      const retailPiecePrice = item.product.pricing.pcsPrice;
      totalRetail += item.totalPieces * retailPiecePrice;
    });

    const wholesaleSavings = Math.max(0, totalRetail - subtotal);
    const taxRate = settings.defaultTaxRate || 0;
    const taxAmount = Number(((subtotal * taxRate) / 100).toFixed(2));
    const grandTotal = Number((subtotal + taxAmount + (shippingFee || 0)).toFixed(2));

    return {
      subtotal: Number(subtotal.toFixed(2)),
      wholesaleSavings: Number(wholesaleSavings.toFixed(2)),
      taxRate,
      taxAmount,
      shippingFee: Number((shippingFee || 0).toFixed(2)),
      grandTotal,
      totalPieces,
      itemCount: cart.length,
    };
  }, [cart, settings.defaultTaxRate, shippingFee]);

  // Process Checkout
  const processCheckout = (
    paymentMethod: PaymentMethod,
    amountPaid: number,
    notes?: string,
    splitDetails?: SaleOrder["splitDetails"]
  ): SaleOrder | null => {
    if (cart.length === 0) {
      showToast("Cart is empty", "error");
      return null;
    }

    const total = cartTotals.grandTotal;
    const balanceDue = Math.max(0, Number((total - amountPaid).toFixed(2)));

    // Status: paid, partial, or unpaid
    let status: SaleOrder["status"] = "paid";
    if (balanceDue > 0 && amountPaid > 0) status = "partial";
    else if (balanceDue > 0 && amountPaid === 0) status = "unpaid";

    // Check customer credit limit if balance due > 0
    if (balanceDue > 0) {
      const projectedBalance = selectedCustomer.currentBalance + balanceDue;
      if (
        selectedCustomer.creditLimit > 0 &&
        projectedBalance > selectedCustomer.creditLimit
      ) {
        showToast(
          `Warning: Order exceeds ${selectedCustomer.companyName}'s credit limit of $${selectedCustomer.creditLimit}`,
          "warning"
        );
      }
    }

    // Generate Order Number
    const orderNumber = `${settings.invoicePrefix}${String(orders.length + 101).padStart(4, "0")}`;
    const newOrder: SaleOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerCompany: selectedCustomer.companyName,
      items: [...cart],
      subtotal: cartTotals.subtotal,
      wholesaleSavings: cartTotals.wholesaleSavings,
      taxRate: cartTotals.taxRate,
      taxAmount: cartTotals.taxAmount,
      shippingFee: cartTotals.shippingFee,
      total,
      amountPaid,
      balanceDue,
      paymentMethod,
      splitDetails,
      status,
      createdAt: new Date().toISOString(),
      dueDate:
        selectedCustomer.paymentTerms === "net15"
          ? new Date(Date.now() + 86400000 * 15).toISOString()
          : selectedCustomer.paymentTerms === "net30"
          ? new Date(Date.now() + 86400000 * 30).toISOString()
          : selectedCustomer.paymentTerms === "net60"
          ? new Date(Date.now() + 86400000 * 60).toISOString()
          : new Date().toISOString(),
      cashierName: "Current Staff",
      notes,
    };

    // 1. Deduct stock and record movements
    const newMovements: StockMovement[] = [];
    const updatedProducts = products.map((prod) => {
      const cartItemsForProd = cart.filter((item) => item.productId === prod.id);
      if (cartItemsForProd.length === 0) return prod;

      const totalDeductionPcs = cartItemsForProd.reduce(
        (sum, item) => sum + item.totalPieces,
        0
      );

      const newStock = Math.max(0, prod.stockPcs - totalDeductionPcs);

      cartItemsForProd.forEach((cItem) => {
        newMovements.push({
          id: `mov-${Date.now()}-${Math.random().toString().slice(2, 6)}`,
          productId: prod.id,
          productName: prod.name,
          type: "sale",
          quantityPcs: -cItem.totalPieces,
          unit: cItem.selectedUnit,
          unitQuantity: cItem.quantity,
          previousStockPcs: prod.stockPcs,
          newStockPcs: newStock,
          reference: `Invoice ${orderNumber}`,
          createdAt: new Date().toISOString(),
        });
      });

      return {
        ...prod,
        stockPcs: newStock,
      };
    });

    setProducts(updatedProducts);
    setMovements((prev) => [...newMovements, ...prev]);

    // 2. Update Customer's current balance if unpaid balance exists
    if (balanceDue > 0) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === selectedCustomer.id
            ? { ...c, currentBalance: Number((c.currentBalance + balanceDue).toFixed(2)) }
            : c
        )
      );
      setSelectedCustomer((prev) => ({
        ...prev,
        currentBalance: Number((prev.currentBalance + balanceDue).toFixed(2)),
      }));
    }

    // 3. Save order
    setOrders((prev) => [newOrder, ...prev]);
    setActiveInvoice(newOrder);
    clearCart();

    // Trigger visual confetti
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // ignore
    }

    showToast(`Order ${orderNumber} created successfully!`, "success");
    return newOrder;
  };

  // Inventory Management Actions
  const addProduct = (prodData: Omit<Product, "id">) => {
    const newProd: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProd, ...prev]);

    // Record initial stock movement
    if (newProd.stockPcs > 0) {
      setMovements((prev) => [
        {
          id: `mov-${Date.now()}`,
          productId: newProd.id,
          productName: newProd.name,
          type: "restock",
          quantityPcs: newProd.stockPcs,
          unit: "pcs",
          unitQuantity: newProd.stockPcs,
          previousStockPcs: 0,
          newStockPcs: newProd.stockPcs,
          reference: "Initial Inventory Entry",
          createdAt: new Date().toISOString(),
          costPerPiece: newProd.costPrice,
        },
        ...prev,
      ]);
    }

    showToast(`Product "${newProd.name}" added to catalog`, "success");
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((prod) => (prod.id === id ? { ...prod, ...updates } : prod))
    );
    showToast("Product updated successfully", "success");
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast("Product removed", "info");
  };

  const adjustStock = (
    productId: string,
    type: StockMovementType,
    unitQuantity: number,
    unit: UnitType,
    reference: string
  ): boolean => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return false;

    const multiplier = getMultiplier(prod, unit);
    const piecesDelta = unitQuantity * multiplier;

    let finalPiecesChange = piecesDelta;
    if (type === "damage" || type === "return") {
      finalPiecesChange = -Math.abs(piecesDelta);
    } else if (type === "restock") {
      finalPiecesChange = Math.abs(piecesDelta);
    } // if "adjustment", piecesDelta could be set directly

    const newStock = Math.max(0, prod.stockPcs + finalPiecesChange);

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stockPcs: newStock } : p))
    );

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      type,
      quantityPcs: finalPiecesChange,
      unit,
      unitQuantity,
      previousStockPcs: prod.stockPcs,
      newStockPcs: newStock,
      reference,
      createdAt: new Date().toISOString(),
      costPerPiece: prod.costPrice,
    };

    setMovements((prev) => [movement, ...prev]);
    showToast(`Stock updated for ${prod.name} (New Stock: ${newStock} pcs)`, "success");
    return true;
  };

  // Customer Management
  const addCustomer = (customerData: Omit<Customer, "id" | "currentBalance">) => {
    const newCust: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      currentBalance: 0,
    };
    setCustomers((prev) => [...prev, newCust]);
    showToast(`Trade Account created for ${newCust.companyName}`, "success");
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    if (selectedCustomer.id === id) {
      setSelectedCustomer((prev) => ({ ...prev, ...updates }));
    }
    showToast("Customer details updated", "success");
  };

  const deleteCustomer = (id: string) => {
    if (id === "cust-walkin") {
      showToast("Cannot delete default walk-in customer", "error");
      return;
    }
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    if (selectedCustomer.id === id) {
      setSelectedCustomer(customers[0]);
    }
    showToast("Customer account removed", "info");
  };

  const recordCustomerPayment = (
    customerId: string,
    amount: number,
    method: string,
    reference: string
  ) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const newBal = Math.max(0, Number((c.currentBalance - amount).toFixed(2)));
          return { ...c, currentBalance: newBal };
        }
        return c;
      })
    );

    if (selectedCustomer.id === customerId) {
      setSelectedCustomer((prev) => ({
        ...prev,
        currentBalance: Math.max(0, Number((prev.currentBalance - amount).toFixed(2))),
      }));
    }

    showToast(
      `Recorded payment of $${amount.toFixed(2)} via ${method} (Ref: ${reference})`,
      "success"
    );
  };

  // Database Backup & Reset
  const exportDatabase = () => {
    const backupData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      settings,
      products,
      customers,
      orders,
      movements,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wholesale-pos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Database exported successfully", "success");
  };

  const importDatabase = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (!data.products || !data.customers) {
        showToast("Invalid backup file format", "error");
        return false;
      }
      if (data.settings) setSettings(data.settings);
      if (data.products) setProducts(data.products);
      if (data.customers) setCustomers(data.customers);
      if (data.orders) setOrders(data.orders);
      if (data.movements) setMovements(data.movements);
      showToast("Database restored successfully!", "success");
      return true;
    } catch {
      showToast("Failed to parse backup JSON file", "error");
      return false;
    }
  };

  const resetToDemoData = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all data to wholesale demo records? This will overwrite local changes."
      )
    ) {
      setSettings(initialSettings);
      setProducts(initialProducts);
      setCustomers(initialCustomers);
      setOrders(initialOrders);
      setMovements(initialMovements);
      setSelectedCustomer(initialCustomers[0]);
      clearCart();
      showToast("Reset to sample wholesale demo data", "info");
    }
  };

  return (
    <PosContext.Provider
      value={{
        activeTab,
        setActiveTab,
        theme,
        toggleTheme,
        settings,
        updateSettings,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        customers,
        selectedCustomer,
        setSelectedCustomer,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        recordCustomerPayment,
        cart,
        addToCart,
        updateCartItemUnit,
        updateCartItemQuantity,
        updateCartItemDiscount,
        removeFromCart,
        clearCart,
        cartTotals,
        shippingFee,
        setShippingFee,
        orders,
        activeInvoice,
        setActiveInvoice,
        processCheckout,
        movements,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        toasts,
        showToast,
        removeToast,
        isShortcutsOpen,
        setIsShortcutsOpen,
        exportDatabase,
        importDatabase,
        resetToDemoData,
      }}
    >
      {children}
    </PosContext.Provider>
  );
};

export const usePos = (): PosContextType => {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error("usePos must be used within a PosProvider");
  }
  return context;
};
