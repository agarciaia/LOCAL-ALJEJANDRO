
import React, { useState } from 'react';
import { Product, Category, CartItem } from '../types';
import { Search, Plus, Minus, ShoppingBag, UtensilsCrossed, Grid3X3, Grid2X2, LayoutGrid, Rows, User, Calendar as CalendarIcon, Sparkles, Type } from 'lucide-react';

interface SalesViewProps {
  products: Product[];
  categories: Category[];
  onSaleComplete: (items: CartItem[], timestamp?: number) => void;
}

const formatMoney = (amount: number) => amount.toLocaleString('de-DE');

export const SalesView: React.FC<SalesViewProps> = ({ products, categories, onSaleComplete }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [gridCols, setGridCols] = useState(6); // Default a 6 para tarjetas más pequeñas
  const [nameFontSize, setNameFontSize] = useState(13); // Tamaño de fuente inicial ligeramente mayor
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const getCategory = (catId: string) => {
    return categories.find(c => c.id === catId) || categories[0];
  };

  const gridClassMap: Record<number, string> = {
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5',
    6: 'grid-cols-3 md:grid-cols-5 lg:grid-cols-6',
    7: 'grid-cols-3 md:grid-cols-6 lg:grid-cols-7'
  };

  const colorThemes: Record<string, { 
    primary: string, 
    secondary: string, 
    text: string, 
    bgLight: string, 
    gradient: string,
    accent: string,
    cardBg: string,
    borderColor: string
  }> = {
    amber: { 
      primary: 'bg-amber-400', 
      secondary: 'bg-amber-200', 
      text: 'text-amber-900', 
      bgLight: 'bg-amber-50', 
      gradient: 'from-amber-400/30 to-transparent', 
      accent: 'amber', 
      cardBg: 'bg-amber-100',
      borderColor: 'border-amber-300'
    },
    orange: { 
      primary: 'bg-orange-500', 
      secondary: 'bg-orange-200', 
      text: 'text-orange-900', 
      bgLight: 'bg-orange-50', 
      gradient: 'from-orange-500/30 to-transparent', 
      accent: 'orange', 
      cardBg: 'bg-orange-100',
      borderColor: 'border-orange-300'
    },
    emerald: { 
      primary: 'bg-emerald-500', 
      secondary: 'bg-emerald-200', 
      text: 'text-emerald-900', 
      bgLight: 'bg-emerald-50', 
      gradient: 'from-emerald-500/30 to-transparent', 
      accent: 'emerald', 
      cardBg: 'bg-emerald-100',
      borderColor: 'border-emerald-300'
    },
    blue: { 
      primary: 'bg-blue-500', 
      secondary: 'bg-blue-200', 
      text: 'text-blue-900', 
      bgLight: 'bg-blue-50', 
      gradient: 'from-blue-500/30 to-transparent', 
      accent: 'blue', 
      cardBg: 'bg-blue-100',
      borderColor: 'border-blue-300'
    },
    sky: { 
      primary: 'bg-sky-400', 
      secondary: 'bg-sky-200', 
      text: 'text-sky-900', 
      bgLight: 'bg-sky-50', 
      gradient: 'from-sky-400/30 to-transparent', 
      accent: 'sky', 
      cardBg: 'bg-sky-100',
      borderColor: 'border-sky-300'
    },
  };

  const isToday = saleDate === new Date().toISOString().split('T')[0];

  return (
    <div className="flex h-full gap-6 overflow-hidden">
      <div className="flex-1 flex flex-col gap-6 overflow-hidden min-w-0">
        <div className="flex gap-4 items-center shrink-0">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar producto..." 
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-slate-100 transition-all outline-none text-slate-700 font-bold text-xs uppercase tracking-tight"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Controlador de Fuente de Nombres */}
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm shrink-0">
              <div className="px-3 py-1 flex items-center gap-2 border-r border-slate-100 mr-1">
                <Type size={14} className="text-slate-400" />
                <span className="text-[10px] font-black font-mono text-slate-900 w-4 text-center">{nameFontSize}</span>
              </div>
              <button
                onClick={() => setNameFontSize(prev => Math.max(8, prev - 1))}
                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
              >
                <Minus size={14} strokeWidth={3} />
              </button>
              <button
                onClick={() => setNameFontSize(prev => Math.min(24, prev + 1))}
                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
              >
                <Plus size={14} strokeWidth={3} />
              </button>
            </div>

            {/* Selector de Cuadrícula */}
            <div className="flex bg-white border border-slate-200 rounded-2xl p-1 shadow-sm shrink-0">
              {[4, 5, 6, 7].map((cols) => (
                <button
                  key={cols}
                  onClick={() => setGridCols(cols)}
                  className={`p-2 rounded-xl transition-all ${gridCols === cols ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                >
                  {cols === 4 && <Grid2X2 size={16} />}
                  {cols === 5 && <Grid3X3 size={16} />}
                  {cols === 6 && <Rows size={16} className="rotate-90" />}
                  {cols === 7 && <LayoutGrid size={16} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 pb-4 scrollbar-thin scrollbar-thumb-slate-200">
          <div className={`grid ${gridClassMap[gridCols]} gap-4 p-1`}>
            {filteredProducts.map(product => {
              const cat = getCategory(product.categoryId);
              const theme = colorThemes[cat.color] || colorThemes.orange;
              const seller = product.sellerName || cat.sellerName || 'Admin';

              return (
                <div 
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`group relative ${theme.cardBg} ${theme.borderColor} border-2 rounded-[1.75rem] shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center overflow-hidden cursor-pointer active:scale-95 p-3 min-h-[160px]`}
                >
                  <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl ${theme.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-bl-[2rem] pointer-events-none`} />
                  
                  {/* Floating Seller Chip */}
                  <div className="absolute top-2 left-2 z-20">
                    <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md px-1.5 py-0.5 rounded-full text-[7px] font-black text-slate-600 uppercase tracking-widest shadow-sm border border-white/50">
                      <div className={`w-1 h-1 rounded-full ${theme.primary}`} />
                      {seller}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="relative w-10 h-10 text-xl mb-2 mt-2">
                    <div className={`absolute inset-0 ${theme.secondary} rounded-[30%] rotate-3 group-hover:rotate-12 transition-all duration-500 opacity-80`} />
                    <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {product.icon || cat.icon}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="w-full flex-1 flex flex-col justify-center px-1">
                    <h3 
                      style={{ fontSize: `${nameFontSize}px` }}
                      className="font-black text-slate-900 leading-[1.1] uppercase tracking-tighter mb-2 break-words drop-shadow-sm"
                    >
                      {product.name}
                    </h3>
                  </div>

                  {/* Price */}
                  <div className="mt-auto">
                    <div className="px-3 py-1 bg-slate-900 text-white rounded-xl font-black font-mono text-xs shadow-lg transition-transform group-hover:scale-105">
                      ${formatMoney(product.price)}
                    </div>
                  </div>

                  {/* Hover indicator */}
                  <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className={`${theme.primary} text-white p-1 rounded-lg shadow-xl`}>
                      <Plus size={12} strokeWidth={4} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ticket Sidebar */}
      <div className="w-80 lg:w-96 bg-white border border-slate-200 rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden shrink-0 h-full relative">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30 shrink-0">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic">MI TICKET</h2>
              <div className="relative group">
                <input 
                  type="date"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10 w-8"
                />
                <button className={`p-2 rounded-xl border-2 ${!isToday ? 'bg-orange-500 text-white border-orange-600' : 'bg-white text-slate-400 border-slate-200'} transition-all hover:shadow-md`}>
                  <CalendarIcon size={14} strokeWidth={3} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
               <Sparkles size={10} className="text-orange-400" />
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Punto de Venta Activo</p>
            </div>
          </div>
          <div className="bg-slate-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl shrink-0">
            <ShoppingBag size={20} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-none">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-200 opacity-50 px-8 text-center">
              <div className="p-10 bg-slate-50 rounded-[3rem] mb-6">
                <UtensilsCrossed size={64} strokeWidth={1} />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Selecciona productos para comenzar</p>
            </div>
          ) : (
            cart.map(item => {
              const theme = colorThemes[getCategory(item.categoryId).color] || colorThemes.orange;
              return (
                <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-[1.75rem] border border-slate-100 hover:border-slate-300 transition-all group relative overflow-hidden shadow-sm">
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${theme.primary} opacity-40`} />
                  <div className={`w-10 h-10 ${theme.secondary} rounded-xl flex items-center justify-center text-xl shrink-0 shadow-inner`}>
                    {item.icon || getCategory(item.categoryId).icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-black text-slate-800 truncate uppercase text-[10px] tracking-tight">{item.name}</h4>
                    </div>
                    <p className={`font-black text-sm font-mono ${theme.text}`}>${formatMoney(item.price * item.quantity)}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl shadow-lg shrink-0">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-white/40 hover:text-white transition-colors"><Minus size={10} strokeWidth={4} /></button>
                    <span className="font-black text-white w-5 text-center text-xs font-mono">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-white/40 hover:text-white transition-colors"><Plus size={10} strokeWidth={4} /></button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-8 bg-slate-900 text-white rounded-t-[3rem] shrink-0 shadow-[0_-20px_40px_-10px_rgba(0,0,0,0.2)]">
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
              <span>Base Imponible</span>
              <span className="font-mono text-slate-400">${formatMoney(cartTotal)}</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest block mb-1">Total a Pagar</span>
                <span className="text-xs font-black text-white/50 uppercase tracking-tighter">Cierre de Ticket</span>
              </div>
              <p className="text-4xl font-black text-white font-mono tracking-tighter tabular-nums">${formatMoney(cartTotal)}</p>
            </div>
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={() => {
              const finalTimestamp = isToday ? Date.now() : new Date(`${saleDate}T12:00:00`).getTime();
              onSaleComplete(cart, finalTimestamp);
              setCart([]);
            }}
            className="w-full py-5 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-300 hover:to-orange-400 text-orange-950 rounded-2xl text-[11px] font-black shadow-2xl transition-all active:scale-95 uppercase tracking-[0.2em]"
          >
            Confirmar Venta
          </button>
        </div>
      </div>
    </div>
  );
};
