
import React, { useState, useMemo } from 'react';
import { Product, Category, CostMethod, Ingredient } from '../types';
import { 
  Plus, Trash2, X, Settings, User, Grid2X2, Grid3X3, Rows, LayoutGrid, 
  Edit3, ChevronDown, Scale, Calculator, Info, Zap, TrendingUp, DollarSign,
  UserCheck, Settings2, Eye, Minus, Package, Tag, BarChart3, Lock, Unlock, Save,
  Layers, Palette, CheckCircle2, Search, Sparkles, Box, Menu, Command, ChevronRight,
  Image as ImageIcon
} from 'lucide-react';
import { ICON_OPTIONS } from '../constants';

interface InventoryViewProps {
  products: Product[];
  categories: Category[];
  onAddProduct: (p: Product) => void;
  onUpdateProduct: (p: Product) => void;
  onAddCategory: (c: Category) => void;
  onUpdateCategory: (c: Category) => void;
  onDeleteProduct: (id: string) => void;
  isMenuOpen: boolean;
  onToggleMenu: (isOpen: boolean) => void;
}

const formatMoney = (amount: number) => amount.toLocaleString('de-DE');

export const InventoryView: React.FC<InventoryViewProps> = ({ 
  products, 
  categories, 
  onAddProduct, 
  onUpdateProduct,
  onAddCategory,
  onUpdateCategory,
  onDeleteProduct,
  isMenuOpen,
  onToggleMenu
}) => {
  // Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('create');
  
  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null); 
  const [categoryForm, setCategoryForm] = useState<Category>({
    id: '',
    name: '',
    icon: ICON_OPTIONS[0],
    color: 'orange',
    sellerName: ''
  });

  // UI State
  const [gridCols, setGridCols] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [showIconSelector, setShowIconSelector] = useState(false);

  const availableSellers = useMemo(() => {
    const sellersFromCategories = categories.map(c => c.sellerName || 'Admin');
    const sellersFromProducts = products.map(p => p.sellerName).filter(Boolean) as string[];
    const allSellers = new Set([...sellersFromCategories, ...sellersFromProducts]);
    return Array.from(allSellers).sort();
  }, [categories, products]);

  const initialProductState = {
    name: '',
    categoryId: categories[0]?.id || '',
    price: 0,
    icon: ICON_OPTIONS[0],
    sellerName: availableSellers[0] || 'Admin', 
    costMethod: CostMethod.FIXED,
    fixedCost: 0,
    ingredients: [] as Ingredient[],
    yield: 1
  };

  const [newProd, setNewProd] = useState(initialProductState);
  const [currentIngredient, setCurrentIngredient] = useState<Ingredient>({
    id: '', name: '', quantity: 0, unit: 'kg', unitCost: 0
  });

  // --- HANDLERS: PRODUCTS ---

  const handleProductClick = (product: Product) => {
    setEditingProductId(product.id);
    setNewProd({
      name: product.name,
      categoryId: product.categoryId,
      price: product.price,
      icon: product.icon || ICON_OPTIONS[0],
      sellerName: product.sellerName || 'Admin', 
      costMethod: product.costMethod,
      fixedCost: product.fixedCost || 0,
      ingredients: product.ingredients.map(i => ({...i})),
      yield: product.yield || 1
    });
    setModalMode('view');
    setShowProductModal(true);
    setShowIconSelector(false);
  };

  const handleAddNewProduct = () => {
    setEditingProductId(null);
    setNewProd(initialProductState);
    setModalMode('create');
    setShowProductModal(true);
    setShowIconSelector(true); // Mostrar selector por defecto al crear
    onToggleMenu(false); 
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    onDeleteProduct(id);
  };

  const addIngredient = () => {
    if (currentIngredient.name && currentIngredient.quantity > 0) {
      setNewProd(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, { ...currentIngredient, id: Date.now().toString() }]
      }));
      setCurrentIngredient({ id: '', name: '', quantity: 0, unit: 'kg', unitCost: 0 });
    }
  };

  const removeIngredient = (id: string) => {
    setNewProd(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(i => i.id !== id)
    }));
  };

  const handleSaveProduct = () => {
    const productData = {
      ...newProd,
      id: editingProductId || `p-${Date.now()}`,
      image: '' 
    } as Product;

    if (editingProductId) {
      onUpdateProduct(productData);
    } else {
      onAddProduct(productData);
    }

    setShowProductModal(false);
    setEditingProductId(null);
    setNewProd(initialProductState);
  };

  // --- HANDLERS: CATEGORIES ---

  const openCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm({
      id: '',
      name: '',
      icon: ICON_OPTIONS[0],
      color: 'orange',
      sellerName: ''
    });
    setShowCategoryModal(true);
    onToggleMenu(false);
  };

  const handleSelectCategoryForEdit = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryForm({ ...cat });
  };

  const handleSaveCategory = () => {
    if (!categoryForm.name) return;

    if (editingCategory) {
      onUpdateCategory(categoryForm);
    } else {
      const newCat = { ...categoryForm, id: `c-${Date.now()}` };
      onAddCategory(newCat);
    }
    
    setEditingCategory(null);
    setCategoryForm({
      id: '',
      name: '',
      icon: ICON_OPTIONS[0],
      color: 'orange',
      sellerName: ''
    });
  };

  const getCategory = (catId: string) => {
    return categories.find(c => c.id === catId) || categories[0];
  };

  // Filtrado de productos
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCategory(p.categoryId).name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Estilos de tarjetas mejorados con gradientes de fondo
  const themeStyles: Record<string, any> = {
    amber: { 
      cardBg: 'bg-gradient-to-br from-amber-50 to-white hover:to-amber-50', 
      border: 'border-amber-200', 
      text: 'text-amber-700', 
      badge: 'bg-amber-100 text-amber-800', 
      iconBg: 'bg-amber-100 text-amber-600' 
    },
    orange: { 
      cardBg: 'bg-gradient-to-br from-orange-50 to-white hover:to-orange-50', 
      border: 'border-orange-200', 
      text: 'text-orange-700', 
      badge: 'bg-orange-100 text-orange-800', 
      iconBg: 'bg-orange-100 text-orange-600' 
    },
    emerald: { 
      cardBg: 'bg-gradient-to-br from-emerald-50 to-white hover:to-emerald-50', 
      border: 'border-emerald-200', 
      text: 'text-emerald-700', 
      badge: 'bg-emerald-100 text-emerald-800', 
      iconBg: 'bg-emerald-100 text-emerald-600' 
    },
    blue: { 
      cardBg: 'bg-gradient-to-br from-blue-50 to-white hover:to-blue-50', 
      border: 'border-blue-200', 
      text: 'text-blue-700', 
      badge: 'bg-blue-100 text-blue-800', 
      iconBg: 'bg-blue-100 text-blue-600' 
    },
    sky: { 
      cardBg: 'bg-gradient-to-br from-sky-50 to-white hover:to-sky-50', 
      border: 'border-sky-200', 
      text: 'text-sky-700', 
      badge: 'bg-sky-100 text-sky-800', 
      iconBg: 'bg-sky-100 text-sky-600' 
    },
  };

  return (
    <div className="h-full flex flex-col overflow-hidden relative bg-[#f8fafc]">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/50 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-100/60 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      {/* --- VENTANA FLOTANTE (COMMAND CENTER) --- */}
      {/* Controlada por el botón en App.tsx */}
      {isMenuOpen && (
          <div className="absolute top-2 right-2 z-50">
             {/* Backdrop click to close */}
             <div className="fixed inset-0 z-40" onClick={() => onToggleMenu(false)} />
             
             <div className="relative mt-2 w-[420px] bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.2)] border border-white/60 p-6 z-50 animate-in zoom-in-95 slide-in-from-top-4 origin-top-right flex flex-col gap-6">
                
                {/* Sección 1: Buscador y Stats */}
                <div className="space-y-4">
                   <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                      <input 
                         type="text" 
                         placeholder="BUSCAR PRODUCTO O CATEGORÍA..." 
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         autoFocus
                         className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-[10px] font-black uppercase tracking-widest focus:bg-white focus:border-indigo-300 transition-all placeholder:text-slate-300"
                      />
                   </div>
                   
                   <div className="flex gap-3">
                      <div className="flex-1 bg-indigo-50 rounded-2xl p-4 border border-indigo-100 flex items-center gap-3">
                         <div className="p-2 bg-white rounded-full text-indigo-600 shadow-sm"><Box size={14}/></div>
                         <div>
                            <span className="block text-xl font-black text-slate-900 leading-none">{products.length}</span>
                            <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">Productos</span>
                         </div>
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-3">
                         <div className="p-2 bg-white rounded-full text-slate-400 shadow-sm"><Info size={14}/></div>
                         <div>
                            <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">Gestión</span>
                            <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Avanzada de Costos</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="h-px bg-slate-100 w-full" />

                {/* Sección 2: Acciones Principales */}
                <div className="grid grid-cols-2 gap-3">
                   <button 
                      onClick={handleAddNewProduct}
                      className="flex flex-col items-center justify-center gap-3 py-6 bg-slate-900 text-white rounded-[1.5rem] hover:bg-slate-800 transition-all shadow-xl active:scale-95 group"
                   >
                      <div className="p-2 bg-white/10 rounded-full group-hover:scale-110 transition-transform"><Plus size={20} /></div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Nuevo Producto</span>
                   </button>

                   <button 
                      onClick={openCategoryModal}
                      className="flex flex-col items-center justify-center gap-3 py-6 bg-white border border-slate-100 text-slate-600 rounded-[1.5rem] hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm active:scale-95 group"
                   >
                      <div className="p-2 bg-slate-100 text-slate-400 rounded-full group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors"><Layers size={20} /></div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Categorías</span>
                   </button>
                </div>

                {/* Sección 3: Ajustes de Vista */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex justify-between items-center mb-3 px-1">
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><Eye size={12}/> Visualización</span>
                       <span className="text-[9px] font-mono font-bold text-slate-400">{gridCols} Cols</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={() => setGridCols(Math.max(1, gridCols - 1))} className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-900 hover:scale-95 border border-slate-100" disabled={gridCols <= 1}>
                          <Minus size={14} strokeWidth={3} />
                       </button>
                       <div className="flex-1 h-1.5 bg-slate-200 rounded-full mx-2 overflow-hidden">
                          <div className="h-full bg-slate-900 rounded-full transition-all" style={{ width: `${((gridCols - 1) / 9) * 100}%` }} />
                       </div>
                       <button onClick={() => setGridCols(Math.min(10, gridCols + 1))} className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-900 hover:scale-95 border border-slate-100" disabled={gridCols >= 10}>
                          <Plus size={14} strokeWidth={3} />
                       </button>
                    </div>
                </div>

             </div>
          </div>
      )}

      {/* Products Grid Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 z-10 pt-8">
        
        {filteredProducts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4 pb-20">
             <div className="w-24 h-24 rounded-[2rem] bg-white border-2 border-dashed border-slate-200 flex items-center justify-center animate-pulse">
                <Box size={40} className="opacity-20" />
             </div>
             <p className="text-xs font-black uppercase tracking-[0.2em]">No hay productos que mostrar</p>
             <button onClick={handleAddNewProduct} className="text-indigo-500 font-bold text-xs hover:underline">Crear el primero</button>
          </div>
        ) : (
          <div className={`grid ${gridClassMap[gridCols]} gap-6 transition-all duration-500 pb-24`}>
            {filteredProducts.map(p => {
              const cat = getCategory(p.categoryId);
              // Fallback a estilo orange si no existe el color
              const style = themeStyles[cat.color] || themeStyles.orange;
              
              return (
                <div 
                  key={p.id} 
                  onClick={() => handleProductClick(p)}
                  className={`group relative ${style.cardBg} backdrop-blur-md rounded-[2.5rem] p-6 border ${style.border} shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col justify-between h-full overflow-hidden`}
                >
                  {/* Delete Button */}
                  <button 
                    onClick={(e) => handleDeleteClick(e, p.id)} 
                    className="absolute top-4 right-4 p-2.5 bg-white text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all z-20 shadow-sm border border-slate-100 scale-75 group-hover:scale-100"
                    title="Eliminar producto"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* Header: Icon & Category Indicator */}
                  <div className="relative z-10 flex justify-between items-start mb-4">
                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-sm border border-white/50 ${style.iconBg} group-hover:scale-110 transition-transform duration-500`}>
                      {p.icon || cat.icon}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="relative z-10 flex-1 flex flex-col justify-end">
                    <h3 className={`text-base font-black ${style.text} leading-tight mb-2 line-clamp-2 uppercase tracking-tight group-hover:scale-[1.02] transition-transform origin-left`}>
                      {p.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border border-transparent ${style.badge}`}>
                        {cat.name}
                      </span>
                    </div>
                  </div>

                  {/* Footer: Price */}
                  <div className="relative z-10 pt-4 border-t border-black/5 flex justify-between items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Precio Venta</span>
                    <span className="text-xl font-black text-slate-900 font-mono tracking-tighter">
                      ${formatMoney(p.price)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- MODAL DE PRODUCTO --- */}
      {showProductModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-lg p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[4rem] w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.3)] flex flex-col animate-in zoom-in-95 border-4 border-white/10">
            <div className="px-12 py-10 flex justify-between items-center bg-slate-50/80 border-b border-slate-100 shrink-0">
               <div>
                  <div className="flex items-center gap-3 mb-1">
                     <h2 className="text-3xl font-black text-slate-950 tracking-tighter uppercase italic">
                       {modalMode === 'create' ? 'Nuevo Producto' : modalMode === 'edit' ? 'Editando Producto' : 'Detalle de Producto'}
                     </h2>
                     {modalMode === 'view' && <span className="bg-slate-200 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Lock size={12}/> Solo Lectura</span>}
                     {modalMode === 'edit' && <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Edit3 size={12}/> Edición</span>}
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                     {modalMode === 'create' ? 'Ingresa los datos del nuevo ítem' : 'Revisa la información completa del producto'}
                  </p>
               </div>
               <button onClick={() => setShowProductModal(false)} className="p-4 bg-white border border-slate-100 hover:bg-slate-50 rounded-full text-slate-400 transition-all shadow-sm hover:rotate-90 duration-300">
                 <X size={24} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-12">
              <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 relative ${modalMode === 'view' ? 'pointer-events-none opacity-80' : ''}`}>
                
                {/* COLUMNA IZQUIERDA: Identidad Visual y Precio */}
                <div className="lg:col-span-5 space-y-8">
                   
                   {/* HERO CARD: Icono y Nombre */}
                   <div className="relative bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-[3rem] p-8 flex flex-col items-center justify-center text-center shadow-lg overflow-hidden group">
                      <div className="absolute top-0 right-0 p-12 bg-indigo-100/50 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
                      
                      {/* Icon Display */}
                      <button 
                         onClick={() => modalMode !== 'view' && setShowIconSelector(!showIconSelector)}
                         disabled={modalMode === 'view'}
                         className={`relative w-32 h-32 mb-6 rounded-[2rem] bg-white border-2 border-indigo-50 shadow-xl flex items-center justify-center text-6xl transition-transform ${modalMode !== 'view' ? 'hover:scale-105 cursor-pointer hover:border-indigo-200' : ''}`}
                      >
                         {newProd.icon}
                         {modalMode !== 'view' && (
                           <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-full shadow-md">
                             <ImageIcon size={14} />
                           </div>
                         )}
                      </button>

                      {/* Name Input - HUGE Emphasis */}
                      <div className="w-full relative">
                         <input 
                           type="text" 
                           className="w-full bg-transparent text-center text-3xl font-black text-slate-900 uppercase tracking-tight outline-none placeholder:text-slate-300 border-b-2 border-transparent focus:border-indigo-200 transition-all pb-2" 
                           placeholder="NOMBRE PRODUCTO"
                           value={newProd.name}
                           onChange={e => setNewProd({...newProd, name: e.target.value})}
                           readOnly={modalMode === 'view'}
                         />
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Nombre Comercial</p>
                      </div>

                      {/* Icon Selector Drawer */}
                      {showIconSelector && (
                        <div className="mt-6 w-full bg-white rounded-2xl p-4 border border-slate-100 shadow-inner animate-in slide-in-from-top-2">
                           <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                              {ICON_OPTIONS.map(icon => (
                                <button 
                                  key={icon}
                                  onClick={() => { setNewProd({...newProd, icon}); setShowIconSelector(false); }}
                                  className={`text-xl p-2 rounded-xl hover:bg-indigo-50 ${newProd.icon === icon ? 'bg-indigo-100' : ''}`}
                                >
                                  {icon}
                                </button>
                              ))}
                           </div>
                        </div>
                      )}
                   </div>

                   {/* Categoría y Vendedor */}
                   <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Categoría</label>
                          <select 
                            className="w-full bg-transparent text-sm font-black text-slate-800 outline-none cursor-pointer"
                            value={newProd.categoryId}
                            onChange={e => setNewProd({...newProd, categoryId: e.target.value})}
                            disabled={modalMode === 'view'}
                          >
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                          </select>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Vendedor</label>
                           <select 
                            className="w-full bg-transparent text-sm font-black text-slate-800 outline-none cursor-pointer"
                            value={newProd.sellerName}
                            onChange={e => setNewProd({...newProd, sellerName: e.target.value})}
                            disabled={modalMode === 'view'}
                           >
                            {availableSellers.map(seller => <option key={seller} value={seller}>{seller}</option>)}
                            <option value="Admin">Admin</option>
                           </select>
                        </div>
                   </div>

                   {/* Precio Card */}
                   <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl flex items-center justify-between">
                      <div className="relative z-10">
                         <label className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2 block">Precio Venta</label>
                         <div className="flex items-center gap-2">
                            <span className="text-3xl font-black font-mono text-white/40 italic">$</span>
                            <input 
                              type="number" 
                              className="bg-transparent text-5xl font-black text-white font-mono outline-none w-full tracking-tighter"
                              placeholder="0"
                              value={newProd.price}
                              onChange={e => setNewProd({...newProd, price: Number(e.target.value)})}
                              readOnly={modalMode === 'view'}
                           />
                         </div>
                      </div>
                      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white/20">
                         <Tag size={32} />
                      </div>
                   </div>
                </div>

                {/* COLUMNA DERECHA: Costos e Ingredientes */}
                <div className="lg:col-span-7 space-y-8">
                   <div className="flex gap-4 p-2 bg-slate-100 rounded-[2rem] shadow-inner">
                      <button 
                        onClick={() => setNewProd({...newProd, costMethod: CostMethod.FIXED})}
                        disabled={modalMode === 'view'}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all ${newProd.costMethod === CostMethod.FIXED ? 'bg-white shadow-lg text-slate-900 border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        <Zap size={14} /> Costo Fijo
                      </button>
                      <button 
                        onClick={() => setNewProd({...newProd, costMethod: CostMethod.DETAILED})}
                        disabled={modalMode === 'view'}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all ${newProd.costMethod === CostMethod.DETAILED ? 'bg-white shadow-lg text-slate-900 border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        <Calculator size={14} /> Receta Detallada
                      </button>
                   </div>

                   {newProd.costMethod === CostMethod.FIXED ? (
                     <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center min-h-[300px]">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Monto Unitario Directo</label>
                        <input 
                          type="number" 
                          className="w-full max-w-sm px-6 py-6 bg-white border-2 border-slate-100 rounded-[2rem] text-center text-4xl font-black font-mono outline-none focus:border-indigo-300 transition-all shadow-inner"
                          placeholder="0.00"
                          value={newProd.fixedCost}
                          onChange={e => setNewProd({...newProd, fixedCost: Number(e.target.value)})}
                          readOnly={modalMode === 'view'}
                        />
                     </div>
                   ) : (
                     <div className="space-y-8">
                        <div className="bg-indigo-950 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                           <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                              <div className="flex-1">
                                 <h4 className="text-xl font-black uppercase tracking-tighter italic text-indigo-300 mb-2">Rendimiento Total</h4>
                                 <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-relaxed">¿Cuántas unidades rinde la cantidad de ingredientes especificada?</p>
                              </div>
                              <div className="w-full md:w-56">
                                 <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-4 border border-white/20">
                                    <input 
                                       type="number" 
                                       className="w-full bg-transparent text-4xl font-black font-mono text-center outline-none"
                                       value={newProd.yield}
                                       onChange={e => setNewProd({...newProd, yield: Math.max(1, Number(e.target.value))})}
                                       readOnly={modalMode === 'view'}
                                    />
                                    <div className="text-[8px] font-black uppercase text-center text-indigo-300 mt-2">Unidades</div>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 space-y-4">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Registrar Insumo</label>
                              <input placeholder="NOMBRE..." className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none font-black uppercase text-xs focus:bg-white shadow-inner" value={currentIngredient.name} onChange={e => setCurrentIngredient({...currentIngredient, name: e.target.value})} readOnly={modalMode === 'view'}/>
                              <div className="grid grid-cols-3 gap-4">
                                 <input type="number" placeholder="CANT." className="w-full px-5 py-4 border border-slate-200 rounded-2xl bg-white font-mono text-xs outline-none" value={currentIngredient.quantity || ''} onChange={e => setCurrentIngredient({...currentIngredient, quantity: Number(e.target.value)})} readOnly={modalMode === 'view'}/>
                                 <select className="px-4 py-4 border border-slate-200 rounded-2xl bg-white text-xs font-bold outline-none cursor-pointer disabled:bg-slate-100" value={currentIngredient.unit} onChange={e => setCurrentIngredient({...currentIngredient, unit: e.target.value})} disabled={modalMode === 'view'}><option>kg</option><option>gr</option><option>un</option><option>lt</option></select>
                                 <input type="number" placeholder="COSTO U." className="w-full px-5 py-4 border border-slate-200 rounded-2xl bg-white font-mono text-xs outline-none" value={currentIngredient.unitCost || ''} onChange={e => setCurrentIngredient({...currentIngredient, unitCost: Number(e.target.value)})} readOnly={modalMode === 'view'}/>
                              </div>
                              <button onClick={addIngredient} disabled={modalMode === 'view'} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-200">+ Añadir Insumo</button>
                           </div>

                           <div className="space-y-3">
                              {newProd.ingredients.map(ing => (
                                <div key={ing.id} className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-[2rem] hover:shadow-lg transition-all">
                                   <div className="flex-1">
                                      <p className="text-[11px] font-black uppercase text-slate-900">{ing.name}</p>
                                      <p className="text-[10px] font-mono font-bold text-slate-400">{ing.quantity} {ing.unit} x ${formatMoney(ing.unitCost)}</p>
                                   </div>
                                   <div className="text-right mr-4">
                                      <p className="text-[11px] font-black font-mono text-slate-950">${formatMoney(ing.quantity * ing.unitCost)}</p>
                                   </div>
                                   <button onClick={() => removeIngredient(ing.id)} disabled={modalMode === 'view'} className="p-3 text-slate-300 hover:text-red-500 transition-colors disabled:opacity-0"><Trash2 size={16}/></button>
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>
                   )}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-12 py-10 bg-slate-50/50 border-t border-slate-100 flex gap-6 shrink-0">
               {modalMode === 'view' ? (
                 <>
                   <button onClick={() => setShowProductModal(false)} className="flex-1 py-6 text-slate-400 font-black uppercase tracking-[0.3em] text-xs hover:text-slate-600">Cerrar</button>
                   <button onClick={() => setModalMode('edit')} className="flex-[2] py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                      <Unlock size={16} /> Habilitar Edición
                   </button>
                 </>
               ) : (
                 <>
                   <button onClick={() => setShowProductModal(false)} className="flex-1 py-6 text-slate-400 font-black uppercase tracking-[0.3em] text-xs hover:text-red-500">Cancelar</button>
                   <button onClick={handleSaveProduct} className="flex-[2] py-6 bg-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-200">
                      <Save size={16} /> Guardar Cambios
                   </button>
                 </>
               )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL GESTIÓN DE CATEGORÍAS --- */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 border border-white/20">
            
            {/* Header Modal */}
            <div className="px-10 py-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl shadow-sm">
                    <Layers size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Gestión de Categorías</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Organiza tu menú y vendedores</p>
                  </div>
               </div>
               <button onClick={() => setShowCategoryModal(false)} className="p-3 bg-white border border-slate-100 hover:bg-slate-50 rounded-full text-slate-400 transition-all shadow-sm">
                 <X size={20} />
               </button>
            </div>

            {/* Body */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Sidebar List (Left) */}
              <div className="w-full md:w-1/3 border-r border-slate-100 flex flex-col bg-slate-50/50">
                 <div className="p-6 pb-2">
                    <button 
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryForm({ id: '', name: '', icon: ICON_OPTIONS[0], color: 'orange', sellerName: '' });
                      }}
                      className="w-full py-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-500 hover:border-indigo-300 hover:bg-indigo-50 transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                       <Plus size={16} /> Nueva Categoría
                    </button>
                 </div>
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                    {categories.map(cat => (
                      <div 
                        key={cat.id}
                        onClick={() => handleSelectCategoryForEdit(cat)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${
                          editingCategory?.id === cat.id 
                            ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-100' 
                            : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-sm'
                        }`}
                      >
                         <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${themeStyles[cat.color]?.iconBg || 'bg-slate-100 text-slate-600'}`}>
                              {cat.icon}
                            </div>
                            <div>
                               <p className="text-xs font-black uppercase text-slate-800">{cat.name}</p>
                               <p className="text-[9px] font-bold uppercase text-slate-400">{cat.sellerName || 'Admin'}</p>
                            </div>
                         </div>
                         {editingCategory?.id === cat.id && <CheckCircle2 size={16} className="text-indigo-500" />}
                      </div>
                    ))}
                 </div>
              </div>

              {/* Form Area (Right) */}
              <div className="flex-1 p-8 md:p-10 overflow-y-auto custom-scrollbar bg-white">
                 <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-8 border-b border-slate-50 pb-4">
                    {editingCategory ? 'Editar Categoría' : 'Crear Nueva Categoría'}
                 </h3>

                 <div className="space-y-8 max-w-lg mx-auto md:mx-0">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">Nombre Categoría</label>
                       <input 
                         type="text" 
                         value={categoryForm.name}
                         onChange={e => setCategoryForm({...categoryForm, name: e.target.value})}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-slate-900 uppercase text-sm focus:bg-white focus:border-indigo-200 transition-all placeholder:text-slate-300" 
                         placeholder="Ej: BEBIDAS"
                         autoFocus={!editingCategory}
                       />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">Vendedor Default</label>
                          <input 
                             type="text" 
                             value={categoryForm.sellerName}
                             onChange={e => setCategoryForm({...categoryForm, sellerName: e.target.value})}
                             className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 uppercase text-xs focus:bg-white focus:border-indigo-200 transition-all" 
                             placeholder="Ej: JUAN"
                          />
                       </div>
                       <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">Color Tema</label>
                          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                             {['amber', 'orange', 'emerald', 'blue', 'sky'].map((c) => (
                               <button 
                                 key={c}
                                 onClick={() => setCategoryForm({...categoryForm, color: c})}
                                 className={`w-8 h-8 rounded-xl transition-all ${themeStyles[c].iconBg} ${categoryForm.color === c ? 'ring-2 ring-slate-900 scale-110 shadow-sm' : 'opacity-50 hover:opacity-100'}`}
                               />
                             ))}
                          </div>
                       </div>
                    </div>

                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">Icono</label>
                       <div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-slate-100 custom-scrollbar">
                          {ICON_OPTIONS.map(icon => (
                            <button 
                              key={icon}
                              onClick={() => setCategoryForm({...categoryForm, icon})}
                              className={`text-xl p-2 rounded-xl transition-all ${categoryForm.icon === icon ? 'bg-white shadow-md scale-125 border border-slate-200' : 'opacity-40 hover:opacity-100'}`}
                            >
                              {icon}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="pt-8">
                       <button 
                         onClick={handleSaveCategory}
                         disabled={!categoryForm.name}
                         className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                       >
                          {editingCategory ? <Save size={16} /> : <Plus size={16} />}
                          {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                       </button>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
