import React from 'react';
import { LayoutDashboard, List, BarChart3, ScanLine } from 'lucide-react';
import { AppScreen } from '../types';

interface BottomNavProps {
  activeScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onNavigate }) => {
  const navItems = [
    { label: 'Home', screen: AppScreen.DASHBOARD, icon: LayoutDashboard },
    { label: 'Inventory', screen: AppScreen.INVENTORY_LIST, icon: List },
    { label: 'Expirations', screen: AppScreen.EXPIRATION_OVERVIEW, icon: BarChart3 },
  ];

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-2 flex justify-between items-center pb-safe">
      {navItems.map((item) => {
        const isActive = activeScreen === item.screen;
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            onClick={() => onNavigate(item.screen)}
            className={`flex flex-col items-center gap-1 min-w-[64px] ${isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};