
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
    const productSummary: Record<string, { qty: number, total: number, cost: number }> = {};
    
    periodFilteredData.forEach(item => {
      if (!productSummary[item.producto]) {
        productSummary[item.producto] = { qty: 0, total: 0, cost: 0 };
      }
      productSummary[item.producto].qty += item.cantidad;
      productSummary[item.producto].total += item.total;
      productSummary[item.producto].cost += (item.costo * item.cantidad);
    });

    return {
      products: productSummary,
      revenue: totalRevenue,
      profit: totalProfit,
      count: periodFilteredData.length,
      units: totalProductsSoldCount
    };
  }, [periodFilteredData, totalRevenue, totalProfit, totalProductsSoldCount]);

  const dailyComparisonData = useMemo(() => {
    const getStats = (daysAgo: number) => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - daysAgo);
      targetDate.setHours(0, 0, 0, 0);
      const endTime = new Date(targetDate);
      endTime.setHours(23, 59, 59, 999);

      const dayItems = baseProcessedData.filter(h => h.timestamp >= targetDate.getTime() && h.timestamp <= endTime.getTime());
      return {
        name: targetDate.toLocaleDateString([], { weekday: 'short' }),
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
      const itemData = data as any;
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
      `💰 *INGRESOS:* $${formatMoney(totalRevenue)}\n` +
      `📈 *UTILIDAD:* $${formatMoney(totalProfit)}\n` +
      `--------------------------\n` +
      `🚀 _${appName}_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    onWSModalOpenChange(false);
  };

  const downloadReport = () => {
    if (baseProcessedData.length === 0) return;
    const sep = ';';
    const csvContent = [
      ['Fecha', 'Hora', 'Vendedor', 'Producto', 'Cantidad', 'Total', 'Ganancia'].join(sep),
      ...baseProcessedData.map(h => [h.fecha, h.hora, h.vendedor, h.producto, h.cantidad, h.total, h.ganancia].join(sep))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Ventas_${appName}.csv`;
    link.click();
  };

  const isHistorical = statsPeriod === 'ALL';

  return (
    <div className="space-y-6 pb-20">
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
        <div className="lg:col-span-7 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col relative overflow-hidden min-h-[350px]">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Target size={14} className={isHistorical ? 'text-indigo-500' : 'text-orange-500'} />
                {isHistorical ? 'Cronología' : 'Tendencias'}
              </h3>
              <p className="text-lg font-black text-slate-900 uppercase tracking-tighter mt-1">Crecimiento</p>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[250px]" style={{ minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%" minHeight={250}>
              <BarChart data={dailyComparisonData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 700}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }} />
                <Bar name="Ventas" dataKey="ventas" radius={[8, 8, 0, 0]} barSize={40}>
                  {dailyComparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={isHistorical ? (index === dailyComparisonData.length - 1 ? '#6366f1' : '#a5b4fc') : (index === dailyComparisonData.length - 1 ? '#f97316' : '#cbd5e1')} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Users size={14} className={isHistorical ? 'text-indigo-500' : 'text-blue-500'} />
                {isHistorical ? 'Aportes Históricos' : 'Ranking Equipos'}
              </h3>
              <p className="text-lg font-black text-slate-900 uppercase tracking-tighter mt-1">Productividad</p>
            </div>
          </div>

          <div className="flex-1 space-y-6 relative z-10 overflow-y-auto pr-1 scrollbar-thin">
            {sellerPerformance.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center py-10">
                <Users size={40} className="mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest">Sin ventas</p>
              </div>
            ) : (
              sellerPerformance.map((seller, idx) => {
                const maxRev = Math.max(...sellerPerformance.map(s => s.rev));
                const percentage = maxRev > 0 ? (seller.rev / maxRev) * 100 : 0;
                return (
                  <div key={seller.name} className="group p-4 bg-slate-50 border border-transparent hover:border-slate-100 rounded-2xl transition-all">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center font-black text-xs text-slate-600">
                        {seller.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <h4 className="text-[11px] font-black text-slate-800 uppercase truncate">{seller.name}</h4>
                          <span className="text-[11px] font-black text-slate-900 font-mono tracking-tighter">${formatMoney(seller.rev)}</span>
                        </div>
                        <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                          <span>{seller.qty} UN</span>
                          <span className={isHistorical ? 'text-indigo-600' : 'text-emerald-600'}>${formatMoney(seller.profit)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full ${isHistorical ? 'bg-indigo-400' : 'bg-orange-400'}`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-12 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.15em]">Últimos Movimientos</h3>
            <button 
              onClick={downloadReport}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md active:scale-95"
            >
              Exportar CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase border-b border-slate-100">Ticket</th>
                  <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase border-b border-slate-100">Vendedor</th>
                  <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase border-b border-slate-100 text-right">Venta</th>
                  <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase border-b border-slate-100 text-right">Utilidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {baseProcessedData.slice(0, 10).map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-4">
                      <div>
                        <p className="text-[11px] font-black text-slate-800 uppercase">{row.producto}</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase">{row.fecha} • {row.hora}</p>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <p className="text-[10px] font-black text-slate-600 uppercase">{row.vendedor}</p>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <p className="text-[11px] font-black text-slate-900 font-mono tracking-tighter">${formatMoney(row.total)}</p>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black font-mono ${row.ganancia >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
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

      {isWSModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900 uppercase">Enviar Reporte</h2>
              <button onClick={() => onWSModalOpenChange(false)} className="p-2 bg-slate-50 rounded-full text-slate-400"><X size={18}/></button>
            </div>
            <div className="p-8 flex-1 bg-slate-50">
               <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl">
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic mb-4">{appName}</h3>
                  <div className="space-y-2 mb-6 max-h-[200px] overflow-y-auto scrollbar-none">
                     {Object.entries(reportSummary.products).map(([name, data]) => (
                       <div key={name} className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                          <span>{(data as any).qty}x {name}</span>
                          <span className="text-white">${formatMoney((data as any).total)}</span>
                       </div>
                     ))}
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                     <div>
                        <p className="text-[9px] font-black text-white/30 uppercase mb-1">Total Ventas</p>
                        <p className="text-2xl font-black text-white font-mono tracking-tighter">${formatMoney(totalRevenue)}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[9px] font-black text-white/30 uppercase mb-1">Margen</p>
                        <p className="text-2xl font-black text-emerald-400 font-mono tracking-tighter">${formatMoney(totalProfit)}</p>
                     </div>
                  </div>
               </div>
            </div>
            <div className="p-8 shrink-0">
              <button 
                onClick={shareByWhatsApp}
                className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                Compartir WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, trend, icon, accentClass, iconClass, bgClass, special }: { title: string, value: string, trend: string, icon: React.ReactNode, accentClass: string, iconClass: string, bgClass: string, special?: boolean }) => (
  <div className={`relative p-6 rounded-[2rem] border-b-4 ${accentClass} border-t border-x border-slate-200 shadow-sm transition-all duration-300 bg-white overflow-hidden group`}>
    <div className={`absolute inset-0 ${bgClass} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${iconClass} shadow-sm group-hover:scale-110 transition-transform`}>{icon}</div>
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${special ? 'bg-indigo-600' : 'bg-slate-900'} text-white`}>{trend}</span>
      </div>
      <div className="space-y-1">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-2">{title}</p>
        <p className={`text-3xl font-black ${special ? 'text-indigo-900' : 'text-slate-900'} font-mono tracking-tighter`}>{value}</p>
      </div>
    </div>
  </div>
);
