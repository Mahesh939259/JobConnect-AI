export const formatSalary = (min, max) => {
  if (!min && !max) return 'Best in Industry';

  const toLPA = (amount) => {
    if (!amount) return '0';
    if (amount >= 100000) {
      return (amount / 100000).toFixed(1).replace(/\.0$/, '');
    }
    return amount.toLocaleString('en-IN');
  };

  if (min && max) {
    if (min >= 100000) {
      return `₹${toLPA(min)} - ₹${toLPA(max)} LPA`;
    }
    return `₹${min.toLocaleString('en-IN')} - ₹${max.toLocaleString('en-IN')}`;
  }

  if (min) return `₹${toLPA(min)}+ LPA`;
  return `Up to ₹${toLPA(max)} LPA`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Applied':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Under Review':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Shortlisted':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Interview':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Selected':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'Rejected':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'Active':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Closed':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};
