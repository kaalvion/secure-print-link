import React, { useState } from 'react';
import styled from 'styled-components';
import { useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaShieldAlt, FaCog } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 40px;
`;

const Header = styled(motion.div)`
  margin-bottom: 40px;
  h1 {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 8px;
    background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Section = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 24px;
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    color: white;
    font-size: 1.25rem;
    font-weight: 600;
    
    svg { color: var(--primary); }
  }
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    color: var(--text-secondary);
    margin-bottom: 8px;
    font-size: 0.9rem;
  }
  
  input, select {
    width: 100%;
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: white;
    font-size: 1rem;
    transition: all 0.2s;
    
    &:focus {
      outline: none;
      border-color: var(--primary);
      background: rgba(0, 0, 0, 0.3);
    }
  }
`;

const ToggleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  
  &:last-child { border-bottom: none; }
  
  .info {
    h4 { color: white; margin-bottom: 4px; font-weight: 500; }
    p { color: var(--text-secondary); font-size: 0.85rem; }
  }
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
  
  input { opacity: 0; width: 0; height: 0; }
  
  span {
    position: absolute;
    cursor: pointer;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(255, 255, 255, 0.1);
    transition: .4s;
    border-radius: 34px;
    
    &:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
  }
  
  input:checked + span { background-color: var(--primary); }
  input:checked + span:before { transform: translateX(22px); }
`;

const SaveBar = styled(motion.div)`
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(10px);
  padding: 12px 24px;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  z-index: 100;
  
  button {
    padding: 10px 24px;
    border-radius: 20px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    
    &.save { background: var(--primary); color: white; }
    &.cancel { background: transparent; color: var(--text-secondary); }
  }
`;

const Settings = () => {
  const { user } = useUser();
  const [hasChanges, setHasChanges] = useState(false);
  const [form, setForm] = useState({
    name: user?.fullName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    notifications: true,
    darkMode: true,
    twoFactor: false
  });

  const handleChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    setHasChanges(true);
  };

  const handleSave = () => {
    toast.success('Settings saved successfully');
    setHasChanges(false);
  };

  return (
    <Container>
      <Header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1>System Settings</h1>
      </Header>

      <Section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="section-title"><FaUser /> Profile Settings</div>
        <InputGroup>
          <label>Display Name</label>
          <input value={form.name} onChange={e => handleChange('name', e.target.value)} />
        </InputGroup>
        <InputGroup>
          <label>Email Address</label>
          <input value={form.email} onChange={e => handleChange('email', e.target.value)} />
        </InputGroup>
      </Section>

      <Section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="section-title"><FaCog /> Preferences</div>

        <ToggleRow>
          <div className="info">
            <h4>Dark Mode</h4>
            <p>Use high-contrast dark theme</p>
          </div>
          <Switch>
            <input
              type="checkbox"
              checked={form.darkMode}
              onChange={e => handleChange('darkMode', e.target.checked)}
            />
            <span />
          </Switch>
        </ToggleRow>

        <ToggleRow>
          <div className="info">
            <h4>Email Notifications</h4>
            <p>Receive updates about print jobs</p>
          </div>
          <Switch>
            <input
              type="checkbox"
              checked={form.notifications}
              onChange={e => handleChange('notifications', e.target.checked)}
            />
            <span />
          </Switch>
        </ToggleRow>
      </Section>

      <Section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="section-title"><FaShieldAlt /> Security</div>

        <ToggleRow>
          <div className="info">
            <h4>Two-Factor Authentication</h4>
            <p>Require code verification on login</p>
          </div>
          <Switch>
            <input
              type="checkbox"
              checked={form.twoFactor}
              onChange={e => handleChange('twoFactor', e.target.checked)}
            />
            <span />
          </Switch>
        </ToggleRow>
      </Section>

      <AnimatePresence>
        {hasChanges && (
          <SaveBar initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}>
            <button className="cancel" onClick={() => setHasChanges(false)}>Reset</button>
            <button className="save" onClick={handleSave}>Save Changes</button>
          </SaveBar>
        )}
      </AnimatePresence>

    </Container>
  );
};

export default Settings;
