
import React, { useState } from 'react';
import { Product, Category, CartItem } from '../types';
import { 
  Search, Plus, Minus, ShoppingBag, 
  Grid3X3, Grid2X2, LayoutGrid, Rows, 
  Calendar as CalendarIcon, 
  X, ArrowRight, ChevronUp, ChevronDown, Receipt, Sparkles,
  Type as TypeIcon
} from 'lucide-react';

interface SalesViewProps {
  products: Product[];
  categories: Category[];
  onSaleComplete: (items: CartItem[], timestamp?: number) => void;
}

const formatMoney = (amount: number) => amount.toLocaleString('de-DE');

export const SalesView: React.FC<SalesViewProps> = ({ products, categories, onSaleComplete }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [gridCols, setGridCols] = useState(6); 
  const [nameFontSize, setNameFontSize] = useState(14); // Nuevo estado para tamaño de letra
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const isToday = saleDate === new Date().toISOString().split('T')[0];

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

  const gridClassMap: Record<number, string> = {
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5',
    6: 'grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6',
    7: 'grid-cols-3 sm:grid-cols-6 lg:grid-cols-7 xl:grid-cols-7'
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
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-200 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        
        <div className="flex items-center justify-between px-8 py-6 bg-white/40 backdrop-blur-3xl border-b border-white/50 z-40 shrink-0">
           <div className="flex items-center gap-6">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar delicias..." 
                  className="pl-12 pr-6 py-3.5 bg-white/60 border border-slate-200/50 rounded-2xl outline-none text-slate-900 font-bold text-xs uppercase tracking-widest focus:bg-white focus:border-orange-200 focus:shadow-[0_0_20px_rgba(249,115,22,0.1)] transition-all w-64 sm:w-96"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
           </div>

           <div className="hidden md:flex items-center gap-4">
             {/* Controles de Tamaño de Letra */}
             <div className="flex items-center bg-white/50 p-1 rounded-2xl border border-white/80 shadow-sm">
               <span className="p-2 text-slate-400"><TypeIcon size={14}/></span>
               <button 
                 onClick={() => setNameFontSize(Math.max(10, nameFontSize - 1))}
                 className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-900 transition-all active:scale-90"
               >
                 <Minus size={14} />
               </button>
               <span className="px-2 text-[10px] font-black text-slate-800 min-w-[30px] text-center">{nameFontSize}</span>
               <button 
                 onClick={() => setNameFontSize(Math.min(24, nameFontSize + 1))}
                 className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-900 transition-all active:scale-90"
               >
                 <Plus size={14} />
               </button>
             </div>

             <div className="flex items-center gap-1.5 bg-white/50 p-1.5 rounded-2xl border border-white/80 shadow-sm">
               <span className="text-[10px] font-black uppercase text-slate-400 px-3 tracking-widest">Vista</span>
               {[4, 5, 6, 7].map((cols) => (
                 <button
                   key={cols}
                   onClick={() => setGridCols(cols)}
                   className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-tighter ${gridCols === cols ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-white'}`}
                 >
                   {cols === 4 && <Grid2X2 size={12} />}
                   {cols === 5 && <Grid3X3 size={12} />}
                   {cols === 6 && <Rows size={12} className="rotate-90" />}
                   {cols === 7 && <LayoutGrid size={12} />}
                   <span>{cols} x fila</span>
                 </button>
               ))}
             </div>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 no-x-scroll pb-52">
          <div className={`grid ${gridClassMap[gridCols]} gap-8 max-w-[1920px] mx-auto`}>
            {filteredProducts.map(product => {
              const cat = getCategory(product.categoryId);
              const style = themeStyles[cat.color] || themeStyles.orange;
              
              return (
                <div 
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`group relative bg-gradient-to-br ${style.bg} backdrop-blur-md ${style.border} border-2 rounded-[3.5rem] p-7 flex flex-col items-center transition-all duration-500 cursor-pointer active:scale-95 shadow-sm ${style.glow} hover:-translate-y-4`}
                >
                  <div className={`absolute top-6 left-8 flex items-center gap-2 px-3 py-1 rounded-full ${style.tag} font-black text-[9px] uppercase tracking-widest shadow-sm group-hover:shadow-md transition-all`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
                    <span>{cat.name}</span>
                  </div>

                  <div className={`relative w-28 h-28 rounded-[3rem] flex items-center justify-center text-5xl mb-6 mt-10 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6`}>
                    <div className={`absolute inset-0 ${style.iconBg} rounded-[2.5rem] opacity-90 shadow-2xl group-hover:opacity-100 transition-opacity`} />
                    <div className="absolute inset-2 bg-white/20 backdrop-blur-sm rounded-[2rem] border border-white/30" />
                    <span className="relative z-10 drop-shadow-2xl filter saturate-[1.3] brightness-[1.1]">{product.icon || cat.icon}</span>
                  </div>

                  <div className="text-center w-full px-2 mb-6 flex-1 flex flex-col justify-center">
                    <h3 
                      style={{ fontSize: `${nameFontSize}px` }} 
                      className="font-black text-slate-900 leading-tight uppercase tracking-tighter line-clamp-2 group-hover:text-black transition-colors"
                    >
                      {product.name}
                    </h3>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      POR {product.sellerName || cat.sellerName || 'CASA'}
                    </p>
                  </div>

                  <div className="w-full relative overflow-hidden rounded-[2rem] shadow-sm group-hover:shadow-xl transition-shadow">
                    <div className={`bg-white/80 ${style.priceBg} transition-all duration-500 py-4 rounded-[2rem] text-center border border-white/50 group-hover:border-transparent`}>
                      <span className="font-mono font-black text-slate-900 group-hover:text-white text-base tracking-tighter">
                        ${formatMoney(product.price)}
                      </span>
                    </div>
                  </div>

                  <div className="absolute top-6 right-8 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity animate-bounce">
                    <Sparkles size={16} />
                  </div>

                  <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.2)] border-4 border-slate-50 text-orange-500 z-10">
                    <Plus size={32} strokeWidth={4} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {cartItemCount > 0 && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[calc(100%-4rem)] max-w-4xl z-50 animate-in slide-in-from-bottom-40 duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)">
            {isDetailOpen && (
              <div className="bg-white/70 backdrop-blur-3xl rounded-[4rem] border border-white/80 shadow-[0_60px_180px_rgba(0,0,0,0.4)] mb-6 overflow-hidden animate-in zoom-in-95 duration-500 origin-bottom">
                 <div className="px-12 py-10 flex justify-between items-center border-b border-slate-200/30">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl shadow-sm"><Receipt size={24} /></div>
                       <div>
                          <p className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-900">Resumen del Pedido</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Control de artículos seleccionados</p>
                       </div>
                    </div>
                    <button onClick={() => setIsDetailOpen(false)} className="p-4 hover:bg-white rounded-full transition-all text-slate-400 hover:text-slate-950 shadow-sm border border-slate-100"><X size={20}/></button>
                 </div>
                 <div className="max-h-[450px] overflow-y-auto px-10 py-10 space-y-6 custom-scrollbar">
                    {cart.map(item => (
                      <div key={item.id} className="group flex items-center gap-8 p-6 bg-white/60 border border-white rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                        <div className="w-20 h-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-[2rem] flex items-center justify-center text-5xl shadow-inner shrink-0 group-hover:rotate-6 transition-transform">{item.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-black uppercase tracking-tight truncate text-slate-900">{item.name}</p>
                          <p className="text-sm font-mono font-bold text-slate-400 mt-1">${formatMoney(item.price)} <span className="text-orange-500 px-3 font-black text-lg">× {item.quantity}</span></p>
                        </div>
                        <div className="flex items-center gap-5 bg-slate-950 px-6 py-3.5 rounded-[2rem] shadow-2xl shrink-0 border border-white/10">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-2 text-white/30 hover:text-white transition-colors"><Minus size={18} strokeWidth={3} /></button>
                          <span className="text-base font-mono font-black text-white w-10 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-2 text-white/30 hover:text-white transition-colors"><Plus size={18} strokeWidth={3} /></button>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            <div className="bg-slate-950 text-white rounded-[4rem] p-5 flex items-center shadow-[0_50px_120px_rgba(0,0,0,0.7)] border border-white/10 ring-1 ring-white/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-orange-500/10 animate-pulse pointer-events-none" />
              
              <div 
                onClick={() => setIsDetailOpen(!isDetailOpen)}
                className="flex items-center gap-8 pl-10 pr-10 py-4 cursor-pointer hover:bg-white/10 rounded-[3rem] transition-all group shrink-0 relative"
              >
                <div className="relative">
                   <div className="absolute -inset-10 bg-orange-500/40 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                   <div className="bg-white/10 p-3 rounded-2xl relative z-10">
                     <ShoppingBag size={36} className="text-orange-400" />
                   </div>
                   <span className="absolute -top-3 -right-3 bg-white text-slate-950 text-sm font-black w-8 h-8 flex items-center justify-center rounded-full border-[4px] border-slate-950 shadow-2xl z-20">
                     {cartItemCount}
                   </span>
                </div>
                <div className="flex flex-col relative z-10">
                  <div className="flex items-center gap-3 opacity-60">
                    <span className="text-[11px] font-black uppercase tracking-[0.4em]">Total a Cobrar</span>
                    {isDetailOpen ? <ChevronDown size={16} className="text-orange-400 animate-bounce"/> : <ChevronUp size={16}/>}
                  </div>
                  <span className="text-5xl font-black font-mono tracking-tighter leading-none text-white">${formatMoney(cartTotal)}</span>
                </div>
              </div>

              <div className="flex-1" />

              <button 
                onClick={handleConfirmSale}
                className="relative overflow-hidden group bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-300 hover:to-orange-500 text-orange-950 px-16 py-7 rounded-[3rem] font-black text-base uppercase tracking-[0.3em] flex items-center gap-6 transition-all active:scale-95 shadow-[0_25px_60px_rgba(249,115,22,0.6)]"
              >
                <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms] ease-in-out" />
                
                <span className="relative z-10 drop-shadow-sm">Confirmar</span>
                <div className="relative z-10 p-3 bg-orange-950/20 rounded-2xl group-hover:translate-x-4 transition-transform duration-500">
                  <ArrowRight size={30} strokeWidth={4} />
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="hidden lg:flex w-32 border-l border-white/50 bg-white/20 backdrop-blur-3xl flex-col items-center py-16 gap-14 shrink-0 z-40">
        <div className="relative group">
          <input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
          <div className={`p-6 rounded-[2.5rem] border-2 transition-all shadow-xl ${!isToday ? 'bg-orange-500 text-white border-orange-600 scale-110 shadow-orange-200' : 'bg-white text-slate-300 border-white hover:border-slate-200 hover:text-slate-600'}`}>
            <CalendarIcon size={32} />
          </div>
          <div className="absolute right-full mr-8 px-6 py-4 bg-slate-950 text-white text-[10px] font-black rounded-3xl opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none transition-all translate-x-10 group-hover:translate-x-0 shadow-3xl border border-white/10">
             Cerrar Caja para Fecha
          </div>
        </div>
      </div>
    </div>
  );
};
