
import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { SalesView } from './components/SalesView';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { SettingsView } from './components/SettingsView';
import { TutorialOverlay, TutorialStep } from './components/TutorialOverlay';
import { View, Product, Category, Sale, CartItem, AppConfig, TimePeriod } from './types';
import { CATEGORIES, INITIAL_PRODUCTS, DEFAULT_CONFIG } from './constants';
import { Maximize, Minimize, Menu, ZoomIn, ZoomOut, RotateCcw, Command } from 'lucide-react';

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
  
  // Inventory Master Menu State (Lifted)
  const [isInventoryMenuOpen, setIsInventoryMenuOpen] = useState(false);

  // --- TUTORIAL STATE ---
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0);

  // Definición de pasos del Tutorial
  const tutorialSteps: TutorialStep[] = [
    {
      title: "Bienvenido a GastroMaster Pro",
      description: "Este es un recorrido interactivo para que aprendas a dominar todas las herramientas de tu nuevo punto de venta. Avanza a tu ritmo.",
      targetId: undefined, // Centro
      position: 'center'
    },
    {
      title: "Navegación Principal",
      description: "Desde esta barra lateral puedes acceder a las 4 áreas clave: Ventas, Panel de Control, Inventario y Ajustes. ¡Es tu centro de comando!",
      targetId: "sidebar-nav",
      position: 'right'
    },
    {
      title: "Punto de Venta",
      description: "Aquí es donde ocurre la magia. Selecciona productos para agregarlos al carrito. Puedes filtrar por nombre usando la barra superior.",
      targetId: "sales-grid",
      view: 'SALES',
      position: 'top'
    },
    {
      title: "Buscador Rápido",
      description: "Escribe el nombre de cualquier producto aquí para filtrarlo instantáneamente. Ideal para menús extensos.",
      targetId: "product-search-bar",
      view: 'SALES',
      position: 'bottom'
    },
    {
      title: "Panel de Control",
      description: "Visualiza tus ingresos, ganancias y tendencias en tiempo real. Un resumen ejecutivo de la salud de tu negocio.",
      targetId: "dashboard-kpi-container",
      view: 'DASHBOARD',
      position: 'bottom'
    },
    {
      title: "Acciones Rápidas",
      description: "Genera reportes detallados, exporta a Excel o comparte el resumen del día por WhatsApp desde este menú.",
      targetId: "dashboard-actions",
      view: 'DASHBOARD',
      position: 'left'
    },
    {
      title: "Gestión de Inventario",
      description: "Administra tus productos, recetas e insumos. Aquí puedes crear nuevos platos y definir sus costos.",
      targetId: "inventory-add-btn",
      view: 'INVENTORY',
      position: 'left'
    },
    {
      title: "Personalización",
      description: "Adapta la aplicación a tu marca. Cambia colores, nombres de vendedores y ajusta la interfaz a tu gusto.",
      targetId: "settings-container",
      view: 'SETTINGS',
      position: 'center'
    },
    {
      title: "¡Estás listo!",
      description: "Has completado el recorrido básico. Explora y disfruta de la potencia de GastroMaster Pro.",
      targetId: undefined,
      position: 'center'
    }
  ];

  const handleStartTutorial = () => {
    setIsTutorialActive(true);
    setTutorialStepIndex(0);
    setCurrentView('SALES'); // Reiniciar a vista por defecto al inicio
  };

  const handleNextTutorialStep = () => {
    if (tutorialStepIndex < tutorialSteps.length - 1) {
      const nextStep = tutorialSteps[tutorialStepIndex + 1];
      if (nextStep.view && nextStep.view !== currentView) {
        setCurrentView(nextStep.view as View);
      }
      setTutorialStepIndex(prev => prev + 1);
    } else {
      setIsTutorialActive(false); // Fin del tutorial
    }
  };

  const handlePrevTutorialStep = () => {
    if (tutorialStepIndex > 0) {
      const prevStep = tutorialSteps[tutorialStepIndex - 1];
      if (prevStep.view && prevStep.view !== currentView) {
        setCurrentView(prevStep.view as View);
      }
      setTutorialStepIndex(prev => prev - 1);
    }
  };
  
  // Estado de zoom independiente por vista con persistencia (CON PROTECCIÓN DE ERRORES)
  const [zoomLevels, setZoomLevels] = useState<Record<View, number>>(() => {
    try {
      const savedZoom = localStorage.getItem('gastro_zoom_levels');
      return savedZoom ? JSON.parse(savedZoom) : {
        SALES: 100,
        DASHBOARD: 100,
        INVENTORY: 100,
        SETTINGS: 100
      };
    } catch (error) {
      console.warn("Error parsing zoom levels from localStorage, resetting to default.", error);
      return {
        SALES: 100,
        DASHBOARD: 100,
        INVENTORY: 100,
        SETTINGS: 100
      };
    }
  });

  // Persistir cambios de zoom
  useEffect(() => {
    try {
      localStorage.setItem('gastro_zoom_levels', JSON.stringify(zoomLevels));
    } catch (e) {
      console.error("Failed to save zoom levels", e);
    }
  }, [zoomLevels]);

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

  const handleZoomIn = () => {
    setZoomLevels(prev => ({
      ...prev,
      [currentView]: Math.min(prev[currentView] + 10, 140)
    }));
  };

  const handleZoomOut = () => {
    setZoomLevels(prev => ({
      ...prev,
      [currentView]: Math.max(prev[currentView] - 10, 20)
    }));
  };

  const resetZoom = () => {
    setZoomLevels(prev => ({
      ...prev,
      [currentView]: 100
    }));
  };

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
        return <SalesView 
          products={products} 
          categories={categories} 
          onSaleComplete={handleSaleComplete} 
          sales={sales}
        />;
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
              companyPhone={config.phone} 
              onDeleteSale={handleDeleteSale}
            />
          </div>
        );
      case 'INVENTORY':
        return (
          <div className="h-full overflow-y-auto px-4 lg:px-6 no-x-scroll">
            <InventoryView 
              products={products} 
              categories={categories} 
              onAddProduct={handleAddProduct} 
              onUpdateProduct={handleUpdateProduct}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteProduct={handleDeleteProduct}
              isMenuOpen={isInventoryMenuOpen}
              onToggleMenu={setIsInventoryMenuOpen}
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
              onStartTutorial={handleStartTutorial}
            />
          </div>
        );
      default:
        return <SalesView products={products} categories={categories} onSaleComplete={handleSaleComplete} sales={sales} />;
    }
  };

  // Obtener el zoom actual basado en la vista activa
  const currentZoom = zoomLevels[currentView];
  const zoomScale = currentZoom / 100;
  
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
      
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden no-x-scroll relative">
        <header className="px-4 lg:px-6 py-2 lg:py-2.5 flex justify-between items-center bg-white border-b border-slate-100 z-[60] shrink-0">
          <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 bg-slate-50 rounded-xl text-slate-500 active:scale-90 transition-all shrink-0">
              <Menu size={18} />
            </button>
            <div className="flex flex-col min-w-0">
              <h1 className="text-sm lg:text-lg font-black text-slate-900 leading-none tracking-tighter uppercase italic whitespace-nowrap overflow-hidden text-ellipsis">
                {config.appName}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />
                <p className="text-slate-400 text-[6px] lg:text-[7px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                  {currentView === 'SALES' ? 'Terminal Venta' : currentView === 'DASHBOARD' ? 'Estadísticas' : currentView === 'INVENTORY' ? 'Stock' : 'Ajustes'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3 shrink-0">
             
             {/* Inventario Maestro Button (Only visible in INVENTORY view) */}
             {currentView === 'INVENTORY' && (
                <button 
                  onClick={() => setIsInventoryMenuOpen(!isInventoryMenuOpen)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm ${isInventoryMenuOpen ? 'bg-slate-900 text-white border border-slate-900' : 'bg-white text-slate-500 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200'}`}
                  title="Inventario Maestro"
                >
                  <Command size={14} />
                </button>
             )}

             <div className="flex items-center bg-slate-50 p-0.5 rounded-lg border border-slate-200 gap-0.5">
                <button onClick={handleZoomOut} className="p-1.5 hover:bg-white rounded-md text-slate-400 hover:text-slate-900 transition-all">
                  <ZoomOut size={13} />
                </button>
                <button onClick={resetZoom} className="px-2 text-[8px] font-black text-slate-500 hover:text-slate-900 transition-all min-w-[40px] text-center">
                  {currentZoom}%
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

        {/* TUTORIAL OVERLAY */}
        <TutorialOverlay 
           steps={tutorialSteps} 
           currentStepIndex={tutorialStepIndex}
           isOpen={isTutorialActive}
           onNext={handleNextTutorialStep}
           onPrev={handlePrevTutorialStep}
           onClose={() => setIsTutorialActive(false)}
        />
      </main>
    </div>
  );
};

export default App;
