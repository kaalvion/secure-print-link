import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { usePrintJob } from '../context/PrintJobContext';
import { FaPrint, FaFileAlt, FaServer, FaChartBar, FaCog, FaClock, FaCheckCircle, FaExclamationTriangle, FaList } from 'react-icons/fa';
import EmptyState from '../components/EmptyState';

const DashboardContainer = styled.div`
  padding: 20px;
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
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.color || '#3498db'};
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background: ${props => props.color || '#3498db'}20;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.color || '#3498db'};
    font-size: 24px;
  }
  
  .stat-info {
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 8px;
    }
    
    .stat-label {
      color: #7f8c8d;
      font-size: 14px;
    }
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    
    h2 {
      font-size: 20px;
      font-weight: 600;
      color: #2c3e50;
    }
    
    .view-all {
      color: #3498db;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const JobList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const JobItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  .job-info {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .job-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: #3498db20;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #3498db;
    }
    
    .job-details {
      .job-name {
        font-weight: 500;
        color: #2c3e50;
        margin-bottom: 4px;
      }
      
      .job-meta {
        font-size: 12px;
        color: #7f8c8d;
      }
    }
  }
  
  .job-status {
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
`;

const PrinterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const PrinterCard = styled.div`
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  
  .printer-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: ${props => props.status === 'online' ? '#d4edda' : '#f8d7da'};
    color: ${props => props.status === 'online' ? '#155724' : '#721c24'};
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
    font-size: 20px;
  }
  
  .printer-name {
    font-weight: 500;
    color: #2c3e50;
    margin-bottom: 4px;
  }
  
  .printer-status {
    font-size: 12px;
    color: ${props => props.status === 'online' ? '#27ae60' : '#e74c3c'};
    font-weight: 500;
  }
`;

const QuickActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border: 2px solid #ecf0f1;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  
  &:hover {
    border-color: #3498db;
    background: #f8f9fa;
  }
  
  .action-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: #3498db20;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #3498db;
    font-size: 18px;
  }
  
  .action-text {
    flex: 1;
    
    .action-title {
      font-weight: 500;
      color: #2c3e50;
      margin-bottom: 4px;
    }
    
    .action-description {
      font-size: 12px;
      color: #7f8c8d;
    }
  }
`;

const ChartPlaceholder = styled.div`
  height: 200px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 16px;
