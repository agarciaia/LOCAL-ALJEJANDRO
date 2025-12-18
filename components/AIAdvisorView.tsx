
import React, { useState, useEffect } from 'react';
import { Product, Sale } from '../types';
import { getBusinessInsights } from '../services/geminiService';
import { BrainCircuit, Loader2, Sparkles, RefreshCcw } from 'lucide-react';

interface AIAdvisorViewProps {
  products: Product[];
  sales: Sale[];
}

export const AIAdvisorView: React.FC<AIAdvisorViewProps> = ({ products, sales }) => {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const data = await getBusinessInsights(products, sales);
      setInsights(data);
    } catch (err) {
      setInsights("Hubo un error analizando tus datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (insights === '') fetchInsights();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
              <Sparkles />
            </div>
            <h2 className="text-3xl font-black">AI Business Insights</h2>
          </div>
          <p className="text-indigo-100 text-lg leading-relaxed max-w-2xl">
            Nuestra inteligencia artificial analiza tus costos de harina, carne y rotación de productos 
            para darte las mejores estrategias de rentabilidad.
          </p>
          <button 
            onClick={fetchInsights}
            disabled={loading}
            className="mt-8 flex items-center gap-2 bg-white text-indigo-700 px-8 py-3 rounded-2xl font-bold hover:bg-indigo-50 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <RefreshCcw size={18} />}
            {loading ? 'Analizando datos...' : 'Actualizar Análisis'}
          </button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-indigo-100 rounded-full" />
              <div className="w-20 h-20 border-4 border-t-indigo-600 rounded-full absolute top-0 animate-spin" />
            </div>
            <p className="text-slate-500 font-medium animate-pulse">Procesando métricas de rendimiento...</p>
          </div>
        ) : (
          <div className="p-10 prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-black prose-p:text-slate-600 prose-strong:text-indigo-600">
             {insights.split('\n').map((line, i) => (
               <p key={i} className="mb-2">{line}</p>
             ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard 
          icon={<BrainCircuit className="text-indigo-500" />} 
          title="Optimización de Margen" 
          desc="Identificamos qué productos necesitan ajuste de precios."
        />
        <FeatureCard 
          icon={<TrendingUp className="text-purple-500" />} 
          title="Previsión de Ventas" 
          desc="Predice la demanda de insumos para evitar quiebres."
        />
        <FeatureCard 
          icon={<Activity className="text-pink-500" />} 
          title="Salud del Negocio" 
          desc="Métricas claras sobre el retorno de inversión por plato."
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">{icon}</div>
    <h4 className="font-bold text-slate-800 mb-2">{title}</h4>
    <p className="text-sm text-slate-500">{desc}</p>
  </div>
);

const TrendingUp = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
);

const Activity = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
);
