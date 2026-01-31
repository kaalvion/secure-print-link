import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useUser } from '@clerk/clerk-react';
import { usePrintJob } from '../context/PrintJobContext';

import { motion, AnimatePresence } from 'framer-motion';
import EmptyState from '../components/EmptyState';
import {
  FaPrint,
  FaTrash,
  FaEye,
  FaCheckCircle,
  FaClock,
  FaFileAlt,
  FaSearch
} from 'react-icons/fa';

const QueueContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-bottom: 40px;
`;

const PageHeader = styled(motion.div)`
  margin-bottom: 8px;
  
  h1 {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 8px;
    background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    color: var(--text-secondary);
    font-size: 1.1rem;
    max-width: 600px;
  }
`;

const Toolbar = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  min-width: 300px;
  
  .icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
  }
  
  input {
    width: 100%;
    padding: 12px 16px 12px 48px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: white;
    font-size: 0.95rem;
    transition: all 0.2s;
    
    &:focus {
      outline: none;
      border-color: var(--primary);
      background: rgba(0, 0, 0, 0.3);
    }
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  select {
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: white;
    font-size: 0.9rem;
    cursor: pointer;
    
    &:focus {
      outline: none;
      border-color: var(--primary);
    }

    option {
      background: var(--bg-dark);
    }
  }
`;

const JobCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 24px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 24px;
  align-items: center;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.3);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const JobIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: ${props => props.bg || 'rgba(59, 130, 246, 0.1)'};
  color: ${props => props.color || 'var(--primary)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
`;

const JobContent = styled.div`
  min-width: 0; 
  
  h3 {
    font-size: 1.2rem;
    color: white;
    margin-bottom: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    color: var(--text-secondary);
    font-size: 0.9rem;
    
    span {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .dot {
      width: 4px;
      height: 4px;
      background: var(--text-secondary);
      border-radius: 50%;
      align-self: center;
    }
  }
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  width: fit-content;
  
  &.pending { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
  &.printing { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
  &.completed { background: rgba(52, 211, 153, 0.2); color: #34d399; }
  &.cancelled { background: rgba(248, 113, 113, 0.2); color: #f87171; }
  &.released { background: rgba(167, 139, 250, 0.2); color: #a78bfa; }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 768px) {
    justify-content: flex-end;
  }
`;

const IconButton = styled(motion.button)`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: white;
    color: var(--primary);
  }
  
  &.danger:hover:not(:disabled) {
    background: #fee2e2;
    color: #dc2626;
    border-color: #fee2e2;
  }
  
  &.success:hover:not(:disabled) {
    background: #dcfce7;
    color: #16a34a;
    border-color: #dcfce7;
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const PrintJobQueue = () => {
  const { user } = useUser();
  const { printJobs, deletePrintJob, viewPrintJob, releasePrintJob, printers } = usePrintJob();
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [filters, setFilters] = useState({ status: 'all', priority: 'all', search: '' });
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (printJobs && user?.id) {
      let result = printJobs.filter(job => job.userId === user.id);

      if (filters.status !== 'all') {
        result = result.filter(job => job.status === filters.status);
      }
      if (filters.priority !== 'all') {
        result = result.filter(job => job.priority === filters.priority);
      }
      if (filters.search) {
        const term = filters.search.toLowerCase();
        result = result.filter(job =>
          job.documentName?.toLowerCase().includes(term) ||
          job.notes?.toLowerCase().includes(term)
        );
      }

      // Sort: Newest first
      result.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

      setFilteredJobs(result);
    }
  }, [printJobs, user, filters]);

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Delete this job?')) {
      try {
        await deletePrintJob(jobId);
        toast.success('Job deleted');
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleViewJob = async (jobId, job) => {
    if (job.viewCount > 0) return toast.error('Already viewed');
    try {
      const data = await viewPrintJob(jobId, job.secureToken, user.id);
      if (data?.dataUrl) window.open(data.dataUrl, '_blank');
    } catch (error) {
      if (error.message !== 'Document already viewed') toast.error(error.message);
    }
  };

  const handleReleaseJob = async (jobId, job) => {
    const printer = printers.find(p => p.status === 'online') || { id: 1 };
    try {
      await releasePrintJob(jobId, printer.id, user.id, job.secureToken);
      // Toast handled by context
    } catch (err) {
      // Handled by context
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'high': return '#f87171';
      case 'urgent': return '#ef4444';
      case 'low': return '#94a3b8';
      default: return '#60a5fa';
    }
  };

  const formatDate = (date) => new Date(date).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <QueueContainer>
      <PageHeader initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1>Print Queue</h1>
        <p>Manage your secure print jobs in real-time</p>
      </PageHeader>

      <Toolbar initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <SearchBox>
          <FaSearch className="icon" />
          <input
            placeholder="Search documents..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </SearchBox>

        <FilterGroup>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="all">Status: All</option>
            <option value="pending">Pending</option>
            <option value="printing">Printing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          >
            <option value="all">Priority: All</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </FilterGroup>
      </Toolbar>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <AnimatePresence mode="popLayout">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <JobIcon>
                  {job.status === 'completed' ? <FaCheckCircle /> : <FaFileAlt />}
                </JobIcon>

                <JobContent>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0 }}>{job.documentName}</h3>
                    <StatusBadge className={job.status}>{job.status}</StatusBadge>
                  </div>
                  <div className="meta">
                    <span><FaClock size={12} /> {formatDate(job.submittedAt)}</span>
                    <span className="dot" />
                    <span>{job.pages} Pages</span>
                    <span className="dot" />
                    <span style={{ color: getPriorityColor(job.priority), fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem' }}>
                      {job.priority}
                    </span>
                    {job.notes && (
                      <>
                        <span className="dot" />
                        <span>"{job.notes}"</span>
                      </>
                    )}
                  </div>
                </JobContent>

                <ActionButtons>
                  {job.viewCount === 0 && (
                    <IconButton
                      onClick={() => handleViewJob(job.id, job)}
                      title="Preview (One-time)"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaEye />
                    </IconButton>
                  )}

                  {job.status === 'pending' && (
                    <IconButton
                      className="success"
                      onClick={() => handleReleaseJob(job.id, job)}
                      title="Release Now"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaPrint />
                    </IconButton>
                  )}

                  <IconButton
                    className="danger"
                    onClick={() => handleDeleteJob(job.id)}
                    title="Delete Job"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaTrash />
                  </IconButton>
                </ActionButtons>
              </JobCard>
            ))
          ) : (
            <EmptyState />
          )}
        </AnimatePresence>
      </div>
    </QueueContainer>
  );
};

export default PrintJobQueue;