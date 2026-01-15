import { ExpirationStatus, LocationContext } from './types';

export const MOCK_DELAY = 600;

export const LOCATIONS: LocationContext[] = [
  {
    id: 'loc-1',
    name: 'OR Suite 1',
    hospital: 'St. Jude Medical Center',
    department: 'Surgery',
    floor: 'Level 3',
    area: 'Sterile Zone A'
  },
  {
    id: 'loc-2',
    name: 'OR Suite 2',
    hospital: 'St. Jude Medical Center',
    department: 'Surgery',
    floor: 'Level 3',
    area: 'Sterile Zone A'
  },
  {
    id: 'loc-3',
    name: 'Cath Lab 1',
    hospital: 'St. Jude Medical Center',
    department: 'Cardiology',
    floor: 'Level 2',
    area: 'East Wing'
  },
  {
    id: 'loc-4',
    name: 'Central Supply',
    hospital: 'St. Jude Medical Center',
    department: 'Logistics',
    floor: 'Basement',
    area: 'Main Warehouse'
  },
  {
    id: 'loc-5',
    name: 'Emergency Room',
    hospital: 'St. Jude Medical Center',
    department: 'Emergency',
    floor: 'Level 1',
    area: 'Trauma Center'
  }
];

export const getExpirationStatus = (dateStr: string): ExpirationStatus => {
  const today = new Date();
  const exp = new Date(dateStr);
  const diffTime = exp.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return ExpirationStatus.EXPIRED;
  if (diffDays <= 7) return ExpirationStatus.CRITICAL;
  if (diffDays <= 30) return ExpirationStatus.WARNING;
  return ExpirationStatus.GOOD;
};

export const getStatusColor = (status: ExpirationStatus): string => {
  switch (status) {
    case ExpirationStatus.EXPIRED:
      return 'bg-red-100 text-red-700 border-red-200';
    case ExpirationStatus.CRITICAL:
      return 'bg-red-50 text-red-600 border-red-100';
    case ExpirationStatus.WARNING:
      return 'bg-orange-50 text-orange-600 border-orange-100';
    case ExpirationStatus.GOOD:
      return 'bg-green-50 text-green-700 border-green-100';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};