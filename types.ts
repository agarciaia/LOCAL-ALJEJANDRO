
export enum CostMethod {
  FIXED = 'FIXED',
  DETAILED = 'DETAILED'
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  image: string;
  icon?: string;
  sellerName?: string;
  costMethod: CostMethod;
  fixedCost?: number;
  ingredients: Ingredient[];
  yield?: number; // Cantidad de unidades que rinde la receta (ej: 20kg harina -> 80 empanadas)
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  sellerName?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Sale {
  id: string;
  timestamp: number;
  items: CartItem[];
  total: number;
  profit: number;
}

export interface AppConfig {
  appName: string;
  themeColor: string;
  panelBg: 'bg-slate-50' | 'bg-gray-50' | 'bg-zinc-50' | 'bg-blue-50/30';
  sidebarStyle: 'light' | 'dark' | 'glass';
}

export type View = 'SALES' | 'DASHBOARD' | 'INVENTORY' | 'SETTINGS';

export type TimePeriod = 'TODAY' | 'WEEK' | 'MONTH' | 'ALL';
