
import React, { useState, useMemo } from 'react';
import { Product, Category, CostMethod, Ingredient } from '../types';
import { Plus, Trash2, X, Settings, User, Grid2X2, Grid3X3, Rows, LayoutGrid, Edit3, ChevronDown } from 'lucide-react';
import { ICON_OPTIONS } from '../constants';

interface InventoryViewProps {
  products: Product[];
  categories: Category[];
  onAddProduct: (p: Product) => void;
  onUpdateProduct: (p: Product) => void;
  onAddCategory: (c: Category) => void;
  onDeleteProduct: (id: string) => void;
}

// Helper for consistent currency formatting
const formatMoney = (amount: number) => amount.toLocaleString('de-DE');

export const InventoryView: React.FC<InventoryViewProps> = ({ 
  products, 
  categories, 
  onAddProduct, 
  onUpdateProduct,
  onAddCategory,
  onDeleteProduct 
}) => {
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  const [newCatName, setNewCatName] = useState('');
  const [newCatSeller, setNewCatSeller] = useState('');
  const [newCatIcon, setNewCatIcon] = useState(ICON_OPTIONS[0]);
  const [gridCols, setGridCols] = useState(5);

  const availableSellers = useMemo(() => {
    const sellers = new Set(categories.map(c => c.sellerName || 'Admin'));
    return Array.from(sellers).sort();
  }, [categories]);

  const initialProductState = {
    name: '',
    categoryId: categories[0]?.id || '',
    price: 0,
    icon: ICON_OPTIONS[0],
    sellerName: '', 
    costMethod: CostMethod.FIXED,
    fixedCost: 0,
    ingredients: [] as Ingredient[]
  };

  const [newProd, setNewProd] = useState(initialProductState);

  const [currentIngredient, setCurrentIngredient] = useState<Ingredient>({
    id: '', name: '', quantity: 0, unit: 'kg', unitCost: 0
  });

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setNewProd({
      name: product.name,
      categoryId: product.categoryId,
      price: product.price,
      icon: product.icon || ICON_OPTIONS[0],
      sellerName: product.sellerName || '', 
      costMethod: product.costMethod,
      fixedCost: product.fixedCost || 0,
      ingredients: product.ingredients
    });
    setShowProductModal(true);
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

  const calculateCost = () => {
    if (newProd.costMethod === CostMethod.FIXED) return newProd.fixedCost;
    return newProd.ingredients.reduce((acc, i) => acc + (i.quantity * i.unitCost), 0);
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

  const getCategory = (catId: string) => {
    return categories.find(c => c.id === catId) || categories[0];
  };

  const gridClassMap: Record<number, string> = {
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5',
    6: 'grid-cols-3 md:grid-cols-5 lg:grid-cols-6',
    7: 'grid-cols-3 md:grid-cols-6 lg:grid-cols-7'
  };

  const colorClasses: Record<string, { bg: string, text: string, border: string, lightBg: string, accent: string }> = {
    amber: { bg: 'bg-amber-300', text: 'text-amber-800', border: 'border-amber-100', lightBg: 'bg-amber-50', accent: 'amber' },
    orange: { bg: 'bg-orange-300', text: 'text-orange-800', border: 'border-orange-100', lightBg: 'bg-orange-50', accent: 'orange' },
    emerald: { bg: 'bg-emerald-300', text: 'text-emerald-800', border: 'border-emerald-100', lightBg: 'bg-emerald-50', accent: 'emerald' },
    blue: { bg: 'bg-blue-300', text: 'text-blue-800', border: 'border-blue-100', lightBg: 'bg-blue-50', accent: 'blue' },
    sky: { bg: 'bg-sky-300', text: 'text-sky-800', border: 'border-sky-100', lightBg: 'bg-sky-50', accent: 'sky' },
  };

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm shrink-0">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Inventario</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Gestión de Costos y Productos</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-0.5">
            {[4, 5, 6, 7].map((cols) => (
              <button
                key={cols}
                onClick={() => setGridCols(cols)}
                className={`p-1.5 rounded-lg transition-all ${gridCols === cols ? 'bg-slate-900 text-white shadow-sm font-bold' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {cols === 4 && <Grid2X2 size={14} />}
                {cols === 5 && <Grid3X3 size={14} />}
                {cols === 6 && <Rows size={14} className="rotate-90" />}
                {cols === 7 && <LayoutGrid size={14} />}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setShowCategoryModal(true)}
              className="p-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-black"
              title="Configurar Categorías"
            >
              <Settings size={18} />
            </button>
            <button 
              onClick={() => {
                setEditingProductId(null);
                setNewProd(initialProductState);
                setShowProductModal(true);
              }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-400 text-orange-950 rounded-xl hover:bg-orange-300 transition-all font-black shadow-md shadow-orange-100 text-xs"
            >
              <Plus size={16} strokeWidth={3} />
              <span className="uppercase tracking-widest">Crear</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 pb-2 scrollbar-thin scrollbar-thumb-slate-200">
        <div className={`grid ${gridClassMap[gridCols]} gap-4 p-1`}>
          {products.map(p => {
            const totalCost = p.costMethod === CostMethod.FIXED 
              ? p.fixedCost || 0 
              : p.ingredients.reduce((acc, i) => acc + (i.quantity * i.unitCost), 0);
            const margin = p.price > 0 ? ((p.price - totalCost) / p.price) * 100 : 0;
            const cat = getCategory(p.categoryId);
            const theme = colorClasses[cat.color] || colorClasses.orange;
            const isVeryCompact = gridCols >= 6;
            const sellerToDisplay = p.sellerName || cat.sellerName || 'Admin';

            return (
              <div key={p.id} className="bg-white rounded-[1.5rem] border border-slate-200 overflow-hidden group hover:border-slate-400 hover:shadow-xl transition-all duration-300 flex flex-col relative">
                <div className={`absolute top-0 left-0 right-0 h-1 ${theme.bg} opacity-50`} />
                
                <div className="absolute top-2 right-2 flex gap-1 z-20 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={() => handleEditProduct(p)}
                    className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Edit3 size={12} />
                  </button>
                  <button 
                    onClick={() => onDeleteProduct(p.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <div className={`flex-1 flex flex-col items-center text-center ${isVeryCompact ? 'p-3' : 'p-5'} space-y-3`}>
                  <div className={`${isVeryCompact ? 'w-10 h-10 text-xl' : 'w-14 h-14 text-2xl'} ${theme.lightBg} border border-${theme.accent}-100 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-all relative`}>
                    {p.icon || cat.icon}
                  </div>

                  <div className="space-y-1 w-full text-center">
                    <h3 className={`${isVeryCompact ? 'text-[10px]' : 'text-xs'} font-black text-slate-800 uppercase truncate w-full tracking-tight px-1`}>
                      {p.name}
                    </h3>
                    <div className="flex items-center justify-center gap-1 opacity-50">
                      <User size={10} />
                      <span className="text-[8px] font-bold uppercase">{sellerToDisplay}</span>
                    </div>
                  </div>
                  
                  <div className={`w-full ${isVeryCompact ? 'space-y-2 pt-2' : 'space-y-3 pt-3'} border-t border-slate-100`}>
                    <div className="flex flex-col items-center">
                      <span className={`${isVeryCompact ? 'text-lg' : 'text-2xl'} font-black text-slate-900 font-mono tracking-tighter`}>${formatMoney(p.price)}</span>
                    </div>

                    <div className={`grid ${isVeryCompact ? 'grid-cols-1 gap-1' : 'grid-cols-2 gap-2'}`}>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Costo</p>
                        <p className="font-black text-slate-800 text-[10px] font-mono">${formatMoney(totalCost)}</p>
                      </div>
                      <div className={`p-2 rounded-xl border font-black flex flex-col items-center justify-center ${margin > 40 ? 'bg-emerald-100/50 border-emerald-200 text-emerald-700' : 'bg-rose-100/50 border-rose-200 text-rose-700'}`}>
                        <p className="text-[7px] font-black uppercase tracking-widest opacity-60">Margen</p>
                        <span className="text-[10px] font-black">{margin.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`${isVeryCompact ? 'py-1 text-[6px]' : 'py-1.5 text-[8px]'} px-4 font-black uppercase tracking-widest text-center ${p.costMethod === CostMethod.FIXED ? 'bg-sky-100 text-sky-800 border-t border-sky-200' : 'bg-indigo-100 text-indigo-800 border-t border-indigo-200'}`}>
                  {p.costMethod === CostMethod.FIXED ? 'Fijo' : 'Receta'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-10 space-y-10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
                  {editingProductId ? 'Editar Producto' : 'Alta de Producto'}
                </h2>
                <button 
                  onClick={() => {
                    setShowProductModal(false);
                    setEditingProductId(null);
                    setNewProd(initialProductState);
                  }} 
                  className="p-3 hover:bg-slate-100 rounded-full text-slate-400"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-2xl">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nombre</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-black text-slate-900 uppercase" 
                      placeholder="Ej: Empanada Queso"
                      value={newProd.name}
                      onChange={e => setNewProd({...newProd, name: e.target.value})}
                    />
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Seleccionar Icono</label>
                    <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto pr-2 scrollbar-thin">
                      {ICON_OPTIONS.map(icon => (
                        <button
                          key={icon}
                          onClick={() => setNewProd({...newProd, icon})}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl text-xl transition-all ${newProd.icon === icon ? 'bg-orange-300 text-orange-950 shadow-lg' : 'bg-white hover:bg-slate-100 border border-slate-100'}`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1 flex items-center gap-2">
                      <User size={12}/> Vendedor Responsable
                    </label>
                    <div className="relative group">
                      <select 
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-black text-slate-900 uppercase appearance-none cursor-pointer"
                        value={newProd.sellerName}
                        onChange={e => setNewProd({...newProd, sellerName: e.target.value})}
                      >
                        <option value="">USAR POR DEFECTO (CATEGORÍA)</option>
                        {availableSellers.map(seller => (
                          <option key={seller} value={seller}>{seller.toUpperCase()}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-6 rounded-2xl">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Categoría</label>
                      <select 
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none font-black"
                        value={newProd.categoryId}
                        onChange={e => setNewProd({...newProd, categoryId: e.target.value})}
                      >
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
                      </select>
                    </div>
                    <div className="bg-orange-50 p-6 rounded-2xl">
                      <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2 block">P. Venta</label>
                      <input 
                        type="number" 
                        className="w-full px-4 py-3 bg-white border border-orange-200 rounded-xl outline-none font-black text-orange-700 font-mono" 
                        value={newProd.price || ''}
                        onChange={e => setNewProd({...newProd, price: Number(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="p-8 bg-slate-900 rounded-[2rem] text-white space-y-4">
                    <h3 className="font-black text-lg tracking-tight uppercase">Resumen Financiero</h3>
                    <div className="flex justify-between text-slate-500 text-xs">
                      <span>Costo Total</span>
                      <span className="font-mono text-slate-300 font-bold">${formatMoney(calculateCost())}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-white/5">
                      <span className="font-black">Margen</span>
                      <span className="text-3xl font-black text-emerald-300 font-mono">${formatMoney(newProd.price - calculateCost())}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                    <button 
                      onClick={() => setNewProd({...newProd, costMethod: CostMethod.FIXED})}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${newProd.costMethod === CostMethod.FIXED ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                    >
                      Costo Fijo
                    </button>
                    <button 
                      onClick={() => setNewProd({...newProd, costMethod: CostMethod.DETAILED})}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${newProd.costMethod === CostMethod.DETAILED ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                    >
                      Receta Detallada
                    </button>
                  </div>

                  {newProd.costMethod === CostMethod.FIXED ? (
                    <div className="animate-in fade-in slide-in-from-top-4 text-center">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Monto Fijo de Costo</label>
                      <input 
                        type="number" 
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-black text-center text-2xl font-mono" 
                        placeholder="0.00"
                        value={newProd.fixedCost || ''}
                        onChange={e => setNewProd({...newProd, fixedCost: Number(e.target.value)})}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                      <div className="bg-indigo-50 p-6 rounded-2xl space-y-3">
                        <input placeholder="Ingrediente..." className="w-full px-4 py-2 rounded-lg border font-black uppercase text-xs" value={currentIngredient.name} onChange={e => setCurrentIngredient({...currentIngredient, name: e.target.value})}/>
                        <div className="grid grid-cols-3 gap-2">
                          <input type="number" placeholder="Cant." className="px-3 py-2 border rounded-lg bg-white font-mono text-xs" value={currentIngredient.quantity || ''} onChange={e => setCurrentIngredient({...currentIngredient, quantity: Number(e.target.value)})}/>
                          <select className="px-2 py-2 border rounded-lg bg-white text-xs font-bold" value={currentIngredient.unit} onChange={e => setCurrentIngredient({...currentIngredient, unit: e.target.value})}><option>kg</option><option>gr</option><option>un</option><option>lt</option></select>
                          <input type="number" placeholder="$ Unit." className="px-3 py-2 border rounded-lg bg-white font-mono text-xs" value={currentIngredient.unitCost || ''} onChange={e => setCurrentIngredient({...currentIngredient, unitCost: Number(e.target.value)})}/>
                        </div>
                        <button onClick={addIngredient} className="w-full py-2 bg-indigo-200 text-indigo-900 rounded-lg font-black text-[10px] uppercase tracking-widest">+ Añadir</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-10 border-t border-slate-100">
                <button 
                  onClick={() => {
                    setShowProductModal(false);
                    setEditingProductId(null);
                    setNewProd(initialProductState);
                  }} 
                  className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-xs"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveProduct} 
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl"
                >
                  {editingProductId ? 'Actualizar Producto' : 'Guardar Producto'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
