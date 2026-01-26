import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { usePrintJob } from '../context/PrintJobContext';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import { 
  FaPrint, 
  FaTrash, 
  FaEye, 
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaFileAlt,
  FaSearch,
  FaSort,
  FaDownload,
  FaInfoCircle
} from 'react-icons/fa';

const QueueContainer = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
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
  
  @media (max-width: 768px) {
    h1 {
      font-size: 24px;
    }
    
    p {
      font-size: 14px;
    }
  }
`;

const ControlsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const ControlsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: end;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  label {
    font-weight: 500;
    color: #333;
    font-size: 14px;
  }
  
  input, select {
    padding: 10px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.2s;
    
    &:focus {
      border-color: #3498db;
      outline: none;
    }
    
    @media (max-width: 768px) {
      padding: 8px;
      font-size: 13px;
    }
  }
`;

const SortSection = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
`;

const SortButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  background: white;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &.active {
    background: #3498db;
    color: white;
    border-color: #3498db;
  }
  
  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 12px;
  }
`;

const JobsContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  
  @media (max-width: 768px) {
    border-radius: 8px;
  }
`;

const JobList = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 600px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const JobItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #ecf0f1;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 12px 16px;
    gap: 12px;
  }
`;

const JobInfo = styled.div`
  flex: 1;
  min-width: 0;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const JobTitle = styled.div`
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: 768px) {
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
  }
`;

const JobDetails = styled.div`
  display: flex;
  gap: 16px;
  color: #7f8c8d;
  font-size: 14px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
  }
`;

const JobStatus = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-right: 16px;
  
  .status-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    
    &.pending {
      background: #fff3cd;
      color: #856404;
    }
    
    &.printing {
      background: #d1ecf1;
      color: #0c5460;
    }
    
    &.completed {
      background: #d4edda;
      color: #155724;
    }
    
    &.cancelled {
      background: #f8d7da;
      color: #721c24;
    }
  }
  
  .job-cost {
    font-size: 14px;
    font-weight: 500;
    color: #2c3e50;
  }
  
  @media (max-width: 768px) {
    flex-direction: row;
    margin-right: 0;
    margin-bottom: 8px;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    
    .job-cost {
      font-size: 12px;
    }
  }
`;

const JobActions = styled.div`
  display: flex;
  gap: 8px;
  
  @media (max-width: 768px) {
    align-self: flex-end;
  }
`;

const ActionButton = styled.button`
  width: 36px;
  height: 36px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  background: white;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  position: relative;
  
  ${props => props.disabled && `
    opacity: 0.5;
    pointer-events: none;
  `}
  
  &:not(:disabled):hover {
    background: ${props => {
      if (props.className?.includes('danger')) return '#f8d7da';
      if (props.className?.includes('success')) return '#d4edda';
      return '#f8f9fa';
    }};
    color: ${props => {
      if (props.className?.includes('danger')) return '#721c24';
      if (props.className?.includes('success')) return '#155724';
      return '#333';
    }};
    border-color: ${props => {
      if (props.className?.includes('danger')) return '#f5c6cb';
      if (props.className?.includes('success')) return '#c3e6cb';
      return '#3498db';
    }};
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #7f8c8d;
`;

