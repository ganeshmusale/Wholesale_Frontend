import React from 'react';

export default function StatCard({ title, value, footer, icon: Icon, color = 'purple' }) {
  return (
    <div className="card stat-card">
      <div className="stat-header">
        <span>{title}</span>
        <div className={`stat-icon-bg ${color}`}>
          {Icon && <Icon size={20} />}
        </div>
      </div>
      <div className="stat-value">{value}</div>
      {footer && <div className="stat-footer">{footer}</div>}
    </div>
  );
}
