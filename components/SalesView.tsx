
import React, { useState, useMemo } from 'react';
import { Product, Category, CartItem, Sale } from '../types';
import { 
  Search, Plus, Minus, ShoppingBag, 
  Grid3X3, Grid2X2, LayoutGrid, Rows, 
  Calendar as CalendarIcon, 
  X, ArrowRight, ChevronUp, ChevronDown, Receipt, Sparkles,
  Type as TypeIcon, CalendarDays, Clock, FileText,
  SlidersHorizontal, Settings2, Eye, Filter, CheckCircle2, Layers,
  DollarSign
} from 'lucide-react';

interface SalesViewProps {
  products: Product[];
  categories: Category[];
  onSaleComplete: (items: CartItem[], timestamp?: number) => void;
  sales: Sale[];
}

const formatMoney = (amount: number) => amount.toLocaleString('de-DE');

export const SalesView: React.FC<SalesViewProps> = ({ products, categories, onSaleComplete, sales }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [gridCols, setGridCols] = useState(6); 
  const [nameFontSize, setNameFontSize] = useState(14); // Tamaño base ligeramente ajustado para el nuevo estilo
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Modals & Popovers State
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showViewOptions, setShowViewOptions] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  
  // Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const isToday = saleDate === new Date().toISOString().split('T')[0];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  const handleConfirmSale = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cart.length === 0) return;
    const finalTimestamp = isToday 
      ? Date.now() 
      : new Date(`${saleDate}T12:00:00`).getTime();
    onSaleComplete(cart, finalTimestamp);
    setCart([]);
    setIsDetailOpen(false);
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const getCategory = (catId: string) => {
    return categories.find(c => c.id === catId) || categories[0];
  };

  // Filtrar ventas por fecha seleccionada para el modal
  const salesForSelectedDate = useMemo(() => {
    return sales.filter(sale => {
      const date = new Date(sale.timestamp);
      const dateStr = date.toISOString().split('T')[0];
      return dateStr === saleDate;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [sales, saleDate]);

  const totalSalesForSelectedDate = salesForSelectedDate.reduce((acc, sale) => acc + sale.total, 0);

  const gridClassMap: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-5',
    6: 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6',
    7: 'grid-cols-3 sm:grid-cols-5 lg:grid-cols-7',
    8: 'grid-cols-3 sm:grid-cols-5 lg:grid-cols-8',
    9: 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-9',
    10: 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-10'
  };

  const themeStyles: Record<string, any> = {
    amber: { 
      bg: 'from-amber-50/90 to-amber-100/40', 
      glow: 'group-hover:shadow-[0_20px_50px_rgba(245,158,11,0.3)]', 
      border: 'border-amber-200/50', 
      dot: 'bg-amber-500', 
      iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500', 
      priceBg: 'group-hover:bg-amber-600',
      tag: 'bg-amber-100 text-amber-700'
    },
    orange: { 
      bg: 'from-orange-50/90 to-orange-100/40', 
      glow: 'group-hover:shadow-[0_20px_50px_rgba(249,115,22,0.3)]', 
      border: 'border-orange-200/50', 
      dot: 'bg-orange-500', 
      iconBg: 'bg-gradient-to-br from-orange-400 to-red-500', 
      priceBg: 'group-hover:bg-orange-600',
      tag: 'bg-orange-100 text-orange-700'
    },
    emerald: { 
      bg: 'from-emerald-50/90 to-emerald-100/40', 
      glow: 'group-hover:shadow-[0_20px_50px_rgba(16,185,129,0.3)]', 
      border: 'border-emerald-200/50', 
      dot: 'bg-emerald-500', 
      iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-600', 
      priceBg: 'group-hover:bg-emerald-600',
      tag: 'bg-emerald-100 text-emerald-700'
    },
    blue: { 
      bg: 'from-blue-50/90 to-blue-100/40', 
      glow: 'group-hover:shadow-[0_20px_50px_rgba(59,130,246,0.3)]', 
      border: 'border-blue-200/50', 
      dot: 'bg-blue-500', 
      iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-600', 
      priceBg: 'group-hover:bg-blue-600',
      tag: 'bg-blue-100 text-blue-700'
    },
    sky: { 
      bg: 'from-sky-50/90 to-sky-100/40', 
      glow: 'group-hover:shadow-[0_20px_50px_rgba(14,165,233,0.3)]', 
      border: 'border-sky-200/50', 
      dot: 'bg-sky-500', 
      iconBg: 'bg-gradient-to-br from-sky-400 to-blue-500', 
      priceBg: 'group-hover:bg-sky-600',
      tag: 'bg-sky-100 text-sky-700'
    },
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full gap-0 overflow-hidden relative no-x-scroll bg-[#f8fafc]">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-200 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        
        {/* CLEAN MINIMALIST HEADER */}
        <div className="flex items-center justify-between px-6 py-4 z-40 shrink-0 gap-4 pointer-events-none">
           {/* Search Bar (Floating & Pointer Events Enabled) */}
           <div id="product-search-bar" className="relative group flex-1 max-w-md pointer-events-auto">
              <div className="absolute inset-0 bg-white/40 backdrop-blur-md rounded-2xl shadow-sm border border-white/50" />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors z-10" size={18} />
              <input 
                type="text" 
                placeholder="BUSCAR PRODUCTO..." 
                className="relative z-10 w-full pl-12 pr-6 py-4 bg-transparent rounded-2xl outline-none text-slate-900 font-black text-xs uppercase tracking-widest placeholder-slate-400 focus:bg-white/80 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>

           <div className="flex items-center gap-3 pointer-events-auto">
             
             {/* BOTÓN FILTRO DE CATEGORÍAS */}
             <div className="relative">
                <button 
                  onClick={() => { setShowCategoryFilter(!showCategoryFilter); setShowViewOptions(false); }}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg border ${showCategoryFilter || selectedCategory !== 'ALL' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-white hover:scale-105'}`}
                  title="Filtrar por Categoría"
                >
                   <Filter size={24} />
                   {selectedCategory !== 'ALL' && !showCategoryFilter && (
                     <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                   )}
                </button>

                {/* MENÚ DESPLEGABLE DE CATEGORÍAS */}
                {showCategoryFilter && (
                   <div className="absolute top-16 right-0 w-72 bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_50px_100px_rgba(0,0,0,0.15)] border border-white/50 p-4 z-50 animate-in zoom-in-95 origin-top-right flex flex-col gap-2">
                      <div className="flex items-center gap-2 pb-2 px-2 border-b border-slate-100 mb-1">
                        <Layers size={14} className="text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Categorías</span>
                      </div>
                      
                      <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-1">
                        <button 
                          onClick={() => { setSelectedCategory('ALL'); setShowCategoryFilter(false); }}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${selectedCategory === 'ALL' ? 'bg-slate-900 text-white shadow-md' : 'hover:bg-slate-50 text-slate-600'}`}
                        >
                           <span className="text-[10px] font-black uppercase tracking-widest">Todas</span>
                           {selectedCategory === 'ALL' && <CheckCircle2 size={14} />}
                        </button>
                        
                        {categories.map(cat => (
                          <button 
                            key={cat.id}
                            onClick={() => { setSelectedCategory(cat.id); setShowCategoryFilter(false); }}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${selectedCategory === cat.id ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm' : 'hover:bg-slate-50 text-slate-600 border border-transparent'}`}
                          >
                             <div className="flex items-center gap-3">
                                <span className="text-lg">{cat.icon}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
                             </div>
                             {selectedCategory === cat.id && <CheckCircle2 size={14} />}
                          </button>
                        ))}
                      </div>
                   </div>
                )}
             </div>

             {/* View Settings Toggle Button */}
             <div className="relative">
               <button 
                  onClick={() => { setShowViewOptions(!showViewOptions); setShowCategoryFilter(false); }}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg border ${showViewOptions ? 'bg-slate-900 text-white border-slate-900 rotate-180' : 'bg-white text-slate-500 border-white hover:scale-105'}`}
               >
                  {showViewOptions ? <X size={24} /> : <Settings2 size={24} />}
               </button>

               {/* FLOATING CONTROL WINDOW (POP-OVER) */}
               {showViewOptions && (
                 <div className="absolute top-16 right-0 w-80 bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.15)] border border-white/50 p-6 z-50 animate-in zoom-in-95 origin-top-right flex flex-col gap-6">
                    
                    {/* Header Ventana */}
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Eye size={16} className="text-orange-500" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ajustes de Vista</span>
                    </div>

                    {/* SECCIÓN 1: FECHA GRANDE */}
                    <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 text-center relative overflow-hidden group">
                       <button 
                          onClick={() => { setShowViewOptions(false); setShowCalendarModal(true); }}
                          className="absolute top-2 right-2 p-2 bg-white rounded-full text-orange-500 shadow-sm hover:scale-110 transition-transform"
                       >
                          <CalendarDays size={16} />
                       </button>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha de Trabajo</p>
                       <p className={`text-2xl font-black font-mono tracking-tighter ${!isToday ? 'text-orange-600' : 'text-slate-900'}`}>
                          {isToday ? 'HOY' : saleDate}
                       </p>
                       {!isToday && <p className="text-[8px] font-bold text-orange-500 mt-1 animate-pulse">MODO HISTÓRICO</p>}
                    </div>

                    {/* SECCIÓN 2: TAMAÑO DE FUENTE */}
                    <div>
                       <div className="flex justify-between items-center mb-3 px-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tamaño Texto</span>
                          <span className="text-[10px] font-mono font-bold text-slate-400">{nameFontSize}px</span>
                       </div>
                       <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
                          <button 
                             onClick={() => setNameFontSize(Math.max(10, nameFontSize - 1))}
                             className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-600 hover:scale-95 transition-transform"
                          >
                             <Minus size={16} strokeWidth={3} />
                          </button>
                          <div className="flex-1 h-1 bg-slate-200 rounded-full mx-2 overflow-hidden">
                             <div className="h-full bg-slate-400 rounded-full transition-all" style={{ width: `${((nameFontSize - 10) / 14) * 100}%` }} />
                          </div>
                          <button 
                             onClick={() => setNameFontSize(Math.min(24, nameFontSize + 1))}
                             className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-600 hover:scale-95 transition-transform"
                          >
                             <Plus size={16} strokeWidth={3} />
                          </button>
                       </div>
                    </div>

                    {/* SECCIÓN 3: COLUMNAS GRID (1 a 10) */}
                    <div>
                       <div className="flex justify-between items-center mb-3 px-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Columnas</span>
                          <span className="text-[10px] font-mono font-bold text-slate-400">{gridCols} x Fila</span>
                       </div>
                       <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
                          <button
                             onClick={() => setGridCols(Math.max(1, gridCols - 1))}
                             className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-600 hover:scale-95 transition-transform"
                             disabled={gridCols <= 1}
                          >
                             <Minus size={16} strokeWidth={3} className={gridCols <= 1 ? "opacity-30" : ""} />
                          </button>
                          
                          <div className="flex-1 h-1 bg-slate-200 rounded-full mx-2 overflow-hidden">
                             {/* Progreso basado en rango 1 a 10 (9 pasos) */}
                             <div 
                                className="h-full bg-slate-900 rounded-full transition-all" 
                                style={{ width: `${((gridCols - 1) / 9) * 100}%` }} 
                             />
                          </div>

                          <button
                             onClick={() => setGridCols(Math.min(10, gridCols + 1))}
                             className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-600 hover:scale-95 transition-transform"
                             disabled={gridCols >= 10}
                          >
                             <Plus size={16} strokeWidth={3} className={gridCols >= 10 ? "opacity-30" : ""} />
                          </button>
                       </div>
                    </div>

                 </div>
               )}
             </div>
           </div>
        </div>

        {/* MAIN PRODUCT GRID - Now with more space */}
        <div id="sales-grid" className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-52 pt-2 no-x-scroll">
          
          {!isToday && (
             <div className="mb-8 p-4 bg-orange-100/50 border border-orange-200 rounded-3xl flex items-center justify-center gap-3 animate-in slide-in-from-top-4 mx-auto max-w-lg">
                <CalendarIcon className="text-orange-500" size={18} />
                <p className="text-[10px] font-black text-orange-800 uppercase tracking-widest">
                   Editando Ventas: {saleDate}
                </p>
             </div>
          )}

          {/* Feedback cuando hay filtro activo */}
          {selectedCategory !== 'ALL' && (
            <div className="mb-4 flex items-center justify-center animate-in fade-in zoom-in">
               <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Filtrando por:</span>
                  <span className="text-[10px] font-black uppercase text-indigo-700">{getCategory(selectedCategory).name}</span>
                  <button onClick={() => setSelectedCategory('ALL')} className="bg-white rounded-full p-0.5 text-indigo-400 hover:text-red-500 transition-colors"><X size={12}/></button>
               </div>
            </div>
          )}

          <div className={`grid ${gridClassMap[gridCols]} gap-6 max-w-[2400px] mx-auto transition-all duration-500`}>
            {filteredProducts.map(product => {
              const cat = getCategory(product.categoryId);
              const style = themeStyles[cat.color] || themeStyles.orange;
              
              return (
                <div 
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`group relative bg-gradient-to-br ${style.bg} backdrop-blur-md ${style.border} border-2 rounded-[3rem] p-4 flex flex-col items-center transition-all duration-500 cursor-pointer active:scale-95 shadow-sm ${style.glow} hover:-translate-y-2 h-full`}
                >
                  
                  {/* Icon Area - Smaller & Optimized spacing */}
                  <div className={`relative w-16 h-16 rounded-[2rem] flex items-center justify-center text-3xl mb-3 mt-4 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6`}>
                    <div className={`absolute inset-0 ${style.iconBg} rounded-[1.5rem] opacity-90 shadow-xl group-hover:opacity-100 transition-opacity`} />
                    <div className="absolute inset-2 bg-white/30 backdrop-blur-sm rounded-[1rem] border border-white/40" />
                    <span className="relative z-10 drop-shadow-xl filter saturate-[1.2] text-2xl">{product.icon || cat.icon}</span>
                  </div>

                  {/* PROFFESIONAL & CLEAN TEXT DESIGN */}
                  <div className="text-center w-full px-3 mb-2 flex-1 flex flex-col justify-center min-h-[3.5rem]">
                    <h3 
                      style={{ fontSize: `${nameFontSize}px` }} 
                      className="font-bold text-slate-700 leading-snug uppercase tracking-wide group-hover:text-slate-900 transition-colors break-words"
                    >
                      {product.name}
                    </h3>
                  </div>

                  <div className="w-full relative overflow-hidden rounded-[1.5rem] shadow-sm group-hover:shadow-lg transition-shadow">
                    <div className={`bg-white/60 ${style.priceBg} transition-all duration-300 py-2.5 rounded-[1.5rem] text-center border border-white/50 group-hover:border-transparent`}>
                      <span className="font-mono font-black text-slate-900 group-hover:text-white text-sm tracking-tighter">
                        ${formatMoney(product.price)}
                      </span>
                    </div>
                  </div>

                  <div className="absolute top-4 right-5 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity animate-bounce">
                    <Sparkles size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CART FLOATING BAR (Same logic, consistent UI) */}
        {cartItemCount > 0 && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[calc(100%-4rem)] max-w-4xl z-50 animate-in slide-in-from-bottom-40 duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)">
            {isDetailOpen && (
              <div className="bg-white/80 backdrop-blur-3xl rounded-[3.5rem] border border-white/80 shadow-[0_60px_180px_rgba(0,0,0,0.4)] mb-6 overflow-hidden animate-in zoom-in-95 duration-500 origin-bottom">
                 <div className="px-10 py-8 flex justify-between items-center border-b border-slate-200/30">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl shadow-sm"><Receipt size={24} /></div>
                       <div>
                          <p className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-900">Resumen</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Control de artículos</p>
                       </div>
                    </div>
                    <button onClick={() => setIsDetailOpen(false)} className="p-4 hover:bg-white rounded-full transition-all text-slate-400 hover:text-slate-950 shadow-sm border border-slate-100"><X size={20}/></button>
                 </div>
                 <div className="max-h-[400px] overflow-y-auto px-8 py-8 space-y-4 custom-scrollbar">
                    {cart.map(item => (
                      <div key={item.id} className="group flex items-center gap-6 p-4 bg-white/60 border border-white rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                        <div className="w-16 h-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner shrink-0 group-hover:rotate-6 transition-transform">{item.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black uppercase tracking-tight truncate text-slate-900">{item.name}</p>
                          <p className="text-xs font-mono font-bold text-slate-400 mt-1">${formatMoney(item.price)} <span className="text-orange-500 px-2 font-black text-base">× {item.quantity}</span></p>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-[1.5rem] shadow-2xl shrink-0 border border-white/10">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 text-white/30 hover:text-white transition-colors"><Minus size={14} strokeWidth={3} /></button>
                          <span className="text-sm font-mono font-black text-white w-8 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 text-white/30 hover:text-white transition-colors"><Plus size={14} strokeWidth={3} /></button>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            <div className="bg-slate-950 text-white rounded-[4rem] p-4 flex items-center shadow-[0_50px_120px_rgba(0,0,0,0.7)] border border-white/10 ring-1 ring-white/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-orange-500/10 animate-pulse pointer-events-none" />
              
              <div 
                onClick={() => setIsDetailOpen(!isDetailOpen)}
                className="flex items-center gap-6 pl-8 pr-8 py-4 cursor-pointer hover:bg-white/10 rounded-[3rem] transition-all group shrink-0 relative"
              >
                <div className="relative">
                   <div className="bg-white/10 p-3 rounded-2xl relative z-10">
                     <ShoppingBag size={28} className="text-orange-400" />
                   </div>
                   <span className="absolute -top-2 -right-2 bg-white text-slate-950 text-xs font-black w-6 h-6 flex items-center justify-center rounded-full border-[3px] border-slate-950 shadow-2xl z-20">
                     {cartItemCount}
                   </span>
                </div>
                <div className="flex flex-col relative z-10">
                  <div className="flex items-center gap-2 opacity-60">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Total</span>
                    {isDetailOpen ? <ChevronDown size={14} className="text-orange-400 animate-bounce"/> : <ChevronUp size={14}/>}
                  </div>
                  <span className="text-4xl font-black font-mono tracking-tighter leading-none text-white">${formatMoney(cartTotal)}</span>
                </div>
              </div>

              <div className="flex-1" />

              <button 
                onClick={handleConfirmSale}
                className="relative overflow-hidden group bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-300 hover:to-orange-500 text-orange-950 px-10 py-6 rounded-[3rem] font-black text-sm uppercase tracking-[0.3em] flex items-center gap-4 transition-all active:scale-95 shadow-[0_25px_60px_rgba(249,115,22,0.6)]"
              >
                <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms] ease-in-out" />
                <span className="relative z-10 drop-shadow-sm">Cobrar</span>
                <div className="relative z-10 p-2 bg-orange-950/20 rounded-xl group-hover:translate-x-2 transition-transform duration-500">
                  <ArrowRight size={20} strokeWidth={4} />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* MODAL CALENDARIO COMPLETO (Se mantiene igual para selección detallada) */}
        {showCalendarModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[4rem] w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
               <div className="px-12 py-10 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-6">
                     <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl shadow-sm"><CalendarDays size={28} /></div>
                     <div>
                        <h2 className="text-3xl font-black text-slate-950 tracking-tighter uppercase italic">Gestor Diario</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Selecciona fecha y revisa pedidos</p>
                     </div>
                  </div>
                  <button onClick={() => setShowCalendarModal(false)} className="p-4 bg-white border border-slate-100 hover:bg-slate-50 rounded-full text-slate-400 transition-all shadow-sm">
                     <X size={24} />
                  </button>
               </div>
  
               <div className="flex-1 overflow-y-auto custom-scrollbar p-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
                     <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 flex flex-col justify-center">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block text-center">Fecha de Trabajo</label>
                        <input 
                           type="date" 
                           value={saleDate} 
                           onChange={(e) => setSaleDate(e.target.value)} 
                           className="w-full bg-white border-2 border-slate-200 rounded-[2rem] px-6 py-5 text-center font-black text-xl text-slate-900 outline-none focus:border-orange-300 transition-all cursor-pointer shadow-sm" 
                        />
                        <p className="text-[9px] font-bold text-slate-400 text-center mt-4">
                           *Al cambiar la fecha, las nuevas ventas se registrarán en este día.
                        </p>
                     </div>
                     <div className="bg-slate-950 text-white p-8 rounded-[3rem] flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10"><DollarSign size={80}/></div>
                        <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2 relative z-10">Total Vendido ({saleDate})</p>
                        <p className="text-5xl font-black font-mono tracking-tighter relative z-10">${formatMoney(totalSalesForSelectedDate)}</p>
                     </div>
                  </div>
  
                  <div>
                     <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2">
                        <FileText size={14}/> Pedidos Registrados
                     </h3>
                     {salesForSelectedDate.length > 0 ? (
                        <div className="space-y-4">
                           {salesForSelectedDate.map(sale => (
                              <div key={sale.id} className="bg-white border border-slate-100 p-6 rounded-[2rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all">
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 font-bold">
                                       <Clock size={20} />
                                    </div>
                                    <div>
                                       <p className="text-sm font-black text-slate-900">{new Date(sale.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                          {sale.items.length} Productos • {sale.items[0]?.sellerName || 'General'}
                                       </p>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                    <div className="text-right">
                                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Importe</p>
                                       <p className="text-lg font-mono font-black text-slate-900">${formatMoney(sale.total)}</p>
                                    </div>
                                    <div className="text-right">
                                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Utilidad</p>
                                       <p className="text-lg font-mono font-black text-emerald-600">${formatMoney(sale.profit)}</p>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="py-20 text-center text-slate-300">
                           <Receipt size={48} className="mx-auto mb-4 opacity-50"/>
                           <p className="text-xs font-black uppercase tracking-widest">No hay pedidos para esta fecha</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
          </div>
        )}
    </div>
  );
};
