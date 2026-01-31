import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { useUser } from '@clerk/clerk-react';
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
  FaTimes,
  FaComments,
  FaMapMarkerAlt
} from 'react-icons/fa';

const SidebarContainer = styled.aside`
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  width: ${props => props.isOpen ? '260px' : '80px'};
  height: 100vh;
  transition: all var(--transition-normal);
  overflow: hidden;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  z-index: 900;
  
  @media (max-width: 1199px) and (min-width: 769px) {
    width: ${props => props.isOpen ? '260px' : '80px'};
  }

  /* Desktop Styles: Scroll with page */
  @media (min-width: 769px) {
    position: relative;
    top: 0;
    margin-top: 64px; /* Push down below fixed header */
    height: auto;
    min-height: calc(100vh - 64px);
    overflow: visible;
  }

  @media (max-width: 768px) {
    background: #0f172a; /* Solid background on mobile for legibility */
    position: fixed;
    top: 0;
    left: ${props => props.isOpen ? '0' : '-260px'};
    width: 260px;
    height: 100vh;
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
    background: rgba(15, 23, 42, 0.5);
    backdrop-filter: blur(4px);
    z-index: 999;
  }
`;

const ToggleButton = styled.button`
  position: absolute;
  top: 20px;
  right: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: none; /* Hidden as requested to remove clutter */
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 20;
  transition: all var(--transition-fast);
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
`;

const MobileToggleButton = styled.button`
  display: none;
  position: fixed;
  top: 12px;
  left: 12px;
  background: var(--primary-color);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1001;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-fast);
  
  &:hover {
    background: var(--primary-hover);
    transform: scale(1.05);
  }
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const CloseButton = styled.button`
  display: none;
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background-color var(--transition-fast);
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const LogoSection = styled.div`
  padding: 20px;
  padding-right: 50px; /* Make space for toggle button */
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  height: 68px; /* Fixed height for consistency */
  
  .logo-icon {
    font-size: 28px;
    color: var(--primary-color);
    flex-shrink: 0;
  }
  
  .logo-text {
    font-size: 1.1rem;
    font-weight: 800;
    white-space: nowrap;
    letter-spacing: -0.025em;
    opacity: ${props => props.isOpen ? '1' : '0'};
    transition: opacity var(--transition-normal);
  }
  
  @media (max-width: 768px) {
    .logo-text {
      opacity: 1;
    }
  }

  /* Hide Logo Section on Desktop as Header handles branding */
  @media (min-width: 769px) {
    display: none;
  }
`;

const NavMenu = styled.nav`
  padding: 0 12px;
  flex: 1;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }

  /* Reset overflow for desktop to effectively disable internal scroll */
  @media (min-width: 769px) {
    overflow: visible;
    margin-top: 20px; /* Small spacing */
  }
`;

const NavSection = styled.div`
  margin-bottom: 24px;
  
  .section-title {
    padding: 0 16px 12px;
    font-size: 0.75rem;
    text-transform: uppercase;
    color: var(--text-light);
    font-weight: 600;
    letter-spacing: 0.05em;
    opacity: ${props => props.isOpen ? '1' : '0'};
    transition: opacity var(--transition-normal);
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
  gap: 12px;
  padding: 12px 16px;
  color: var(--text-light);
  text-decoration: none;
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast);
  margin-bottom: 4px;
  white-space: nowrap;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: white;
  }
  
  &.active {
    background: var(--primary-color);
    color: white;
    box-shadow: var(--shadow-md);
  }
  
  .nav-icon {
    font-size: 20px;
    min-width: 20px;
    text-align: center;
    flex-shrink: 0;
  }
  
  .nav-text {
    font-size: 0.9375rem;
    font-weight: 500;
    opacity: ${props => props.isOpen ? '1' : '0'};
    transition: opacity var(--transition-normal);
  }
  
  @media (max-width: 768px) {
    .nav-text {
      opacity: 1;
    }
  }
`;

const UserSection = styled.div`
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.1);
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: var(--border-radius-md);
    background: var(--primary-color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 600;
    flex-shrink: 0;
    box-shadow: var(--shadow-sm);
  }
  
  .user-details {
    opacity: ${props => props.isOpen ? '1' : '0'};
    transition: opacity var(--transition-normal);
    min-width: 0;
    overflow: hidden;
  }
  
  .user-name {
    font-size: 0.875rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: white;
  }
  
  .user-role {
    font-size: 0.75rem;
    color: var(--text-light);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: capitalize;
  }
  
  @media (max-width: 768px) {
    .user-details {
      opacity: 1;
    }
  }
`;

const Sidebar = ({ isOpen, onToggle }) => {
  const { user } = useUser();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Check if device is mobile or tablet
  useEffect(() => {
    const checkSize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1199);
    };

    checkSize();
    window.addEventListener('resize', checkSize);

    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // Handle initial state for tablet (icon-only)
  useEffect(() => {
    if (isTablet) {
      onToggle(false);
    } else if (!isMobile) {
      onToggle(true);
    }
  }, [isTablet, isMobile, onToggle]);

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
        { path: '/shop-discovery', icon: FaMapMarkerAlt, text: 'Find a Shop' },
        { path: '/chat', icon: FaComments, text: 'Messages' },
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
  const userRole = user?.unsafeMetadata?.role;

  const filteredNavItems = navItems.map(section => ({
    ...section,
    items: section.items.filter(item => {
      // Admin sees everything
      if (userRole === 'admin') return true;

      // Printer Shop
      if (userRole === 'printer') {
        const hiddenForPrinter = ['/submit-job', '/user-management'];
        return !hiddenForPrinter.includes(item.path);
      }

      // Regular User
      if (userRole === 'user') {
        const allowedForUser = ['/dashboard', '/submit-job', '/print-job-queue', '/chat', '/settings', '/shop-discovery'];
        return allowedForUser.includes(item.path);
      }

      // Default (e.g. valid login but no role yet, though Onboarding should catch this)
      return false;
    })
  })).filter(section => section.items.length > 0);

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
              {getInitials(user?.fullName || user?.firstName)}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.fullName || user?.firstName}</div>
              <div className="user-role">{user?.unsafeMetadata?.role || 'User'}</div>
            </div>
          </div>
        </UserSection>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;