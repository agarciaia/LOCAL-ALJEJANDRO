
import React, { useState, useMemo, useEffect } from 'react';
import { Sale, Product, Category, TimePeriod } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Legend
} from 'recharts';
import { 
  TrendingUp, Users, DollarSign, Calendar, Download, Table as TableIcon, History, 
  User, Package, MessageCircle, X, CheckCircle2, ArrowRight, ChevronDown, 
  Activity, Wallet, ShoppingCart, Filter, Award, Target, Star, Globe, Send, Mail, 
  Banknote, Percent, Layers, Share2, Trash2, FileSpreadsheet, ClipboardList, Crown,
  Trophy, Medal, Eye, EyeOff, Printer, Search, ArrowUpDown, GripVertical, Settings2, Sparkles, MoreHorizontal,
  CircleDollarSign, Receipt
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
  companyPhone?: string;
  onDeleteSale: (id: string) => void;
}

const formatMoney = (amount: number) => amount.toLocaleString('de-DE');

// Helper para formatear ejes compactos (Ej: 1500 -> 1.5k)
const formatCompactNumber = (number: number) => {
  return Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(number);
};

// Tooltip Personalizado para el Gráfico
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] text-white min-w-[150px]">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <div className="flex items-center gap-2">
           <div className="w-1 h-8 bg-orange-500 rounded-full"/>
           <div>
              <p className="text-2xl font-black font-mono tracking-tighter leading-none">
                ${formatMoney(payload[0].value)}
              </p>
              <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mt-0.5">Total Ventas</p>
           </div>
        </div>
      </div>
    );
  }
  return null;
};

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
  companyPhone,
  onDeleteSale
}) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  // Estados para el Generador de Reportes Avanzado
  const [reportDateRange, setReportDateRange] = useState({ start: '', end: '' });
  const [reportSearch, setReportSearch] = useState('');
  const [reportSeller, setReportSeller] = useState('ALL');
  const [reportProduct, setReportProduct] = useState('ALL');
  const [reportTitle, setReportTitle] = useState('Reporte General de Ventas');
  const [reportNotes, setReportNotes] = useState('');
  
  // Configuración de Columnas con Persistencia (LocalStorage)
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('dashboard_columns_config');
    return saved ? JSON.parse(saved) : {
      date: true,
      time: true,
      seller: true,
      product: true,
      category: true,
      qty: true,
      price: true,
      total: true,
      status: true
    };
  });

  // Guardar configuración de columnas cuando cambia
  useEffect(() => {
    localStorage.setItem('dashboard_columns_config', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  // Configuración de Ordenamiento
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsHydrated(true), 100);
    // Set default dates for report (Start of month to Today)
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setReportDateRange({
      start: startOfMonth.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    });
    return () => clearTimeout(timer);
  }, []);

  // --- LOGICA DE PROCESAMIENTO GENERAL (Dashboard Charts) ---
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
          hourOnly: date.getHours(),
          categoria: category?.name || 'S/C',
          categoryId: item.categoryId,
          vendedor: seller,
          producto: item.name,
          icon: item.icon,
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

  // --- LOGICA DE PROCESAMIENTO DEL REPORTE AVANZADO ---
  const reportData = useMemo(() => {
    // 1. Flatten Data sin filtrar por el selector principal del dashboard (independiente)
    let data = sales.flatMap(sale => {
      const dateObj = new Date(sale.timestamp);
      return sale.items.map(item => {
        const category = categories.find(c => c.id === item.categoryId);
        const seller = item.sellerName || category?.sellerName || 'Admin';
        
        // Calcular Profit para el reporte avanzado
        const costPerUnit = item.costMethod === 'FIXED' 
          ? (item.fixedCost || 0)
          : item.ingredients.reduce((iAcc, ing) => iAcc + (ing.quantity * ing.unitCost), 0) / (item.yield || 1);
        const profit = (item.price * item.quantity) - (costPerUnit * item.quantity);

        return {
          rawId: sale.id,
          itemId: item.id,
          timestamp: sale.timestamp,
          dateStr: dateObj.toISOString().split('T')[0], // YYYY-MM-DD para sort
          displayDate: dateObj.toLocaleDateString(), // DD/MM/YYYY para display
          timeStr: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          productName: item.name,
          categoryName: category?.name || 'General',
          sellerName: seller,
          quantity: item.quantity,
          price: item.price,
          total: item.quantity * item.price,
          profit: profit, // Added profit
          status: 'Pagada' // Asumimos pagada ya que está en el historial
        };
      });
    });

    // 2. Aplicar Filtros del Reporte
    if (reportDateRange.start) {
      data = data.filter(d => d.dateStr >= reportDateRange.start);
    }
    if (reportDateRange.end) {
      data = data.filter(d => d.dateStr <= reportDateRange.end);
    }
    if (reportSeller !== 'ALL') {
      data = data.filter(d => d.sellerName === reportSeller);
    }
    if (reportProduct !== 'ALL') {
       data = data.filter(d => d.categoryName === reportProduct);
    }
    if (reportSearch) {
      const lowerQ = reportSearch.toLowerCase();
      data = data.filter(d => 
        d.productName.toLowerCase().includes(lowerQ) || 
        d.sellerName.toLowerCase().includes(lowerQ) ||
        d.rawId.toLowerCase().includes(lowerQ)
      );
    }

    // 3. Aplicar Ordenamiento
    if (sortConfig) {
      data.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      // Default sort by date desc
      data.sort((a, b) => b.timestamp - a.timestamp);
    }

    return data;
  }, [sales, categories, reportDateRange, reportSeller, reportProduct, reportSearch, sortConfig]);

  // Métricas del Reporte
  const reportTotals = useMemo(() => {
    return {
      salesCount: new Set(reportData.map(d => d.rawId)).size,
      itemsCount: reportData.reduce((acc, curr) => acc + curr.quantity, 0),
      revenue: reportData.reduce((acc, curr) => acc + curr.total, 0),
      avgTicket: 0 // Se calcula abajo
    };
  }, [reportData]);
  
  reportTotals.avgTicket = reportTotals.salesCount > 0 ? reportTotals.revenue / reportTotals.salesCount : 0;

  // Funciones auxiliares del reporte
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const exportReportCSV = () => {
    // Definir encabezados basados en columnas visibles
    const headers = [];
    if (visibleColumns.date) headers.push('FECHA');
    if (visibleColumns.time) headers.push('HORA');
    if (visibleColumns.seller) headers.push('VENDEDOR');
    if (visibleColumns.product) headers.push('PRODUCTO');
    if (visibleColumns.category) headers.push('CATEGORIA');
    if (visibleColumns.qty) headers.push('CANTIDAD');
    if (visibleColumns.price) headers.push('PRECIO UNITARIO');
    if (visibleColumns.total) headers.push('TOTAL VENTA');
    if (visibleColumns.status) headers.push('ESTADO');

    // Usar punto y coma (;) para Excel en regiones latinas/europeas
    let csvContent = headers.join(';') + "\n";

    reportData.forEach(row => {
      const line = [];
      // Asegurarse de que los datos no tengan punto y coma ni saltos de línea
      const clean = (val: any) => `"${String(val).replace(/;/g, ',').replace(/\n/g, ' ')}"`;

      if (visibleColumns.date) line.push(clean(row.displayDate));
      if (visibleColumns.time) line.push(clean(row.timeStr));
      if (visibleColumns.seller) line.push(clean(row.sellerName));
      if (visibleColumns.product) line.push(clean(row.productName));
      if (visibleColumns.category) line.push(clean(row.categoryName));
      if (visibleColumns.qty) line.push(row.quantity); // Números sin comillas si es posible, pero Excel lo maneja mejor así
      if (visibleColumns.price) line.push(row.price);
      if (visibleColumns.total) line.push(row.total);
      if (visibleColumns.status) line.push(clean(row.status));
      
      csvContent += line.join(';') + "\n";
    });

    // Agregar BOM (\uFEFF) para que Excel reconozca UTF-8 correctamente (tildes, ñ)
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `Reporte_GastroMaster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const printReport = () => {
    window.print();
  };


  // --- DATOS DASHBOARD ---
  const totalRevenue = periodFilteredData.reduce((acc, h) => acc + h.total, 0);
  const totalProfit = periodFilteredData.reduce((acc, h) => acc + h.ganancia, 0);
  const totalProductsSoldCount = periodFilteredData.reduce((acc, h) => acc + h.cantidad, 0);

  const topProducts = useMemo(() => {
    const map: Record<string, { name: string, qty: number, total: number, icon?: string, category: string }> = {};
    periodFilteredData.forEach(item => {
      if (!map[item.producto]) {
        map[item.producto] = { name: item.producto, qty: 0, total: 0, icon: item.icon, category: item.categoria };
      }
      map[item.producto].qty += item.cantidad;
      map[item.producto].total += item.total;
    });
    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 3);
  }, [periodFilteredData]);

  const categoryDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    periodFilteredData.forEach(item => {
      map[item.categoria] = (map[item.categoria] || 0) + item.total;
    });
    return Object.entries(map).map(([name, value], index) => ({
      name,
      value,
      color: ['#f97316', '#8b5cf6', '#10b981', '#3b82f6', '#f43f5e'][index % 5]
    })).sort((a,b) => b.value - a.value);
  }, [periodFilteredData]);

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

  const availableCategories = useMemo(() => {
    return categories.map(c => c.name).sort();
  }, [categories]);

  // --- CHART LOGIC DINÁMICO MEJORADO ---
  const dailyComparisonData = useMemo(() => {
    if (periodFilteredData.length === 0) return [];

    // Si el filtro es HOY, agrupamos por HORA (orden numérico)
    if (statsPeriod === 'TODAY') {
      const hoursMap: Record<number, number> = {};
      // Inicializar horas laborales (ej: 8am a 11pm)
      for (let i = 8; i <= 23; i++) hoursMap[i] = 0;

      periodFilteredData.forEach(item => {
        if (hoursMap[item.hourOnly] !== undefined) {
          hoursMap[item.hourOnly] += item.total;
        }
      });

      return Object.entries(hoursMap).map(([hour, total]) => ({
        name: `${hour}:00`,
        ventas: total
      }));
    } 
    
    // Si es SEMANA, MES o TODO, agrupamos por FECHA y ORDENAMOS CRONOLÓGICAMENTE
    const datesMap: Record<string, number> = {};
    
    // Agrupar
    periodFilteredData.forEach(item => {
      // Usar DD/MM como clave visual
      const dateKey = new Date(item.timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      datesMap[dateKey] = (datesMap[dateKey] || 0) + item.total;
    });

    // Metodo robusto que no depende de strings:
    // Creamos un array temporal que tenga la fecha legible Y el timestamp para ordenar
    const tempArray: { name: string, ventas: number, timestamp: number }[] = [];
    const mapIndex: Record<string, number> = {};

    periodFilteredData.forEach(item => {
       const dateObj = new Date(item.timestamp);
       // Formato legible para el eje X (depende de locale, pero no afecta ordenamiento ahora)
       const label = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
       
       if (mapIndex[label] === undefined) {
         // Crear nueva entrada
         const newIndex = tempArray.push({ 
           name: label, 
           ventas: item.total, 
           timestamp: new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).getTime() // Timestamp del inicio del día para ordenar
         }) - 1;
         mapIndex[label] = newIndex;
       } else {
         // Acumular
         tempArray[mapIndex[label]].ventas += item.total;
       }
    });

    return tempArray.sort((a, b) => a.timestamp - b.timestamp);

  }, [periodFilteredData, statsPeriod]);

  // --- LOGIC FOR SHARING WITH PHONE ---
  const cleanPhoneNumber = (phone?: string) => {
    if (!phone) return null;
    return phone.replace(/[^0-9]/g, '');
  };

  // Mensaje para Reporte (Modal) y Dashboard
  const generateReportMessage = (isModal = false) => {
    // Normalizar estructura de datos para poder iterar uniformemente
    // reportData usa { productName, total, profit, quantity }
    // periodFilteredData usa { producto, total, ganancia, cantidad }
    const dataToUse = isModal 
      ? reportData.map(d => ({ name: d.productName, total: d.total, profit: d.profit, qty: d.quantity, rawId: d.rawId }))
      : periodFilteredData.map(d => ({ name: d.producto, total: d.total, profit: d.ganancia, qty: d.cantidad, rawId: d.saleId }));

    // Calcular totales locales
    const totalRev = dataToUse.reduce((acc, curr) => acc + curr.total, 0);
    const count = new Set(dataToUse.map(d => d.rawId)).size;
    
    // Agrupar productos para detalle
    const productSummary: Record<string, { qty: number, revenue: number, profit: number }> = {};
    dataToUse.forEach(item => {
      if (!productSummary[item.name]) {
         productSummary[item.name] = { qty: 0, revenue: 0, profit: 0 };
      }
      productSummary[item.name].qty += item.qty;
      productSummary[item.name].revenue += item.total;
      productSummary[item.name].profit += item.profit;
    });

    // Ordenar productos por cantidad descendente
    const sortedProducts = Object.entries(productSummary).sort(([, a], [, b]) => b.qty - a.qty);

    let message = isModal 
      ? `📊 *REPORTE PERSONALIZADO - ${appName}*\n*Título:* ${reportTitle}\n` 
      : `📊 *RESUMEN DE VENTAS - ${appName}*\n`;
      
    if (isModal) {
      if (reportDateRange.start) message += `*Desde:* ${reportDateRange.start} `;
      if (reportDateRange.end) message += `*Hasta:* ${reportDateRange.end}\n`;
      if (reportNotes) message += `*Notas:* ${reportNotes}\n`;
    }

    message += `--------------------------\n`;
    message += `💰 *TOTAL VENDIDO:* $${formatMoney(totalRev)}\n`;
    message += `🧾 *Transacciones:* ${count}\n`;
    message += `--------------------------\n`;
    
    if (sortedProducts.length > 0) {
      message += `📦 *DETALLE DE PRODUCTOS:*\n`;
      sortedProducts.forEach(([name, stats]) => {
         message += `🔹 *${stats.qty}x ${name}*\n`;
         message += `   💵 Venta: $${formatMoney(stats.revenue)} | 📈 Ganancia: $${formatMoney(stats.profit)}\n`;
      });
      message += `--------------------------\n`;
    }

    message += `🚀 _Generado el ${new Date().toLocaleDateString()}_`;
    if (companyPhone) {
        message += `\n📞 ${companyPhone}`;
    }
    
    return message;
  };

  const shareReportWhatsApp = () => {
    const message = generateReportMessage(true);
    // Generic Share to allow selecting ANY contact
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareReportTelegram = () => {
    const message = generateReportMessage(true);
    window.open(`https://t.me/share/url?url=${encodeURIComponent('Reporte GastroMaster')}&text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareByWhatsApp = () => {
    const message = generateReportMessage(false);
    // Generic Share to allow selecting ANY contact
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareByTelegram = () => {
    const message = generateReportMessage(false);
    window.open(`https://t.me/share/url?url=${encodeURIComponent('Reporte Analítico')}&text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareBySMS = () => {
    const message = generateReportMessage(false);
    // Generic SMS share
    window.open(`sms:?body=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-8 pb-24">
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Panel de Control</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Visión general del negocio</p>
        </div>
        
        {/* CONTROL GROUP: SELLER SELECT + ACTION BUTTON */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          {/* Seller Selector */}
          <div className="relative w-full sm:w-auto">
            <select 
              value={selectedSeller} 
              onChange={(e) => onSelectedSellerChange(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-slate-50 border border-slate-200 rounded-[1.5rem] pl-6 pr-12 py-4 text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-slate-300 transition-all cursor-pointer text-slate-600 hover:border-slate-300"
            >
              <option value="ALL">Todos los Vendedores</option>
              {availableSellers.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* ACTION BUTTON (UNIFIED) */}
          <div id="dashboard-actions" className="relative w-full sm:w-auto z-20">
            <button 
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95"
            >
              <MoreHorizontal size={18} />
              <span>Acciones</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${showActionsMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu */}
            {showActionsMenu && (
              <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in slide-in-from-top-4 fade-in">
                <div className="p-2 space-y-1">
                    <button 
                      onClick={() => { setShowHistory(true); setShowActionsMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl text-left transition-colors"
                    >
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FileSpreadsheet size={16}/></div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Generar Reporte</span>
                        <span className="text-[9px] font-medium text-slate-400">Exportar y filtrar datos</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => { setShowDetailedReport(true); setShowActionsMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl text-left transition-colors"
                    >
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><ClipboardList size={16}/></div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Análisis Detallado</span>
                        <span className="text-[9px] font-medium text-slate-400">Insumos y rentabilidad</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => { onWSModalOpenChange(true); setShowActionsMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl text-left transition-colors"
                    >
                      <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Share2 size={16}/></div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Compartir</span>
                        <span className="text-[9px] font-medium text-slate-400">Enviar resumen actual</span>
                      </div>
                    </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI CARDS - REDESIGNED */}
      <div id="dashboard-kpi-container" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Ingresos Brutos" 
          value={`$${formatMoney(totalRevenue)}`} 
          trend="Ventas del Período" 
          icon={<Banknote size={24} />} 
          variant="revenue" 
        />
        <StatCard 
          title="Utilidad Neta" 
          value={`$${formatMoney(totalProfit)}`} 
          trend="Margen de Ganancia" 
          icon={<Percent size={24} />} 
          variant="profit" 
        />
        <StatCard 
          title="Ventas Totales" 
          value={totalProductsSoldCount.toLocaleString()} 
          trend="Unidades Vendidas" 
          icon={<Layers size={24} />} 
          variant="sales" 
        />
      </div>

      {/* TOP 3 PODIUM */}
      {topProducts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* SILVER - 2nd Place */}
          {topProducts[1] && (
            <div className="relative bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center order-2 md:order-1 mt-8 md:mt-0">
               <div className="absolute -top-4 bg-slate-300 text-slate-700 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-4 border-white shadow-lg z-10">2</div>
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner">{topProducts[1].icon}</div>
               <h4 className="font-black text-slate-900 uppercase text-sm leading-tight mb-1">{topProducts[1].name}</h4>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{topProducts[1].category}</p>
               <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <span className="font-mono font-black text-slate-600">{topProducts[1].qty} Unidades</span>
               </div>
            </div>
          )}
          
          {/* GOLD - 1st Place */}
          {topProducts[0] && (
            <div className="relative bg-gradient-to-br from-orange-50 to-orange-100/50 p-8 rounded-[3rem] border border-orange-200 shadow-xl flex flex-col items-center text-center order-1 md:order-2 transform md:-translate-y-4 z-10">
               <div className="absolute -top-6 bg-yellow-400 text-yellow-900 w-14 h-14 rounded-full flex items-center justify-center font-black text-xl border-4 border-white shadow-lg z-20">
                  <Crown size={24} />
               </div>
               <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center text-5xl mb-6 shadow-[0_10px_30px_rgba(249,115,22,0.2)] border-4 border-white">{topProducts[0].icon}</div>
               <h4 className="font-black text-slate-900 uppercase text-lg leading-tight mb-1">{topProducts[0].name}</h4>
               <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-4">{topProducts[0].category}</p>
               <div className="bg-white px-6 py-3 rounded-2xl border border-orange-100 shadow-sm">
                  <span className="font-mono font-black text-2xl text-slate-900">{topProducts[0].qty}</span>
                  <span className="text-[10px] font-black uppercase text-slate-400 block tracking-widest">Unidades Vendidas</span>
               </div>
            </div>
          )}

          {/* BRONZE - 3rd Place */}
          {topProducts[2] && (
            <div className="relative bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center order-3 mt-8 md:mt-0">
               <div className="absolute -top-4 bg-orange-200 text-orange-800 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-4 border-white shadow-lg z-10">3</div>
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner">{topProducts[2].icon}</div>
               <h4 className="font-black text-slate-900 uppercase text-sm leading-tight mb-1">{topProducts[2].name}</h4>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{topProducts[2].category}</p>
               <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <span className="font-mono font-black text-slate-600">{topProducts[2].qty} Unidades</span>
               </div>
            </div>
          )}
        </div>
      )}

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Chart: Cash Flow - OPTIMIZED */}
        <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col min-h-[450px]">
          <div className="flex justify-between items-start mb-10">
             <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
               <Activity size={14} className="text-orange-500" />
               Tendencia de Flujo de Caja
             </h3>
             <div className="bg-orange-50 px-3 py-1 rounded-lg text-[9px] font-black uppercase text-orange-600 tracking-widest border border-orange-100">
                {statsPeriod === 'TODAY' ? 'Vista por Horas' : 'Vista por Días'}
             </div>
          </div>
          
          {/* FIX: Contenedor con altura explícita en móvil y flex en desktop */}
          <div className="w-full h-[300px] lg:h-full lg:flex-1 min-h-[300px] relative">
            {isHydrated && dailyComparisonData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                    minTickGap={30} // Evita que se solapen
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                    tickFormatter={formatCompactNumber}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f97316', strokeWidth: 2, strokeDasharray: '4 4' }} />
                  <Area 
                    type="monotone" 
                    dataKey="ventas" 
                    stroke="#f97316" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorVentas)" 
                    animationDuration={1500}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#f97316', className: 'animate-ping' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-slate-300 flex-col gap-2 absolute inset-0">
                  <Activity size={40} />
                  <p className="text-xs font-bold uppercase">Sin datos para graficar</p>
               </div>
            )}
          </div>
        </div>

        {/* Secondary Chart: Category Distribution & Sellers */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {/* Category Pie Chart */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex-1 min-h-[300px] flex flex-col">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
               <PieChart size={14} className="text-purple-500" />
               Ventas por Categoría
            </h3>
            {/* FIX: Contenedor con altura explícita en móvil y flex en desktop */}
            <div className="w-full h-[250px] lg:h-full lg:flex-1 min-h-[250px] relative">
              {isHydrated && (
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={categoryDistribution}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={80}
                       paddingAngle={5}
                       dataKey="value"
                       stroke="none"
                     >
                       {categoryDistribution.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                     </Pie>
                     <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }} />
                     <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', paddingTop: '20px' }}
                     />
                   </PieChart>
                 </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top Sellers List */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex-1 flex flex-col">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Award size={14} className="text-indigo-500" />
              Ranking Vendedores
            </h3>
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[200px] scrollbar-none">
              {sellerPerformance.map((seller, idx) => (
                <div key={seller.name} className="p-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex items-center justify-between group hover:bg-white hover:border-indigo-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px] ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-white text-slate-400 shadow-sm'}`}>{idx + 1}</div>
                    <span className="text-[10px] font-black uppercase text-slate-900">{seller.name}</span>
                  </div>
                  <span className="font-mono text-xs font-black text-indigo-600">${formatMoney(seller.rev)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- GENERADOR DE REPORTES AVANZADO (MODAL) --- */}
      {showHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white rounded-[3rem] w-full max-w-[90vw] min-h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 my-auto">
             
             {/* 1. ENCABEZADO Y ACCIONES */}
             <div className="px-8 py-6 bg-slate-50 border-b border-slate-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 print:hidden">
                <div className="flex-1">
                   <div className="flex items-center gap-2 mb-2">
                      <span className="bg-orange-100 text-orange-600 p-2 rounded-lg"><FileSpreadsheet size={20}/></span>
                      <input 
                        value={reportTitle}
                        onChange={(e) => setReportTitle(e.target.value)}
                        className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic bg-transparent outline-none border-b-2 border-transparent focus:border-orange-200 w-full"
                        placeholder="TITULO DEL REPORTE"
                      />
                   </div>
                   <input 
                     value={reportNotes}
                     onChange={(e) => setReportNotes(e.target.value)}
                     className="text-xs font-bold text-slate-400 w-full bg-transparent outline-none placeholder-slate-300"
                     placeholder="Añadir notas internas u observaciones (opcional)..."
                   />
                </div>
                <div className="flex gap-2 shrink-0 items-center">
                   
                   {/* Share Buttons Toolbar */}
                   <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 mr-2">
                      <button onClick={shareReportWhatsApp} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" title="Compartir Reporte WhatsApp">
                         <MessageCircle size={18} />
                      </button>
                      <button onClick={shareReportTelegram} className="p-2 text-sky-500 hover:bg-sky-50 rounded-lg transition-colors" title="Compartir Reporte Telegram">
                         <Send size={18} />
                      </button>
                   </div>

                   <button onClick={printReport} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                      <Printer size={16} /> <span className="hidden sm:inline">Imprimir / PDF</span>
                   </button>
                   <button onClick={exportReportCSV} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl hover:shadow-emerald-200">
                      <Download size={16} /> <span className="hidden sm:inline">Exportar Excel</span>
                   </button>
                   <button onClick={() => setShowHistory(false)} className="p-3 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm">
                      <X size={20} />
                   </button>
                </div>
             </div>

             {/* 2. BARRA DE CONTROL UNIFICADA */}
             <div className="px-8 py-6 bg-white border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 print:hidden">
                <div className="lg:col-span-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Rango de Fechas</label>
                   <div className="flex gap-2">
                      <input type="date" value={reportDateRange.start} onChange={e => setReportDateRange(prev => ({...prev, start: e.target.value}))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none" />
                      <input type="date" value={reportDateRange.end} onChange={e => setReportDateRange(prev => ({...prev, end: e.target.value}))} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none" />
                   </div>
                </div>
                <div>
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Filtrar Vendedor</label>
                   <select value={reportSeller} onChange={e => setReportSeller(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none">
                      <option value="ALL">Todos los Vendedores</option>
                      {availableSellers.map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>
                <div>
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Filtrar Categoría</label>
                   <select value={reportProduct} onChange={e => setReportProduct(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none">
                      <option value="ALL">Todas las Categorías</option>
                      {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
                <div>
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Búsqueda Rápida</label>
                   <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                         value={reportSearch} 
                         onChange={e => setReportSearch(e.target.value)} 
                         placeholder="Producto, ID, etc..." 
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-700 outline-none placeholder:font-normal"
                      />
                   </div>
                </div>
                <div className="relative group">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Columnas (Persistente)</label>
                   <button className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 flex justify-between items-center outline-none">
                      <span>Configurar Vista</span>
                      <ChevronDown size={14} />
                   </button>
                   {/* Dropdown de Columnas - Mejorado UX */}
                   <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-4 z-50 hidden group-hover:block animate-in slide-in-from-top-2">
                      <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mb-2 border-b border-slate-50 pb-2">Seleccionar campos visibles</p>
                      {Object.keys(visibleColumns).map((key) => {
                         const labels: any = { date: 'Fecha', time: 'Hora', seller: 'Vendedor', product: 'Producto', category: 'Categoría', qty: 'Cantidad', price: 'Precio', total: 'Total', status: 'Estado' };
                         return (
                           <label key={key} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${visibleColumns[key as keyof typeof visibleColumns] ? 'bg-orange-500 border-orange-500' : 'border-slate-300 bg-white'}`}>
                                 {visibleColumns[key as keyof typeof visibleColumns] && <CheckCircle2 size={10} className="text-white"/>}
                              </div>
                              <input 
                                type="checkbox" 
                                className="hidden"
                                checked={visibleColumns[key as keyof typeof visibleColumns]} 
                                onChange={() => toggleColumn(key as keyof typeof visibleColumns)}
                              />
                              <span className="text-[10px] font-bold uppercase text-slate-600">{labels[key] || key}</span>
                           </label>
                         );
                      })}
                   </div>
                </div>
             </div>

             {/* 3. RESUMEN EJECUTIVO */}
             <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-200 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[150px] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Ingresos</p>
                   <p className="text-2xl font-black font-mono text-slate-900">${formatMoney(reportTotals.revenue)}</p>
                </div>
                <div className="flex-1 min-w-[150px] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Transacciones</p>
                   <p className="text-2xl font-black font-mono text-slate-900">{reportTotals.salesCount}</p>
                </div>
                <div className="flex-1 min-w-[150px] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ticket Promedio</p>
                   <p className="text-2xl font-black font-mono text-indigo-600">${formatMoney(reportTotals.avgTicket)}</p>
                </div>
                <div className="flex-1 min-w-[150px] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Productos</p>
                   <p className="text-2xl font-black font-mono text-orange-600">{reportTotals.itemsCount}</p>
                </div>
             </div>

             {/* 4. TABLA DE DATOS */}
             <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar bg-white relative">
                <table className="w-full min-w-[1000px] border-collapse">
                   <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                      <tr>
                         {visibleColumns.date && (
                           <th onClick={() => handleSort('timestamp')} className="text-left px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors group">
                              <div className="flex items-center gap-1">Fecha <ArrowUpDown size={10} className="opacity-0 group-hover:opacity-100"/></div>
                           </th>
                         )}
                         {visibleColumns.time && <th className="text-left px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Hora</th>}
                         {visibleColumns.product && (
                           <th onClick={() => handleSort('productName')} className="text-left px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors group">
                              <div className="flex items-center gap-1">Producto <ArrowUpDown size={10} className="opacity-0 group-hover:opacity-100"/></div>
                           </th>
                         )}
                         {visibleColumns.category && <th className="text-left px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Categoría</th>}
                         {visibleColumns.seller && (
                           <th onClick={() => handleSort('sellerName')} className="text-left px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors group">
                              <div className="flex items-center gap-1">Vendedor <ArrowUpDown size={10} className="opacity-0 group-hover:opacity-100"/></div>
                           </th>
                         )}
                         {visibleColumns.qty && (
                           <th onClick={() => handleSort('quantity')} className="text-right px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors group">
                              <div className="flex items-center justify-end gap-1">Cant. <ArrowUpDown size={10} className="opacity-0 group-hover:opacity-100"/></div>
                           </th>
                         )}
                         {visibleColumns.price && <th className="text-right px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Precio</th>}
                         {visibleColumns.total && (
                           <th onClick={() => handleSort('total')} className="text-right px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors group">
                              <div className="flex items-center justify-end gap-1">Total <ArrowUpDown size={10} className="opacity-0 group-hover:opacity-100"/></div>
                           </th>
                         )}
                         {visibleColumns.status && <th className="text-center px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Estado</th>}
                         <th className="px-6 py-4 w-10 print:hidden"></th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {reportData.map((row) => (
                         <tr key={`${row.rawId}-${row.itemId}`} className="hover:bg-blue-50/30 transition-colors">
                            {visibleColumns.date && <td className="px-6 py-4 text-xs font-bold text-slate-700">{row.displayDate}</td>}
                            {visibleColumns.time && <td className="px-6 py-4 text-[10px] font-bold text-slate-400 font-mono">{row.timeStr}</td>}
                            {visibleColumns.product && <td className="px-6 py-4 text-xs font-black text-slate-900 uppercase">{row.productName}</td>}
                            {visibleColumns.category && <td className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">{row.categoryName}</td>}
                            {visibleColumns.seller && <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-[9px] font-black uppercase text-slate-600">{row.sellerName}</span></td>}
                            {visibleColumns.qty && <td className="px-6 py-4 text-xs font-bold text-slate-700 text-right">{row.quantity}</td>}
                            {visibleColumns.price && <td className="px-6 py-4 text-xs font-mono text-slate-500 text-right">${formatMoney(row.price)}</td>}
                            {visibleColumns.total && <td className="px-6 py-4 text-xs font-black font-mono text-slate-900 text-right">${formatMoney(row.total)}</td>}
                            {visibleColumns.status && (
                              <td className="px-6 py-4 text-center">
                                 <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-wide">Pagada</span>
                              </td>
                            )}
                            <td className="px-6 py-4 text-center print:hidden">
                               <button onClick={() => onDeleteSale(row.rawId)} className="text-slate-300 hover:text-red-500 transition-colors" title="Anular transacción completa">
                                  <Trash2 size={14} />
                               </button>
                            </td>
                         </tr>
                      ))}
                      {reportData.length === 0 && (
                         <tr>
                            <td colSpan={10} className="py-20 text-center text-slate-400">
                               <div className="flex flex-col items-center gap-2">
                                  <Filter size={32} className="opacity-20"/>
                                  <span className="text-xs font-bold uppercase tracking-widest">No hay datos con los filtros actuales</span>
                               </div>
                            </td>
                         </tr>
                      )}
                   </tbody>
                   {/* FOOTER TOTALS */}
                   <tfoot className="bg-slate-50 border-t border-slate-200 sticky bottom-0 z-10 font-mono">
                      <tr>
                         <td colSpan={Object.values(visibleColumns).filter(v => v).length - (visibleColumns.total ? 1 : 0) - (visibleColumns.status ? 1 : 0)} className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Totales</td>
                         {visibleColumns.total && <td className="px-6 py-4 text-right text-sm font-black text-slate-900">${formatMoney(reportTotals.revenue)}</td>}
                         {visibleColumns.status && <td></td>}
                         <td className="print:hidden"></td>
                      </tr>
                   </tfoot>
                </table>
             </div>
             
             {/* Print Only Footer Info */}
             <div className="hidden print:block px-8 py-4 text-[9px] text-slate-400 font-mono border-t border-slate-200">
                <p>Generado el {new Date().toLocaleString()} por {appName}</p>
             </div>

          </div>
        </div>
      )}

      {/* MODAL REPORTE DETALLADO (ANALISIS) */}
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
                      {(Object.values(periodFilteredData.reduce((acc, item) => {
                        if (!acc[item.producto]) acc[item.producto] = { name: item.producto, qty: 0, rev: 0, profit: 0 };
                        acc[item.producto].qty += item.cantidad;
                        acc[item.producto].rev += item.total;
                        acc[item.producto].profit += item.ganancia;
                        return acc;
                      }, {} as Record<string, { name: string; qty: number; rev: number; profit: number }>)) as { name: string; qty: number; rev: number; profit: number }[])
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

const StatCard = ({ title, value, trend, icon, variant }: { title: string, value: string, trend: string, icon: React.ReactNode, variant: 'revenue' | 'profit' | 'sales' }) => {
  const styles = {
    revenue: {
      bg: 'bg-gradient-to-br from-emerald-500 to-teal-700',
      bgIcon: <CircleDollarSign size={140} strokeWidth={0.5} />,
    },
    profit: {
      bg: 'bg-gradient-to-br from-indigo-500 to-violet-700',
      bgIcon: <Wallet size={140} strokeWidth={0.5} />,
    },
    sales: {
      bg: 'bg-gradient-to-br from-orange-500 to-red-600',
      bgIcon: <Receipt size={140} strokeWidth={0.5} />,
    }
  };

  const currentStyle = styles[variant];

  return (
    <div className={`relative overflow-hidden rounded-[3rem] p-8 ${currentStyle.bg} shadow-xl group hover:-translate-y-1 transition-all duration-500`}>
        {/* Background Icon (Watermark) */}
        <div className="absolute -right-8 -bottom-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-700 pointer-events-none text-white">
            {currentStyle.bgIcon}
        </div>

        {/* Content Centered */}
        <div className="relative z-10 flex flex-col items-center text-center h-full justify-center gap-2">
            {/* Top Section: Icon & Title */}
            <div className="flex flex-col items-center gap-2 mb-2">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner text-white mb-1">
                    {icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">{title}</span>
            </div>

            {/* Center: The Big Value */}
            <h3 className="text-5xl lg:text-6xl font-black text-white font-mono tracking-tighter drop-shadow-sm mb-2">
                {value}
            </h3>

            {/* Bottom: Trend/Subtitle */}
            <div className="py-1 px-3 bg-white/10 rounded-full border border-white/10 backdrop-blur-sm">
                 <span className="text-[9px] font-bold uppercase tracking-widest text-white/90">{trend}</span>
            </div>
        </div>
    </div>
  );
};
