import React, { useState, useMemo, useEffect } from 'react';
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

const formatMoney = (amount: number) => amount.toLocaleString('de-DE');

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  sales, 
  products, 
  categories, 
  selectedSeller,
  statsPeriod,
  isWSModalOpen,
  onWSModalOpenChange,
  appName
}) => {
  const [isHydrated, setIsHydrated] = useState(false);

  // Solución para error de Recharts: Solo renderizar cuando el componente está montado
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
    const productSummary: Record<string, { qty: number, total: number }> = {};
    // Ensure item is correctly typed from periodFilteredData to avoid 'unknown' issues
    periodFilteredData.forEach(item => {
      if (!productSummary[item.producto]) {
        productSummary[item.producto] = { qty: 0, total: 0 };
      }
      productSummary[item.producto].qty += item.cantidad;
      productSummary[item.producto].total += item.total;
    });
    return productSummary;
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
        name: targetDate.toLocaleDateString([], { weekday: 'short' }),
        ventas: dayItems.reduce((acc, h) => acc + h.total, 0),
      };
    };
    return [getStats(4), getStats(3), getStats(2), getStats(1), getStats(0)];
  }, [baseProcessedData]);

  const shareByWhatsApp = () => {
    let productList = "";
    // Fix: Cast entry to concrete type to resolve 'unknown' property access errors (qty, total)
    Object.entries(reportSummary).forEach(([name, entry]) => {
      const data = entry as { qty: number; total: number };
      productList += `• ${data.qty} x ${name} = $${formatMoney(data.total)}\n`;
    });

    const message = `📊 *REPORTE DE VENTAS*\n*Local:* ${appName}\n--------------------------\n${productList}--------------------------\n💰 *TOTAL:* $${formatMoney(totalRevenue)}\n📈 *UTILIDAD:* $${formatMoney(totalProfit)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    onWSModalOpenChange(false);
  };

  const downloadReport = () => {
    if (baseProcessedData.length === 0) return;
    const csv = [['Fecha', 'Vendedor', 'Producto', 'Total'].join(';'), ...baseProcessedData.map(h => [h.fecha, h.vendedor, h.producto, h.total].join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ventas.csv`;
    a.click();
  };

  const isHistorical = statsPeriod === 'ALL';

  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Ingresos" value={`$${formatMoney(totalRevenue)}`} trend={isHistorical ? 'Total' : 'Período'} icon={<Wallet size={20} />} accentClass="border-orange-200" iconClass="bg-orange-50 text-orange-600" bgClass="bg-orange-50/20" />
        <StatCard title="Utilidad" value={`$${formatMoney(totalProfit)}`} trend="Margen" icon={<TrendingUp size={20} />} accentClass="border-emerald-200" iconClass="bg-emerald-50 text-emerald-600" bgClass="bg-emerald-50/20" />
        <StatCard title="Ventas" value={totalProductsSoldCount.toString()} trend="Unidades" icon={<ShoppingCart size={20} />} accentClass="border-blue-200" iconClass="bg-blue-50 text-blue-600" bgClass="bg-blue-50/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col relative min-h-[350px]">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Tendencias de Crecimiento</h3>
          <div className="flex-1 w-full" style={{ minWidth: 0, minHeight: 250 }}>
            {isHydrated && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyComparisonData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 700}} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="ventas" radius={[8, 8, 0, 0]} fill="#f97316" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Ranking Productividad</h3>
          <div className="flex-1 space-y-4 overflow-y-auto pr-1 scrollbar-none">
            {sellerPerformance.map(seller => (
              <div key={seller.name} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center font-black text-[10px]">{seller.name.charAt(0)}</div>
                  <span className="text-[11px] font-black uppercase">{seller.name}</span>
                </div>
                <span className="font-mono text-[11px] font-black">${formatMoney(seller.rev)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-12 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-4 bg-slate-50 flex justify-between items-center">
            <span className="text-[10px] font-black uppercase">Movimientos Recientes</span>
            <button onClick={downloadReport} className="text-[9px] font-black uppercase bg-slate-900 text-white px-3 py-1.5 rounded-lg shadow-md">Exportar</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/30">
                  <th className="px-8 py-3 text-[9px] font-black text-slate-400 uppercase">Producto</th>
                  <th className="px-8 py-3 text-[9px] font-black text-slate-400 uppercase">Vendedor</th>
                  <th className="px-8 py-3 text-[9px] font-black text-slate-400 uppercase text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {baseProcessedData.slice(0, 10).map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/50">
                    <td className="px-8 py-3 text-[10px] font-bold uppercase">{row.producto}</td>
                    <td className="px-8 py-3 text-[9px] font-bold text-slate-500 uppercase">{row.vendedor}</td>
                    <td className="px-8 py-3 text-[10px] font-black text-right font-mono">${formatMoney(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isWSModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-8 space-y-6">
            <h2 className="text-xl font-black uppercase tracking-tighter">Enviar por WhatsApp</h2>
            <div className="bg-slate-900 rounded-2xl p-6 text-white font-mono text-xs">
              <p className="text-emerald-400 mb-2">Reporte: {appName}</p>
              <p>Ventas: ${formatMoney(totalRevenue)}</p>
              <p>Utilidad: ${formatMoney(totalProfit)}</p>
            </div>
            <button onClick={shareByWhatsApp} className="w-full py-4 bg-emerald-500 text-white rounded-xl font-black uppercase text-[10px] shadow-lg">Confirmar Envíos</button>
            <button onClick={() => onWSModalOpenChange(false)} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, trend, icon, accentClass, iconClass, bgClass }: any) => (
  <div className={`p-6 rounded-[2rem] border-b-4 ${accentClass} border-t border-x border-slate-200 bg-white relative overflow-hidden group transition-all hover:scale-[1.02]`}>
    <div className={`absolute inset-0 ${bgClass} opacity-0 group-hover:opacity-100 transition-opacity`} />
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-xl ${iconClass}`}>{icon}</div>
        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-slate-900 text-white">{trend}</span>
      </div>
      <div>
        <p className="text-slate-400 text-[9px] font-black uppercase mb-1">{title}</p>
        <p className="text-2xl font-black tracking-tighter font-mono">{value}</p>
      </div>
    </div>
  </div>
);