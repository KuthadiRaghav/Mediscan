import { InventoryItem } from '../types';

const today = new Date();
const addDays = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: '1',
    name: 'Drug-Eluting Stent 3.5mm',
    gtin: '00885544112233',
    lot: 'L8842X',
    expirationDate: addDays(-5), // Expired
    location: 'Cath Lab Shelf A',
    quantity: 2,
    addedAt: addDays(-60),
    isSynced: true,
  },
  {
    id: '2',
    name: 'Surgical Mesh 10x10',
    gtin: '00998877665544',
    lot: 'M10293',
    expirationDate: addDays(3), // Critical
    location: 'OR Supply Room',
    quantity: 5,
    addedAt: addDays(-20),
    isSynced: true,
  },
  {
    id: '3',
    name: 'Pacemaker Lead',
    gtin: '00112233445566',
    lot: 'P9921Z',
    expirationDate: addDays(15), // Warning
    location: 'Cath Lab Shelf B',
    quantity: 1,
    addedAt: addDays(-10),
    isSynced: true,
  },
  {
    id: '4',
    name: 'Hemostat Forceps',
    gtin: '00334455667788',
    lot: 'H11223',
    expirationDate: addDays(120), // Good
    location: 'Central Supply',
    quantity: 20,
    addedAt: addDays(-5),
    isSynced: true,
  },
  {
    id: '5',
    name: 'Bone Cement Kit',
    gtin: '00556677889900',
    lot: 'B44556',
    expirationDate: addDays(25), // Warning
    location: 'Ortho Cart',
    quantity: 3,
    addedAt: addDays(-2),
    isSynced: false, // Simulate offline add
  },
];