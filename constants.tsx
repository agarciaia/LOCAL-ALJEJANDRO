
import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Settings
} from 'lucide-react';
import { Category, Product, CostMethod, AppConfig } from './types';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Empanadas', icon: '🥟', color: 'amber', sellerName: 'Juan' },
  { id: '2', name: 'Pollos Asados', icon: '🍗', color: 'orange', sellerName: 'Maria' },
  { id: '3', name: 'Hand Rolls', icon: '🍱', color: 'emerald', sellerName: 'Luis' },
  { id: '4', name: 'Completos', icon: '🌭', color: 'blue', sellerName: 'Juan' },
  { id: '5', name: 'Bebidas', icon: '🥤', color: 'sky', sellerName: 'Admin' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Empanada de Pino',
    categoryId: '1',
    price: 2500,
    image: '',
    icon: '🥟',
    costMethod: CostMethod.DETAILED,
    ingredients: [
      { id: 'i1', name: 'Harina', quantity: 0.2, unit: 'kg', unitCost: 1000 },
      { id: 'i2', name: 'Carne', quantity: 0.15, unit: 'kg', unitCost: 8500 },
      { id: 'i3', name: 'Cebolla', quantity: 0.1, unit: 'kg', unitCost: 600 }
    ]
  },
  {
    id: 'p2',
    name: 'Pollo Asado Entero',
    categoryId: '2',
    price: 8500,
    image: '',
    icon: '🍗',
    costMethod: CostMethod.FIXED,
    fixedCost: 4200,
    ingredients: []
  },
  {
    id: 'p3',
    name: 'Completo Italiano',
    categoryId: '4',
    price: 3200,
    image: '',
    icon: '🌭',
    costMethod: CostMethod.DETAILED,
    ingredients: [
      { id: 'i4', name: 'Pan', quantity: 1, unit: 'un', unitCost: 250 },
      { id: 'i5', name: 'Palta', quantity: 0.1, unit: 'kg', unitCost: 5000 },
      { id: 'i6', name: 'Tomate', quantity: 0.1, unit: 'kg', unitCost: 1200 }
    ]
  }
];

export const DEFAULT_CONFIG: AppConfig = {
  appName: 'GastroMaster Pro',
  themeColor: '#f97316', 
  panelBg: 'bg-slate-50',
  sidebarStyle: 'light'
};

export const ICON_OPTIONS = [
  '🥟', '🍗', '🍱', '🌭', '🥤', '🍔', '🍟', '🍕', '🌮', '🌯', '🥘', '🍲', '🍜', '🍣', '🍤', 
  '🍦', '🍩', '🍪', '🍰', '🥞', '🥓', '🍖', '🍳', '🥗', '🥣', '🥢', '🧂', '🥫', '🧇', '🥨'
];

export const MENU_ITEMS = [
  { id: 'SALES', label: 'Ventas', icon: <ShoppingCart size={20} /> },
  { id: 'DASHBOARD', label: 'Panel', icon: <LayoutDashboard size={20} /> },
  { id: 'INVENTORY', label: 'Inventario', icon: <Package size={20} /> },
  { id: 'SETTINGS', label: 'Ajustes', icon: <Settings size={20} /> },
];
