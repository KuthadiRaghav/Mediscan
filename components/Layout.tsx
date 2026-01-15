import React, { useState } from 'react';
import { Wifi, WifiOff, Menu, ArrowLeft, X, MapPin, User, Settings, LogOut, Building2, Layers } from 'lucide-react';
import { AppScreen, LocationContext } from '../types';
import { LOCATIONS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  title?: string;
  isOffline: boolean;
  onToggleOffline: () => void;
  showBack?: boolean;
  bottomNav?: React.ReactNode;
  currentLocation: LocationContext;
  onLocationChange: (location: LocationContext) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeScreen,
  onNavigate,
  title,
  isOffline,
  onToggleOffline,
  showBack = false,
  bottomNav,
  currentLocation,
  onLocationChange
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLocationSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const location = LOCATIONS.find(loc => loc.id === selectedId);
    if (location) {
        onLocationChange(location);
        toggleMenu();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center overflow-hidden h-screen">
      {/* Mobile container */}
      <div className="w-full max-w-md bg-white shadow-xl relative flex flex-col h-full">
        
        {/* Header */}
        <header className="bg-white border-b border-gray-100 flex-none z-30 px-4 py-3 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            {showBack ? (
              <button 
                onClick={() => {
                   if (activeScreen === AppScreen.ITEM_DETAIL) onNavigate(AppScreen.INVENTORY_LIST);
                   else if (activeScreen === AppScreen.DATA_REVIEW) onNavigate(AppScreen.SCANNER);
                   else onNavigate(AppScreen.DASHBOARD);
                }} 
                className="p-1 -ml-1 text-gray-600 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            ) : (
               <div className="w-6" /> 
            )}
            <h1 className="font-semibold text-lg text-slate-800 truncate">
              {title || 'MediScan'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={onToggleOffline}
              className={`p-1.5 rounded-full transition-colors ${isOffline ? 'bg-orange-100 text-orange-600' : 'text-green-600 bg-green-50'}`}
              title="Toggle Offline Mode"
            >
              {isOffline ? <WifiOff size={18} /> : <Wifi size={18} />}
            </button>
            <button 
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full"
              onClick={toggleMenu}
            >
              <Menu size={20} />
            </button>
          </div>
        </header>

        {/* Offline Banner */}
        {isOffline && (
          <div className="bg-orange-600 text-white text-xs py-1 px-4 text-center font-medium flex-none">
            Offline Mode: Scans will save locally
          </div>
        )}

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar relative bg-slate-50">
          {children}
        </main>

        {/* Fixed Bottom Nav Container */}
        {bottomNav && (
          <div className="flex-none bg-white z-20 border-t border-gray-200">
            {bottomNav}
          </div>
        )}

        {/* Sidebar / Drawer */}
        {isMenuOpen && (
          <div className="absolute inset-0 z-50 flex">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={toggleMenu}
            ></div>
            
            {/* Drawer Content */}
            <div className="relative w-3/4 max-w-xs bg-white h-full shadow-2xl flex flex-col animate-slide-in-left">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Nurse Joy</p>
                    <p className="text-xs text-blue-100">Inventory Manager</p>
                  </div>
                </div>
                <button onClick={toggleMenu} className="text-white/80 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto">
                <div className="mb-6">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                    Current Location Context
                  </label>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-3">
                    
                    {/* Context Details */}
                    <div className="space-y-2 pb-2 border-b border-blue-200">
                        <div className="flex items-start gap-2 text-xs text-blue-800">
                            <Building2 size={14} className="mt-0.5 opacity-70" />
                            <span className="font-semibold">{currentLocation.hospital}</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-blue-800">
                            <Layers size={14} className="mt-0.5 opacity-70" />
                            <span>{currentLocation.department}, {currentLocation.floor}</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-blue-800">
                            <MapPin size={14} className="mt-0.5 opacity-70" />
                            <span>{currentLocation.area}</span>
                        </div>
                    </div>

                    {/* Selector */}
                    <div>
                        <label className="text-[10px] text-blue-600 font-bold uppercase mb-1 block">Active Room / Suite</label>
                        <select 
                            value={currentLocation.id}
                            onChange={handleLocationSelect}
                            className="w-full text-sm p-2 border border-blue-200 rounded bg-white text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        >
                            {LOCATIONS.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
                    <Settings size={18} />
                    Settings
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">MediScan v0.1.3</p>
              </div>
            </div>
          </div>
        )}

      </div>
      <style>{`
        @keyframes slide-in-left {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};