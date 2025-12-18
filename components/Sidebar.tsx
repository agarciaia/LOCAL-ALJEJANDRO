
import React, { useState } from 'react';
import { View, AppConfig } from '../types';
import { MENU_ITEMS } from '../constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  config: AppConfig;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, config }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const bgStyles: Record<AppConfig['sidebarStyle'], string> = {
    light: 'bg-white border-slate-200',
    dark: 'bg-slate-900 border-slate-800 text-white',
    glass: 'bg-white/70 backdrop-blur-xl border-white/20',
  };

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} border-r flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out z-30 ${bgStyles[config.sidebarStyle]}`}>
      {/* Botón de Toggle Manual */}
      <button 
        onClick={toggleSidebar}
        className={`absolute -right-3 top-10 w-6 h-6 rounded-full border shadow-md flex items-center justify-center transition-all z-50 ${
          config.sidebarStyle === 'dark' 
            ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' 
            : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
        }`}
      >
        {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
      </button>

      <div className={`p-6 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <h1 className={`text-xl font-black flex items-center gap-2 tracking-tighter uppercase italic transition-all ${config.sidebarStyle === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          <span 
            style={{ backgroundColor: config.themeColor }}
            className={`p-2 rounded-xl flex items-center justify-center text-white shadow-lg transition-colors shrink-0`}
          >
            🍔
          </span>
          {!isCollapsed && <span className="truncate">{config.appName}</span>}
        </h1>
      </div>
      
      <nav className={`flex-1 px-4 space-y-2 mt-4 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        {MENU_ITEMS.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as View)}
              style={isActive ? { backgroundColor: config.themeColor } : {}}
              title={isCollapsed ? item.label : undefined}
              className={`relative flex items-center rounded-xl transition-all font-black text-xs uppercase tracking-widest group ${
                isCollapsed ? 'w-12 h-12 justify-center p-0' : 'w-full gap-3 px-4 py-3'
              } ${
                isActive 
                  ? `text-white shadow-xl` 
                  : `${config.sidebarStyle === 'dark' ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-50'}`
              }`}
            >
              <span className={`${isActive ? 'opacity-100' : 'opacity-60'} shrink-0`}>
                {React.cloneElement(item.icon as React.ReactElement, { size: isCollapsed ? 22 : 20 })}
              </span>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              
              {/* Tooltip flotante en estado colapsado */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/10">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      <div className={`p-4 border-t transition-all ${isCollapsed ? 'flex justify-center' : ''} ${config.sidebarStyle === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
        <div className={`${config.sidebarStyle === 'dark' ? 'bg-white/5' : 'bg-slate-900'} text-white rounded-3xl text-[10px] space-y-2 transition-all ${isCollapsed ? 'p-3' : 'p-5'}`}>
          {!isCollapsed && <p className="opacity-40 font-black uppercase tracking-widest leading-none">Estado Servidor</p>}
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
            {!isCollapsed && <p className="font-bold uppercase tracking-tighter truncate">Premium v2.5.1</p>}
          </div>
        </div>
      </div>
    </aside>
  );
};
