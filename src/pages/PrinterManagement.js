import React, { useState } from 'react';
import styled from 'styled-components';
import { usePrintJob } from '../context/PrintJobContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaWifi,
  FaTimesCircle,
  FaCog,
  FaMapMarkerAlt,
  FaSearch
} from 'react-icons/fa';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding-bottom: 40px;
`;

const Header = styled(motion.div)`
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  
  div {
    h1 {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p { color: var(--text-secondary); font-size: 1.1rem; }
  }
`;

const AddButton = styled(motion.button)`
  background: var(--primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  
  &:hover { transform: translateY(-2px); }
`;

const SearchBar = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary);
  margin-bottom: 32px;
  max-width: 500px;
  
  input {
    background: transparent;
    border: none;
    color: white;
    font-size: 1rem;
    width: 100%;
    &:focus { outline: none; }
    &::placeholder { color: rgba(255, 255, 255, 0.2); }
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
`;

const PrinterCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.2s;
  
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; bottom: 0; width: 4px;
    background: ${props => props.status === 'online' ? 'var(--success)' : 'var(--error)'};
  }
  
  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.05);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-left: 12px;
  
  h3 { font-size: 1.25rem; color: white; margin-bottom: 4px; }
  span { font-size: 0.85rem; color: var(--text-secondary); }
`;

const StatusBadge = styled.div`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 6px;
  
  background: ${props => props.status === 'online' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  color: ${props => props.status === 'online' ? '#10b981' : '#ef4444'};
  
  .dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 8px currentColor;
  }
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  color: var(--text-secondary);
  font-size: 0.95rem;
  padding-left: 12px;
  
  svg { color: var(--primary); opacity: 0.7; }
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 20px 0;
  padding-left: 12px;
  
  span {
    padding: 4px 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    font-size: 0.8rem;
    color: var(--text-secondary);
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 24px;
  padding-left: 12px;
  
  button {
    flex: 1;
    padding: 10px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.02);
    color: white;
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.2s;
    
    &:hover { background: rgba(255, 255, 255, 0.1); }
    
    &.danger { color: #ef4444; border-color: rgba(239, 68, 68, 0.2); }
    &.danger:hover { background: rgba(239, 68, 68, 0.1); }
  }
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 32px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  
  h2 {
    color: white;
    margin-bottom: 24px;
    font-size: 1.75rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  label {
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 600;
  }
  
  input, select {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 12px 16px;
    color: white;
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: var(--primary);
    }
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
  
  button {
    flex: 1;
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    
    &.primary {
      background: var(--primary);
      color: white;
      &:hover { transform: translateY(-2px); }
    }
    
    &.secondary {
      background: rgba(255, 255, 255, 0.05);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.1);
      &:hover { background: rgba(255, 255, 255, 0.1); }
    }
  }
`;

const PrinterManagement = () => {
  const { printers, updatePrinter, deletePrinter, addPrinter } = usePrintJob();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    location: '',
    department: '',
    capabilities: ''
  });

  const handleToggle = (id) => {
    const p = printers.find(x => x.id === id);
    if (p) updatePrinter(id, { status: p.status === 'online' ? 'offline' : 'online' });
  };

  const handleAdd = () => {
    setEditingPrinter(null);
    setFormData({
      name: '',
      model: '',
      location: '',
      department: '',
      capabilities: ''
    });
    setShowModal(true);
  };

  const handleEdit = (printer) => {
    setEditingPrinter(printer);
    setFormData({
      name: printer.name,
      model: printer.model,
      location: printer.location,
      department: printer.department,
      capabilities: Array.isArray(printer.capabilities)
        ? printer.capabilities.join(', ')
        : printer.capabilities
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const printerData = {
      ...formData,
      capabilities: formData.capabilities.split(',').map(s => s.trim())
    };

    if (editingPrinter) {
      await updatePrinter(editingPrinter.id, printerData);
    } else {
      await addPrinter(printerData);
    }

    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this printer?')) {
      await deletePrinter(id);
    }
  };

  const filtered = printers.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container>
      <Header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1>Printer Management</h1>
          <p>Configure network printers and monitor status</p>
        </div>
        <AddButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAdd}>
          <FaPlus /> Add Printer
        </AddButton>
      </Header>

      <SearchBar>
        <FaSearch />
        <input
          placeholder="Search printers by name, location, or IP..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </SearchBar>

      <Grid>
        {Array.isArray(filtered) && filtered.map((p, i) => {
          const caps = Array.isArray(p.capabilities)
            ? p.capabilities
            : (typeof p.capabilities === 'string' ? p.capabilities.split(',').map(s => s.trim()) : []);

          return (
            <PrinterCard
              key={p.id}
              status={p.status}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <CardHeader>
                <div>
                  <h3>{p.name}</h3>
                  <span>{p.model}</span>
                </div>
                <StatusBadge status={p.status}>
                  <div className="dot" /> {p.status}
                </StatusBadge>
              </CardHeader>

              <InfoRow>
                <FaMapMarkerAlt /> {p.location}
              </InfoRow>
              <InfoRow>
                <FaWifi /> {p.ip}
              </InfoRow>
              <InfoRow>
                <FaCog /> {p.department}
              </InfoRow>

              <TagContainer>
                {caps.map(c => <span key={c}>{c}</span>)}
              </TagContainer>

              <Actions>
                <button onClick={() => handleToggle(p.id)}>
                  {p.status === 'online' ? <FaTimesCircle /> : <FaWifi />}
                  {p.status === 'online' ? 'Offline' : 'Online'}
                </button>
                <button onClick={() => handleEdit(p)}><FaEdit /> Edit</button>
                <button className="danger" onClick={() => handleDelete(p.id)}>
                  <FaTrash />
                </button>
              </Actions>
            </PrinterCard>
          );
        })}
      </Grid>

      <AnimatePresence>
        {showModal && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <ModalContent
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <h2>{editingPrinter ? 'Edit Printer' : 'Add New Printer'}</h2>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <label>Printer Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Main Office Printer"
                  />
                </FormGroup>

                <FormGroup>
                  <label>Model *</label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g., HP LaserJet Enterprise"
                  />
                </FormGroup>

                <FormGroup>
                  <label>Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Level 1, Room 102"
                  />
                </FormGroup>

                <FormGroup>
                  <label>Department *</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g., Administration"
                  />
                </FormGroup>

                <FormGroup>
                  <label>Capabilities (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.capabilities}
                    onChange={e => setFormData({ ...formData, capabilities: e.target.value })}
                    placeholder="e.g., Color, Duplex, Stapling"
                  />
                </FormGroup>

                <ButtonGroup>
                  <button type="button" className="secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="primary">
                    {editingPrinter ? 'Update' : 'Add'} Printer
                  </button>
                </ButtonGroup>
              </Form>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default PrinterManagement;
