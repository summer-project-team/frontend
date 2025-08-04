import React from 'react';
import { Home, QrCode, Gift, CreditCard } from 'lucide-react';
import { Screen } from '../App';

interface ModernFooterProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export function ModernFooter({ currentScreen, onNavigate }: ModernFooterProps) {
  const footerItems = [
    {
      id: 'home' as Screen,
      label: 'Home',
      icon: Home,
      activeScreens: ['home']
    },
    {
      id: 'scan' as Screen,
      label: 'Scan',
      icon: QrCode,
      activeScreens: ['scan']
    },
    {
      id: 'rewards' as Screen,
      label: 'Rewards',
      icon: Gift,
      activeScreens: ['rewards']
    },
    {
      id: 'linked-accounts' as Screen,
      label: 'Accounts',
      icon: CreditCard,
      activeScreens: ['linked-accounts', 'bank-accounts']
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-white/30 dark:border-white/20 px-4 py-2 safe-area-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {footerItems.map((item) => {
          const isActive = item.activeScreens.includes(currentScreen);
          const IconComponent = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 ease-out group ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <IconComponent 
                size={20} 
                strokeWidth={isActive ? 2.5 : 1.5}
                className={`transition-all duration-500 ease-out transform ${
                  isActive 
                    ? 'scale-110 drop-shadow-sm' 
                    : 'group-hover:scale-110 group-hover:-translate-y-0.5 group-active:scale-95 group-active:translate-y-0'
                }`} 
              />
              <span className={`text-xs transition-all duration-500 ease-out transform ${
                isActive 
                  ? 'font-semibold scale-105 text-indigo-600 dark:text-indigo-400' 
                  : 'font-medium group-hover:scale-105 group-hover:-translate-y-0.5 group-active:scale-95 group-active:translate-y-0'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
