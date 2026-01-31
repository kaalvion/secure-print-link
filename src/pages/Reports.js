import React from 'react';
import styled from 'styled-components';
import { usePrintJob } from '../context/PrintJobContext';
import { motion } from 'framer-motion';
import {
  FaChartBar,
  FaPrint,
  FaUsers,
  FaCalendarAlt,
  FaArrowUp,
} from 'react-icons/fa';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 40px;
`;

const Header = styled(motion.div)`
  margin-bottom: 32px;
  h1 {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 8px;
    background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  p { color: var(--text-secondary); font-size: 1.1rem; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
  
  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 24px;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.05);
  }
  
  .icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: ${props => props.bg || 'rgba(59, 130, 246, 0.1)'};
    color: ${props => props.color || 'var(--primary)'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-bottom: 16px;
  }
  
  .val {
    font-size: 2.5rem;
    font-weight: 700;
    color: white;
    line-height: 1;
    margin-bottom: 8px;
  }
  
  .label { color: var(--text-secondary); font-size: 0.9rem; font-weight: 500; }
  
  .trend {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.85rem;
    margin-top: 12px;
    
    &.up { color: var(--success); }
    &.down { color: var(--error); }
  }
`;

const ChartCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
  
  h3 { color: white; margin-bottom: 8px; }
  p { color: var(--text-secondary); margin-bottom: 24px; font-size: 0.9rem; }
  
  .placeholder {
    height: 200px;
    border: 2px dashed rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    gap: 16px;
    
    svg { font-size: 48px; opacity: 0.2; }
  }
`;

const Reports = () => {
  const { getJobStatistics } = usePrintJob();
  const stats = getJobStatistics();


  return (
    <Container>
      <Header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1>Analytics Overview</h1>
        <p>Real-time insights into system performance</p>
      </Header>

      <Grid>
        <StatCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="icon"><FaChartBar /></div>
          <div className="val">{stats.total}</div>
          <div className="label">Total Jobs</div>
          <div className="trend up"><FaArrowUp /> 12% vs last week</div>
        </StatCard>

        <StatCard bg="rgba(16, 185, 129, 0.1)" color="#10b981" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="icon"><FaPrint /></div>
          <div className="val">${stats.totalCost || '0.00'}</div>
          <div className="label">Cost Savings</div>
          <div className="trend up"><FaArrowUp /> 8% efficiency</div>
        </StatCard>

        <StatCard bg="rgba(245, 158, 11, 0.1)" color="#f59e0b" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="icon"><FaUsers /></div>
          <div className="val">{stats.completed}</div>
          <div className="label">Completed Jobs</div>
          <div className="trend up"><FaArrowUp /> 98% success rate</div>
        </StatCard>

        <StatCard bg="rgba(239, 68, 68, 0.1)" color="#ef4444" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="icon"><FaCalendarAlt /></div>
          <div className="val">24h</div>
          <div className="label">System Uptime</div>
          <div className="trend up"><FaArrowUp /> 100% stable</div>
        </StatCard>
      </Grid>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <ChartCard initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <h3>Print Volume Trends</h3>
          <p>Daily job submission vs release rates</p>
          <div className="placeholder">
            <FaChartBar />
            <span>Interactive Chart Visualization Placeholder</span>
          </div>
        </ChartCard>

        <ChartCard initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <h3>Department Usage</h3>
          <p>Cost distribution by team</p>
          <div className="placeholder">
            <FaUsers />
            <span>Pie Chart Placeholder</span>
          </div>
        </ChartCard>
      </div>

    </Container>
  );
};

export default Reports;
