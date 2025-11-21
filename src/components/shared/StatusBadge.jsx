import React from 'react';

const StatusBadge = ({ status }) => {
  const styles = {
    waiting: 'bg-gray-100 text-gray-700 border-gray-200',
    in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    completed: 'bg-green-100 text-green-700 border-green-200',
    active: 'bg-blue-100 text-blue-700 border-blue-200',
    expired: 'bg-red-100 text-red-700 border-red-200'
  };

  const labels = {
    waiting: 'Waiting',
    in_progress: 'In Progress',
    completed: 'Completed',
    active: 'Active',
    expired: 'Expired'
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.waiting}`}>
      {labels[status] || status}
    </span>
  );
};

export default StatusBadge;
