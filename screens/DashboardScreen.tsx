import React from 'react';
import { ScanLine, AlertCircle, Clock, CheckCircle2, Package, MapPin, Building2 } from 'lucide-react';
import { Button } from '../components/Button';
import { InventoryItem, AppScreen, ExpirationStatus, LocationContext } from '../types';
import { getExpirationStatus, getStatusColor, formatDate } from '../constants';

interface DashboardScreenProps {
  inventory: InventoryItem[];
  onNavigate: (screen: AppScreen) => void;
  currentLocation?: LocationContext;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ inventory, onNavigate, currentLocation }) => {
  
  // Calculate Stats
  const activeItems = inventory.length;
  const expiredCount = inventory.filter(i => getExpirationStatus(i.expirationDate) === ExpirationStatus.EXPIRED).length;
  const criticalCount = inventory.filter(i => getExpirationStatus(i.expirationDate) === ExpirationStatus.CRITICAL).length;
  const warningCount = inventory.filter(i => getExpirationStatus(i.expirationDate) === ExpirationStatus.WARNING).length;

  const recentItems = [...inventory].sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()).slice(0, 5);

  return (
    <div className="p-4 space-y-6 pb-24">
      
      {/* Location Banner */}
      {currentLocation && (
        <div className="flex flex-col gap-1 text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wide font-medium">
                <Building2 size={12} />
                <span>{currentLocation.hospital} • {currentLocation.department}</span>
            </div>
            <div className="flex items-center gap-2">
                <MapPin size={16} className="text-blue-500" />
                <span className="text-gray-900">
                    Counting in: <span className="font-bold">{currentLocation.name}</span> <span className="text-gray-400 font-normal">({currentLocation.floor})</span>
                </span>
            </div>
        </div>
      )}

      {/* Action Area */}
      <div className="bg-blue-600 rounded-2xl p-6 shadow-lg shadow-blue-200 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-1">Ready to scan?</h2>
          <p className="text-blue-100 text-sm mb-4">Capture UDI barcodes to add new inventory.</p>
          <Button 
            variant="white"
            onClick={() => onNavigate(AppScreen.SCANNER)}
            className="font-bold shadow-sm border-none"
            icon={<ScanLine size={20} />}
          >
            Start Scan
          </Button>
        </div>
        {/* Decorative circle */}
        <div className="absolute -right-6 -bottom-12 w-40 h-40 bg-blue-500 rounded-full opacity-50 blur-xl"></div>
      </div>

      {/* Stats Grid */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Inventory Health</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <span className="text-gray-500 text-xs font-medium mb-1">Total Active</span>
            <div className="flex items-center gap-2">
                <Package className="text-blue-500" size={20} />
                <span className="text-2xl font-bold text-gray-900">{activeItems}</span>
            </div>
          </div>
          <div 
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col cursor-pointer hover:bg-gray-50"
            onClick={() => onNavigate(AppScreen.EXPIRATION_OVERVIEW)}
          >
            <span className="text-red-500 text-xs font-bold mb-1">Expiring &lt;7d</span>
            <div className="flex items-center gap-2">
                <AlertCircle className="text-red-500" size={20} />
                <span className="text-2xl font-bold text-gray-900">{criticalCount + expiredCount}</span>
            </div>
          </div>
          <div 
             className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col cursor-pointer hover:bg-gray-50"
             onClick={() => onNavigate(AppScreen.EXPIRATION_OVERVIEW)}
          >
            <span className="text-orange-500 text-xs font-bold mb-1">Expiring 30d</span>
            <div className="flex items-center gap-2">
                <Clock className="text-orange-500" size={20} />
                <span className="text-2xl font-bold text-gray-900">{warningCount}</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <span className="text-green-600 text-xs font-bold mb-1">Good</span>
            <div className="flex items-center gap-2">
                <CheckCircle2 className="text-green-500" size={20} />
                <span className="text-2xl font-bold text-gray-900">
                    {activeItems - (expiredCount + criticalCount + warningCount)}
                </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recent Scans</h3>
            <button 
                onClick={() => onNavigate(AppScreen.INVENTORY_LIST)}
                className="text-xs text-blue-600 font-medium"
            >
                View All
            </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {recentItems.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
                No items scanned yet.
            </div>
          ) : (
            recentItems.map((item) => {
                const status = getExpirationStatus(item.expirationDate);
                return (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.location} • {formatDate(item.addedAt)}</p>
                        </div>
                        <div className={`ml-3 flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusColor(status)}`}>
                            {status === ExpirationStatus.GOOD ? 'Active' : status.split(' ')[0]}
                        </div>
                    </div>
                );
            })
          )}
        </div>
      </div>
    </div>
  );
};