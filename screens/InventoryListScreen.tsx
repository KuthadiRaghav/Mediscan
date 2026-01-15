import React, { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { InventoryItem, AppScreen, ExpirationStatus } from '../types';
import { getExpirationStatus, getStatusColor, formatDate } from '../constants';

interface InventoryListScreenProps {
  inventory: InventoryItem[];
  onSelectItem: (item: InventoryItem) => void;
}

export const InventoryListScreen: React.FC<InventoryListScreenProps> = ({ inventory, onSelectItem }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'EXPIRED' | 'CRITICAL'>('ALL');

  const filteredItems = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                            item.gtin.includes(search) ||
                            item.location.toLowerCase().includes(search.toLowerCase());
      
      if (!matchesSearch) return false;

      const status = getExpirationStatus(item.expirationDate);
      
      if (filter === 'EXPIRED') return status === ExpirationStatus.EXPIRED;
      if (filter === 'CRITICAL') return status === ExpirationStatus.CRITICAL;
      
      return true;
    });
  }, [inventory, search, filter]);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      
      {/* Search & Filter Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 sticky top-0 z-20 space-y-3">
        <div className="relative">
            <input 
                type="text" 
                placeholder="Search name, GTIN, location..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button 
                onClick={() => setFilter('ALL')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${filter === 'ALL' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            >
                All Items
            </button>
            <button 
                onClick={() => setFilter('EXPIRED')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${filter === 'EXPIRED' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            >
                Expired
            </button>
            <button 
                onClick={() => setFilter('CRITICAL')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${filter === 'CRITICAL' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            >
                Expiring &lt;7d
            </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 pb-24">
        {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Search size={48} className="mb-4 opacity-20" />
                <p>No items found</p>
                <p className="text-xs">Try adjusting your filters</p>
            </div>
        ) : (
            <div className="space-y-2">
                {filteredItems.map(item => {
                    const status = getExpirationStatus(item.expirationDate);
                    return (
                        <div 
                            key={item.id}
                            onClick={() => onSelectItem(item)}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-[0.99] transition-transform cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-gray-900 line-clamp-2 pr-4">{item.name}</h3>
                                <div className={`flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(status)}`}>
                                    {status === ExpirationStatus.GOOD ? 'OK' : status.split(' ')[0]}
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-end">
                                <div className="text-xs text-gray-500 space-y-1">
                                    <p className="flex items-center gap-1">
                                        <span className="font-medium text-gray-400">LOC:</span> {item.location}
                                    </p>
                                    <p className="flex items-center gap-1">
                                        <span className="font-medium text-gray-400">EXP:</span> 
                                        <span className={status !== ExpirationStatus.GOOD ? 'text-red-600 font-medium' : ''}>
                                            {formatDate(item.expirationDate)}
                                        </span>
                                    </p>
                                </div>
                                <div className="text-sm font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded">
                                    Qty: {item.quantity}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
};