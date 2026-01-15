import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Building2, ChevronDown, Check, Plus, X, Layers } from 'lucide-react';
import { LocationContext } from '../types';
import { LOCATIONS } from '../constants';

interface LocationPickerProps {
  value: string;
  onChange: (value: string, context?: LocationContext) => void;
  className?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if current value matches a known location
  const selectedContext = LOCATIONS.find(l => l.name === value);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc: LocationContext) => {
    onChange(loc.name, loc);
    setIsOpen(false);
    setIsCustomMode(false);
  };

  const toggleCustom = () => {
    setIsCustomMode(true);
    setIsOpen(false);
    // Use current value as start for custom editing if it's not in the list, otherwise clear?
    // Let's keep current value to allow editing.
  };

  if (isCustomMode) {
     return (
        <div className={`relative ${className}`}>
           <input 
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value, undefined)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              placeholder="Enter custom location name..."
              autoFocus
           />
           <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
           <button 
             onClick={() => setIsCustomMode(false)}
             className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
             title="Back to list"
           >
             <X size={16} />
           </button>
        </div>
     );
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-gray-300 hover:border-blue-400 rounded-lg px-3 py-2 shadow-sm transition-all focus:ring-2 focus:ring-blue-100 outline-none text-left min-h-[50px]"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
            <MapPin size={16} />
          </div>
          <div className="flex-1 min-w-0">
             {selectedContext ? (
                <>
                  <div className="font-medium text-gray-900 truncate text-sm">{selectedContext.name}</div>
                  <div className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                     <Building2 size={10} />
                     {selectedContext.hospital} • {selectedContext.department}
                  </div>
                </>
             ) : (
                <div className="font-medium text-gray-900 text-sm truncate">{value || "Select Location..."}</div>
             )}
          </div>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
           <div className="sticky top-0 bg-gray-50 px-3 py-2 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider z-10">
              Available Locations
           </div>
           
           {LOCATIONS.map((loc) => {
             const isSelected = loc.name === value;
             return (
               <button
                 key={loc.id}
                 onClick={() => handleSelect(loc)}
                 className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 ${isSelected ? 'bg-blue-50' : ''}`}
               >
                 <div className={`mt-0.5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>
                    <MapPin size={16} />
                 </div>
                 <div className="flex-1">
                    <div className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>{loc.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                       <Building2 size={10} />
                       {loc.department} • {loc.floor}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                       <Layers size={10} />
                       {loc.area}
                    </div>
                 </div>
                 {isSelected && <Check size={16} className="text-blue-600 mt-1" />}
               </button>
             );
           })}

           <button
             onClick={toggleCustom}
             className="w-full text-left px-4 py-3 flex items-center gap-3 text-blue-600 hover:bg-blue-50 font-medium text-sm border-t border-gray-100 bg-gray-50/50"
           >
              <Plus size={16} />
              <span>Enter Custom Location...</span>
           </button>
        </div>
      )}
    </div>
  );
};