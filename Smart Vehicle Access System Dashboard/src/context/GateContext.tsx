import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { vehicleAPI } from '../utils/api';

interface GateContextType {
  gateStatus: 'open' | 'closed';
  setGateStatus: (status: 'open' | 'closed') => void;
  weather: {
    condition: string;
    visibility: string;
    temp: number;
  } | null;
  refreshWeather: () => Promise<void>;
}

const GateContext = createContext<GateContextType | undefined>(undefined);

export function GateProvider({ children }: { children: ReactNode }) {
  const [gateStatus, setGateStatusState] = useState<'open' | 'closed'>('closed');
  const [weather, setWeather] = useState<{ condition: string; visibility: string; temp: number } | null>(null);

  // Load initial gate status from backend (check latest override)
  const loadGateStatus = async () => {
    try {
      // Get all events and check for gate-related overrides
      // For now, we'll use localStorage to persist gate status
      const savedStatus = localStorage.getItem('gateStatus') as 'open' | 'closed' | null;
      if (savedStatus) {
        setGateStatusState(savedStatus);
      }
    } catch (error) {
      console.error('Error loading gate status:', error);
    }
  };

  const setGateStatus = (status: 'open' | 'closed') => {
    setGateStatusState(status);
    localStorage.setItem('gateStatus', status);
  };

  const refreshWeather = async () => {
    try {
      const weatherData = await vehicleAPI.getWeather();
      setWeather(weatherData);
    } catch (error) {
      console.error('Error loading weather:', error);
    }
  };

  useEffect(() => {
    loadGateStatus();
    refreshWeather();
    
    // Refresh weather every 15 seconds
    const weatherInterval = setInterval(refreshWeather, 15000);
    
    return () => clearInterval(weatherInterval);
  }, []);

  const contextValue = useMemo(() => ({
    gateStatus,
    setGateStatus,
    weather,
    refreshWeather
  }), [gateStatus, weather]);

  return (
    <GateContext.Provider value={contextValue}>
      {children}
    </GateContext.Provider>
  );
}

export function useGate() {
  const context = useContext(GateContext);
  if (context === undefined) {
    throw new Error('useGate must be used within a GateProvider');
  }
  return context;
}

