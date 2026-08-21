import { Battery, Signal, Wifi } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface AndroidFrameWrapperProps {
  children: React.ReactNode;
}

export const AndroidFrameWrapper: React.FC<AndroidFrameWrapperProps> = ({ children }) => {
  const { isAndroidFrame } = useAuth();
  const [time, setTime] = useState('12:00');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      setTime(`${hours % 12 || 12}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!isAndroidFrame) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-950 flex flex-col items-center justify-center p-0 md:p-6 transition-colors font-sans">
      {/* Device Frame */}
      <div className="w-full md:max-w-[440px] md:h-[900px] md:max-h-[94vh] bg-white dark:bg-slate-900 md:rounded-[44px] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border-0 md:border-[10px] md:border-slate-800 dark:md:border-slate-700/80 overflow-hidden flex flex-col relative">
        {/* Status Bar */}
        <div className="bg-white dark:bg-slate-900 px-6 pt-3 pb-1 flex items-center justify-between text-slate-800 dark:text-slate-200 text-xs font-semibold select-none border-b border-transparent z-50">
          <span className="font-bold tracking-tight">{time}</span>

          {/* Camera Notch */}
          <div className="w-4 h-4 rounded-full bg-black dark:bg-slate-950 border border-slate-700/40 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-900/60" />
          </div>

          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 fill-current" />
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col pb-20 custom-scrollbar relative">
          {children}
        </div>

        {/* Android Gesture Bar */}
        <div className="hidden md:flex justify-center pb-2 pt-1 bg-white dark:bg-slate-900 pointer-events-none select-none">
          <div className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>
      </div>
    </div>
  );
};
