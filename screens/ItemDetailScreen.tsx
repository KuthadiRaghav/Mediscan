import React from 'react';
import { Trash2, Edit2, Calendar, MapPin, Hash, Box, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { InventoryItem, ExpirationStatus, AppScreen } from '../types';
import { getExpirationStatus, getStatusColor, formatDate } from '../constants';

interface ItemDetailScreenProps {
  item: InventoryItem;
  onNavigate: (screen: AppScreen) => void;
  onDelete: (id: string) => void;
}

export const ItemDetailScreen: React.FC<ItemDetailScreenProps> = ({ item, onNavigate, onDelete }) => {
  const status = getExpirationStatus(item.expirationDate);
  
  const handleDelete = () => {
    if (confirm('Are you sure you want to remove this item from inventory?')) {
        onDelete(item.id);
        onNavigate(AppScreen.INVENTORY_LIST);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-10">
      
      {/* Header Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
        <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl text-xs font-bold border-l border-b ${getStatusColor(status)}`}>
            {status}
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 pr-20 mb-2">{item.name}</h2>
        <div className="text-sm text-gray-500 mb-4">Added on {formatDate(item.addedAt)}</div>

        <div className="flex gap-4">
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-center flex-1">
                <span className="block text-xs uppercase opacity-70 mb-0.5">Quantity</span>
                <span className="text-2xl font-bold">{item.quantity}</span>
            </div>
            <div className={`px-4 py-2 rounded-lg text-center flex-1 border ${status === ExpirationStatus.GOOD ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-100'}`}>
                <span className="block text-xs uppercase opacity-70 mb-0.5">Days Left</span>
                <span className={`text-2xl font-bold ${status !== ExpirationStatus.GOOD ? 'text-red-600' : 'text-gray-800'}`}>
                    {Math.ceil((new Date(item.expirationDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))}
                </span>
            </div>
        </div>
      </div>

      {/* Details List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        <div className="p-4 flex items-center gap-3">
            <Hash className="text-gray-400" size={20} />
            <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase">GTIN</p>
                <p className="font-mono text-sm text-gray-800">{item.gtin}</p>
            </div>
        </div>
        <div className="p-4 flex items-center gap-3">
            <Box className="text-gray-400" size={20} />
            <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase">Lot / Batch</p>
                <p className="font-mono text-sm text-gray-800">{item.lot}</p>
            </div>
        </div>
        <div className="p-4 flex items-center gap-3">
            <Calendar className="text-gray-400" size={20} />
            <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase">Expiration Date</p>
                <p className="text-sm font-medium text-gray-800">{formatDate(item.expirationDate)}</p>
            </div>
        </div>
        <div className="p-4 flex items-center gap-3">
            <MapPin className="text-gray-400" size={20} />
            <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase">Location</p>
                <p className="text-sm font-medium text-gray-800">{item.location}</p>
            </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <Button 
            variant="danger" 
            className="flex-1" 
            onClick={handleDelete}
            icon={<Trash2 size={18} />}
        >
            Remove
        </Button>
        <Button 
            variant="secondary" 
            className="flex-1" 
            onClick={() => alert("Edit feature in development")}
            icon={<Edit2 size={18} />}
        >
            Edit Item
        </Button>
      </div>
    </div>
  );
};