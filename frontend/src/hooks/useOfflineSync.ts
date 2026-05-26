import { useEffect, useState } from 'react';
import axios from 'axios';
import offlineStore from '../utils/offlineStore';

export const useOfflineSync = (onSyncComplete?: () => void) => {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncOfflineData = async () => {
    // If browser is currently offline, don't attempt to sync
    if (!navigator.onLine) return;

    const logs = offlineStore.getMealLogs();
    const unsynced = logs.filter((log: any) => !log.synced);

    if (unsynced.length === 0) return;

    setSyncing(true);
    setError(null);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const token = localStorage.getItem('token');

      for (const log of unsynced) {
        // Upload each local meal log to the backend
        await axios.post(
          `${API_URL}/ai/save-meal-log`,
          { 
            analysis: {
              dish: log.dish,
              macros: log.macros,
              insights: log.insights,
              estimatedPortion: log.estimatedPortion
            }
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        log.synced = true;
      }

      // Save updated logs state back to localStorage
      localStorage.setItem('nc_meal_logs', JSON.stringify(logs));
      
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (err: any) {
      console.error('Offline sync failed:', err);
      setError('Sync failed. Will retry automatically when connection stabilizes.');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    // Attempt sync immediately on load if online
    if (navigator.onLine) {
      syncOfflineData();
    }

    const handleOnline = () => {
      console.log('🌐 Connection restored. Starting offline sync...');
      syncOfflineData();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return { syncing, error, syncOfflineData };
};

export default useOfflineSync;
