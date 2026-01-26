import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const layoutStyle = {
  display: 'flex',
  minHeight: '100vh',
};

const mainStyle = {
  flex: 1,
  padding: '24px',
  background: '#f5f7fa',
  transition: 'margin-left 0.3s ease',
  overflow: 'auto',
};

const mobileMainStyle = {
  flex: 1,
  padding: '16px',
  background: '#f5f7fa',
  marginTop: '60px', // Account for fixed header
  minHeight: 'calc(100vh - 60px)',
  overflow: 'auto',
};

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false); // Start with closed sidebar on mobile
      } else {
        setSidebarOpen(true); // Start with open sidebar on desktop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = (state) => {
    if (typeof state === 'boolean') {
      setSidebarOpen(state);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <div>
      <Header onMenuToggle={toggleSidebar} />
      <div style={layoutStyle}>
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        <main style={isMobile ? mobileMainStyle : { ...mainStyle, marginLeft: sidebarOpen ? '250px' : '60px' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;