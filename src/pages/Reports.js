import React from 'react';
import styled from 'styled-components';
import { usePrintJob } from '../context/PrintJobContext';
import { 
  FaChartBar, 
  FaPrint, 
  FaUsers, 
  FaCalendarAlt
} from 'react-icons/fa';

const ReportsContainer = styled.div`
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
  
  .stat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
    
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
  }
  
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
`;

const ChartPlaceholder = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  text-align: center;
  
  .chart-icon {
    font-size: 48px;
    color: #3498db;
    margin-bottom: 16px;
    opacity: 0.3;
  }
  
  .chart-title {
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 8px;
  }
  
  .chart-description {
    color: #7f8c8d;
    font-size: 14px;
  }
`;

const Reports = () => {
  const { getJobStatistics } = usePrintJob();
  const stats = getJobStatistics();

  return (
    <ReportsContainer>
      <PageHeader>
        <h1>Reports & Analytics</h1>
        <p>Comprehensive insights into print usage and system performance</p>
      </PageHeader>

      <StatsGrid>
        <StatCard color="#3498db">
          <div className="stat-header">
            <div className="stat-icon">
              <FaChartBar />
            </div>
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Print Jobs</div>
        </StatCard>

        <StatCard color="#27ae60">
          <div className="stat-header">
            <div className="stat-icon">
              <FaPrint />
            </div>
          </div>
          <div className="stat-value">${stats.totalCost}</div>
          <div className="stat-label">Total Cost</div>
        </StatCard>

        <StatCard color="#f39c12">
          <div className="stat-header">
            <div className="stat-icon">
              <FaUsers />
            </div>
          </div>
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed Jobs</div>
        </StatCard>

        <StatCard color="#e74c3c">
          <div className="stat-header">
            <div className="stat-icon">
              <FaCalendarAlt />
            </div>
          </div>
          <div className="stat-value">24</div>
          <div className="stat-label">Active Users</div>
        </StatCard>
      </StatsGrid>

      <ChartPlaceholder>
        <FaChartBar className="chart-icon" />
        <div className="chart-title">Print Usage Over Time</div>
        <div className="chart-description">
          Daily, weekly, and monthly print job trends and patterns
        </div>
      </ChartPlaceholder>

      <ChartPlaceholder>
        <FaUsers className="chart-icon" />
        <div className="chart-title">Department Usage Breakdown</div>
        <div className="chart-description">
          Print volume and cost analysis by department and user
        </div>
      </ChartPlaceholder>

      <ChartPlaceholder>
        <FaPrint className="chart-icon" />
        <div className="chart-title">Printer Performance Metrics</div>
        <div className="chart-description">
          Uptime, efficiency, and maintenance statistics for all printers
        </div>
      </ChartPlaceholder>
    </ReportsContainer>
  );
};

export default Reports;
