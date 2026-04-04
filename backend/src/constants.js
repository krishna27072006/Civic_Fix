export const CATEGORY_MAP = [
  { id: 'pothole', label: 'Pothole', icon: '🕳️', color: 'orange' },
  { id: 'garbage', label: 'Garbage', icon: '🗑️', color: 'red' },
  { id: 'water', label: 'Water Supply', icon: '💧', color: 'blue' },
  { id: 'streetlight', label: 'Street Light', icon: '💡', color: 'yellow' },
  { id: 'sewage', label: 'Sewage', icon: '🚰', color: 'green' },
  { id: 'encroachment', label: 'Encroachment', icon: '🏗️', color: 'purple' },
  { id: 'noise', label: 'Noise Pollution', icon: '🔊', color: 'pink' },
  { id: 'road', label: 'Road Damage', icon: '🛣️', color: 'brown' },
  { id: 'drainage', label: 'Drainage', icon: '🌊', color: 'teal' },
  { id: 'other', label: 'Other', icon: '📌', color: 'gray' }
];

export const STATUS_MAP = {
  open: { label: 'Open' },
  escalated: { label: 'Escalated' },
  resolved: { label: 'Resolved' },
  pending: { label: 'Pending' },
  progress: { label: 'In Progress' },
  awaiting_review: { label: 'Awaiting Votes' },
  unsolved: { label: 'Unsolved' }
};

export const VOTE_THRESHOLD_PERCENT = 60;
