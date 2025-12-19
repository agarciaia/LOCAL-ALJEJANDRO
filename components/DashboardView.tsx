
import React, { useState, useMemo, useEffect } from 'react';
import { Sale, Product, Category, TimePeriod } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell
} from 'recharts';
import { 
  TrendingUp, Users, DollarSign, Calendar, Download, Table as TableIcon, History, 
  User, Package, MessageCircle, X, CheckCircle2, PieChart, ArrowRight, ChevronDown, 
  Activity, Wallet, ShoppingCart, Filter, Award, Target, Star, Globe, Send, Mail, 
  Banknote, Percent, Layers, Share2, Trash2, FileSpreadsheet, ClipboardList
} from 'lucide-react';

interface DashboardViewProps {
  sales: Sale[];
  products: Product[];
  categories: Category[];
  selectedSeller: string;
  onSelectedSellerChange: (seller: string) => void;
  statsPeriod: TimePeriod;
  isWSModalOpen: boolean;
  onWSModalOpenChange: (open: boolean) => void;
  appName: string;
  onDeleteSale: (id: string) => void;
}

const formatMoney = (amount: number) => amount.toLocaleString('de-DE');

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  sales, 
  products, 
  categories, 
  selectedSeller,
  onSelectedSellerChange,
  statsPeriod,
  isWSModalOpen,
  onWSModalOpenChange,
  appName,
  onDeleteSale
}) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDetailedReport, setShowDetailedReport] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsHydrated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const baseProcessedData = useMemo(() => {
    return sales.flatMap(sale => {
      const date = new Date(sale.timestamp);
      return sale.items.map(item => {
        const category = categories.find(c => c.id === item.categoryId);
        const seller = item.sellerName || category?.sellerName || 'Admin';
        
        if (selectedSeller !== 'ALL' && seller !== selectedSeller) return null;

        const costPerUnit = item.costMethod === 'FIXED' 
          ? (item.fixedCost || 0)
          : item.ingredients.reduce((iAcc, ing) => iAcc + (ing.quantity * ing.unitCost), 0) / (item.yield || 1);
        
        const totalCost = costPerUnit * item.quantity;
        const totalRevenue = item.price * item.quantity;
        const profit = totalRevenue - totalCost;

        return {
          id: `${sale.id}-${item.id}`,
          saleId: sale.id,
          timestamp: sale.timestamp,
          fecha: date.toLocaleDateString(),
          hora: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          categoria: category?.name || 'S/C',
          vendedor: seller,
          producto: item.name,
          cantidad: item.quantity,
          precio: item.price,
          costo: costPerUnit,
          ganancia: profit,
          total: totalRevenue,
          ingredients: item.ingredients,
          yield: item.yield || 1
        };
      });
    }).filter((item): item is NonNullable<typeof item> => item !== null);
  }, [sales, categories, selectedSeller]);

  const periodFilteredData = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (statsPeriod === 'TODAY') {
      const todayStart = new Date().setHours(0,0,0,0);
      return baseProcessedData.filter(h => h.timestamp >= todayStart);
    }
    if (statsPeriod === 'WEEK') {
      return baseProcessedData.filter(h => h.timestamp >= now - (7 * oneDay));
    }
    if (statsPeriod === 'MONTH') {
      return baseProcessedData.filter(h => h.timestamp >= now - (30 * oneDay));
    }
    return baseProcessedData;
  }, [baseProcessedData, statsPeriod]);

  const totalRevenue = periodFilteredData.reduce((acc, h) => acc + h.total, 0);
  const totalProfit = periodFilteredData.reduce((acc, h) => acc + h.ganancia, 0);
  const totalProductsSoldCount = periodFilteredData.reduce((acc, h) => acc + h.cantidad, 0);

  const ingredientBreakdown = useMemo(() => {
    const ingredientsMap: Record<string, { qty: number, unit: string, cost: number }> = {};
    periodFilteredData.forEach(item => {
      item.ingredients.forEach(ing => {
        if (!ingredientsMap[ing.name]) {
          ingredientsMap[ing.name] = { qty: 0, unit: ing.unit, cost: 0 };
        }
        const usage = (ing.quantity / (item.yield || 1)) * item.cantidad;
        ingredientsMap[ing.name].qty += usage;
        ingredientsMap[ing.name].cost += usage * ing.unitCost;
      });
    });
    return Object.entries(ingredientsMap).map(([name, data]) => ({ name, ...data }));
  }, [periodFilteredData]);

  const sellerPerformance = useMemo(() => {
    const map: Record<string, { qty: number, rev: number, profit: number }> = {};
    periodFilteredData.forEach(h => {
      if (!map[h.vendedor]) map[h.vendedor] = { qty: 0, rev: 0, profit: 0 };
      map[h.vendedor].qty += h.cantidad;
      map[h.vendedor].rev += h.total;
      map[h.vendedor].profit += h.ganancia;
    });
    return Object.entries(map).map(([name, stats]) => ({
      name,
      ...stats
    })).sort((a, b) => b.rev - a.rev);
  }, [periodFilteredData]);

  const availableSellers = useMemo(() => {
    const sellers = new Set(categories.map(c => c.sellerName || 'Admin'));
    return Array.from(sellers).sort();
  }, [categories]);

  // FIX: Added missing dailyComparisonData to resolve "Cannot find name 'dailyComparisonData'" error
  const dailyComparisonData = useMemo(() => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        name: days[d.getDay()],
        date: d.toLocaleDateString(),
        ventas: 0
      };
    });

    periodFilteredData.forEach(h => {
      const hDate = new Date(h.timestamp).toLocaleDateString();
      const day = last7Days.find(d => d.date === hDate);
      if (day) {
        day.ventas += h.total;
      }
    });

    return last7Days;
  }, [periodFilteredData]);

  const exportSalesCSV = () => {
    let csv = "ID_VENTA,FECHA,VENDEDOR,PRODUCTO,CANTIDAD,PRECIO,COSTO_UNIT,TOTAL,GANANCIA\n";
    periodFilteredData.forEach(h => {
      csv += `${h.saleId},${h.fecha},${h.vendedor},${h.producto},${h.cantidad},${h.precio},${h.costo.toFixed(2)},${h.total},${h.ganancia.toFixed(2)}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `Ventas_${statsPeriod}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const generateReportMessage = () => {
    let productList = "*RESUMEN POR PRODUCTO*\n";
    const productSummary: Record<string, { qty: number, total: number }> = {};
    periodFilteredData.forEach(item => {
      if (!productSummary[item.producto]) productSummary[item.producto] = { qty: 0, total: 0 };
      productSummary[item.producto].qty += item.cantidad;
      productSummary[item.producto].total += item.total;
    });
    Object.entries(productSummary).forEach(([name, data]) => {
      productList += `• ${data.qty} x ${name} = $${formatMoney(data.total)}\n`;
    });

    let ingredientList = "\n*CONSUMO DE INSUMOS*\n";
    ingredientBreakdown.forEach(ing => {
      ingredientList += `• ${ing.qty.toFixed(3)} ${ing.unit} ${ing.name}\n`;
    });

    return `📊 *REPORTE DETALLADO - ${appName}*\n*Vendedor:* ${selectedSeller}\n--------------------------\n${productList}${ingredientList}--------------------------\n💰 *TOTAL:* $${formatMoney(totalRevenue)}\n📈 *UTILIDAD:* $${formatMoney(totalProfit)}\n🚀 _Generado por ${appName}_`;
  };

  const shareByWhatsApp = () => {
    const message = generateReportMessage();
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareByTelegram = () => {
    const message = generateReportMessage();
    window.open(`https://t.me/share/url?url=${encodeURIComponent('Reporte Analítico')}&text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareBySMS = () => {
    const message = generateReportMessage();
    window.open(`sms:?body=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Panel de Control</h2>
          <div className="flex items-center gap-3 mt-2">
            <select 
              value={selectedSeller} 
              onChange={(e) => onSelectedSellerChange(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white"
            >
              <option value="ALL">TODOS LOS VENDEDORES</option>
              {availableSellers.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">
            <History size={16} />
            <span>Historial</span>
          </button>
          <button onClick={() => setShowDetailedReport(true)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl">
            <ClipboardList size={16} />
            <span>Reporte Detallado</span>
          </button>
          <button onClick={() => onWSModalOpenChange(true)} className="flex items-center gap-2 px-6 py-3 bg-orange-400 text-orange-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-300 transition-all shadow-xl">
            <Share2 size={16} />
            <span>Compartir</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Ingresos Brutos" value={`$${formatMoney(totalRevenue)}`} trend="Ventas del Período" icon={<Banknote size={28} />} colorScheme="emerald" />
        <StatCard title="Utilidad Neta" value={`$${formatMoney(totalProfit)}`} trend="Margen de Ganancia" icon={<Percent size={28} />} colorScheme="indigo" />
        <StatCard title="Ventas Totales" value={totalProductsSoldCount.toLocaleString()} trend="Unidades Vendidas" icon={<Layers size={28} />} colorScheme="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col min-h-[450px]">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
            <Activity size={14} className="text-orange-500" />
            Ventas Últimos Días
          </h3>
          <div className="flex-1 w-full" style={{ minWidth: 0, minHeight: 300 }}>
            {isHydrated && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyComparisonData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }} />
                  <Bar dataKey="ventas" radius={[12, 12, 0, 0]} fill="#f97316" barSize={60}>
                    {dailyComparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 4 ? '#f97316' : '#cbd5e1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
            <Award size={14} className="text-indigo-500" />
            Mejores Vendedores
          </h3>
          <div className="flex-1 space-y-4">
            {sellerPerformance.map((seller, idx) => (
              <div key={seller.name} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-between group hover:bg-white hover:border-indigo-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">{idx + 1}</div>
                  <div>
                    <span className="text-xs font-black uppercase text-slate-900 block">{seller.name}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{seller.qty} Ventas</span>
                  </div>
                </div>
                <span className="font-mono text-sm font-black text-indigo-600">${formatMoney(seller.rev)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL HISTORIAL */}
      {showHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[4rem] w-full max-w-6xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
             <div className="px-12 py-10 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                <div>
                   <h2 className="text-3xl font-black text-slate-950 tracking-tighter uppercase italic">Historial Maestro</h2>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gestión de transacciones y auditoría</p>
                </div>
                <div className="flex gap-4">
                   <button onClick={exportSalesCSV} className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all">
                      <FileSpreadsheet size={18} />
                      Exportar Excel
                   </button>
                   <button onClick={() => setShowHistory(false)} className="p-4 bg-white border border-slate-100 rounded-full text-slate-400 hover:text-slate-950 transition-all"><X size={24}/></button>
                </div>
             </div>
             <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <table className="w-full">
                   <thead>
                      <tr className="border-b border-slate-100">
                         <th className="text-left py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha/Hora</th>
                         <th className="text-left py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Vendedor</th>
                         <th className="text-left py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Productos</th>
                         <th className="text-right py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Total</th>
                         <th className="text-right py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Utilidad</th>
                         <th className="text-center py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Acción</th>
                      </tr>
                   </thead>
                   <tbody>
                      {sales.sort((a,b) => b.timestamp - a.timestamp).map(sale => {
                        const date = new Date(sale.timestamp);
                        const itemsList = sale.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
                        return (
                          <tr key={sale.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                             <td className="py-6">
                                <p className="text-xs font-black text-slate-900">{date.toLocaleDateString()}</p>
                                <p className="text-[10px] text-slate-400 font-bold">{date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                             </td>
                             <td className="py-6">
                                <span className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-600">{sale.items[0]?.sellerName || 'CASA'}</span>
                             </td>
                             <td className="py-6 text-xs text-slate-500 font-medium max-w-xs truncate">{itemsList}</td>
                             <td className="py-6 text-right font-mono font-black text-slate-950 text-sm">${formatMoney(sale.total)}</td>
                             <td className="py-6 text-right font-mono font-black text-emerald-600 text-sm">${formatMoney(sale.profit)}</td>
                             <td className="py-6 text-center">
                                <button onClick={() => onDeleteSale(sale.id)} className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16}/></button>
                             </td>
                          </tr>
                        );
                      })}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      )}

      {/* MODAL REPORTE DETALLADO */}
      {showDetailedReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[4rem] w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
             <div className="px-12 py-10 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                <div>
                   <h2 className="text-3xl font-black text-slate-950 tracking-tighter uppercase italic">Análisis Profundo</h2>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Desglose de productos, márgenes e insumos</p>
                </div>
                <button onClick={() => setShowDetailedReport(false)} className="p-4 bg-white border border-slate-100 rounded-full text-slate-400 hover:text-slate-950 transition-all"><X size={24}/></button>
             </div>
             <div className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-12">
                <section>
                   <h3 className="text-xs font-black uppercase tracking-[0.3em] text-orange-500 mb-6">Productos Más Vendidos</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* // Fix: Typed the accumulator explicitly to avoid 'unknown' type errors during sort and map */}
                      {Object.values(periodFilteredData.reduce((acc, item) => {
                        if (!acc[item.producto]) acc[item.producto] = { name: item.producto, qty: 0, rev: 0, profit: 0 };
                        acc[item.producto].qty += item.cantidad;
                        acc[item.producto].rev += item.total;
                        acc[item.producto].profit += item.ganancia;
                        return acc;
                      }, {} as Record<string, { name: string; qty: number; rev: number; profit: number }>))
                      .sort((a, b) => b.qty - a.qty)
                      .map((p) => (
                        <div key={p.name} className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                           <div className="flex justify-between items-center mb-4">
                              <span className="text-xs font-black uppercase text-slate-900">{p.name}</span>
                              <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full">{p.qty} UN</span>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="text-center">
                                 <p className="text-[8px] font-black text-slate-400 uppercase">Ingresos</p>
                                 <p className="text-sm font-black text-slate-900 font-mono">${formatMoney(p.rev)}</p>
                              </div>
                              <div className="text-center">
                                 <p className="text-[8px] font-black text-slate-400 uppercase">Utilidad</p>
                                 <p className="text-sm font-black text-emerald-600 font-mono">${formatMoney(p.profit)}</p>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </section>

                <section>
                   <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500 mb-6">Uso de Materia Prima (Consumido)</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {ingredientBreakdown.map(ing => (
                        <div key={ing.name} className="p-6 bg-indigo-950 text-white rounded-[2rem] text-center shadow-lg">
                           <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">{ing.name}</p>
                           <p className="text-2xl font-black font-mono leading-none">{ing.qty.toFixed(2)}</p>
                           <p className="text-[8px] font-bold text-white/50 uppercase mt-1">{ing.unit}</p>
                           <p className="text-[10px] font-black text-indigo-400 mt-4 border-t border-white/5 pt-2 font-mono">${formatMoney(ing.cost)}</p>
                        </div>
                      ))}
                   </div>
                </section>
             </div>
          </div>
        </div>
      )}

      {isWSModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl p-10 space-y-8 animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter italic">Compartir Informe</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reporte consolidado del período</p>
              </div>
              <button onClick={() => onWSModalOpenChange(false)} className="p-3 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-colors"><X size={20}/></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ShareButton icon={<MessageCircle size={24} />} label="WhatsApp" color="bg-emerald-50 text-emerald-600 hover:bg-emerald-500" onClick={shareByWhatsApp} />
              <ShareButton icon={<Send size={24} />} label="Telegram" color="bg-sky-50 text-sky-600 hover:bg-sky-500" onClick={shareByTelegram} />
              <ShareButton icon={<Mail size={24} />} label="SMS" color="bg-slate-50 text-slate-600 hover:bg-slate-900" onClick={shareBySMS} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ShareButton = ({ icon, label, color, onClick }: any) => (
  <button onClick={onClick} className={`group flex flex-col items-center gap-3 p-6 rounded-[2rem] transition-all duration-300 border border-transparent shadow-sm ${color} hover:text-white hover:shadow-xl active:scale-95`}>
    <div className="p-3 bg-white/80 rounded-2xl group-hover:scale-110 transition-transform shadow-sm">{icon}</div>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const StatCard = ({ title, value, trend, icon, colorScheme }: { title: string, value: string, trend: string, icon: React.ReactNode, colorScheme: string }) => {
  const styles: any = {
    emerald: 'border-emerald-200 bg-white text-emerald-600 icon-bg-emerald-50',
    indigo: 'border-indigo-200 bg-white text-indigo-600 icon-bg-indigo-50',
    orange: 'border-orange-200 bg-white text-orange-600 icon-bg-orange-50'
  };
  return (
    <div className={`p-8 rounded-[3rem] border ${styles[colorScheme]} shadow-2xl flex flex-col relative overflow-hidden group hover:-translate-y-2 transition-all duration-500`}>
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="p-4 rounded-2xl bg-slate-50 shadow-inner group-hover:scale-110 transition-transform">{icon}</div>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{trend}</span>
        </div>
        <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-2">{title}</p>
        <p className="text-4xl font-black text-slate-950 font-mono tracking-tighter leading-none">{value}</p>
      </div>
    </div>
  );
};
