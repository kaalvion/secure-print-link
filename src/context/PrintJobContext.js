import React, { createContext, useContext, useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

const PrintJobContext = createContext();

export const usePrintJob = () => {
  const context = useContext(PrintJobContext);
  if (!context) {
    throw new Error('usePrintJob must be used within a PrintJobProvider');
  }
  return context;
};

export const PrintJobProvider = ({ children }) => {
  const [printJobs, setPrintJobs] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mock printers for demonstration
    const mockPrinters = [
      {
        id: 1,
        name: 'Main Office Printer',
        location: 'Main Office - Floor 1',
        model: 'HP LaserJet Pro M404n',
        status: 'online',
        ip: '192.168.1.100',
        capabilities: ['color', 'duplex', 'stapling'],
        department: 'All'
      },
      {
        id: 2,
        name: 'Sales Department Printer',
        location: 'Sales Office - Floor 2',
        model: 'Canon imageRUNNER ADVANCE C3530',
        status: 'online',
        ip: '192.168.1.101',
        capabilities: ['color', 'duplex', 'scanning'],
        department: 'Sales'
      },
      {
        id: 3,
        name: 'Marketing Printer',
        location: 'Marketing Office - Floor 3',
        model: 'Xerox WorkCentre 6515',
        status: 'offline',
        ip: '192.168.1.102',
        capabilities: ['color', 'duplex', 'scanning', 'fax'],
        department: 'Marketing'
      }
    ];

    // Load mock data
    setPrinters(mockPrinters);
    
    // Load stored print jobs
    const storedJobs = localStorage.getItem('securePrintJobs');
    if (storedJobs) {
      try {
        setPrintJobs(JSON.parse(storedJobs));
      } catch (error) {
        console.error('Error loading stored print jobs:', error);
      }
    }
  }, []);

  // Save print jobs to localStorage whenever they change
  useEffect(() => {
    try {
      const jobsJson = JSON.stringify(printJobs);
      // Check localStorage size limit (typically 5-10MB)
      const sizeInMB = new Blob([jobsJson]).size / (1024 * 1024);
      if (sizeInMB > 5) {
        console.warn(`Warning: Print jobs data is large (${sizeInMB.toFixed(2)}MB). Large documents may cause issues.`);
      }
      localStorage.setItem('securePrintJobs', jobsJson);
      console.log('Print jobs saved to localStorage:', printJobs.length, 'jobs');
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded. Document may be too large. Consider using server storage.');
        // Keep jobs without document data for smaller storage
        const jobsWithoutDocs = printJobs.map(job => ({
          ...job,
          document: null // Remove document data to save space
        }));
        try {
          localStorage.setItem('securePrintJobs', JSON.stringify(jobsWithoutDocs));
          console.warn('Saved jobs without document data due to storage limit');
        } catch (e) {
          console.error('Failed to save even without document data:', e);
        }
      } else {
        console.error('Error saving print jobs to localStorage:', error);
      }
    }
  }, [printJobs]);

  const submitPrintJob = async (jobData) => {
    setLoading(true);
    try {
      // Simulate backend behavior entirely on the client so the app works on Vercel alone
      const jobId = String(Date.now());
      const secureToken = CryptoJS.lib.WordArray.random(16).toString();
      const releaseLinkBase = typeof window !== 'undefined' && window.location && window.location.origin
        ? window.location.origin
        : '';
      const releaseLink = `${releaseLinkBase}/release/${jobId}?token=${secureToken}`;

      // If a file is present, convert to data URL so we can print it later in the browser
      let documentDataUrl = null;
      let documentMimeType = null;
      let documentFileName = null;
      if (jobData.file instanceof File) {
        documentFileName = jobData.file.name || 'document';
        // Detect MIME type from file extension if browser doesn't provide it correctly
        const fileName = documentFileName.toLowerCase();
        if (!jobData.file.type || jobData.file.type === 'application/octet-stream') {
          // Infer MIME type from file extension
          if (fileName.endsWith('.pdf')) {
            documentMimeType = 'application/pdf';
          } else if (fileName.endsWith('.doc')) {
            documentMimeType = 'application/msword';
          } else if (fileName.endsWith('.docx')) {
            documentMimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          } else if (fileName.endsWith('.xls')) {
            documentMimeType = 'application/vnd.ms-excel';
          } else if (fileName.endsWith('.xlsx')) {
            documentMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          } else if (fileName.endsWith('.ppt')) {
            documentMimeType = 'application/vnd.ms-powerpoint';
          } else if (fileName.endsWith('.pptx')) {
            documentMimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          } else if (fileName.endsWith('.txt')) {
            documentMimeType = 'text/plain';
          } else if (fileName.endsWith('.csv')) {
            documentMimeType = 'text/csv';
          } else if (/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/.test(fileName)) {
            documentMimeType = jobData.file.type || 'image/jpeg';
          } else {
            documentMimeType = jobData.file.type || 'application/octet-stream';
          }
        } else {
          documentMimeType = jobData.file.type;
        }
        
        documentDataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            console.log('File converted to data URL:', {
              name: documentFileName,
              mimeType: documentMimeType,
              size: jobData.file.size,
              dataUrlLength: reader.result?.length
            });
            resolve(reader.result);
          };
          reader.onerror = (error) => {
            console.error('Error reading file:', error);
            reject(error);
          };
          reader.readAsDataURL(jobData.file);
        });
      }

      const newJob = {
        id: jobId,
        userId: jobData.userId,
        userName: jobData.userName,
        documentName: jobData.documentName,
        pages: jobData.pages,
        copies: jobData.copies,
        color: jobData.color,
        duplex: jobData.duplex,
        stapling: jobData.stapling,
        priority: jobData.priority,
        notes: jobData.notes,
        status: 'pending',
        cost: parseFloat(calculateJobCost(jobData)),
        submittedAt: new Date().toISOString(),
        printerId: null,
        releasedBy: null,
        secureToken,
        releaseLink,
        encrypted: true,
        // Persist document so the release page can print it directly
        document: documentDataUrl
          ? { dataUrl: documentDataUrl, mimeType: documentMimeType, name: documentFileName }
          : null,
      };

      setPrintJobs(prev => [newJob, ...prev]);
      return { success: true, job: newJob };
    } catch (err) {
      console.error(err);
      throw new Error('Failed to submit print job');
    } finally {
      setLoading(false);
    }
  };

  const releasePrintJob = async (jobId, printerId, userId, token) => {
    setLoading(true);
    try {
      // Validate token locally against stored job
      const targetJob = printJobs.find(j => j.id === jobId);
      if (!targetJob || (targetJob.secureToken && targetJob.secureToken !== token)) {
        throw new Error('Invalid release token');
      }

      setPrintJobs(prev => prev.map(job =>
        job.id === jobId
          ? { ...job, status: 'printing', releasedAt: new Date().toISOString(), printerId, releasedBy: userId }
          : job
      ));
      setTimeout(() => {
        setPrintJobs(prev => prev.map(job => job.id === jobId ? { ...job, status: 'completed', completedAt: new Date().toISOString() } : job));
      }, 3000);
      return { success: true };
    } catch (err) {
      console.error(err);
      throw new Error(err.message || 'Failed to release print job');
    } finally {
      setLoading(false);
    }
  };

  const cancelPrintJob = async (jobId) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPrintJobs(prev => 
        prev.map(job => 
          job.id === jobId 
            ? { ...job, status: 'cancelled', cancelledAt: new Date().toISOString() }
            : job
        )
      );
      
      return { success: true };
    } catch (error) {
      throw new Error('Failed to cancel print job');
    } finally {
      setLoading(false);
    }
  };

  const deletePrintJob = async (jobId) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPrintJobs(prev => prev.filter(job => job.id !== jobId));
      
      return { success: true };
    } catch (error) {
      throw new Error('Failed to delete print job');
    } finally {
      setLoading(false);
    }
  };

  const getJobsByUser = (userId) => {
    return printJobs.filter(job => job.userId === userId);
  };

  const getJobsByStatus = (status) => {
    return printJobs.filter(job => job.status === status);
  };

  const getJobsByPrinter = (printerId) => {
    return printJobs.filter(job => job.printerId === printerId);
  };

  const calculateJobCost = (jobData) => {
    const baseCost = 0.10; // $0.10 per page
    const colorMultiplier = jobData.color ? 2 : 1;
    const duplexMultiplier = jobData.duplex ? 0.8 : 1;
    
    return (baseCost * jobData.pages * jobData.copies * colorMultiplier * duplexMultiplier).toFixed(2);
  };

  const getJobStatistics = () => {
    const total = printJobs.length;
    const pending = printJobs.filter(job => job.status === 'pending').length;
    const printing = printJobs.filter(job => job.status === 'printing').length;
    const completed = printJobs.filter(job => job.status === 'completed').length;
    const cancelled = printJobs.filter(job => job.status === 'cancelled').length;
    
    const totalCost = printJobs
      .filter(job => job.status === 'completed')
      .reduce((sum, job) => sum + parseFloat(job.cost), 0);
    
    return {
      total,
      pending,
      printing,
      completed,
      cancelled,
      totalCost: totalCost.toFixed(2)
    };
  };

  const addPrinter = (printerData) => {
    const newPrinter = {
      id: Date.now(),
      ...printerData,
      status: 'online'
    };
    setPrinters(prev => [...prev, newPrinter]);
    return newPrinter;
  };

  const updatePrinter = (printerId, updates) => {
    setPrinters(prev => 
      prev.map(printer => 
        printer.id === printerId ? { ...printer, ...updates } : printer
      )
    );
  };

  const deletePrinter = (printerId) => {
    setPrinters(prev => prev.filter(printer => printer.id !== printerId));
  };

  const value = {
    printJobs,
    printers,
    loading,
    submitPrintJob,
    releasePrintJob,
    cancelPrintJob,
    deletePrintJob,
    getJobsByUser,
    getJobsByStatus,
    getJobsByPrinter,
    getJobStatistics,
    addPrinter,
    updatePrinter,
    deletePrinter,
    calculateJobCost
  };

  return (
    <PrintJobContext.Provider value={value}>
      {children}
    </PrintJobContext.Provider>
  );
};
