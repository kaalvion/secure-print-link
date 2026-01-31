import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { usePrintJob } from '../context/PrintJobContext';
import {
  FaPrint,
  FaFileAlt,
  FaChartBar,
  FaCog,
  FaClock,
  FaCheckCircle,
  FaArrowRight,
  FaMapMarkerAlt
} from 'react-icons/fa';
import EmptyState from '../components/EmptyState';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-bottom: 40px;
`;

const WelcomeSection = styled(motion.div)`
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

const BentoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(180px, auto);
  gap: 24px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const GlassCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5);
  }
  
  &.span-2 { grid-column: span 2; }
  &.span-full { grid-column: 1 / -1; }
  &.row-2 { grid-row: span 2; }
  
  @media (max-width: 768px) {
    &.span-2, &.span-full { grid-column: 1; }
  }
`;

const StatValue = styled.div`
  font-size: 3.5rem;
  font-weight: 800;
  color: white;
  line-height: 1;
  margin-bottom: 4px;
  background: ${props => props.gradient || 'white'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg { color: ${props => props.iconColor || 'white'}; }
`;

const StatIconLarge = styled.div`
  position: absolute;
  right: -20px;
  bottom: -20px;
  font-size: 120px;
  opacity: 0.05;
  color: white;
  pointer-events: none;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    font-size: 1.25rem;
    color: white;
    font-weight: 700;
  }
  
  a {
    color: var(--primary);
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: gap 0.2s;
    
    &:hover {
      gap: 10px;
    }
  }
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
  
  &:hover {
    background: var(--primary);
    border-color: var(--primary);
    transform: translateY(-2px);
  }
  
  .icon-box {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  }
  
  span {
    font-weight: 600;
    font-size: 0.9rem;
  }
`;

const JobItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  margin-bottom: 12px;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
  
  .info {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(59, 130, 246, 0.1);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .text {
      h4 { color: white; margin-bottom: 4px; font-weight: 600; }
      p { color: var(--text-secondary); font-size: 0.85rem; }
    }
  }
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  
  &.pending { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
  &.printing { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
  &.completed { background: rgba(52, 211, 153, 0.2); color: #34d399; }
  &.cancelled { background: rgba(248, 113, 113, 0.2); color: #f87171; }
`;

