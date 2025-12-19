
import React, { useState, useMemo } from 'react';
import { Product, Category, CostMethod, Ingredient } from '../types';
import { 
  Plus, Trash2, X, Settings, User, Grid2X2, Grid3X3, Rows, LayoutGrid, 
  Edit3, ChevronDown, Scale, Calculator, Info, Zap, TrendingUp, DollarSign,
  UserCheck
} from 'lucide-react';
import { ICON_OPTIONS } from '../constants';

interface InventoryViewProps {
  products: Product[];
  categories: Category[];
  onAddProduct: (p: Product) => void;
  onUpdateProduct: (p: Product) => void;
  onAddCategory: (c: Category) => void;
  onDeleteProduct: (id: string) => void;
}

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
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [gridCols, setGridCols] = useState(5);

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

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setNewProd({
      name: product.name,
      categoryId: product.categoryId,
      price: product.price,
      icon: product.icon || ICON_OPTIONS[0],
      sellerName: product.sellerName || 'Admin', 
      costMethod: product.costMethod,
      fixedCost: product.fixedCost || 0,
      ingredients: product.ingredients,
      yield: product.yield || 1
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

  const calculateTotalRecipeCost = () => {
    if (newProd.costMethod === CostMethod.FIXED) return newProd.fixedCost;
    return newProd.ingredients.reduce((acc, i) => acc + (i.quantity * i.unitCost), 0);
  };

  const calculateUnitCost = () => {
    const totalCost = calculateTotalRecipeCost();
    const yieldVal = newProd.yield || 1;
    return totalCost / yieldVal;
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

  const themeStyles: Record<string, any> = {
    amber: { bg: 'from-amber-50 to-amber-100', border: 'border-amber-200', dot: 'bg-amber-500', iconBg: 'bg-amber-100' },
    orange: { bg: 'from-orange-50 to-orange-100', border: 'border-orange-200', dot: 'bg-orange-500', iconBg: 'bg-orange-100' },
    emerald: { bg: 'from-emerald-50 to-emerald-100', border: 'border-emerald-200', dot: 'bg-emerald-500', iconBg: 'bg-emerald-100' },
    blue: { bg: 'from-blue-50 to-blue-100', border: 'border-blue-200', dot: 'bg-blue-500', iconBg: 'bg-blue-100' },
    sky: { bg: 'from-sky-50 to-sky-100', border: 'border-sky-200', dot: 'bg-sky-500', iconBg: 'bg-sky-100' },
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200 shadow-sm shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Scale size={14} className="text-orange-500" />
             <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Inventario Maestro</h2>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Gestión avanzada de costos y rendimiento</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {[4, 5, 6, 7].map((cols) => (
              <button
                key={cols}
                onClick={() => setGridCols(cols)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-tighter ${gridCols === cols ? 'bg-white text-slate-950 shadow-md border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {cols === 4 && <Grid2X2 size={12} />}
                {cols === 5 && <Grid3X3 size={12} />}
                {cols === 6 && <Rows size={12} className="rotate-90" />}
                {cols === 7 && <LayoutGrid size={12} />}
                <span>{cols} x fila</span>
              </button>
            ))}
          </div>

          <button 
            onClick={() => {
              setEditingProductId(null);
              setNewProd(initialProductState);
              setShowProductModal(true);
            }}
            className="flex items-center justify-center gap-3 px-8 py-3.5 bg-slate-950 text-white rounded-2xl hover:bg-slate-800 transition-all font-black shadow-xl shadow-slate-200 text-xs uppercase tracking-widest active:scale-95"
          >
            <Plus size={18} strokeWidth={3} className="text-orange-400" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        <div className={`grid ${gridClassMap[gridCols]} gap-8`}>
          {products.map(p => {
            const cat = getCategory(p.categoryId);
            const style = themeStyles[cat.color] || themeStyles.orange;
            const totalCost = p.costMethod === CostMethod.FIXED 
              ? p.fixedCost || 0 
              : p.ingredients.reduce((acc, i) => acc + (i.quantity * i.unitCost), 0);
            
            const unitCost = totalCost / (p.yield || 1);
            const margin = p.price > 0 ? ((p.price - unitCost) / p.price) * 100 : 0;

            return (
              <div key={p.id} className="group relative bg-white rounded-[3rem] border border-slate-200/60 p-6 flex flex-col transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] hover:-translate-y-2 overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${cat.color === 'orange' ? 'from-orange-400 to-orange-600' : 'from-slate-200 to-slate-300'} opacity-30 group-hover:opacity-100 transition-opacity`} />
                
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 ${style.iconBg} rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform`}>
                    {p.icon || cat.icon}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditProduct(p)} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl transition-colors"><Edit3 size={14}/></button>
                    <button onClick={() => onDeleteProduct(p.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors"><Trash2 size={14}/></button>
                  </div>
                </div>

                <div className="space-y-1 mb-6 flex-1">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight line-clamp-2">{p.name}</h3>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UserCheck size={10} className="text-slate-300" />
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{p.sellerName || 'CASA'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Precio Venta</p>
                      <p className="text-xl font-black text-slate-950 font-mono tracking-tighter">${formatMoney(p.price)}</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${margin > 40 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                      {margin.toFixed(0)}% Util.
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showProductModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[4rem] w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-[0_50px_150px_rgba(0,0,0,0.5)] flex flex-col animate-in zoom-in-95">
            <div className="px-12 py-10 flex justify-between items-center bg-slate-50/50 border-b border-slate-100 shrink-0">
               <div>
                  <h2 className="text-3xl font-black text-slate-950 tracking-tighter uppercase italic">
                    {editingProductId ? 'Maquetación de Producto' : 'Arquitectura de Producto'}
                  </h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Identificación de vendedor e ingeniería de costos</p>
               </div>
               <button onClick={() => setShowProductModal(false)} className="p-4 bg-white border border-slate-100 hover:bg-slate-50 rounded-full text-slate-400 transition-all shadow-sm">
                 <X size={24} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-5 space-y-10">
                   <div className="space-y-6">
                      <div className="group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">Nombre Comercial</label>
                        <input 
                          type="text" 
                          className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none font-black text-slate-950 uppercase text-lg focus:bg-white focus:border-orange-200 transition-all" 
                          placeholder="Ej: EMPANADA"
                          value={newProd.name}
                          onChange={e => setNewProd({...newProd, name: e.target.value})}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">Categoría</label>
                          <select 
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-slate-900 cursor-pointer"
                            value={newProd.categoryId}
                            onChange={e => setNewProd({...newProd, categoryId: e.target.value})}
                          >
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
                          </select>
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">Vendedor Responsable</label>
                           <select 
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-slate-900 cursor-pointer"
                            value={newProd.sellerName}
                            onChange={e => setNewProd({...newProd, sellerName: e.target.value})}
                           >
                            {availableSellers.map(seller => <option key={seller} value={seller}>{seller}</option>)}
                            <option value="Admin">Admin</option>
                           </select>
                        </div>
                      </div>

                      <div>
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">Icono Representativo</label>
                         <div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-slate-100 custom-scrollbar">
                            {ICON_OPTIONS.map(icon => (
                              <button 
                                key={icon}
                                onClick={() => setNewProd({...newProd, icon})}
                                className={`text-2xl p-2 rounded-xl transition-all ${newProd.icon === icon ? 'bg-white shadow-md scale-125 border border-slate-200' : 'opacity-40 hover:opacity-100'}`}
                              >
                                {icon}
                              </button>
                            ))}
                         </div>
                      </div>

                      <div className="bg-slate-950 rounded-[3rem] p-10 text-white relative overflow-hidden">
                         <label className="text-[11px] font-black text-orange-400 uppercase tracking-[0.3em] mb-4 block">Precio de Venta</label>
                         <div className="flex items-center gap-4">
                            <span className="text-4xl font-black font-mono text-white/40 italic">$</span>
                            <input 
                              type="number" 
                              className="bg-transparent text-5xl font-black text-white font-mono outline-none w-full tracking-tighter"
                              placeholder="0"
                              value={newProd.price || ''}
                              onChange={e => setNewProd({...newProd, price: Number(e.target.value)})}
                            />
                         </div>
                      </div>
                   </div>
                </div>

                <div className="lg:col-span-7 space-y-8">
                   <div className="flex gap-4 p-2 bg-slate-100 rounded-[2rem] shadow-inner">
                      <button 
                        onClick={() => setNewProd({...newProd, costMethod: CostMethod.FIXED})}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all ${newProd.costMethod === CostMethod.FIXED ? 'bg-white shadow-lg text-slate-900 border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        <Zap size={14} /> Costo Fijo
                      </button>
                      <button 
                        onClick={() => setNewProd({...newProd, costMethod: CostMethod.DETAILED})}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all ${newProd.costMethod === CostMethod.DETAILED ? 'bg-white shadow-lg text-slate-900 border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        <Calculator size={14} /> Receta Detallada
                      </button>
                   </div>

                   {newProd.costMethod === CostMethod.FIXED ? (
                     <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 flex flex-col items-center">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Monto Unitario Directo</label>
                        <input 
                          type="number" 
                          className="w-full max-w-sm px-6 py-6 bg-white border-2 border-slate-100 rounded-[2rem] text-center text-4xl font-black font-mono outline-none focus:border-slate-300 transition-all shadow-inner"
                          placeholder="0.00"
                          value={newProd.fixedCost || ''}
                          onChange={e => setNewProd({...newProd, fixedCost: Number(e.target.value)})}
                        />
                     </div>
                   ) : (
                     <div className="space-y-8">
                        <div className="bg-indigo-950 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                           <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                              <div className="flex-1">
                                 <h4 className="text-xl font-black uppercase tracking-tighter italic text-orange-400 mb-2">Rendimiento Total</h4>
                                 <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-relaxed">¿Cuántas unidades rinde la cantidad de ingredientes especificada?</p>
                              </div>
                              <div className="w-full md:w-56">
                                 <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-4 border border-white/20">
                                    <input 
                                       type="number" 
                                       className="w-full bg-transparent text-4xl font-black font-mono text-center outline-none"
                                       value={newProd.yield || ''}
                                       onChange={e => setNewProd({...newProd, yield: Math.max(1, Number(e.target.value))})}
                                    />
                                    <div className="text-[8px] font-black uppercase text-center text-orange-400 mt-2">Unidades</div>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 space-y-4">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Registrar Insumo</label>
                              <input placeholder="NOMBRE..." className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none font-black uppercase text-xs focus:bg-white shadow-inner" value={currentIngredient.name} onChange={e => setCurrentIngredient({...currentIngredient, name: e.target.value})}/>
                              <div className="grid grid-cols-3 gap-4">
                                 <input type="number" placeholder="CANT." className="w-full px-5 py-4 border border-slate-200 rounded-2xl bg-white font-mono text-xs outline-none" value={currentIngredient.quantity || ''} onChange={e => setCurrentIngredient({...currentIngredient, quantity: Number(e.target.value)})}/>
                                 <select className="px-4 py-4 border border-slate-200 rounded-2xl bg-white text-xs font-bold outline-none cursor-pointer" value={currentIngredient.unit} onChange={e => setCurrentIngredient({...currentIngredient, unit: e.target.value})}><option>kg</option><option>gr</option><option>un</option><option>lt</option></select>
                                 <input type="number" placeholder="COSTO U." className="w-full px-5 py-4 border border-slate-200 rounded-2xl bg-white font-mono text-xs outline-none" value={currentIngredient.unitCost || ''} onChange={e => setCurrentIngredient({...currentIngredient, unitCost: Number(e.target.value)})}/>
                              </div>
                              <button onClick={addIngredient} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all">+ Añadir Insumo</button>
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
                                   <button onClick={() => removeIngredient(ing.id)} className="p-3 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>
                   )}
                </div>
              </div>
            </div>

            <div className="px-12 py-10 bg-slate-50/50 border-t border-slate-100 flex gap-6 shrink-0">
               <button onClick={() => setShowProductModal(false)} className="flex-1 py-6 text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Descartar</button>
               <button onClick={handleSaveProduct} className="flex-[2] py-6 bg-slate-950 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all">Guardar Producto</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
