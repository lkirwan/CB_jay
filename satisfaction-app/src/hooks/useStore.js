import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'cb_jay_data';

const defaultData = {
  offerings: [],
  ratings: [],
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultData;
  } catch {
    return defaultData;
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useStore() {
  const [data, setData] = useState(loadData);

  // Sync from localStorage when another tab updates
  useEffect(() => {
    function onStorage(e) {
      if (e.key === STORAGE_KEY) {
        setData(loadData());
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Also poll every 3 seconds for same-tab updates
  useEffect(() => {
    const id = setInterval(() => setData(loadData()), 3000);
    return () => clearInterval(id);
  }, []);

  const addOffering = useCallback((name) => {
    const fresh = loadData();
    const updated = {
      ...fresh,
      offerings: [
        ...fresh.offerings,
        { id: crypto.randomUUID(), name: name.trim(), status: 'active', createdAt: new Date().toISOString() },
      ],
    };
    saveData(updated);
    setData(updated);
    return updated.offerings[updated.offerings.length - 1];
  }, []);

  const setOfferingStatus = useCallback((id, status) => {
    const fresh = loadData();
    const updated = {
      ...fresh,
      offerings: fresh.offerings.map((o) =>
        o.id === id ? { ...o, status } : o
      ),
    };
    saveData(updated);
    setData(updated);
  }, []);

  const addRating = useCallback((offeringId, score, username) => {
    const fresh = loadData();
    const updated = {
      ...fresh,
      ratings: [
        ...fresh.ratings,
        {
          id: crypto.randomUUID(),
          offeringId,
          score,
          username: username ? username.trim() : null,
          createdAt: new Date().toISOString(),
        },
      ],
    };
    saveData(updated);
    setData(updated);
  }, []);

  const getOfferingStats = useCallback(
    (offeringId) => {
      const offeringRatings = data.ratings.filter((r) => r.offeringId === offeringId);
      if (offeringRatings.length === 0) return { avg: null, count: 0 };
      const avg = offeringRatings.reduce((sum, r) => sum + r.score, 0) / offeringRatings.length;
      return { avg: Math.round(avg * 10) / 10, count: offeringRatings.length };
    },
    [data.ratings]
  );

  return { data, addOffering, setOfferingStatus, addRating, getOfferingStats };
}
