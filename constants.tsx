
import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Settings
} from 'lucide-react';
import { Category, Product, CostMethod, AppConfig } from './types';

export const CATEGORIES: Category[] = [
  { id: 'cat_pollos', name: 'Pollos Asados', icon: '🍗', color: 'orange', sellerName: 'Pepe' },
  { id: 'cat_papas', name: 'Papas & Fritos', icon: '🍟', color: 'amber', sellerName: 'Pepe' },
  { id: 'cat_sandwich', name: 'Churrascos', icon: '🍔', color: 'emerald', sellerName: 'Pepe' },
  { id: 'cat_completos', name: 'Completos', icon: '🌭', color: 'blue', sellerName: 'Maria' },
  { id: 'cat_sushi', name: 'Handrolls', icon: '🍱', color: 'sky', sellerName: 'Luis' },
  { id: 'cat_empanadas', name: 'Empanadas', icon: '🥟', color: 'orange', sellerName: 'Maria' },
];

export const INITIAL_PRODUCTS: Product[] = [
  // --- POLLOS ASADOS ---
  {
    id: 'p_pollo_entero',
    name: 'Pollo Asado Entero',
    categoryId: 'cat_pollos',
    price: 14000,
    image: '',
    icon: '🍗',
    sellerName: 'Pepe',
    costMethod: CostMethod.FIXED,
    fixedCost: 7000,
    ingredients: []
  },
  {
    id: 'p_pollo_entero_papas',
    name: 'Pollo Entero + Papas Fritas',
    categoryId: 'cat_pollos',
    price: 17000,
    image: '',
    icon: '🍟',
    sellerName: 'Pepe',
    costMethod: CostMethod.FIXED,
    fixedCost: 8500,
    ingredients: []
  },
  {
    id: 'p_pollo_medio',
    name: '1/2 Pollo Asado',
    categoryId: 'cat_pollos',
    price: 7000,
    image: '',
    icon: '🍗',
    sellerName: 'Pepe',
    costMethod: CostMethod.FIXED,
    fixedCost: 3500,
    ingredients: []
  },
  {
    id: 'p_pollo_medio_papas',
    name: '1/2 Pollo + Papas Fritas',
    categoryId: 'cat_pollos',
    price: 10000,
    image: '',
    icon: '🍟',
    sellerName: 'Pepe',
    costMethod: CostMethod.FIXED,
    fixedCost: 5000,
    ingredients: []
  },
  {
    id: 'p_pollo_cuarto_papas',
    name: '1/4 Pollo + Papas Fritas',
    categoryId: 'cat_pollos',
    price: 5000,
    image: '',
    icon: '🍗',
    sellerName: 'Pepe',
    costMethod: CostMethod.FIXED,
    fixedCost: 2500,
    ingredients: []
  },
  
  // --- OTROS (Precios estimados ya que no venían en el afiche, ajustables) ---
  {
    id: 'p_churrasco',
    name: 'Churrasco Tradicional',
    categoryId: 'cat_sandwich',
    price: 4500,
    image: '',
    icon: '🥩',
    sellerName: 'Pepe',
    costMethod: CostMethod.FIXED,
    fixedCost: 2000,
    ingredients: []
  },
  {
    id: 'p_papas_suprema',
    name: 'Papas Suprema',
    categoryId: 'cat_papas',
    price: 6500,
    image: '',
    icon: '🍟',
    sellerName: 'Pepe',
    costMethod: CostMethod.FIXED,
    fixedCost: 3000,
    ingredients: []
  },
  {
    id: 'p_papas_cheddar',
    name: 'Papas Cheddar',
    categoryId: 'cat_papas',
    price: 5500,
    image: '',
    icon: '🧀',
    sellerName: 'Pepe',
    costMethod: CostMethod.FIXED,
    fixedCost: 2500,
    ingredients: []
  },
  {
    id: 'p_salchipapas',
    name: 'Salchipapas Familiar',
    categoryId: 'cat_papas',
    price: 6000,
    image: '',
    icon: '🌭',
    sellerName: 'Pepe',
    costMethod: CostMethod.FIXED,
    fixedCost: 2800,
    ingredients: []
  },
  {
    id: 'p_completo',
    name: 'Completo Italiano',
    categoryId: 'cat_completos',
    price: 2500,
    image: '',
    icon: '🌭',
    sellerName: 'Maria',
    costMethod: CostMethod.DETAILED,
    yield: 1,
    ingredients: [
      { id: 'i1', name: 'Pan', quantity: 1, unit: 'un', unitCost: 250 },
      { id: 'i2', name: 'Vienesa', quantity: 1, unit: 'un', unitCost: 300 },
      { id: 'i3', name: 'Palta', quantity: 0.05, unit: 'kg', unitCost: 5000 },
      { id: 'i4', name: 'Tomate', quantity: 0.05, unit: 'kg', unitCost: 1000 }
    ]
  },
  {
    id: 'p_handroll',
    name: 'Handroll Pollo/Queso',
    categoryId: 'cat_sushi',
    price: 3500,
    image: '',
    icon: '🍱',
    sellerName: 'Luis',
    costMethod: CostMethod.FIXED,
    fixedCost: 1200,
    ingredients: []
  },
  {
    id: 'p_empanada',
    name: 'Empanada Pino',
    categoryId: 'cat_empanadas',
    price: 2000,
    image: '',
    icon: '🥟',
    sellerName: 'Maria',
    costMethod: CostMethod.FIXED,
    fixedCost: 800,
    ingredients: []
  }
];

export const DEFAULT_CONFIG: AppConfig = {
  appName: 'DONDE PEPE',
  themeColor: '#f97316', // Orange-500 por defecto
  panelBg: 'bg-slate-50',
  sidebarStyle: 'light',
  address: '6 Poniente 7527, esq. 20 Sur',
  phone: '+56 9 8452 0284',
  deliveryMode: 'Delivery y Retiros'
};

export const ICON_OPTIONS = [
  '🥟', '🍗', '🍱', '🌭', '🥤', '🍔', '🍟', '🍕', '🌮', '🌯', '🥘', '🍲', '🍜', '🍣', '🍤', 
  '🍦', '🍩', '🍪', '🍰', '🥞', '🥓', '🍖', '🍳', '🥗', '🥣', '🥢', '🧂', '🥫', ' waffle', '🥨',
  '🥯', '🥐', '🍞', '🥖', '🥨', '🧀', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯',
  '🍳', '🥘', '🍲', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜',
  '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡', '🍦', '🍧', '🍨', '🍩',
  '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕', '🍵', '🍶',
  '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥤', '🧃', '🧉', '🧊'
];

export const MENU_ITEMS = [
  { id: 'SALES', label: 'Ventas', icon: <ShoppingCart size={20} /> },
  { id: 'DASHBOARD', label: 'Panel', icon: <LayoutDashboard size={20} /> },
  { id: 'INVENTORY', label: 'Inventario', icon: <Package size={20} /> },
  { id: 'SETTINGS', label: 'Ajustes', icon: <Settings size={20} /> },
];