const PrintJobQueue = () => {
  const { currentUser } = useAuth();
  const { printJobs, cancelPrintJob, deletePrintJob, getJobById, viewPrintJob } = usePrintJob();
  const navigate = useNavigate();
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: ''
  });
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [userJobs, setUserJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter user's jobs only
  useEffect(() => {
    if (printJobs && currentUser?.id) {
      const userJobs = printJobs.filter(job => job.userId === currentUser.id);
      setUserJobs(userJobs);
      setLoading(false);
    }
  }, [printJobs, currentUser]);

  // Apply filters and sorting
  useEffect(() => {
    if (!userJobs.length) return;
    
    let jobs = [...userJobs];
    
    // Apply filters
    if (filters.status !== 'all') {
      jobs = jobs.filter(job => job.status === filters.status);
    }
    if (filters.priority !== 'all') {
      jobs = jobs.filter(job => job.priority === filters.priority);
    }
    if (filters.search) {
      jobs = jobs.filter(job => 
        job.documentName?.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.notes?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    // Apply sorting
    jobs.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'submittedAt' || sortBy === 'releasedAt' || sortBy === 'completedAt') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredJobs(jobs);
  }, [userJobs, filters, sortBy, sortOrder]);

  const handleCancelJob = async (jobId) => {
    if (window.confirm('Are you sure you want to cancel this print job?')) {
      try {
        await cancelPrintJob(jobId);
        toast.success('Print job cancelled successfully');
      } catch (error) {
        toast.error('Failed to cancel print job: ' + error.message);
      }
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this print job? This cannot be undone.')) {
      try {
        await deletePrintJob(jobId);
        toast.success('Print job deleted successfully');
        // Remove from viewed jobs if it was there
        setViewedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      } catch (error) {
        toast.error('Failed to delete print job: ' + error.message);
      }
    }
  };

  const handleViewJob = async (jobId) => {
    const job = filteredJobs.find(j => j.id === jobId);
    if (!job) {
      toast.error('Job not found.');
      return;
    }
    
    if (job.viewCount > 0) {
      toast.error('Document already viewed (one-time only)');
      return;
    }

    try {
      const documentData = await viewPrintJob(jobId, job.secureToken, currentUser.id);
      if (documentData?.dataUrl) {
        // Open in new tab for preview (not download)
        window.open(documentData.dataUrl, '_blank');
        toast.success('Document preview opened. This was a one-time view - the button is now permanently disabled.');
      } else {
        toast.error('Document data not available for viewing.');
      }
    } catch (error) {
      if (error.message === 'Document already viewed') {
        // Already handled by viewPrintJob
        return;
      }
      toast.error('Failed to view document: ' + error.message);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FaClock />;
      case 'printing': return <FaPrint />;
      case 'completed': return <FaCheckCircle />;
      case 'cancelled': return <FaExclamationTriangle />;
      default: return <FaFileAlt />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'normal': return '#3498db';
      case 'low': return '#95a5a6';
      default: return '#7f8c8d';
    }
  };

  if (loading) {
    return (
      <QueueContainer>
        <LoadingWrapper>
          <div>Loading print jobs...</div>
        </LoadingWrapper>
      </QueueContainer>
    );
  }

  // Determine empty state type
  let emptyStateType = 'jobs';
  let emptyStateAction = null;
  let emptyStateActionText = 'Submit Print Job';
  
  if (filters.status !== 'all' || filters.search || filters.priority !== 'all') {
    emptyStateType = 'search';
  } else {
    emptyStateAction = () => navigate('/submit-job');
  }

  return (
    <QueueContainer>
      <PageHeader>
        <h1>Print Job Queue</h1>
        <p>Manage and track your secure print jobs</p>
      </PageHeader>

      <ControlsSection>
        <ControlsGrid>
          <ControlGroup>
            <label htmlFor="search">Search Jobs</label>
            <div style={{ position: 'relative' }}>
              <FaSearch style={{ 
                position: 'absolute', 
                left: '10px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#7f8c8d' 
              }} />
              <input
                id="search"
                type="text"
                placeholder="Search by document name or notes..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                style={{ paddingLeft: '34px' }}
              />
            </div>
          </ControlGroup>

          <ControlGroup>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="printing">Printing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </ControlGroup>

          <ControlGroup>
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </ControlGroup>

          <SortSection>
            <span style={{ color: '#7f8c8d', fontSize: '14px', marginRight: '8px' }}>Sort by:</span>
            <SortButton
              className={sortBy === 'submittedAt' ? 'active' : ''}
              onClick={() => handleSort('submittedAt')}
            >
              <FaSort />
              Date
            </SortButton>
            <SortButton
              className={sortBy === 'documentName' ? 'active' : ''}
              onClick={() => handleSort('documentName')}
            >
              <FaSort />
              Name
            </SortButton>
            <SortButton
              className={sortBy === 'status' ? 'active' : ''}
              onClick={() => handleSort('status')}
            >
              <FaSort />
              Status
            </SortButton>
          </SortSection>
        </ControlsGrid>
      </ControlsSection>

      <JobsContainer>
        {filteredJobs.length > 0 ? (
          <JobList>
            {filteredJobs.map((job) => (
              <JobItem key={job.id}>
                <JobStatus>
                  <div className={`status-badge ${job.status}`}>
                    {getStatusIcon(job.status)}
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </div>
                  <div className="job-cost">${job.cost?.toFixed(2) || '0.00'}</div>
                </JobStatus>
                
                <JobInfo>
                  <JobTitle title={job.documentName}>{job.documentName}</JobTitle>
                  <JobDetails>
                    <span>Pages: {job.pages}</span>
                    <span>Copies: {job.copies}</span>
                    <span style={{ color: getPriorityColor(job.priority) }}>
                      Priority: {job.priority}
                    </span>
                    <span>Submitted: {formatDate(job.submittedAt)}</span>
                    {job.notes && <span>Notes: {job.notes}</span>}
                  </JobDetails>
                </JobInfo>
                
                <JobActions>
                  <ActionButton
                    onClick={() => handleViewJob(job.id)}
                    disabled={job.viewCount > 0}
                    title={job.viewCount > 0 ? 'Document already viewed (one-time only)' : 'Preview document (one-time view)'}
                    className={job.viewCount > 0 ? 'danger' : 'success'}
                  >
                    {job.viewCount > 0 ? <FaTimes /> : <FaEye />}
                  </ActionButton>
                  
                  {job.status === 'pending' && job.viewCount > 0 && (
                    <ActionButton
                      onClick={() => navigate(`/print-release?token=${job.secureToken}`)}
                      title="Release this job for printing"
                      className="success"
                    >
                      <FaPrint />
                    </ActionButton>
                  )}
                  
                  <ActionButton
                    onClick={() => handleDeleteJob(job.id)}
                    title="Delete this job"
                    className="danger"
                  >
                    <FaTrash />
                  </ActionButton>
                </JobActions>
              </JobItem>
            ))}
          </JobList>
        ) : (
          <EmptyState
            type={emptyStateType}
            action={emptyStateAction}
            actionText={emptyStateActionText}
            onAction={emptyStateAction}
          />
        )}
      </JobsContainer>
    </QueueContainer>
  );
};

export default PrintJobQueue;