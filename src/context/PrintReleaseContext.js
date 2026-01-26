import React, { createContext, useState, useContext, useCallback } from 'react';
import api from '../api/client';
import { toast } from 'react-toastify';

const PrintReleaseContext = createContext();

export const usePrintRelease = () => {
  const context = useContext(PrintReleaseContext);
  if (!context) {
    throw new Error('usePrintRelease must be used within a PrintReleaseProvider');
  }
  return context;
};

export const PrintReleaseProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const releaseJob = useCallback(async (jobId, printerId, userId, token) => {
    setLoading(true);
    toast.dismiss();
    try {
      const response = await api.post(`/api/jobs/${jobId}/release`, {
        token,
        printerId,
        releasedBy: userId
      });

      if (response.data.success) {
        toast.success(response.data.message);
        return true;
      }
    } catch (error) {
      console.error('Error releasing job:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to release print job';
      if (error.response?.status === 409) {
        toast.warning('This job has already been released.');
      } else {
        toast.error(errorMsg);
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    loading,
    releaseJob
  };

  return (
    <PrintReleaseContext.Provider value={value}>
      {children}
    </PrintReleaseContext.Provider>
  );
};
