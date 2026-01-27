import React from 'react';
import styled from 'styled-components';
import { usePrintJob } from '../context/PrintJobContext';
import { 
  FaServer, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaWifi, 
  FaTimesCircle,
  FaCog,
  FaMapMarkerAlt
} from 'react-icons/fa';

const ManagementContainer = styled.div`
  padding: 20px;
`;

const PageHeader = styled.div`
  margin-bottom: 30px;
  
  h1 {
    font-size: 28px;
    font-weight: bold;
    color: #2c3e50;
    margin-bottom: 8px;
  }
  
  p {
    color: #7f8c8d;
    font-size: 16px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const AddButton = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #2980b9;
  }
`;

const PrintersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
`;

const PrinterCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.status === 'online' ? '#27ae60' : '#e74c3c'};
  
  .printer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    
    .printer-name {
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
    }
    
    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      background: ${props => props.status === 'online' ? '#d4edda' : '#f8d7da'};
      color: ${props => props.status === 'online' ? '#155724' : '#721c24'};
    }
  }
  
  .printer-info {
    margin-bottom: 16px;
    
    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 14px;
      color: #7f8c8d;
      
      .info-icon {
        width: 16px;
        color: #3498db;
      }
    }
  }
  
  .printer-capabilities {
    margin-bottom: 16px;
    
    .capabilities-title {
      font-size: 14px;
      font-weight: 500;
      color: #2c3e50;
      margin-bottom: 8px;
    }
    
    .capabilities-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      
      .capability {
        padding: 4px 8px;
        background: #f8f9fa;
        border-radius: 4px;
        font-size: 12px;
        color: #495057;
      }
    }
  }
  
  .printer-actions {
    display: flex;
    gap: 8px;
    
    .action-btn {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #e1e5e9;
      border-radius: 6px;
      background: white;
      color: #333;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      
      &:hover {
        background: #f8f9fa;
      }
      
      &.danger:hover {
        background: #f8d7da;
        color: #721c24;
        border-color: #f5c6cb;
      }
    }
  }
`;

const PrinterManagement = () => {
  const { printers, updatePrinter, deletePrinter } = usePrintJob();

  const handleToggleStatus = (printerId) => {
    const printer = printers.find(p => p.id === printerId);
    if (printer) {
      updatePrinter(printerId, { status: printer.status === 'online' ? 'offline' : 'online' });
    }
  };

  const handleDeletePrinter = (printerId) => {
    if (window.confirm('Are you sure you want to delete this printer?')) {
      deletePrinter(printerId);
    }
  };

  return (
    <ManagementContainer>
      <PageHeader>
        <h1>Printer Management</h1>
        <p>Manage and monitor all printers in the secure print network</p>
      </PageHeader>

      <HeaderActions>
        <div>
          <strong>{printers.length}</strong> printers configured
        </div>
        <AddButton>
          <FaPlus />
          Add Printer
        </AddButton>
      </HeaderActions>

      <PrintersGrid>
        {printers.map(printer => (
          <PrinterCard key={printer.id} status={printer.status}>
            <div className="printer-header">
              <div className="printer-name">{printer.name}</div>
              <div className="status-badge">{printer.status}</div>
            </div>
            
            <div className="printer-info">
              <div className="info-item">
                <FaServer className="info-icon" />
                <span>{printer.model}</span>
              </div>
              <div className="info-item">
                <FaMapMarkerAlt className="info-icon" />
                <span>{printer.location}</span>
              </div>
              <div className="info-item">
                {printer.status === 'online' ? <FaWifi className="info-icon" /> : <FaTimesCircle className="info-icon" />}
                <span>{printer.ip}</span>
              </div>
              <div className="info-item">
                <FaCog className="info-icon" />
                <span>{printer.department}</span>
              </div>
            </div>
            
            <div className="printer-capabilities">
              <div className="capabilities-title">Capabilities:</div>
              <div className="capabilities-list">
                {printer.capabilities.map(capability => (
                  <span key={capability} className="capability">{capability}</span>
                ))}
              </div>
            </div>
            
            <div className="printer-actions">
              <button className="action-btn" onClick={() => handleToggleStatus(printer.id)}>
                {printer.status === 'online' ? <FaTimesCircle /> : <FaWifi />}
                {printer.status === 'online' ? 'Take Offline' : 'Bring Online'}
              </button>
              <button className="action-btn">
                <FaEdit />
                Edit
              </button>
              <button 
                className="action-btn danger" 
                onClick={() => handleDeletePrinter(printer.id)}
              >
                <FaTrash />
                Delete
              </button>
            </div>
          </PrinterCard>
        ))}
      </PrintersGrid>
    </ManagementContainer>
  );
};

export default PrinterManagement;
