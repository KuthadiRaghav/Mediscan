export enum AppScreen {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  SCANNER = 'SCANNER',
  DATA_REVIEW = 'DATA_REVIEW',
  INVENTORY_LIST = 'INVENTORY_LIST',
  ITEM_DETAIL = 'ITEM_DETAIL',
  EXPIRATION_OVERVIEW = 'EXPIRATION_OVERVIEW',
}

export enum ExpirationStatus {
  EXPIRED = 'Expired',
  CRITICAL = 'Critical (<7d)',
  WARNING = 'Warning (7-30d)',
  GOOD = 'Good (>30d)',
}

export interface LocationContext {
  id: string;
  name: string;      // e.g. "OR Suite 1"
  hospital: string;  // e.g. "General Hospital"
  department: string; // e.g. "Surgery"
  floor: string;     // e.g. "Level 3"
  area: string;      // e.g. "North Wing"
}

export interface InventoryItem {
  id: string;
  name: string;
  gtin: string;
  lot: string;
  expirationDate: string; // ISO date string YYYY-MM-DD
  location: string;       // Room / Suite Name
  
  // Detailed Location Context
  hospital?: string;
  department?: string;
  floor?: string;
  area?: string;

  quantity: number;
  addedAt: string;
  isSynced: boolean;
}

// Minimal mock user
export interface User {
  email: string;
  facility: string;
}

export type NewItemDraft = Omit<InventoryItem, 'id' | 'addedAt' | 'isSynced'>;