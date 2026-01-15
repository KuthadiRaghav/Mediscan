import { useState, useEffect } from 'react';
import { InventoryItem, NewItemDraft } from '../types';
import { INITIAL_INVENTORY } from '../services/mockData';
import { db, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, isFirebaseConfigured, Timestamp } from '../services/firebase';

export const useInventory = (isOfflineMode: boolean) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load Data
  useEffect(() => {
    // 1. If Offline Mode is manually enabled, fall back to what we have or mock
    if (isOfflineMode) {
      if (inventory.length === 0) setInventory(INITIAL_INVENTORY);
      setLoading(false);
      return;
    }

    // 2. If Firebase is NOT configured, use Mock Data
    if (!isFirebaseConfigured) {
      console.warn("Firebase not configured. Using mock data.");
      setInventory(INITIAL_INVENTORY);
      setLoading(false);
      return;
    }

    // 3. Real Firebase Subscription
    setLoading(true);
    const q = query(collection(db, 'inventory'), orderBy('addedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: InventoryItem[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Handle Firebase Timestamp conversion if needed
          addedAt: data.addedAt?.toDate ? data.addedAt.toDate().toISOString() : data.addedAt,
        } as InventoryItem;
      });
      setInventory(items);
      setLoading(false);
    }, (err) => {
      console.error("Firebase Error:", err);
      setError("Failed to sync with database");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOfflineMode]);

  // Actions
  const addItem = async (draft: NewItemDraft) => {
    const newItem = {
      ...draft,
      addedAt: new Date().toISOString(), // In real app, use serverTimestamp()
      isSynced: true
    };

    if (isFirebaseConfigured && !isOfflineMode) {
      try {
        await addDoc(collection(db, 'inventory'), {
           ...newItem,
           addedAt: Timestamp.now()
        });
      } catch (err) {
        console.error("Error adding document:", err);
        // Fallback to local state if add fails
        setInventory(prev => [newItem as InventoryItem, ...prev]);
      }
    } else {
      // Local / Mock behavior
      const mockItem = { ...newItem, id: Date.now().toString(), isSynced: false };
      setInventory(prev => [mockItem as InventoryItem, ...prev]);
    }
  };

  const deleteItem = async (id: string) => {
    if (isFirebaseConfigured && !isOfflineMode) {
      try {
        await deleteDoc(doc(db, 'inventory', id));
      } catch (err) {
        console.error("Error deleting document:", err);
      }
    } else {
      setInventory(prev => prev.filter(item => item.id !== id));
    }
  };

  return { inventory, loading, error, addItem, deleteItem };
};