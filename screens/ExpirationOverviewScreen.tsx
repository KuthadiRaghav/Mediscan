import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { InventoryItem, ExpirationStatus } from '../types';
import { getExpirationStatus, formatDate } from '../constants';
import { AlertCircle, Download } from 'lucide-react';
import { Button } from '../components/Button';

interface ExpirationOverviewScreenProps {
  inventory: InventoryItem[];
}

export const ExpirationOverviewScreen: React.FC<ExpirationOverviewScreenProps> = ({ inventory }) => {
  const expired = inventory.filter(i => getExpirationStatus(i.expirationDate) === ExpirationStatus.EXPIRED);
  const critical = inventory.filter(i => getExpirationStatus(i.expirationDate) === ExpirationStatus.CRITICAL);
  const warning = inventory.filter(i => getExpirationStatus(i.expirationDate) === ExpirationStatus.WARNING);
  const good = inventory.filter(i => getExpirationStatus(i.expirationDate) === ExpirationStatus.GOOD);

  const data = [
    { name: 'Expired', value: expired.length, color: '#EF4444' },
    { name: '<7 Days', value: critical.length, color: '#F97316' },
    { name: '7-30 Days', value: warning.length, color: '#FBBF24' },
    { name: '>30 Days', value: good.length, color: '#22C55E' },
  ];

  const renderSection = (title: string, items: InventoryItem[], colorClass: string, emptyMsg: string) => (
    <div className="mb-6">
        <h3 className={`text-sm font-bold uppercase tracking-wide mb-3 ${colorClass}`}>{title} ({items.length})</h3>
        {items.length === 0 ? (
            <div className="text-xs text-gray-400 italic bg-gray-50 p-3 rounded-lg">{emptyMsg}</div>
        ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {items.map((item, idx) => (
                    <div key={item.id} className={`p-3 flex justify-between items-center ${idx !== items.length -1 ? 'border-b border-gray-100' : ''}`}>
                         <div className="flex-1 min-w-0 pr-3">
                            <div className="text-sm font-medium text-gray-900 truncate">{item.name}</div>
                            <div className="text-xs text-gray-500">Lot: {item.lot}</div>
                         </div>
                         <div className="text-right">
                             <div className={`text-xs font-bold ${colorClass.replace('text-', 'text-')}`}>{formatDate(item.expirationDate)}</div>
                             <div className="text-[10px] text-gray-400">{item.location}</div>
                         </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );

  return (
    <div className="p-4 pb-24">
      {/* Chart Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col items-center">
        <h3 className="text-gray-900 font-semibold mb-2">Inventory Health</h3>
        <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-3 justify-center text-xs mt-2">
            {data.map(d => (
                <div key={d.name} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                    <span className="text-gray-600">{d.name}: {d.value}</span>
                </div>
            ))}
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">Action Required</h2>
        <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-600 text-xs"
            icon={<Download size={14} />}
        >
            Export Report
        </Button>
      </div>

      {renderSection('Expired - Remove Immediately', expired, 'text-red-600', 'No expired items.')}
      {renderSection('Critical (<7 Days)', critical, 'text-orange-600', 'No critical items.')}
      {renderSection('Warning (7-30 Days)', warning, 'text-yellow-600', 'No items in warning range.')}

    </div>
  );
};