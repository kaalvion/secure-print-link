import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { 
  FaBars, 
  FaUser, 
  FaBell, 
  FaCog, 
  FaSignOutAlt,
  FaPrint,
  FaShieldAlt
} from 'react-icons/fa';

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: bold;
  
  .logo-icon {
    font-size: 24px;
  }
  
  @media (max-width: 768px) {
    font-size: 18px;
    
    .logo-text {
      display: none;
    }
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const NotificationButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  position: relative;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .notification-badge {
    position: absolute;
    top: 0;
    right: 0;
    background-color: #ff4757;
    color: white;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  
  .user-name {
    font-weight: 500;
    font-size: 14px;
  }
  
  .user-role {
    font-size: 12px;
    opacity: 0.8;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const UserAvatar = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  padding: 8px 0;
  margin-top: 8px;
  z-index: 1000;
  
  &::before {
    content: '';
    position: absolute;
    top: -8px;
    right: 20px;
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid white;
  }
  
  @media (max-width: 768px) {
    position: fixed;
    top: 60px;
    right: 16px;
    left: 16px;
    min-width: auto;
    margin-top: 0;
    
    &::before {
      display: none;
    }
  }
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  &:first-child {
    border-radius: 8px 8px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 8px 8px;
    border-top: 1px solid #eee;
    color: #dc3545;
  }
`;

const Header = ({ onMenuToggle }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications] = useState(3); // Mock notification count

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowDropdown(false);
  };

  const handleProfile = () => {
    navigate('/settings');
    setShowDropdown(false);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('header')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  return (
    <HeaderContainer>
      <LeftSection>
        <MenuButton onClick={onMenuToggle}>
          <FaBars />
        </MenuButton>
        <Logo>
          <FaShieldAlt className="logo-icon" />
          <span className="logo-text">Secure Print Link</span>
        </Logo>
      </LeftSection>

      <RightSection>
        <NotificationButton>
          <FaBell />
          {notifications > 0 && (
            <span className="notification-badge">{notifications}</span>
          )}
        </NotificationButton>

        <UserSection>
          <UserInfo>
            <div className="user-name">{currentUser?.name}</div>
            <div className="user-role">{currentUser?.role}</div>
          </UserInfo>
          
          <UserAvatar onClick={() => setShowDropdown(!showDropdown)}>
            {getInitials(currentUser?.name || 'U')}
          </UserAvatar>

          {showDropdown && (
            <DropdownMenu>
              <DropdownItem onClick={handleProfile}>
                <FaUser />
                Profile
              </DropdownItem>
              <DropdownItem onClick={() => navigate('/settings')}>
                <FaCog />
                Settings
              </DropdownItem>
              <DropdownItem onClick={() => navigate('/submit-job')}>
                <FaPrint />
                Submit Print Job
              </DropdownItem>
              <DropdownItem onClick={handleLogout}>
                <FaSignOutAlt />
                Logout
              </DropdownItem>
            </DropdownMenu>
          )}
        </UserSection>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;