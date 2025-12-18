
import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { SalesView } from './components/SalesView';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { SettingsView } from './components/SettingsView';
import { View, Product, Category, Sale, CartItem, AppConfig, TimePeriod } from './types';
import { CATEGORIES, INITIAL_PRODUCTS, DEFAULT_CONFIG } from './constants';
import { MessageCircle, User, Calendar, Clock, Globe, Zap, Maximize, Minimize } from 'lucide-react';

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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
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

  const periodOptions: Record<TimePeriod, { label: string, icon: any, color: string, bg: string }> = {
    TODAY: { label: 'Hoy', icon: <Clock size={14} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    WEEK: { label: 'Semana', icon: <Calendar size={14} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    MONTH: { label: 'Mes', icon: <Zap size={14} />, color: 'text-purple-600', bg: 'bg-purple-50' },
    ALL: { label: 'Histórico', icon: <Globe size={14} />, color: 'text-indigo-600', bg: 'bg-indigo-50' }
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
        <header className="px-8 py-6 flex flex-wrap justify-between items-center bg-white/80 backdrop-blur-md border-b border-slate-200 z-[50] shrink-0 gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-slate-900 leading-none tracking-tighter uppercase italic">
              {currentView === 'SALES' && 'Terminal'}
              {currentView === 'DASHBOARD' && 'Analítico'}
              {currentView === 'INVENTORY' && 'Inventario'}
              {currentView === 'SETTINGS' && 'Ajustes'}
            </h1>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-1.5">{config.appName} • Online</p>
          </div>

          <div className="flex items-center gap-3">
             {currentView === 'DASHBOARD' && (
               <div className="flex items-center gap-3">
                 <div className="relative hidden lg:block">
                   <select 
                     value={selectedSeller}
                     onChange={(e) => setSelectedSeller(e.target.value)}
                     className="appearance-none pl-9 pr-10 py-2 bg-white border-2 border-slate-200 rounded-xl font-black text-[10px] text-slate-700 uppercase tracking-tighter hover:border-slate-400 transition-all outline-none cursor-pointer shadow-sm"
                   >
                     <option value="ALL">TODOS</option>
                     {uniqueSellers.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                   </select>
                   <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                 </div>

                 <div className="relative">
                    <button 
                      onClick={() => setIsPeriodFilterOpen(!isPeriodFilterOpen)}
                      className={`flex items-center gap-2 px-3 py-2 bg-white border-2 border-slate-200 rounded-xl shadow-sm transition-all ${isPeriodFilterOpen ? 'border-slate-900' : 'hover:border-slate-400'}`}
                    >
                      <div className={`p-1 rounded-lg ${periodOptions[statsPeriod].bg} ${periodOptions[statsPeriod].color}`}>
                        {periodOptions[statsPeriod].icon}
                      </div>
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">{periodOptions[statsPeriod].label}</p>
                    </button>

                    {isPeriodFilterOpen && (
                      <>
                        <div className="fixed inset-0 z-[100]" onClick={() => setIsPeriodFilterOpen(false)} />
                        <div className="absolute right-0 mt-3 w-52 bg-white border-2 border-slate-900 rounded-[1.25rem] shadow-2xl z-[110] p-1.5 origin-top-right">
                          {Object.entries(periodOptions).map(([key, opt]) => (
                            <button
                              key={key}
                              onClick={() => {
                                setStatsPeriod(key as TimePeriod);
                                setIsPeriodFilterOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${statsPeriod === key ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                              {opt.icon}
                              <span className="text-[10px] font-black uppercase">{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                 </div>

                 <button 
                   onClick={() => setIsWSModalOpen(true)}
                   className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
                 >
                   <MessageCircle size={14} />
                   WhatsApp
                 </button>
               </div>
             )}

             <button
               onClick={toggleFullscreen}
               className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-all active:scale-90 group flex items-center gap-2"
             >
               {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
               <span className="hidden md:block text-[9px] font-black uppercase tracking-widest px-1">Full</span>
             </button>

             <div 
               style={{ backgroundColor: config.themeColor }}
               className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg transition-transform hover:scale-110 cursor-default border-2 border-white/20"
             >
                {config.appName.charAt(0)}
             </div>
          </div>
        </header>

        <section className="flex-1 overflow-hidden p-6">
          {renderView()}
        </section>
      </main>
    </div>
  );
};

export default App;
