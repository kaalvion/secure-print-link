import React from 'react';
import styled from 'styled-components';
import { 
  FaFileAlt, 
  FaClock, 
  FaExclamationTriangle, 
  FaSearch,
  FaPrint,
  FaUser
} from 'react-icons/fa';

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #7f8c8d;
  min-height: 300px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 30px 16px;
    min-height: 250px;
  }
`;

const IconWrapper = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
  color: ${props => props.color || '#bdc3c7'};
  
  @media (max-width: 768px) {
    font-size: 48px;
    margin-bottom: 16px;
  }
`;

const Title = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #2c3e50;
  
  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 8px;
  }
`;

const Description = styled.p`
  font-size: 16px;
  line-height: 1.5;
  max-width: 400px;
  margin-bottom: 24px;
  color: #7f8c8d;
  
  @media (max-width: 768px) {
    font-size: 14px;
    margin-bottom: 20px;
  }
`;

const ActionButton = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #2980b9;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 13px;
  }
`;

const getIconAndColor = (type) => {
  switch (type) {
    case 'jobs':
      return { icon: <FaFileAlt />, color: '#3498db' };
    case 'expired':
      return { icon: <FaClock />, color: '#f39c12' };
    case 'error':
      return { icon: <FaExclamationTriangle />, color: '#e74c3c' };
    case 'search':
      return { icon: <FaSearch />, color: '#95a5a6' };
    case 'print':
      return { icon: <FaPrint />, color: '#27ae60' };
    case 'users':
      return { icon: <FaUser />, color: '#9b59b6' };
    default:
      return { icon: <FaFileAlt />, color: '#bdc3c7' };
  }
};

const EmptyState = ({ 
  type = 'default', 
  title, 
  description, 
  action,
  actionText,
  onAction 
}) => {
  const { icon, color } = getIconAndColor(type);
  
  const defaultContent = {
    jobs: {
      title: 'No print jobs found',
      description: 'Submit your first print job to get started. Your documents will appear here once submitted.'
    },
    expired: {
      title: 'All jobs expired',
      description: 'Your print jobs have expired and been automatically deleted for security.'
    },
    error: {
      title: 'Something went wrong',
      description: 'We encountered an error while loading your data. Please try again.'
    },
    search: {
      title: 'No results found',
      description: 'Try adjusting your search terms or filters to find what you\'re looking for.'
    },
    print: {
      title: 'No print activity',
      description: 'There\'s no print activity to show yet. Submit a job to see it here.'
    },
    users: {
      title: 'No users found',
      description: 'There are no users to display. Add new users to manage access.'
    }
  };

  const content = defaultContent[type] || {
    title: title || 'No data available',
    description: description || 'There\'s nothing to show here.'
  };

  return (
    <EmptyStateContainer>
      <IconWrapper color={color}>
        {icon}
      </IconWrapper>
      <Title>{content.title}</Title>
      <Description>{content.description}</Description>
      {action && onAction && (
        <ActionButton onClick={onAction}>
          {actionText || 'Get Started'}
        </ActionButton>
      )}
    </EmptyStateContainer>
  );
};

export default EmptyState;