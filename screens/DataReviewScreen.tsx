import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Calendar, Package, AlertTriangle, Layers, Wand2, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { LocationPicker } from '../components/LocationPicker';
import { AppScreen, NewItemDraft } from '../types';
import { LOCATIONS } from '../constants';
import { parseGS1 } from '../utils/gs1Parser';

interface DataReviewScreenProps {
  onSave: (item: NewItemDraft) => void;
  onNavigate: (screen: AppScreen) => void;
  scannedCode: string | null;
  initialQuantity?: number;
  defaultLocation?: string;
}

export const DataReviewScreen: React.FC<DataReviewScreenProps> = ({ 
  onSave, 
  onNavigate, 
  scannedCode, 
  initialQuantity = 1,
  defaultLocation = ''
}) => {
  // Helper to find initial context based on defaultLocation name
  const getContext = (name: string) => LOCATIONS.find(l => l.name === name);
  const initialContext = getContext(defaultLocation);

  // Initial state 
  const [formData, setFormData] = useState<NewItemDraft>({
    name: '',
    gtin: '',
    lot: '',
    expirationDate: '',
    location: defaultLocation,
    hospital: initialContext?.hospital,
    department: initialContext?.department,
    floor: initialContext?.floor,
    area: initialContext?.area,
    quantity: initialQuantity,
  });

  const [warnings, setWarnings] = useState<string[]>([]);
  const [isAiCounted, setIsAiCounted] = useState(false);
  const [isSimulatedData, setIsSimulatedData] = useState(false);
  const [missingData, setMissingData] = useState(false);

  useEffect(() => {
    if (scannedCode) {
      const isAutoCount = scannedCode.includes('AUTO-COUNT');
      setIsAiCounted(isAutoCount);
      const currentContext = getContext(defaultLocation);

      let parsedGtin = '';
      let parsedLot = '';
      let parsedExp = '';
      let parsedName = '';
      let simulated = false;

      if (isAutoCount) {
         // AI Counting mode simulates everything
         parsedName = 'Surgical Kit (AI Detected)';
         parsedGtin = '0000000000';
         parsedLot = 'BATCH-AI';
         parsedExp = new Date(Date.now() + 86400000 * 20).toISOString().split('T')[0];
         simulated = true;
      } else {
         // REAL PARSER: Only use what is actually in the barcode
         const result = parseGS1(scannedCode);
         parsedGtin = result.gtin || scannedCode; 
         parsedLot = result.lot || '';
         parsedExp = result.expirationDate || '';
         parsedName = ''; // Barcodes rarely have names
      }

      setIsSimulatedData(simulated);
      setMissingData(!simulated && (!parsedExp || !parsedLot));

      setFormData(prev => ({
        ...prev,
        name: parsedName, 
        gtin: parsedGtin,
        lot: parsedLot,
        expirationDate: parsedExp, 
        location: defaultLocation,
        hospital: currentContext?.hospital,
        department: currentContext?.department,
        floor: currentContext?.floor,
        area: currentContext?.area,
        quantity: initialQuantity,
      }));
    }
  }, [scannedCode, initialQuantity, defaultLocation]);

  // Validation effect
  useEffect(() => {
    const newWarnings = [];
    if (formData.expirationDate) {
      const days = Math.ceil((new Date(formData.expirationDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      if (days < 0) newWarnings.push('This item is already EXPIRED.');
      else if (days < 30) newWarnings.push(`Expiring soon (${days} days remaining).`);
    }
    setWarnings(newWarnings);
  }, [formData.expirationDate]);

  const handleChange = (field: keyof NewItemDraft, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSimulateData = () => {
    // Manually trigger simulation for testing purposes
    const lastDigit = parseInt(formData.gtin.slice(-1)) || 0;
    const mockProducts = [
        "Nitrile Exam Gloves, L", "Surgical Mask Level 3", "Insulin Syringe 1mL",
        "IV Catheter 20G", "Alcohol Prep Pads", "Adhesive Bandage Strips",
        "Gauze Sponges 4x4", "Saline Flush Syringe", "Medical Tape 1 inch",
        "Pulse Oximeter Probe"
    ];
    
    const d = new Date();
    d.setDate(d.getDate() + Math.floor(Math.random() * 410) - 10);
    
    setFormData(prev => ({
        ...prev,
        name: prev.name || mockProducts[lastDigit],
        lot: prev.lot || `L-${prev.gtin.slice(-4)}-TEST`,
        expirationDate: prev.expirationDate || d.toISOString().split('T')[0]
    }));
    
    setIsSimulatedData(true);
    setMissingData(false);
  };

  const handleSave = () => {
    if (!formData.name || !formData.expirationDate) {
        alert("Name and Expiration Date are required.");
        return;
    }
    onSave(formData);
  };

  return (
    <div className="p-4 pb-20 space-y-5">
      {/* Success / Status Banner */}
      <div className={`border rounded-lg p-3 flex items-start gap-3 ${isAiCounted ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-gray-200'}`}>
        <div className={`p-1 rounded-full mt-0.5 ${isAiCounted ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-gray-600 border border-gray-100'}`}>
            {isAiCounted ? <Layers size={16} /> : <Package size={16} />}
        </div>
        <div className="flex-1">
            <div className="flex justify-between items-start">
                <div>
                    <p className={`text-sm font-medium ${isAiCounted ? 'text-indigo-800' : 'text-gray-900'}`}>
                    {isAiCounted ? 'AI Count Completed' : 'Scan Successful'}
                    </p>
                    <p className="text-xs mt-1 text-gray-500">
                    {isSimulatedData 
                        ? 'Data simulated for testing.' 
                        : 'Data extracted from barcode.'}
                    </p>
                </div>
                {/* Manual Simulation Button - Only show if data is missing and not already simulated */}
                {!isSimulatedData && missingData && (
                    <button 
                        onClick={handleSimulateData}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-100"
                    >
                        <Wand2 size={12} />
                        Auto-Fill
                    </button>
                )}
            </div>
        </div>
      </div>

      {missingData && !isSimulatedData && (
          <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 flex gap-2 text-xs text-orange-700 items-center">
             <AlertCircle size={16} />
             <span>Standard barcode detected. Lot/Exp must be entered manually.</span>
          </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
        
        {/* Device Name */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Device Name</label>
            <div className="relative">
                <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter device name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium placeholder:text-gray-300"
                />
                {isSimulatedData && (
                    <div className="absolute right-2 top-2.5 text-blue-400" title="Auto-filled">
                        <Wand2 size={16} />
                    </div>
                )}
            </div>
        </div>

        {/* GTIN & Lot Row */}
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">GTIN / REF</label>
                <input 
                    type="text" 
                    value={formData.gtin}
                    onChange={(e) => handleChange('gtin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm font-mono truncate"
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Lot / Batch</label>
                <input 
                    type="text" 
                    value={formData.lot}
                    onChange={(e) => handleChange('lot', e.target.value)}
                    placeholder="e.g. L-12345"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono placeholder:text-gray-300"
                />
            </div>
        </div>

        {/* Expiration */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
            <div className="relative">
                <input 
                    type="date" 
                    value={formData.expirationDate}
                    onChange={(e) => handleChange('expirationDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg outline-none ${warnings.length > 0 ? 'border-orange-300 bg-orange-50' : 'border-gray-300'}`}
                />
                <Calendar className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={18} />
            </div>
            {warnings.map((w, i) => (
                <div key={i} className="flex items-center gap-1.5 mt-2 text-orange-600 text-xs font-medium">
                    <AlertTriangle size={12} />
                    <span>{w}</span>
                </div>
            ))}
        </div>

        {/* Location & Quantity - Grid Layout */}
        <div className="grid grid-cols-1 gap-4">
            {/* New Location Picker Component */}
            <LocationPicker 
                value={formData.location} 
                onChange={(val, ctx) => {
                    setFormData(prev => ({
                        ...prev,
                        location: val,
                        hospital: ctx?.hospital,
                        department: ctx?.department,
                        floor: ctx?.floor,
                        area: ctx?.area
                    }));
                }} 
            />
            {/* Display context if available */}
            {(formData.hospital || formData.department) && (
                <div className="text-xs text-gray-500 px-1 -mt-2">
                    Saving to: {formData.hospital} • {formData.department} • {formData.floor}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                    <button 
                        onClick={() => handleChange('quantity', Math.max(1, formData.quantity - 1))}
                        className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border-r border-gray-300 text-gray-600 font-medium active:bg-gray-200"
                    >-</button>
                    <div className={`flex-1 text-center py-2 text-base font-bold ${isAiCounted ? 'text-indigo-600' : 'text-gray-900'}`}>{formData.quantity}</div>
                    <button 
                        onClick={() => handleChange('quantity', formData.quantity + 1)}
                        className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border-l border-gray-300 text-gray-600 font-medium active:bg-gray-200"
                    >+</button>
                </div>
            </div>
        </div>

      </div>

      <div className="flex gap-3 pt-2">
        <Button 
            variant="secondary" 
            className="flex-1" 
            onClick={() => onNavigate(AppScreen.SCANNER)}
            icon={<RefreshCw size={18} />}
        >
            Re-scan
        </Button>
        <Button 
            variant="primary" 
            className="flex-[2]" 
            onClick={handleSave}
            icon={<Save size={18} />}
        >
            Save to Inventory
        </Button>
      </div>
    </div>
  );
};