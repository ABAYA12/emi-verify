import React from 'react';
import './ChartCard.css';

const ChartCard = ({ title, children, subtitle }) => {
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3 className="chart-card-title">{title}</h3>
        {subtitle && <p className="chart-card-subtitle">{subtitle}</p>}
      </div>
      <div className="chart-card-body">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
