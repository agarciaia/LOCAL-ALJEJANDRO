
import React, { useEffect, useState, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, GraduationCap } from 'lucide-react';

export interface TutorialStep {
  targetId?: string; // ID del elemento DOM a resaltar (opcional, si es null es un modal central)
  title: string;
  description: string;
  view?: string; // Vista a la que debe cambiar la app
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  currentStepIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  isOpen: boolean;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  steps,
  currentStepIndex,
  onNext,
  onPrev,
  onClose,
  isOpen
}) => {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const step = steps[currentStepIndex];
  const overlayRef = useRef<HTMLDivElement>(null);

  // Efecto para encontrar el elemento objetivo y calcular su posición
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (step.targetId) {
        const element = document.getElementById(step.targetId);
        if (element) {
          // Scroll suave hacia el elemento si es necesario
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const rect = element.getBoundingClientRect();
          setTargetRect(rect);
        } else {
          // Si no encuentra el elemento, usa posición central por defecto
          setTargetRect(null); 
        }
      } else {
        setTargetRect(null);
      }
    };

    // Pequeño delay para permitir que la vista se renderice antes de buscar el elemento
    const timer = setTimeout(updatePosition, 400); 
    window.addEventListener('resize', updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
    };
  }, [currentStepIndex, isOpen, step.targetId]);

  if (!isOpen) return null;

  // Estilos para el cuadro de tooltip
  const getTooltipStyle = () => {
    if (!targetRect) {
      // Posición Central (Modal)
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'fixed' as 'fixed',
        maxWidth: '500px',
        width: '90%'
      };
    }

    // Posición relativa al elemento
    const gap = 20;
    const tooltipWidth = 320; 
    let top = 0;
    let left = 0;
    const position = step.position || 'bottom';

    switch (position) {
      case 'bottom':
        top = targetRect.bottom + gap;
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        break;
      case 'top':
        top = targetRect.top - gap - 200; // Aproximación de altura
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        break;
      case 'right':
        top = targetRect.top;
        left = targetRect.right + gap;
        break;
      case 'left':
        top = targetRect.top;
        left = targetRect.left - tooltipWidth - gap;
        break;
      case 'center':
        return {
           top: '50%',
           left: '50%',
           transform: 'translate(-50%, -50%)',
           position: 'fixed' as 'fixed',
           maxWidth: '400px'
        };
    }

    // Ajustes básicos para que no se salga de pantalla (viewport)
    if (left < 10) left = 10;
    if (left + tooltipWidth > window.innerWidth) left = window.innerWidth - tooltipWidth - 10;
    if (top < 10) top = 10;
    if (top > window.innerHeight - 200) top = window.innerHeight - 250;

    return {
      top: `${top}px`,
      left: `${left}px`,
      position: 'fixed' as 'fixed',
      width: `${tooltipWidth}px`
    };
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* 1. Backdrop con "Agujero" (Spotlight) */}
      {/* Usamos un div semitransparente gigante y clips o box-shadows masivos para crear el efecto spotlight */}
      <div 
         className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] transition-all duration-500 ease-in-out"
         style={
           targetRect 
           ? { 
               clipPath: `polygon(
                 0% 0%, 
                 0% 100%, 
                 ${targetRect.left}px 100%, 
                 ${targetRect.left}px ${targetRect.top}px, 
                 ${targetRect.right}px ${targetRect.top}px, 
                 ${targetRect.right}px ${targetRect.bottom}px, 
                 ${targetRect.left}px ${targetRect.bottom}px, 
                 ${targetRect.left}px 100%, 
                 100% 100%, 
                 100% 0%
               )` 
             } 
           : {} 
         }
      />

      {/* 2. Highlight Border (Anillo brillante alrededor del objetivo) */}
      {targetRect && (
        <div 
          className="absolute border-4 border-orange-500 rounded-xl shadow-[0_0_30px_rgba(249,115,22,0.6)] animate-pulse transition-all duration-500 ease-in-out pointer-events-none"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      )}

      {/* 3. Tooltip Card */}
      <div 
        ref={overlayRef}
        style={getTooltipStyle()}
        className="bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col gap-4 animate-in zoom-in-95 duration-300 transition-all z-50"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl shrink-0">
             <GraduationCap size={24} />
          </div>
          <div>
             <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter italic">
               {step.title}
             </h3>
             <p className="text-xs font-medium text-slate-500 leading-relaxed mt-1">
               {step.description}
             </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
           <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
             Paso {currentStepIndex + 1} de {steps.length}
           </span>
           
           <div className="flex gap-2">
              {currentStepIndex > 0 && (
                <button 
                  onClick={onPrev}
                  className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl font-black text-[10px] uppercase hover:bg-slate-200 transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
              )}
              
              <button 
                onClick={onNext}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                {currentStepIndex === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
                {currentStepIndex < steps.length - 1 && <ChevronRight size={14} />}
              </button>
           </div>
        </div>

        <button 
          onClick={onClose}
          className="absolute -top-3 -right-3 p-2 bg-white text-slate-400 rounded-full shadow-md hover:text-red-500 transition-colors border border-slate-100"
          title="Saltar Tutorial"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
