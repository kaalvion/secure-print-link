import React, { useState } from 'react';
import styled from 'styled-components';
import { useUsers } from '../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaEdit,
  FaTrash,
  FaShieldAlt,
  FaSearch,
  FaPlus,
  FaEnvelope,
  FaIdBadge,
  FaPrint,
  FaCheckCircle,
  FaCog,
  FaFileUpload,
  FaTimes
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
  align-items: center;
  
  h1 {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 8px;
    background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Controls = styled(motion.div)`
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  
  .search {
    flex: 1;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    color: white;
    
    input {
      background: transparent;
      border: none;
      color: white;
      width: 100%;
      font-size: 1rem;
      &:focus { outline: none; }
      &::placeholder { color: rgba(255, 255, 255, 0.3); }
    }
  }
  
  .add-btn {
    padding: 0 24px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    
    &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); }
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

const UserCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  .role-badge {
    position: absolute;
    top: 24px;
    right: 24px;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    background: ${props => props.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
    color: ${props => props.role === 'admin' ? '#ef4444' : '#60a5fa'};
  }
`;

const Avatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
`;

const Info = styled.div`
  margin-bottom: 24px;
  h3 { color: white; font-size: 1.1rem; margin-bottom: 4px; }
  p { color: var(--text-secondary); font-size: 0.9rem; }
  
  .meta {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    div {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: var(--text-secondary);
      
      svg { color: var(--primary); opacity: 0.6; }
    }
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
  
  button {
    flex: 1;
    padding: 8px;
    border-radius: 8px;
    border: none;
    background: rgba(255, 255, 255, 0.05);
    color: white;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    
    &:hover { background: rgba(255, 255, 255, 0.1); }
    &.danger { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
    &.danger:hover { background: rgba(239, 68, 68, 0.2); }
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
  
  option {
    background: #0f172a;
    color: white;
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

const UserManagement = () => {
  const { users, addUser, updateUser, deleteUser } = useUsers();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPrintJobModal, setShowPrintJobModal] = useState(false);
  const [selectedUserForPrint, setSelectedUserForPrint] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    role: 'user',
    department: '',
    // Print Permissions
    canColorPrint: true,
    canDoubleSided: true,
    canStaple: false,
    maxCopies: 10,
    // Default Print Settings
    defaultPriority: 'normal',
    defaultExpiration: 15
  });

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.department?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      email: '',
      role: 'user',
      department: '',
      canColorPrint: true,
      canDoubleSided: true,
      canStaple: false,
      maxCopies: 10,
      defaultPriority: 'normal',
      defaultExpiration: 15
    });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      department: user.department || '',
      canColorPrint: user.canColorPrint ?? true,
      canDoubleSided: user.canDoubleSided ?? true,
      canStaple: user.canStaple ?? false,
      maxCopies: user.maxCopies || 10,
      defaultPriority: user.defaultPriority || 'normal',
      defaultExpiration: user.defaultExpiration || 15
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingUser) {
      await updateUser(editingUser.id, formData);
    } else {
      await addUser(formData);
    }

    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteUser(id);
    }
  };

  return (
    <Container>
      <Header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1>User Directory</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage access and permissions</p>
        </div>
      </Header>

      <Controls initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="search">
          <FaSearch />
          <input
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="add-btn" onClick={handleAdd}>
          <FaPlus /> Add User
        </button>
      </Controls>

      <Grid>
        <AnimatePresence>
          {filtered.map((user, i) => (
            <UserCard
              key={user.id}
              role={user.role}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="role-badge">{user.role}</div>

              <Avatar>
                {user.name.charAt(0)}
              </Avatar>

              <Info>
                <h3>{user.name}</h3>
                <p>@{user.username}</p>

                <div className="meta">
                  <div><FaEnvelope /> {user.email}</div>
                  <div><FaIdBadge /> {user.department || 'General'}</div>
                  <div><FaShieldAlt /> PIN: ••••</div>

                  {/* Print Capabilities */}
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {user.canColorPrint && (
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: '#60a5fa',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <FaCheckCircle /> Color
                        </span>
                      )}
                      {user.canDoubleSided && (
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#34d399'
                        }}>
                          Double-Sided
                        </span>
                      )}
                      {user.canStaple && (
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          background: 'rgba(245, 158, 11, 0.1)',
                          color: '#fbbf24'
                        }}>
                          Stapling
                        </span>
                      )}
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        background: 'rgba(139, 92, 246, 0.1)',
                        color: '#a78bfa'
                      }}>
                        Max {user.maxCopies || 10} copies
                      </span>
                    </div>
                  </div>
                </div>
              </Info>

              <Actions>
                <button onClick={() => handleEdit(user)}><FaEdit /> Edit</button>
                <button
                  style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}
                  onClick={() => {
                    setSelectedUserForPrint(user);
                    setShowPrintJobModal(true);
                  }}
                >
                  <FaPrint /> Print Job
                </button>
                <button className="danger" onClick={() => handleDelete(user.id)}><FaTrash /></button>
              </Actions>
            </UserCard>
          ))}
        </AnimatePresence>
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
              <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., John Smith"
                  />
                </FormGroup>

                <FormGroup>
                  <label>Username *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g., john.smith"
                  />
                </FormGroup>

                <FormGroup>
                  <label>Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g., john.smith@ company.com"
                  />
                </FormGroup>

                <FormGroup>
                  <label>Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g., IT, Marketing, Sales"
                  />
                </FormGroup>

                <FormGroup>
                  <label>Role *</label>
                  <select
                    required
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </FormGroup>

                {/* Print Permissions Section */}
                <div style={{
                  marginTop: '24px',
                  paddingTop: '24px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <h3 style={{
                    color: 'white',
                    fontSize: '1.1rem',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FaPrint /> Print Permissions
                  </h3>

                  <FormGroup>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        transition: 'background 0.2s'
                      }}>
                        <input
                          type="checkbox"
                          checked={formData.canColorPrint}
                          onChange={e => setFormData({ ...formData, canColorPrint: e.target.checked })}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{ flex: 1 }}>Allow Color Printing</span>
                      </label>

                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.02)'
                      }}>
                        <input
                          type="checkbox"
                          checked={formData.canDoubleSided}
                          onChange={e => setFormData({ ...formData, canDoubleSided: e.target.checked })}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{ flex: 1 }}>Allow Double-Sided Printing</span>
                      </label>

                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.02)'
                      }}>
                        <input
                          type="checkbox"
                          checked={formData.canStaple}
                          onChange={e => setFormData({ ...formData, canStaple: e.target.checked })}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{ flex: 1 }}>Allow Stapling</span>
                      </label>
                    </div>
                  </FormGroup>

                  <FormGroup>
                    <label>Maximum Copies Allowed</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.maxCopies}
                      onChange={e => setFormData({ ...formData, maxCopies: parseInt(e.target.value) || 1 })}
                    />
                  </FormGroup>
                </div>

                {/* Default Print Settings Section */}
                <div style={{
                  marginTop: '24px',
                  paddingTop: '24px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <h3 style={{
                    color: 'white',
                    fontSize: '1.1rem',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FaCog /> Default Print Settings
                  </h3>

                  <FormGroup>
                    <label>Default Priority</label>
                    <select
                      value={formData.defaultPriority}
                      onChange={e => setFormData({ ...formData, defaultPriority: e.target.value })}
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </FormGroup>

                  <FormGroup>
                    <label>Default Link Expiration</label>
                    <select
                      value={formData.defaultExpiration}
                      onChange={e => setFormData({ ...formData, defaultExpiration: parseInt(e.target.value) })}
                    >
                      <option value="5">5 Minutes</option>
                      <option value="15">15 Minutes</option>
                      <option value="30">30 Minutes</option>
                      <option value="60">1 Hour</option>
                      <option value="120">2 Hours</option>
                      <option value="1440">24 Hours</option>
                    </select>
                  </FormGroup>
                </div>

                <ButtonGroup>
                  <button type="button" className="secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="primary">
                    {editingUser ? 'Update' : 'Add'} User
                  </button>
                </ButtonGroup>
              </Form>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>

      {/* Print Job Submission Modal */}
      <AnimatePresence>
        {showPrintJobModal && selectedUserForPrint && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPrintJobModal(false)}
          >
            <ModalContent
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '600px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0 }}>Submit Print Job for {selectedUserForPrint.name}</h2>
                <button
                  onClick={() => setShowPrintJobModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '8px'
                  }}
                >
                  <FaTimes />
                </button>
              </div>

              <Form onSubmit={(e) => {
                e.preventDefault();
                alert(`Print job submitted for ${selectedUserForPrint.name}`);
                setShowPrintJobModal(false);
              }}>
                {/* File Upload */}
                <FormGroup>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaFileUpload /> Upload Document *
                  </label>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '2px dashed rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '32px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--primary)'; }}
                    onDragLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; }}
                    onDrop={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; }}
                  >
                    <FaFileUpload style={{ fontSize: '48px', color: 'rgba(255, 255, 255, 0.3)', marginBottom: '16px' }} />
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Drag and drop or click to upload
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      required
                      style={{
                        opacity: 0,
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        top: 0,
                        left: 0,
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </FormGroup>

                {/* Print Settings */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <FormGroup>
                    <label>Number of Copies</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedUserForPrint.maxCopies || 10}
                      defaultValue="1"
                      required
                    />
                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
                      Max: {selectedUserForPrint.maxCopies || 10}
                    </small>
                  </FormGroup>

                  <FormGroup>
                    <label>Priority</label>
                    <select defaultValue={selectedUserForPrint.defaultPriority || 'normal'}>
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </FormGroup>
                </div>

                <FormGroup>
                  <label>Link Expiration</label>
                  <select defaultValue={selectedUserForPrint.defaultExpiration || 15}>
                    <option value="5">5 Minutes</option>
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="60">1 Hour</option>
                    <option value="120">2 Hours</option>
                    <option value="1440">24 Hours</option>
                  </select>
                  <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
                    Print link will expire after this duration
                  </small>
                </FormGroup>

                {/* Print Options */}
                <div style={{
                  marginTop: '20px',
                  paddingTop: '20px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <h3 style={{ color: 'white', fontSize: '1rem', marginBottom: '12px' }}>
                    Print Options
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      opacity: selectedUserForPrint.canColorPrint ? 1 : 0.5,
                      cursor: selectedUserForPrint.canColorPrint ? 'pointer' : 'not-allowed'
                    }}>
                      <input
                        type="checkbox"
                        disabled={!selectedUserForPrint.canColorPrint}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span>Color Printing {!selectedUserForPrint.canColorPrint && '(Not allowed)'}</span>
                    </label>

                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      opacity: selectedUserForPrint.canDoubleSided ? 1 : 0.5,
                      cursor: selectedUserForPrint.canDoubleSided ? 'pointer' : 'not-allowed'
                    }}>
                      <input
                        type="checkbox"
                        disabled={!selectedUserForPrint.canDoubleSided}
                        defaultChecked={selectedUserForPrint.canDoubleSided}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span>Double-Sided {!selectedUserForPrint.canDoubleSided && '(Not allowed)'}</span>
                    </label>

                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      opacity: selectedUserForPrint.canStaple ? 1 : 0.5,
                      cursor: selectedUserForPrint.canStaple ? 'pointer' : 'not-allowed'
                    }}>
                      <input
                        type="checkbox"
                        disabled={!selectedUserForPrint.canStaple}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span>Stapling {!selectedUserForPrint.canStaple && '(Not allowed)'}</span>
                    </label>
                  </div>
                </div>

                {/* Security Features */}
                <div style={{
                  marginTop: '20px',
                  padding: '16px',
                  background: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '12px'
                }}>
                  <h3 style={{
                    color: '#34d399',
                    fontSize: '0.9rem',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FaShieldAlt /> Security Features
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <FaCheckCircle style={{ color: '#34d399' }} />
                      <span>End-to-end encryption</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <FaCheckCircle style={{ color: '#34d399' }} />
                      <span>Secure token authentication</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaCheckCircle style={{ color: '#34d399' }} />
                      <span>Audit trail logging</span>
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <FormGroup style={{ marginTop: '20px' }}>
                  <label>Additional Notes (Optional)</label>
                  <textarea
                    rows="3"
                    placeholder="Any special instructions or notes..."
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      color: 'white',
                      fontSize: '1rem',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      width: '100%'
                    }}
                  />
                </FormGroup>

                <ButtonGroup style={{ marginTop: '24px' }}>
                  <button type="button" className="secondary" onClick={() => setShowPrintJobModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="primary">
                    <FaPrint /> Submit Print Job
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

export default UserManagement;