const Dashboard = () => {
  const { user } = useUser();
  const { printJobs, getJobStatistics, printers: allPrinters } = usePrintJob();
  const navigate = useNavigate();
  const [userJobs, setUserJobs] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [stats, setStats] = useState({
    total: 0, pending: 0, released: 0, completed: 0, cancelled: 0, viewed: 0, expired: 0
  });

  useEffect(() => {
    if (printJobs && user && user.id) {
      const uJobs = printJobs.filter(job => job.userId === user.id);
      setUserJobs(uJobs);
      const jobStats = getJobStatistics(user.id);
      setStats(jobStats);
    }
    if (allPrinters) setPrinters(allPrinters);
  }, [printJobs, user, getJobStatistics, allPrinters]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const userRole = user?.unsafeMetadata?.role;
  const isUser = userRole === 'user';
  const isPrinterShop = userRole === 'printer';

  return (
    <DashboardContainer>
      <WelcomeSection
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Dashboard</h1>
        <p>
          Welcome back, {user?.fullName || user?.firstName}.
          {isUser && " Overview of your secure printing activity."}
          {isPrinterShop && " Manage your print shop operations."}
        </p>
      </WelcomeSection>

      <motion.div variants={containerVariants} initial="hidden" animate="show">
        <BentoGrid>
          {/* USER DASHBOARD */}
          {isUser && (
            <>
              {/* Main Stat Card - Total Jobs */}
              <GlassCard className="span-2" variants={itemVariants}>
                <StatLabel iconColor="#60a5fa"><FaFileAlt /> Total Documents</StatLabel>
                <StatValue gradient="linear-gradient(to right, #60a5fa, #a78bfa)">
                  {stats.total}
                </StatValue>
                <StatIconLarge><FaFileAlt /></StatIconLarge>
              </GlassCard>

              {/* Pending Jobs */}
              <GlassCard variants={itemVariants} style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                <StatLabel iconColor="#fbbf24"><FaClock /> Pending</StatLabel>
                <StatValue gradient="linear-gradient(to right, #fbbf24, #f59e0b)">
                  {stats.pending}
                </StatValue>
              </GlassCard>

              {/* Completed Jobs */}
              <GlassCard variants={itemVariants} style={{ background: 'rgba(52, 211, 153, 0.1)' }}>
                <StatLabel iconColor="#34d399"><FaCheckCircle /> Completed</StatLabel>
                <StatValue gradient="linear-gradient(to right, #34d399, #10b981)">
                  {stats.completed}
                </StatValue>
              </GlassCard>

              {/* Quick Actions for Users */}
              <GlassCard className="span-2" variants={itemVariants}>
                <SectionHeader>
                  <h3>Quick Actions</h3>
                </SectionHeader>
                <ActionGrid>
                  <ActionButton onClick={() => navigate('/submit-job')}>
                    <div className="icon-box"><FaPrint /></div>
                    <span>New Print</span>
                  </ActionButton>
                  <ActionButton onClick={() => navigate('/print-job-queue')}>
                    <div className="icon-box"><FaFileAlt /></div>
                    <span>My Jobs</span>
                  </ActionButton>
                  <ActionButton onClick={() => navigate('/shop-discovery')}>
                    <div className="icon-box"><FaMapMarkerAlt /></div>
                    <span>Find Shop</span>
                  </ActionButton>
                  <ActionButton onClick={() => navigate('/settings')}>
                    <div className="icon-box"><FaCog /></div>
                    <span>Settings</span>
                  </ActionButton>
                </ActionGrid>
              </GlassCard>

              {/* Recent Jobs List */}
              <GlassCard className="span-2 row-2" variants={itemVariants}>
                <SectionHeader>
                  <h3>My Recent Jobs</h3>
                  <a href="/print-job-queue">View All <FaArrowRight /></a>
                </SectionHeader>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {userJobs.length > 0 ? (
                    userJobs.slice(0, 4).map((job) => (
                      <JobItem key={job.id}>
                        <div className="info">
                          <div className="icon"><FaFileAlt /></div>
                          <div className="text">
                            <h4>{job.documentName}</h4>
                            <p>{formatDate(job.submittedAt)} • {job.pages} pgs</p>
                          </div>
                        </div>
                        <StatusBadge className={job.status.toLowerCase()}>
                          {job.status}
                        </StatusBadge>
                      </JobItem>
                    ))
                  ) : (
                    <EmptyState
                      type="jobs"
                      action={() => navigate('/submit-job')}
                      actionText="Submit First Job"
                    />
                  )}
                </div>
              </GlassCard>
            </>
          )}

          {/* PRINTER SHOP DASHBOARD */}
          {isPrinterShop && (
            <>
              {/* Incoming Jobs */}
              <GlassCard className="span-2" variants={itemVariants}>
                <StatLabel iconColor="#60a5fa"><FaFileAlt /> Incoming Jobs</StatLabel>
                <StatValue gradient="linear-gradient(to right, #60a5fa, #a78bfa)">
                  {printJobs.filter(j => j.status === 'pending' || j.status === 'released').length}
                </StatValue>
                <StatIconLarge><FaFileAlt /></StatIconLarge>
              </GlassCard>

              {/* Pending Release */}
              <GlassCard variants={itemVariants} style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                <StatLabel iconColor="#fbbf24"><FaClock /> Awaiting Release</StatLabel>
                <StatValue gradient="linear-gradient(to right, #fbbf24, #f59e0b)">
                  {printJobs.filter(j => j.status === 'pending').length}
                </StatValue>
              </GlassCard>

              {/* Completed Today */}
              <GlassCard variants={itemVariants} style={{ background: 'rgba(52, 211, 153, 0.1)' }}>
                <StatLabel iconColor="#34d399"><FaCheckCircle /> Completed</StatLabel>
                <StatValue gradient="linear-gradient(to right, #34d399, #10b981)">
                  {printJobs.filter(j => j.status === 'completed').length}
                </StatValue>
              </GlassCard>

              {/* Quick Actions for Printer Shop */}
              <GlassCard className="span-2" variants={itemVariants}>
                <SectionHeader>
                  <h3>Quick Actions</h3>
                </SectionHeader>
                <ActionGrid>
                  <ActionButton onClick={() => navigate('/print-release')}>
                    <div className="icon-box"><FaCheckCircle /></div>
                    <span>Release Print</span>
                  </ActionButton>
                  <ActionButton onClick={() => navigate('/print-job-queue')}>
                    <div className="icon-box"><FaFileAlt /></div>
                    <span>Job Queue</span>
                  </ActionButton>
                  <ActionButton onClick={() => navigate('/printer-management')}>
                    <div className="icon-box"><FaCog /></div>
                    <span>Printers</span>
                  </ActionButton>
                  <ActionButton onClick={() => navigate('/reports')}>
                    <div className="icon-box"><FaChartBar /></div>
                    <span>Analytics</span>
                  </ActionButton>
                </ActionGrid>
              </GlassCard>

              {/* Printer Status */}
              <GlassCard className="span-2" variants={itemVariants}>
                <SectionHeader>
                  <h3>Printer Status</h3>
                  <a href="/printer-management"><FaCog /></a>
                </SectionHeader>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  {printers.slice(0, 3).map((printer, idx) => (
                    <div key={idx} style={{
                      padding: '12px',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.08)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{printer.name}</span>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          background: printer.status === 'online' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)',
                          color: printer.status === 'online' ? '#34d399' : '#f87171'
                        }}>
                          {printer.status}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {printer.location}
                      </div>
                    </div>
                  ))}
                  {printers.length === 0 && (
                    <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '24px' }}>
                      No printers configured yet
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Recent Jobs for Printer Shop */}
              <GlassCard className="span-2 row-2" variants={itemVariants}>
                <SectionHeader>
                  <h3>Recent Print Requests</h3>
                  <a href="/print-job-queue">View All <FaArrowRight /></a>
                </SectionHeader>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {printJobs.length > 0 ? (
                    printJobs.slice(0, 4).map((job) => (
                      <JobItem key={job.id}>
                        <div className="info">
                          <div className="icon"><FaFileAlt /></div>
                          <div className="text">
                            <h4>{job.documentName}</h4>
                            <p>{job.userName} • {formatDate(job.submittedAt)} • {job.pages} pgs</p>
                          </div>
                        </div>
                        <StatusBadge className={job.status.toLowerCase()}>
                          {job.status}
                        </StatusBadge>
                      </JobItem>
                    ))
                  ) : (
                    <EmptyState
                      type="jobs"
                      actionText="No print requests yet"
                    />
                  )}
                </div>
              </GlassCard>
            </>
          )}

        </BentoGrid>
      </motion.div>
    </DashboardContainer>
  );
};

export default Dashboard;
