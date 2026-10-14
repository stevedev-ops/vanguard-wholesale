const STORAGE_KEYS = {
  SETTINGS: "vws_wholesale_settings",
  PRODUCTS: "vws_wholesale_products",
  CUSTOMERS: "vws_wholesale_customers",
  ORDERS: "vws_wholesale_orders",
  MOVEMENTS: "vws_wholesale_movements",
  THEME: "vws_wholesale_theme",
};

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return defaultValue;
    return JSON.parse(saved) as T;
  } catch (error) {
    console.error(`Error loading key "${key}" from localStorage:`, error);
    return defaultValue;
  }
};

export const saveToStorage = <T>(key: string, value: T): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving key "${key}" to localStorage:`, error);
  }
};

export { STORAGE_KEYS };
