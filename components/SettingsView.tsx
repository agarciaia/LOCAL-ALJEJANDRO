
import React, { useState } from 'react';
import { AppConfig, Category } from '../types';
import { Palette, Layout, UserCircle2, Save, Edit2, Check, Sparkles, Monitor } from 'lucide-react';

interface SettingsViewProps {
  config: AppConfig;
  onConfigChange: (newConfig: AppConfig) => void;
  categories: Category[];
  onUpdateCategory: (updatedCategory: Category) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ config, onConfigChange, categories, onUpdateCategory }) => {
  const [renamingSeller, setRenamingSeller] = useState<{ old: string; new: string } | null>(null);

  const uniqueSellers: string[] = Array.from(new Set(categories.map(c => c.sellerName || 'Admin')));

  const updateConfig = (updates: Partial<AppConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const handleRenameSeller = (oldName: string) => {
    if (!renamingSeller || !renamingSeller.new.trim()) return;
    
    // Actualiza todas las categorías asociadas al vendedor
    categories.forEach(cat => {
      if (cat.sellerName === oldName) {
        onUpdateCategory({ ...cat, sellerName: renamingSeller.new });
      }
    });
    setRenamingSeller(null);
  };

  const backgrounds: { id: AppConfig['panelBg']; label: string; class: string }[] = [
    { id: 'bg-slate-50', label: 'Slate', class: 'bg-slate-50 border-slate-200' },
    { id: 'bg-gray-50', label: 'Neutral', class: 'bg-gray-50 border-gray-200' },
    { id: 'bg-zinc-50', label: 'Zinc', class: 'bg-zinc-50 border-zinc-200' },
    { id: 'bg-blue-50/30', label: 'Ice', class: 'bg-blue-50/30 border-blue-100' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 bg-slate-900 text-white rounded-lg"><Monitor size={14}/></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Panel de Control Central</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Personalización</h2>
          <p className="text-slate-500 font-medium text-sm mt-1">Configura la identidad visual y el equipo de tu negocio.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Identidad de Marca */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100/50 space-y-8 h-full">
            <div className="flex items-center gap-4">
              <div 
                style={{ backgroundColor: config.themeColor }}
                className="p-3 rounded-2xl text-white shadow-lg transition-colors"
              >
                <Palette size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 uppercase tracking-tight">Identidad</h3>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Colores y Nombre</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Nombre del Sistema</label>
                <input 
                  type="text" 
                  value={config.appName}
                  onChange={e => updateConfig({ appName: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] font-black text-slate-900 text-sm focus:ring-4 focus:ring-slate-100 transition-all outline-none"
                  placeholder="Ej: Mi Negocio"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4 px-1">Color de Tema Sugerido o Libre</label>
                <div className="flex flex-wrap gap-3 mb-6">
                  {['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e'].map(color => (
                    <button
                      key={color}
                      onClick={() => updateConfig({ themeColor: color })}
                      style={{ backgroundColor: color }}
                      className={`w-10 h-10 rounded-full transition-all border-4 ${config.themeColor === color ? 'border-slate-900 scale-125 shadow-xl' : 'border-white hover:scale-110'}`}
                    />
                  ))}
                </div>
                
                <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-tight">Color personalizado:</span>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={config.themeColor}
                      onChange={e => updateConfig({ themeColor: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                    />
                    <span className="font-mono text-xs font-bold text-slate-600 uppercase tracking-tighter">{config.themeColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Interfaz y Layout */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100/50 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600"><Layout size={20} /></div>
                <h3 className="font-black text-slate-900 uppercase tracking-tight">Layout y Fondo</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Estilo de Fondo de Paneles</label>
                  <div className="grid grid-cols-2 gap-3">
                    {backgrounds.map(bg => (
                      <button
                        key={bg.id}
                        onClick={() => updateConfig({ panelBg: bg.id })}
                        className={`flex flex-col items-start gap-2 p-4 rounded-2xl border-2 transition-all ${bg.class} ${config.panelBg === bg.id ? 'border-slate-900 ring-4 ring-slate-100 scale-[1.02]' : 'hover:border-slate-300'}`}
                      >
                        <span className="text-[10px] font-black uppercase text-slate-800">{bg.label}</span>
                        <div className={`w-full h-2 rounded-full opacity-50 ${bg.class}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Barra Lateral (Menú)</label>
                  <div className="flex bg-slate-100 p-1.5 rounded-[1.25rem]">
                    {(['light', 'dark', 'glass'] as AppConfig['sidebarStyle'][]).map(style => (
                      <button
                        key={style}
                        onClick={() => updateConfig({ sidebarStyle: style })}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${config.sidebarStyle === style ? 'bg-white text-slate-900 shadow-sm scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {style === 'light' ? 'Claro' : style === 'dark' ? 'Oscuro' : 'Cristal'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Gestión de Personal */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100/50 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600"><UserCircle2 size={20} /></div>
                <h3 className="font-black text-slate-900 uppercase tracking-tight">Personal Responsable</h3>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                {uniqueSellers.map(seller => (
                  <div key={seller} className="group p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-purple-200 hover:bg-white hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-4 flex-1">
                      <div 
                        style={{ backgroundColor: config.themeColor }}
                        className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xs text-white shadow-md"
                      >
                        {seller.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        {renamingSeller?.old === seller ? (
                          <div className="flex items-center gap-2">
                            <input 
                              autoFocus
                              className="bg-white border-2 border-purple-400 rounded-xl px-4 py-2 text-xs font-black uppercase outline-none w-full shadow-inner"
                              value={renamingSeller.new}
                              onChange={e => setRenamingSeller({...renamingSeller, new: e.target.value})}
                              onKeyDown={e => e.key === 'Enter' && handleRenameSeller(seller)}
                            />
                            <button 
                              onClick={() => handleRenameSeller(seller)}
                              className="p-2 bg-emerald-500 text-white rounded-xl shadow-md"
                            >
                              <Check size={16} strokeWidth={3} />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <span className="text-xs font-black uppercase text-slate-800">{seller}</span>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Click en editar para renombrar</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {!renamingSeller && (
                      <button 
                        onClick={() => setRenamingSeller({ old: seller, new: seller })}
                        className="p-2 text-slate-300 hover:text-purple-600 hover:bg-white rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[9px] text-amber-700 font-bold uppercase leading-relaxed tracking-tight">
                  Los cambios de nombres se reflejan automáticamente en el historial de ventas y reportes filtrados.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
