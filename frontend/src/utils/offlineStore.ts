/**
 * A simple offline storage utility for Nutrilas.
 * Caches dashboard data and meal logs locally to ensure an "instant" load experience
 * and functionality during internet outages.
 */

const STORAGE_KEYS = {
  DASHBOARD_STATS: 'nc_dashboard_stats',
  MEAL_LOGS: 'nc_meal_logs',
  USER_PROFILE: 'user'
};

export const offlineStore = {
  // Save dashboard stats locally
  saveStats: (stats: any) => {
    localStorage.setItem(STORAGE_KEYS.DASHBOARD_STATS, JSON.stringify({
      data: stats,
      timestamp: Date.now()
    }));
  },

  // Get cached dashboard stats
  getStats: () => {
    const cached = localStorage.getItem(STORAGE_KEYS.DASHBOARD_STATS);
    if (!cached) return null;
    return JSON.parse(cached).data;
  },

  // Save user profile locally
  saveProfile: (profile: any) => {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  // Get cached user profile
  getProfile: () => {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (!cached || cached === 'undefined' || cached === 'null') return null;
      return JSON.parse(cached);
    } catch (e) {
      console.error('Failed to parse user profile:', e);
      return null;
    }
  },

  // Log a meal offline (to be synced later)
  logMealOffline: (meal: any) => {
    const existing = localStorage.getItem(STORAGE_KEYS.MEAL_LOGS);
    const logs = existing ? JSON.parse(existing) : [];
    logs.push({ ...meal, id: Date.now(), synced: false });
    localStorage.setItem(STORAGE_KEYS.MEAL_LOGS, JSON.stringify(logs));
  },

  // Get all meal logs (cached + offline)
  getMealLogs: () => {
    const logs = localStorage.getItem(STORAGE_KEYS.MEAL_LOGS);
    return logs ? JSON.parse(logs) : [];
  }
};

export default offlineStore;
