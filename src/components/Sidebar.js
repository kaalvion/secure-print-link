import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, 
  FaPrint, 
  FaList, 
  FaServer, 
  FaUsers, 
  FaQrcode, 
  FaChartBar, 
  FaCog,
  FaChevronLeft,
  FaChevronRight,
  FaBars,
  FaTimes
} from 'react-icons/fa';

const SidebarContainer = styled.aside`
  background: #2c3e50;
  color: white;
  width: ${props => props.isOpen ? '250px' : '60px'};
  height: 100vh;
  transition: width 0.3s ease;
  overflow: hidden;
  position: relative;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 900;
  
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: ${props => props.isOpen ? '0' : '-250px'};
    width: 250px;
    transition: left 0.3s ease;
    z-index: 1000;
  }
`;

const Overlay = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
`;

const ToggleButton = styled.button`
  position: absolute;
  top: 20px;
  right: ${props => props.isOpen ? '-15px' : '-15px'};
  background: #34495e;
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.2s;
  
  &:hover {
    background: #4a5f7a;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileToggleButton = styled.button`
  display: none;
  position: fixed;
  top: 15px;
  left: 15px;
  background: #3498db;
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1001;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  
  &:hover {
    background: #2980b9;
    transform: scale(1.05);
  }
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const CloseButton = styled.button`
  display: none;
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const LogoSection = styled.div`
  padding: 20px;
  border-bottom: 1px solid #34495e;
  display: flex;
  align-items: center;
  gap: 10px;
  
  .logo-icon {
    font-size: 24px;
    color: #3498db;
  }
  
  .logo-text {
    font-size: 18px;
    font-weight: bold;
    white-space: nowrap;
    opacity: ${props => props.isOpen ? '1' : '0'};
    transition: opacity 0.3s ease;
  }
  
  @media (max-width: 768px) {
    .logo-text {
      opacity: 1;
    }
  }
`;

const NavMenu = styled.nav`
  padding: 20px 0;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }
`;

const NavSection = styled.div`
  margin-bottom: 20px;
  
  .section-title {
    padding: 0 20px 10px;
    font-size: 12px;
    text-transform: uppercase;
    color: #95a5a6;
    font-weight: 600;
    letter-spacing: 1px;
    opacity: ${props => props.isOpen ? '1' : '0'};
    transition: opacity 0.3s ease;
  }
  
  @media (max-width: 768px) {
    .section-title {
      opacity: 1;
    }
  }
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 20px;
  color: #bdc3c7;
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
  white-space: nowrap;
  
  &:hover {
    background: #34495e;
    color: white;
  }
  
  &.active {
    background: #3498db;
    color: white;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: #2ecc71;
    }
  }
  
  .nav-icon {
    font-size: 18px;
    min-width: 20px;
    text-align: center;
  }
  
  .nav-text {
    opacity: ${props => props.isOpen ? '1' : '0'};
    transition: opacity 0.3s ease;
  }
  
  @media (max-width: 768px) {
    .nav-text {
      opacity: 1;
    }
  }
`;

const UserSection = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  border-top: 1px solid #34495e;
  background: #34495e;
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #3498db;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
    flex-shrink: 0;
  }
  
  .user-details {
    opacity: ${props => props.isOpen ? '1' : '0'};
    transition: opacity 0.3s ease;
    min-width: 0;
    overflow: hidden;
  }
  
  .user-name {
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .user-role {
    font-size: 12px;
    color: #95a5a6;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  @media (max-width: 768px) {
    .user-details {
      opacity: 1;
    }
  }
`;

const Sidebar = ({ isOpen, onToggle }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const navItems = [
    {
      title: 'Main',
      items: [
        { path: '/dashboard', icon: FaHome, text: 'Dashboard' },
        { path: '/submit-job', icon: FaPrint, text: 'Submit Print Job' },
        { path: '/print-job-queue', icon: FaList, text: 'Print Job Queue' },
      ]
    },
    {
      title: 'Management',
      items: [
        { path: '/printer-management', icon: FaServer, text: 'Printer Management' },
        { path: '/user-management', icon: FaUsers, text: 'User Management' },
        { path: '/print-release', icon: FaQrcode, text: 'Print Release' },
      ]
    },
    {
      title: 'Analytics',
      items: [
        { path: '/reports', icon: FaChartBar, text: 'Reports & Analytics' },
        { path: '/settings', icon: FaCog, text: 'Settings' },
      ]
    }
  ];

  // Filter items based on user role
  const filteredNavItems = navItems.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (item.path === '/users' && currentUser?.role !== 'admin') {
        return false;
      }
      return true;
    })
  })).filter(section => section.items.length > 0);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      onToggle(false);
    }
  }, [location, isMobile, isOpen, onToggle]);

  const handleOverlayClick = () => {
    if (isMobile) {
      onToggle(false);
    }
  };

  return (
    <>
      <MobileToggleButton onClick={() => onToggle(true)}>
        <FaBars />
      </MobileToggleButton>
      
      <Overlay isOpen={isOpen && isMobile} onClick={handleOverlayClick} />
      
      <SidebarContainer isOpen={isOpen} isMobile={isMobile}>
        <ToggleButton isOpen={isOpen} onClick={() => onToggle(!isOpen)}>
          {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </ToggleButton>
        
        <CloseButton onClick={() => onToggle(false)}>
          <FaTimes />
        </CloseButton>

        <LogoSection isOpen={isOpen}>
          <FaPrint className="logo-icon" />
          <span className="logo-text">Secure Print</span>
        </LogoSection>

        <NavMenu>
          {filteredNavItems.map((section, index) => (
            <NavSection key={index} isOpen={isOpen}>
              <div className="section-title">{section.title}</div>
              {section.items.map((item, itemIndex) => (
                <NavItem
                  key={itemIndex}
                  to={item.path}
                  isOpen={isOpen}
                  end={item.path === '/'}
                >
                  <item.icon className="nav-icon" />
                  <span className="nav-text">{item.text}</span>
                </NavItem>
              ))}
            </NavSection>
          ))}
        </NavMenu>

        <UserSection isOpen={isOpen}>
          <div className="user-info">
            <div className="user-avatar">
              {getInitials(currentUser?.name)}
            </div>
            <div className="user-details">
              <div className="user-name">{currentUser?.name}</div>
              <div className="user-role">{currentUser?.role}</div>
            </div>
          </div>
        </UserSection>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;