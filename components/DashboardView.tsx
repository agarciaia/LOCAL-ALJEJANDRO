
import React, { useState, useMemo } from 'react';
import { Sale, Product, Category, TimePeriod } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell
} from 'recharts';
import { TrendingUp, Users, DollarSign, Calendar, Download, Table as TableIcon, History, User, Package, MessageCircle, X, CheckCircle2, PieChart, ArrowRight, ChevronDown, Activity, Wallet, ShoppingCart, Filter, Award, Target, Star, Globe } from 'lucide-react';

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
}

type ExportRange = 'ALL' | 'TODAY' | 'WEEK' | 'MONTH';

// Helper for consistent currency formatting (e.g., 1.000.000)
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
  appName
}) => {
  const [exportRange, setExportRange] = useState<ExportRange>('ALL');

  // Global processed data (filtered by seller)
  const baseProcessedData = useMemo(() => {
    return sales.flatMap(sale => {
      const date = new Date(sale.timestamp);
      return sale.items.map(item => {
        const category = categories.find(c => c.id === item.categoryId);
        const seller = item.sellerName || category?.sellerName || 'Admin';
        
        if (selectedSeller !== 'ALL' && seller !== selectedSeller) return null;

        const costPerUnit = item.costMethod === 'FIXED' 
          ? (item.fixedCost || 0)
          : item.ingredients.reduce((iAcc, ing) => iAcc + (ing.quantity * ing.unitCost), 0);
        
        const totalCost = costPerUnit * item.quantity;
        const totalRevenue = item.price * item.quantity;
        const profit = totalRevenue - totalCost;

        return {
          id: `${sale.id}-${item.id}`,
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
          total: totalRevenue
        };
      });
    }).filter((item): item is NonNullable<typeof item> => item !== null);
  }, [sales, categories, selectedSeller]);

  // Data filtered by the selected Stats Period
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

  // Main Stats Calculations
  const totalRevenue = periodFilteredData.reduce((acc, h) => acc + h.total, 0);
  const totalProfit = periodFilteredData.reduce((acc, h) => acc + h.ganancia, 0);
  const totalProductsSoldCount = periodFilteredData.reduce((acc, h) => acc + h.cantidad, 0);

  // Seller Performance Data
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

  const reportSummary = useMemo(() => {
    const reportData = periodFilteredData; 
    const productSummary: Record<string, { qty: number, total: number, cost: number }> = {};
    
    reportData.forEach(item => {
      if (!productSummary[item.producto]) {
        productSummary[item.producto] = { qty: 0, total: 0, cost: 0 };
      }
      productSummary[item.producto].qty += item.cantidad;
      productSummary[item.producto].total += item.total;
      productSummary[item.producto].cost += (item.costo * item.cantidad);
    });

    const totalRev = reportData.reduce((acc, h) => acc + h.total, 0);
    const totalProf = reportData.reduce((acc, h) => acc + h.ganancia, 0);
    const totalCost = reportData.reduce((acc, h) => acc + (h.costo * h.cantidad), 0);
    
    return {
      products: productSummary,
      revenue: totalRev,
      profit: totalProf,
      cost: totalCost,
      count: reportData.length,
      units: reportData.reduce((acc, h) => acc + h.cantidad, 0)
    };
  }, [periodFilteredData]);

  const dailyComparisonData = useMemo(() => {
    const getStats = (daysAgo: number) => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - daysAgo);
      targetDate.setHours(0, 0, 0, 0);
      const endTime = new Date(targetDate);
      endTime.setHours(23, 59, 59, 999);

      const dayItems = baseProcessedData.filter(h => h.timestamp >= targetDate.getTime() && h.timestamp <= endTime.getTime());
      return {
        name: targetDate.toLocaleDateString([], { weekday: 'short', day: 'numeric' }),
        ventas: dayItems.reduce((acc, h) => acc + h.total, 0),
      };
    };
    return [getStats(4), getStats(3), getStats(2), getStats(1), getStats(0)];
  }, [baseProcessedData]);

  const shareByWhatsApp = () => {
    const rangeText = statsPeriod === 'ALL' ? 'Todo el historial' : 
                      statsPeriod === 'TODAY' ? 'Hoy' : 
                      statsPeriod === 'WEEK' ? 'Última Semana' : 'Último Mes';

    let productList = "";
    Object.entries(reportSummary.products).forEach(([name, data]) => {
      const itemData = data as { qty: number; total: number; cost: number };
      productList += `• ${itemData.qty} x ${name} = $${formatMoney(itemData.total)}\n`;
    });

    const message = `📊 *REPORTE DE VENTAS*\n` +
      `🏢 *Local:* ${appName}\n` +
      `👤 *Vendedor:* ${selectedSeller === 'ALL' ? 'Todos' : selectedSeller}\n` +
      `📅 *Periodo:* ${rangeText}\n` +
      `--------------------------\n` +
      `*VENTAS:*\n` +
      productList +
      `--------------------------\n` +
      `💰 *INGRESOS:* $${formatMoney(reportSummary.revenue)}\n` +
      `📈 *UTILIDAD:* $${formatMoney(reportSummary.profit)}\n` +
      `--------------------------\n` +
      `🚀 _${appName}_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    onWSModalOpenChange(false);
  };

  const downloadReport = () => {
    const exportData = baseProcessedData;
    if (exportData.length === 0) return;
    const sep = ';';
    const BOM = '\uFEFF';
    const csvContent = [
      ['Fecha', 'Hora', 'Vendedor', 'Producto', 'Cantidad', 'Total', 'Ganancia'].join(sep),
      ...exportData.map(h => [h.fecha, h.hora, h.vendedor, h.producto, h.cantidad, h.total, h.ganancia].join(sep))
    ].join('\n');
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `Ventas_${appName}_${new Date().toLocaleDateString()}.csv`);
    link.click();
  };

  const isHistorical = statsPeriod === 'ALL';

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard 
          title="Ingresos" 
          value={`$${formatMoney(totalRevenue)}`} 
          trend={isHistorical ? 'Acumulado Total' : 'En período'}
          icon={<Wallet size={20} />} 
          accentClass={isHistorical ? 'border-indigo-400' : 'border-orange-200'}
          iconClass={isHistorical ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-50 text-orange-600'}
          bgClass={isHistorical ? 'bg-indigo-50/40' : 'bg-orange-50/20'}
          special={isHistorical}
        />
        <StatCard 
          title="Utilidad" 
          value={`$${formatMoney(totalProfit)}`} 
          trend="Margen Neto" 
          icon={<TrendingUp size={20} />} 
          accentClass={isHistorical ? 'border-amber-400' : 'border-emerald-200'}
          iconClass={isHistorical ? 'bg-amber-100 text-amber-600' : 'bg-emerald-50 text-emerald-600'}
          bgClass={isHistorical ? 'bg-amber-50/40' : 'bg-emerald-50/20'}
          special={isHistorical}
        />
        <StatCard 
          title="Ventas Totales" 
          value={totalProductsSoldCount.toString()} 
          trend="Unidades" 
          icon={<ShoppingCart size={20} />} 
          accentClass={isHistorical ? 'border-blue-400' : 'border-blue-200'}
          iconClass={isHistorical ? 'bg-blue-100 text-blue-600' : 'bg-blue-50 text-blue-600'}
          bgClass={isHistorical ? 'bg-blue-50/40' : 'bg-blue-50/20'}
          special={isHistorical}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-7 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
          {isHistorical && (
             <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <Globe size={180} />
             </div>
          )}
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Target size={14} className={isHistorical ? 'text-indigo-500' : 'text-orange-500'} />
                {isHistorical ? 'Cronología Vital' : 'Tendencias'}
              </h3>
              <p className="text-lg font-black text-slate-900 uppercase tracking-tighter mt-1">{isHistorical ? 'Hitos de Crecimiento' : 'Crecimiento de Ventas'}</p>
            </div>
          </div>
          <div className="h-64 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyComparisonData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 700}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }} />
                <Bar name="Ventas" dataKey="ventas" radius={[8, 8, 0, 0]} barSize={45}>
                  {dailyComparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={isHistorical ? (index === dailyComparisonData.length - 1 ? '#6366f1' : '#a5b4fc') : (index === dailyComparisonData.length - 1 ? '#f97316' : '#cbd5e1')} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enhanced Teams Section */}
        <div className="lg:col-span-5 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
          <div className={`absolute -right-10 -top-10 w-40 h-40 ${isHistorical ? 'bg-indigo-50' : 'bg-blue-50'} rounded-full opacity-50 blur-3xl`}></div>
          
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Users size={14} className={isHistorical ? 'text-indigo-500' : 'text-blue-500'} />
                {isHistorical ? 'Maestros del Local' : 'Ranking Equipos'}
              </h3>
              <p className="text-lg font-black text-slate-900 uppercase tracking-tighter mt-1">{isHistorical ? 'Aportes Históricos' : 'Productividad'}</p>
            </div>
            {isHistorical ? <Award className="text-indigo-400" size={24} /> : <Award className="text-orange-400" size={24} />}
          </div>

          <div className="flex-1 space-y-6 relative z-10 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-100">
            {sellerPerformance.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center py-10">
                <Users size={40} className="mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest">Sin registros de ventas</p>
              </div>
            ) : (
              sellerPerformance.map((seller, idx) => {
                const maxRev = Math.max(...sellerPerformance.map(s => s.rev));
                const percentage = maxRev > 0 ? (seller.rev / maxRev) * 100 : 0;
                const colors = isHistorical ? ['bg-indigo-300', 'bg-violet-300', 'bg-sky-300', 'bg-blue-300'] : ['bg-orange-300', 'bg-blue-300', 'bg-emerald-300', 'bg-indigo-300'];
                const accentColors = isHistorical ? ['text-indigo-700', 'text-violet-700', 'text-sky-700', 'text-blue-700'] : ['text-orange-700', 'text-blue-700', 'text-emerald-700', 'text-indigo-700'];
                
                return (
                  <div key={seller.name} className="group p-4 bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-slate-100">
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`w-10 h-10 ${colors[idx % colors.length]} rounded-xl flex items-center justify-center font-black text-xs ${accentColors[idx % accentColors.length]} shadow-sm`}>
                        {seller.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-end mb-1">
                          <h4 className="text-[11px] font-black text-slate-800 uppercase truncate">{seller.name}</h4>
                          <span className="text-[11px] font-black text-slate-900 font-mono tracking-tighter">${formatMoney(seller.rev)}</span>
                        </div>
                        <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                          <span>{seller.qty} UNIDADES</span>
                          <span className={isHistorical ? 'text-indigo-600' : 'text-emerald-600'}>UTILIDAD: ${formatMoney(seller.profit)}</span>
                        </div>
                      </div>
                      {idx === 0 && <Star size={14} className="text-yellow-400 fill-yellow-400 shrink-0" />}
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                      <div 
                        className={`h-full ${colors[idx % colors.length]} transition-all duration-1000 ease-out`} 
                        style={{ width: `${percentage}%` }} 
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Detailed Transactions List */}
        <div className="lg:col-span-12 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-8 py-5 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-xl">
                <History size={16} className="text-slate-500" />
              </div>
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.15em]">Historial de Movimientos</h3>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex bg-slate-100 p-1 rounded-xl">
                  {(['ALL', 'TODAY', 'WEEK', 'MONTH'] as ExportRange[]).map((range) => (
                    <button 
                      key={range} 
                      onClick={() => setExportRange(range)} 
                      className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-tighter transition-all ${exportRange === range ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {range === 'ALL' ? 'Todo' : range === 'TODAY' ? 'Hoy' : range === 'WEEK' ? 'Semana' : 'Mes'}
                    </button>
                  ))}
               </div>
               <button 
                onClick={downloadReport}
                className={`flex items-center gap-2 px-4 py-2 ${isHistorical ? 'bg-indigo-900' : 'bg-slate-900'} text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-md active:scale-95`}
               >
                 <Download size={14} />
                 CSV
               </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Información del Ticket</th>
                  <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Vendedor</th>
                  <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Venta Bruta</th>
                  <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Utilidad Neta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {baseProcessedData.slice(0, 10).map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">
                          <Package size={14} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-slate-800 uppercase">{row.producto}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{row.fecha} • {row.hora}</span>
                            <span className="text-[7px] bg-slate-100 px-1 py-0.5 rounded text-slate-500 font-black">X{row.cantidad}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-black uppercase">{row.vendedor.charAt(0)}</div>
                         <p className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{row.vendedor}</p>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <p className="text-[11px] font-black text-slate-900 font-mono tracking-tighter">${formatMoney(row.total)}</p>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black font-mono tracking-tighter ${row.ganancia >= 0 ? (isHistorical ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600') : 'bg-rose-50 text-rose-600'}`}>
                        ${formatMoney(row.ganancia)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* WhatsApp Modal */}
      {isWSModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-5xl h-[85vh] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
            <div className="w-full md:w-[350px] p-8 border-r border-slate-100 flex flex-col bg-white">
              <div className="flex justify-between items-start mb-6 shrink-0">
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Reporte Compartido</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enlace vía WhatsApp</p>
                </div>
                <button onClick={() => onWSModalOpenChange(false)} className="p-2 bg-slate-50 rounded-full text-slate-400"><X size={18}/></button>
              </div>

              <div className="flex-1 space-y-6">
                 <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 text-center">
                    <MessageCircle className="mx-auto text-emerald-500 mb-4" size={32} />
                    <p className="text-xs font-black text-emerald-900 uppercase tracking-widest mb-2">Envío Directo</p>
                    <p className="text-[10px] text-emerald-600 font-bold leading-relaxed">Se generará un mensaje estructurado con las ventas y utilidades del período actual.</p>
                 </div>
              </div>

              <div className="pt-6 mt-6 space-y-3 shrink-0">
                <button 
                  onClick={shareByWhatsApp}
                  className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} />
                  Enviar Reporte
                </button>
                <button 
                  onClick={() => onWSModalOpenChange(false)} 
                  className="w-full py-3 font-black text-slate-400 uppercase tracking-widest text-[9px] hover:text-slate-600 transition-all text-center"
                >
                  Cancelar
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-50 p-8 flex flex-col overflow-hidden">
               <div className="flex-1 bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl flex flex-col overflow-hidden relative">
                  <div className="absolute top-10 right-10 text-white/5"><PieChart size={120} strokeWidth={1} /></div>
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-10 border-b border-white/10 pb-6">
                       <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-2">Previsualización</p>
                       <h3 className="text-3xl font-black tracking-tighter italic uppercase">{appName}</h3>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto scrollbar-none">
                       {Object.entries(reportSummary.products).map(([name, data]) => {
                         const item = data as any;
                         return (
                           <div key={name} className="flex justify-between items-center border-b border-white/5 py-3">
                              <span className="text-[11px] font-black uppercase text-slate-300">{item.qty}x {name}</span>
                              <span className="text-xs font-black font-mono tracking-tighter">${formatMoney(item.total)}</span>
                           </div>
                         );
                       })}
                    </div>

                    <div className="pt-8 border-t border-white/10 grid grid-cols-2 gap-8">
                       <div>
                          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Cierre Ingresos</p>
                          <p className="text-3xl font-black text-white font-mono tracking-tighter">${formatMoney(reportSummary.revenue)}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Margen Neto</p>
                          <p className="text-3xl font-black text-emerald-400 font-mono tracking-tighter">${formatMoney(reportSummary.profit)}</p>
                       </div>
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

// IMPROVED STAT CARD WITH BACKGROUND TINTS
const StatCard = ({ title, value, trend, icon, accentClass, iconClass, bgClass, special }: { title: string, value: string, trend: string, icon: React.ReactNode, accentClass: string, iconClass: string, bgClass: string, special?: boolean }) => (
  <div className={`relative p-6 rounded-[2rem] border-b-4 ${accentClass} border-t border-x border-slate-200 shadow-sm transition-all duration-300 group cursor-default overflow-hidden ${special ? 'bg-white shadow-lg' : 'bg-white'}`}>
    <div className={`absolute inset-0 ${bgClass} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${iconClass} transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm`}>{icon}</div>
        <div className="text-right">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Estatus</span>
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${special ? 'bg-indigo-600' : 'bg-slate-900'} text-white shadow-sm`}>{trend}</span>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-2">{title}</p>
        <p className={`text-3xl font-black ${special ? 'text-indigo-900' : 'text-slate-900'} font-mono tracking-tighter leading-tight tabular-nums group-hover:translate-x-1 transition-transform`}>{value}</p>
      </div>
    </div>
    {special && (
      <div className="absolute -bottom-6 -right-6 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-700">
         <Globe size={80} />
      </div>
    )}
  </div>
);
