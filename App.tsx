import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { BottomNav } from './components/BottomNav';
import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { ScannerScreen } from './screens/ScannerScreen';
import { DataReviewScreen } from './screens/DataReviewScreen';
import { InventoryListScreen } from './screens/InventoryListScreen';
import { ItemDetailScreen } from './screens/ItemDetailScreen';
import { ExpirationOverviewScreen } from './screens/ExpirationOverviewScreen';
import { AppScreen, InventoryItem, NewItemDraft, LocationContext } from './types';
import { LOCATIONS } from './constants';
import { useInventory } from './hooks/useInventory';
import { isFirebaseConfigured } from './services/firebase';

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<AppScreen>(AppScreen.LOGIN);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [scannedQuantity, setScannedQuantity] = useState<number>(1);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  
  // Use Custom Hook for Data (Mock or Firebase)
  const { inventory, loading, addItem, deleteItem } = useInventory(isOffline);
  
  // State is now the full LocationContext object
  const [currentLocation, setCurrentLocation] = useState<LocationContext>(LOCATIONS[0]);

  const handleLogin = () => {
    setActiveScreen(AppScreen.DASHBOARD);
  };

  const handleNavigate = (screen: AppScreen) => {
    setActiveScreen(screen);
  };

  const handleScanSuccess = (code: string, quantity: number = 1) => {
    setScannedCode(code);
    setScannedQuantity(quantity);
    setActiveScreen(AppScreen.DATA_REVIEW);
  };

  const handleSaveItem = async (draft: NewItemDraft) => {
    await addItem(draft);
    setActiveScreen(AppScreen.INVENTORY_LIST);
  };

  const handleSelectItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setActiveScreen(AppScreen.ITEM_DETAIL);
  };

  const handleDeleteItem = async (id: string) => {
    await deleteItem(id);
  };

  // Determine which screen component to render
  const renderScreen = () => {
    if (loading && activeScreen !== AppScreen.LOGIN) {
        return <div className="flex h-full items-center justify-center text-gray-500">Loading Inventory...</div>;
    }

    switch (activeScreen) {
      case AppScreen.LOGIN:
        return <LoginScreen onLogin={handleLogin} />;
      case AppScreen.DASHBOARD:
        return <DashboardScreen inventory={inventory} onNavigate={handleNavigate} currentLocation={currentLocation} />;
      case AppScreen.SCANNER:
        return <ScannerScreen onNavigate={handleNavigate} onScanSuccess={handleScanSuccess} />;
      case AppScreen.DATA_REVIEW:
        return <DataReviewScreen 
          onSave={handleSaveItem} 
          onNavigate={handleNavigate} 
          scannedCode={scannedCode} 
          initialQuantity={scannedQuantity}
          defaultLocation={currentLocation.name} 
        />;
      case AppScreen.INVENTORY_LIST:
        return <InventoryListScreen inventory={inventory} onSelectItem={handleSelectItem} />;
      case AppScreen.ITEM_DETAIL:
        return selectedItem ? (
          <ItemDetailScreen item={selectedItem} onNavigate={handleNavigate} onDelete={handleDeleteItem} />
        ) : (
          <InventoryListScreen inventory={inventory} onSelectItem={handleSelectItem} />
        );
      case AppScreen.EXPIRATION_OVERVIEW:
        return <ExpirationOverviewScreen inventory={inventory} />;
      default:
        return <DashboardScreen inventory={inventory} onNavigate={handleNavigate} currentLocation={currentLocation} />;
    }
  };

  // Login screen doesn't have the main layout shell
  if (activeScreen === AppScreen.LOGIN) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Scanner screen takes over full screen
  if (activeScreen === AppScreen.SCANNER) {
    return <ScannerScreen onNavigate={handleNavigate} onScanSuccess={handleScanSuccess} />;
  }

  const getTitle = () => {
    switch(activeScreen) {
      case AppScreen.DASHBOARD: return 'MediScan Dashboard';
      case AppScreen.INVENTORY_LIST: return 'Inventory List';
      case AppScreen.DATA_REVIEW: return 'Review Scan';
      case AppScreen.ITEM_DETAIL: return 'Item Details';
      case AppScreen.EXPIRATION_OVERVIEW: return 'Expiration Alert';
      default: return 'MediScan';
    }
  };

  // Determine if BottomNav should be shown
  const showBottomNav = [AppScreen.DASHBOARD, AppScreen.INVENTORY_LIST, AppScreen.EXPIRATION_OVERVIEW].includes(activeScreen);

  return (
    <Layout 
        activeScreen={activeScreen} 
        onNavigate={handleNavigate} 
        title={getTitle()}
        isOffline={isOffline}
        onToggleOffline={() => setIsOffline(!isOffline)}
        showBack={activeScreen === AppScreen.ITEM_DETAIL || activeScreen === AppScreen.DATA_REVIEW}
        bottomNav={showBottomNav ? <BottomNav activeScreen={activeScreen} onNavigate={handleNavigate} /> : null}
        currentLocation={currentLocation}
        onLocationChange={setCurrentLocation}
    >
      {/* Configuration Warning Banner */}
      {!isFirebaseConfigured && !isOffline && (
        <div className="bg-blue-600 text-white text-[10px] py-1 px-4 text-center font-medium">
           Running in Demo Mode. Add keys to firebase.ts to connect.
        </div>
      )}
      
      {renderScreen()}
    </Layout>
  );
};

export default App;