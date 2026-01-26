import React, { createContext, useState, useContext, useCallback } from 'react';
import api from '../api/client';

const PrinterContext = createContext();

export const usePrinters = () => {
  const context = useContext(PrinterContext);
  if (!context) {
    throw new Error('usePrinters must be used within a PrinterProvider');
  }
  return context;
};

export const PrinterProvider = ({ children }) => {
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPrinters = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/printers');
      if (response.data.printers) {
        setPrinters(response.data.printers);
      }
    } catch (err) {
      console.error('Failed to fetch printers', err);
      // Fallback
      setPrinters([
        { id: 1, name: 'Main Office Printer', location: 'Level 1, Room 102', status: 'online', model: 'HP LaserJet Enterprise', capabilities: 'Color, Duplex', department: 'Administration' },
        { id: 2, name: 'Marketing Printer', location: 'Level 2, Room 205', status: 'online', model: 'Canon imageRUNNER', capabilities: 'Color, Duplex, Stapling', department: 'Marketing' },
        { id: 3, name: 'IT Support Printer', location: 'Basement, IT Dept', status: 'online', model: 'Brother HL-Series', capabilities: 'Duplex', department: 'IT' }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    printers,
    loading,
    fetchPrinters
  };

  return (
    <PrinterContext.Provider value={value}>
      {children}
    </PrinterContext.Provider>
  );
};
