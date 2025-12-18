
import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { SalesView } from './components/SalesView';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { SettingsView } from './components/SettingsView';
import { View, Product, Category, Sale, CartItem, AppConfig, TimePeriod } from './types';
import { CATEGORIES, INITIAL_PRODUCTS, DEFAULT_CONFIG } from './constants';
import { MessageCircle, User, ChevronDown, Activity, CheckCircle2, Calendar, Clock, Globe, Zap, Maximize, Minimize } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('SALES');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [sales, setSales] = useState<Sale[]>([]);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  
  const [selectedSeller, setSelectedSeller] = useState<string>('ALL');
  const [statsPeriod, setStatsPeriod] = useState<TimePeriod>('ALL');
  const [isWSModalOpen, setIsWSModalOpen] = useState(false);
  const [isPeriodFilterOpen, setIsPeriodFilterOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sincronizar el estado de pantalla completa con eventos del navegador (ej. tecla Esc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error al intentar activar pantalla completa: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const uniqueSellers = useMemo(() => {
    const categorySellers = categories.map(c => c.sellerName || 'Admin');
    const productSellers = products.map(p => p.sellerName).filter(Boolean) as string[];
    const sellers = new Set([...categorySellers, ...productSellers]);
    return Array.from(sellers);
  }, [categories, products]);

  const handleSaleComplete = (cartItems: CartItem[], customTimestamp?: number) => {
    const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const saleTimestamp = customTimestamp || Date.now();
    
    const profit = cartItems.reduce((acc, item) => {
      const costPerUnit = item.costMethod === 'FIXED' 
        ? (item.fixedCost || 0)
        : item.ingredients.reduce((iAcc, ing) => iAcc + (ing.quantity * ing.unitCost), 0);
      return acc + ((item.price - costPerUnit) * item.quantity);
    }, 0);

    const newSale: Sale = {
      id: `s-${Date.now()}`,
      timestamp: saleTimestamp,
      items: cartItems,
      total,
      profit
    };

    setSales(prev => [...prev, newSale]);
  };

  const handleAddProduct = (p: Product) => setProducts(prev => [...prev, p]);
  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };
  const handleAddCategory = (c: Category) => setCategories(prev => [...prev, c]);
  const handleUpdateCategory = (updatedCat: Category) => {
    setCategories(prev => prev.map(c => c.id === updatedCat.id ? updatedCat : c));
  };
  const handleDeleteProduct = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));

  const periodOptions: Record<TimePeriod, { label: string, sub: string, icon: any, color: string, bg: string, ring: string }> = {
    TODAY: { label: 'Hoy', sub: 'Últimas 24h', icon: <Clock size={14} />, color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
    WEEK: { label: 'Semana', sub: 'Últimos 7 días', icon: <Calendar size={14} />, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-100' },
    MONTH: { label: 'Mes', sub: 'Últimos 30 días', icon: <Zap size={14} />, color: 'text-purple-600', bg: 'bg-purple-50', ring: 'ring-purple-100' },
    ALL: { label: 'Histórico', sub: 'Total acumulado', icon: <Globe size={14} />, color: 'text-indigo-600', bg: 'bg-indigo-50', ring: 'ring-indigo-100' }
  };

  const renderView = () => {
    switch (currentView) {
      case 'SALES':
        return <SalesView products={products} categories={categories} onSaleComplete={handleSaleComplete} />;
      case 'DASHBOARD':
        return (
          <div className="h-full overflow-y-auto px-1">
            <DashboardView 
              sales={sales} 
              products={products} 
              categories={categories} 
              selectedSeller={selectedSeller}
              onSelectedSellerChange={setSelectedSeller}
              statsPeriod={statsPeriod}
              isWSModalOpen={isWSModalOpen}
              onWSModalOpenChange={setIsWSModalOpen}
              appName={config.appName}
            />
          </div>
        );
      case 'INVENTORY':
        return (
          <div className="h-full overflow-y-auto px-1">
            <InventoryView 
              products={products} 
              categories={categories} 
              onAddProduct={handleAddProduct} 
              onUpdateProduct={handleUpdateProduct}
              onAddCategory={handleAddCategory}
              onDeleteProduct={handleDeleteProduct}
            />
          </div>
        );
      case 'SETTINGS':
        return (
          <div className="h-full overflow-y-auto px-1">
            <SettingsView 
              config={config} 
              onConfigChange={setConfig} 
              categories={categories} 
              onUpdateCategory={handleUpdateCategory} 
            />
          </div>
        );
      default:
        return <SalesView products={products} categories={categories} onSaleComplete={handleSaleComplete} />;
    }
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-inter transition-colors duration-500 ${config.panelBg}`}>
      <Sidebar currentView={currentView} onViewChange={setCurrentView} config={config} />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="px-8 py-6 flex justify-between items-center bg-white/50 backdrop-blur-sm border-b border-slate-200 z-[50] shrink-0">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-slate-900 leading-none">
              {currentView === 'SALES' && 'Terminal de Ventas'}
              {currentView === 'DASHBOARD' && 'Panel Analítico'}
              {currentView === 'INVENTORY' && 'Gestión de Inventario'}
              {currentView === 'SETTINGS' && 'Ajustes de Sistema'}
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1.5">{config.appName} v2.5.1</p>
          </div>

          <div className="flex items-center gap-4">
             {currentView === 'DASHBOARD' && (
               <div className="hidden md:flex items-center gap-3 mr-2">
                 <div className="relative">
                   <select 
                     value={selectedSeller}
                     onChange={(e) => setSelectedSeller(e.target.value)}
                     className="appearance-none pl-9 pr-10 py-2.5 bg-white border border-slate-200 rounded-2xl font-black text-[10px] text-slate-700 uppercase tracking-tighter hover:border-slate-300 transition-all outline-none cursor-pointer shadow-sm"
                   >
                     <option value="ALL">TODOS</option>
                     {uniqueSellers.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                   </select>
                   <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                 </div>

                 <div className="relative">
                    <button 
                      onClick={() => setIsPeriodFilterOpen(!isPeriodFilterOpen)}
                      className={`flex items-center gap-4 px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm transition-all active:scale-95 group relative overflow-hidden ${isPeriodFilterOpen ? 'ring-2 ring-slate-900 border-transparent' : 'hover:shadow-md hover:border-slate-300'}`}
                    >
                      <div className={`p-2 rounded-xl ${periodOptions[statsPeriod].bg} ${periodOptions[statsPeriod].color} transition-all duration-300 group-hover:scale-110`}>
                        {periodOptions[statsPeriod].icon}
                      </div>
                      <div className="text-left">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Reporte Activo</p>
                        <div className="flex items-center gap-1.5">
                          <p className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">{periodOptions[statsPeriod].label}</p>
                          <ChevronDown size={12} className={`text-slate-400 transition-transform duration-300 ${isPeriodFilterOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </button>

                    {isPeriodFilterOpen && (
                      <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setIsPeriodFilterOpen(false)} />
                        <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-[1.75rem] shadow-2xl z-[110] p-2 animate-in zoom-in-95 origin-top-right duration-200 ease-out">
                          <div className="px-4 py-2 mb-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Seleccionar Periodo</p>
                          </div>
                          <div className="space-y-1">
                            {(Object.entries(periodOptions) as [TimePeriod, typeof periodOptions['ALL']][]).map(([key, opt]) => {
                              const isActive = statsPeriod === key;
                              return (
                                <button
                                  key={key}
                                  onClick={() => {
                                    setStatsPeriod(key);
                                    setIsPeriodFilterOpen(false);
                                  }}
                                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${isActive ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50 hover:translate-x-1'}`}
                                >
                                  <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-white/10 text-white' : `${opt.bg} ${opt.color} group-hover:scale-110`}`}>
                                    {opt.icon}
                                  </div>
                                  <div className="text-left flex-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{opt.label}</p>
                                    <p className={`text-[8px] font-bold uppercase tracking-tighter ${isActive ? 'text-white/50' : 'text-slate-400'}`}>
                                      {opt.sub}
                                    </p>
                                  </div>
                                  {isActive && (
                                    <div className="bg-white/20 p-1 rounded-full">
                                      <CheckCircle2 size={12} className="text-white" />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                 </div>

                 <button 
                   onClick={() => setIsWSModalOpen(true)}
                   className="flex items-center gap-2 px-5 py-3 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 active:scale-95"
                 >
                   <MessageCircle size={16} />
                   WhatsApp
                 </button>
               </div>
             )}

             {/* Botón de Pantalla Completa */}
             <button
               onClick={toggleFullscreen}
               className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 hover:text-slate-900 transition-all active:scale-90 group shrink-0"
               title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
             >
               {isFullscreen ? (
                 <Minimize size={20} className="group-hover:scale-110 transition-transform" />
               ) : (
                 <Maximize size={20} className="group-hover:scale-110 transition-transform" />
               )}
             </button>

             <div className="text-right hidden sm:block">
                <p className="font-black text-slate-800 text-xs uppercase tracking-tight">Admin Gastro</p>
                <p className="text-[9px] text-green-500 font-black flex items-center justify-end gap-1.5 uppercase tracking-tighter mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Online
                </p>
             </div>
             <div 
               style={{ backgroundColor: config.themeColor }}
               className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl transition-all hover:rotate-6 active:scale-90 shrink-0`}
             >
                {config.appName.charAt(0)}
             </div>
          </div>
        </header>

        <section className="flex-1 overflow-hidden p-6">
          <div className="h-full w-full">
            {renderView()}
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