`;

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { printJobs, getJobStatistics } = usePrintJob();
  const navigate = useNavigate();
  const [userJobs, setUserJobs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    released: 0,
    completed: 0,
    cancelled: 0,
    viewed: 0,
    expired: 0
  });

  // Filter user's jobs and calculate statistics
  useEffect(() => {
    if (printJobs && currentUser?.id) {
      const userJobs = printJobs.filter(job => job.userId === currentUser.id);
      setUserJobs(userJobs);
      
      // Calculate real-time statistics from the same data source
      const jobStats = getJobStatistics(currentUser.id);
      setStats(jobStats);
    }
  }, [printJobs, currentUser, getJobStatistics]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardContainer>
      <PageHeader>
        <h1>Dashboard</h1>
        <p>Welcome back, {currentUser?.name}! Here's what's happening with your print jobs.</p>
      </PageHeader>

      <StatsGrid>
        <StatCard>
          <div className="stat-icon total">
            <FaFileAlt />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Jobs</div>
          </div>
        </StatCard>

        <StatCard>
          <div className="stat-icon pending">
            <FaClock />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </StatCard>

        <StatCard>
          <div className="stat-icon released">
            <FaPrint />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.released}</div>
            <div className="stat-label">Released</div>
          </div>
        </StatCard>

        <StatCard>
          <div className="stat-icon completed">
            <FaCheckCircle />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </StatCard>

        <StatCard>
          <div className="stat-icon viewed">
            <FaEye />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.viewed}</div>
            <div className="stat-label">Viewed</div>
          </div>
        </StatCard>

        <StatCard>
          <div className="stat-icon expired">
            <FaExclamationTriangle />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.expired}</div>
            <div className="stat-label">Expired</div>
          </div>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <MainContent>
          <Section>
            <div className="section-header">
              <h2>Recent Print Jobs</h2>
              <a href="/print-job-queue" className="view-all">View All</a>
            </div>
            <JobList>
              {userJobs.length > 0 ? (
                userJobs.slice(0, 5).map((job) => (
                  <JobItem key={job.id}>
                    <div className="job-info">
                      <div className="job-icon">
                        <FaFileAlt />
                      </div>
                      <div className="job-details">
                        <div className="job-name">{job.documentName || 'Document'}</div>
                        <div className="job-meta">
                          {formatDate(job.submittedAt)} • {job.pages} pages • ${job.cost}
                        </div>
                      </div>
                    </div>
                    <div className={`job-status ${job.status}`}>
                      {job.status}
                    </div>
                  </JobItem>
                ))
              ) : (
                <EmptyState 
                  type="jobs" 
                  action={() => navigate('/submit-job')}
                  actionText="Submit Print Job"
                  onAction={() => navigate('/submit-job')}
                />
              )}
            </JobList>
          </Section>

          <Section>
            <div className="section-header">
              <h2>Printer Status</h2>
              <a href="/printers" className="view-all">Manage Printers</a>
            </div>
            <PrinterGrid>
              {printJobs.map(printer => (
                <PrinterCard key={printer.id} status={printer.status}>
                  <div className="printer-icon">
                    <FaServer />
                  </div>
                  <div className="printer-name">{printer.name}</div>
                  <div className="printer-status">{printer.status}</div>
                </PrinterCard>
              ))}
            </PrinterGrid>
          </Section>

          <Section>
            <div className="section-header">
              <h2>Print Activity</h2>
            </div>
            <ChartPlaceholder>
              <div style={{ textAlign: 'center' }}>
                <FaChartBar style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }} />
                <div>Print activity chart will be displayed here</div>
                <div style={{ fontSize: '12px', marginTop: '8px' }}>
                  Shows daily/weekly/monthly print job trends
                </div>
              </div>
            </ChartPlaceholder>
          </Section>
        </MainContent>

        <SidebarContent>
          <Section>
            <div className="section-header">
              <h2>Quick Actions</h2>
            </div>
            <QuickActions>
              <ActionButton onClick={() => navigate('/submit-job')}>
                <div className="action-icon">
                  <FaPrint />
                </div>
                <div className="action-text">
                  <div className="action-title">Submit Print Job</div>
                  <div className="action-description">Upload and submit a new document</div>
                </div>
              </ActionButton>

              <ActionButton onClick={() => navigate('/print-release')}>
                <div className="action-icon">
                  <FaCog />
                </div>
                <div className="action-text">
                  <div className="action-title">Release Print Jobs</div>
                  <div className="action-description">Release your pending print jobs</div>
                </div>
              </ActionButton>

              <ActionButton onClick={() => navigate('/print-job-queue')}>
                <div className="action-icon">
                  <FaFileAlt />
                </div>
                <div className="action-text">
                  <div className="action-title">View Job Queue</div>
                  <div className="action-description">Check status of all your jobs</div>
                </div>
              </ActionButton>

              <ActionButton onClick={() => navigate('/reports')}>
                <div className="action-icon">
                  <FaChartBar />
                </div>
                <div className="action-text">
                  <div className="action-title">View Reports</div>
                  <div className="action-description">Analytics and usage reports</div>
                </div>
              </ActionButton>
            </QuickActions>
          </Section>

          <Section>
            <div className="section-header">
              <h2>System Status</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Online Printers</span>
                <span style={{ color: '#27ae60', fontWeight: '500' }}>{onlinePrinters.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Offline Printers</span>
                <span style={{ color: '#e74c3c', fontWeight: '500' }}>{offlinePrinters.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Active Users</span>
                <span style={{ color: '#3498db', fontWeight: '500' }}>24</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>System Health</span>
                <span style={{ color: '#27ae60', fontWeight: '500' }}>Excellent</span>
              </div>
            </div>
          </Section>
        </SidebarContent>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default Dashboard;
