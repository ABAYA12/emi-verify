import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, icon, color = 'primary', subtitle, trend }) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-header">
        <div className="stat-card-icon">
          {icon}
        </div>
        {trend && (
          <div className={`stat-card-trend ${trend.direction}`}>
            {trend.direction === 'up' ? '↗' : '↘'} {trend.value}%
          </div>
        )}
      </div>
      
      <div className="stat-card-body">
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-title">{title}</div>
        {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
};

export default StatCard;
