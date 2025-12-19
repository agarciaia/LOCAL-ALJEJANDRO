
import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { SalesView } from './components/SalesView';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { SettingsView } from './components/SettingsView';
import { View, Product, Category, Sale, CartItem, AppConfig, TimePeriod } from './types';
import { CATEGORIES, INITIAL_PRODUCTS, DEFAULT_CONFIG } from './constants';
import { Maximize, Minimize, Menu, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('SALES');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [sales, setSales] = useState<Sale[]>([]);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  
  const [selectedSeller, setSelectedSeller] = useState<string>('ALL');
  const [statsPeriod, setStatsPeriod] = useState<TimePeriod>('ALL');
  const [isWSModalOpen, setIsWSModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

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

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 140));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 20));
  const resetZoom = () => setZoomLevel(100);

  const handleSaleComplete = (cartItems: CartItem[], customTimestamp?: number) => {
    const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const saleTimestamp = customTimestamp || Date.now();
    
    const profit = cartItems.reduce((acc, item) => {
      const costPerUnit = item.costMethod === 'FIXED' 
        ? (item.fixedCost || 0)
        : item.ingredients.reduce((iAcc, ing) => iAcc + (ing.quantity * ing.unitCost), 0) / (item.yield || 1);
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

  const handleDeleteSale = (id: string) => {
    if(confirm('¿Seguro que deseas eliminar esta venta del historial?')) {
      setSales(prev => prev.filter(s => s.id !== id));
    }
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

  const renderView = () => {
    switch (currentView) {
      case 'SALES':
        return <SalesView products={products} categories={categories} onSaleComplete={handleSaleComplete} />;
      case 'DASHBOARD':
        return (
          <div className="h-full overflow-y-auto px-4 py-4 lg:py-8 lg:px-10 no-x-scroll">
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
              onDeleteSale={handleDeleteSale}
            />
          </div>
        );
      case 'INVENTORY':
        return (
          <div className="h-full overflow-y-auto px-4 py-4 lg:py-8 lg:px-10 no-x-scroll">
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
          <div className="h-full overflow-y-auto px-4 py-4 lg:py-8 lg:px-10 no-x-scroll">
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

  const zoomScale = zoomLevel / 100;
  const mainStyle: React.CSSProperties = {
    zoom: zoomScale,
    width: `${100 / zoomScale}%`,
    height: `${100 / zoomScale}%`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    maxWidth: '100%',
    position: 'relative'
  };

  return (
    <div className={`flex flex-col lg:flex-row h-full w-full overflow-hidden font-inter transition-colors duration-500 ${config.panelBg}`}>
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block fixed lg:relative z-[100] h-full no-x-scroll`}>
        <div className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        <div className="relative h-full">
           <Sidebar currentView={currentView} onViewChange={(v) => { setCurrentView(v); setIsMobileMenuOpen(false); }} config={config} />
        </div>
      </div>
      
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden no-x-scroll">
        <header className="px-4 lg:px-6 py-2 lg:py-2.5 flex justify-between items-center bg-white border-b border-slate-100 z-[60] shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 bg-slate-50 rounded-xl text-slate-500 active:scale-90 transition-all">
              <Menu size={18} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-sm lg:text-lg font-black text-slate-900 leading-none tracking-tighter uppercase italic truncate max-w-[120px] lg:max-w-none">
                {config.appName}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <p className="text-slate-400 text-[6px] lg:text-[7px] font-black uppercase tracking-[0.2em]">
                  {currentView === 'SALES' ? 'Terminal Venta' : currentView === 'DASHBOARD' ? 'Estadísticas' : currentView === 'INVENTORY' ? 'Stock' : 'Ajustes'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
             <div className="flex items-center bg-slate-50 p-0.5 rounded-lg border border-slate-200 gap-0.5">
                <button onClick={handleZoomOut} className="p-1.5 hover:bg-white rounded-md text-slate-400 hover:text-slate-900 transition-all">
                  <ZoomOut size={13} />
                </button>
                <button onClick={resetZoom} className="px-2 text-[8px] font-black text-slate-500 hover:text-slate-900 transition-all min-w-[40px] text-center">
                  {zoomLevel}%
                </button>
                <button onClick={handleZoomIn} className="p-1.5 hover:bg-white rounded-md text-slate-400 hover:text-slate-900 transition-all">
                  <ZoomIn size={13} />
                </button>
             </div>

             <div className="hidden sm:flex items-center gap-2">
               <button onClick={toggleFullscreen} className="p-2 bg-slate-50 text-slate-400 border border-slate-200 rounded-lg hover:bg-slate-100 transition-all">
                 {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
               </button>
               <div style={{ backgroundColor: config.themeColor }} className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-[10px] shadow-sm">
                  {config.appName.charAt(0)}
               </div>
             </div>
          </div>
        </header>

        <section className="flex-1 overflow-hidden no-x-scroll" style={mainStyle}>
          {renderView()}
        </section>
      </main>
    </div>
  );
};

export default App;
