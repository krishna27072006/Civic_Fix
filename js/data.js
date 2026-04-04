const CATEGORIES = [];

const STATUSES = {
  open: { label: 'Open', color: 'bg-sky-100 text-sky-700', dot: 'bg-sky-500' },
  escalated: { label: 'Escalated', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  resolved: { label: 'Resolved', color: 'bg-teal-100 text-teal-700', dot: 'bg-teal-500' },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  progress: { label: 'In Progress', color: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
  awaiting_review: { label: 'Awaiting Votes', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  unsolved: { label: 'Unsolved', color: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500' }
};

const ISSUES = [];

const MONTHLY_DATA = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  reported: [38, 52, 61, 73, 68, 84, 79, 91, 87, 95, 88, 102],
  resolved: [22, 35, 44, 58, 49, 67, 60, 72, 70, 81, 74, 89]
};

const ANALYTICS = {
  total: 0,
  resolved: 0,
  escalated: 0,
  pending: 0,
  thisWeek: 0,
  avgResolutionDays: 0,
  topAreas: [],
  categoryBreakdown: [],
  resolutionStatus: []
};

const DEFAULT_NOTIFICATIONS = [];

function normalizeStoredUser(user) {
  if (!user) return null;
  const name = user.name || [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email?.split('@')[0] || 'User';
  return {
    ...user,
    uid: user.uid || user.id || null,
    id: user.id || user.uid || null,
    name,
    avatar: user.avatar || user.avatarText || name.charAt(0).toUpperCase(),
    isAdmin: typeof user.isAdmin === 'boolean' ? user.isAdmin : user.role === 'admin'
  };
}

let currentUser = normalizeStoredUser(JSON.parse(localStorage.getItem('civicUser') || 'null'));
let darkMode = localStorage.getItem('darkMode') === 'true';
let userLocation = JSON.parse(localStorage.getItem('userLocation') || 'null');
let upvotedIssues = new Set(JSON.parse(localStorage.getItem('upvoted') || '[]'));
let userReportedIds = JSON.parse(localStorage.getItem('userReported') || '[]');
let userNotifs = JSON.parse(localStorage.getItem('userNotifs') || JSON.stringify(DEFAULT_NOTIFICATIONS));

function syncNotifications(notifications) {
  userNotifs = Array.isArray(notifications) ? notifications : [];
  saveNotifs();
  return userNotifs;
}

function saveUpvoted() {
  localStorage.setItem('upvoted', JSON.stringify([...upvotedIssues]));
}

function saveNotifs() {
  localStorage.setItem('userNotifs', JSON.stringify(userNotifs));
}

function saveReported() {
  localStorage.setItem('userReported', JSON.stringify(userReportedIds));
}

function saveLocation(location) {
  userLocation = location;
  localStorage.setItem('userLocation', JSON.stringify(location));
}

function unreadCount() {
  return userNotifs.filter((notification) => !notification.read).length;
}

function syncCurrentUser(user) {
  currentUser = user ? normalizeStoredUser(user) : null;
  if (currentUser) {
    localStorage.setItem('civicUser', JSON.stringify(currentUser));
  } else {
    localStorage.removeItem('civicUser');
  }
  return currentUser;
}

function syncIssues(nextIssues) {
  ISSUES.length = 0;
  ISSUES.push(...nextIssues);
  syncUpvotedIssuesFromIssues(nextIssues);
}

function mergeIssue(issue) {
  const index = ISSUES.findIndex((item) => item.id === issue.id);
  if (index >= 0) {
    ISSUES[index] = issue;
  } else {
    ISSUES.push(issue);
  }

  if (issue.viewer?.hasUpvoted) {
    upvotedIssues.add(issue.id);
  } else if (issue.viewer?.hasUpvoted === false) {
    upvotedIssues.delete(issue.id);
  }

  saveUpvoted();
  return issue;
}

function syncUpvotedIssuesFromIssues(issues) {
  const ids = issues.filter((issue) => issue.viewer?.hasUpvoted).map((issue) => issue.id);
  if (ids.length) {
    upvotedIssues = new Set(ids);
    saveUpvoted();
  }
}

function buildIssueAnalytics(issues = ISSUES) {
  const total = issues.length;
  const resolved = issues.filter((issue) => issue.status === 'resolved').length;
  const escalated = issues.filter((issue) => issue.status === 'escalated').length;
  const pending = issues.filter((issue) => issue.status !== 'resolved').length;
  const avgResolutionDaysRaw = resolved
    ? issues
        .filter((issue) => issue.status === 'resolved')
        .reduce((sum, issue) => sum + Number(issue.daysOpen || 0), 0) / resolved
    : 0;

  const topAreas = Object.entries(
    issues.reduce((acc, issue) => {
      const key = issue.area || issue.city || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const categoryBreakdown = Object.entries(
    issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const resolutionStatus = Object.entries(
    issues.reduce((acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([status, count]) => ({
      label: STATUSES[status]?.label || status,
      value: count,
      color:
        {
          resolved: '#14b8a6',
          progress: '#8b5cf6',
          escalated: '#f43f5e',
          open: '#0ea5e9',
          awaiting_review: '#f59e0b',
          unsolved: '#ef4444',
          pending: '#eab308'
        }[status] || '#94a3b8'
    }))
    .sort((a, b) => b.value - a.value);

  return {
    total,
    resolved,
    escalated,
    pending,
    avgResolutionDays: Number(avgResolutionDaysRaw.toFixed(1)),
    topAreas,
    categoryBreakdown,
    resolutionStatus
  };
}

function buildMonthlyReportSeries(issues = ISSUES, monthCount = 6) {
  const now = new Date();
  const months = Array.from({ length: monthCount }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1 - index), 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('en-US', { month: 'short' }),
      year: date.getFullYear()
    };
  });

  const series = months.reduce((acc, month) => {
    acc.reported[month.key] = 0;
    acc.resolved[month.key] = 0;
    return acc;
  }, { reported: {}, resolved: {} });

  issues.forEach((issue) => {
    if (issue.reportedAt) {
      const reportedDate = new Date(issue.reportedAt);
      if (!Number.isNaN(reportedDate.getTime())) {
        const key = `${reportedDate.getFullYear()}-${String(reportedDate.getMonth() + 1).padStart(2, '0')}`;
        if (key in series.reported) {
          series.reported[key] += 1;
        }
      }
    }

    const resolvedSource = issue.resolvedAt || (issue.status === 'resolved' ? issue.updatedAt : null);
    if (resolvedSource) {
      const resolvedDate = new Date(resolvedSource);
      if (!Number.isNaN(resolvedDate.getTime())) {
        const key = `${resolvedDate.getFullYear()}-${String(resolvedDate.getMonth() + 1).padStart(2, '0')}`;
        if (key in series.resolved) {
          series.resolved[key] += 1;
        }
      }
    }
  });

  return {
    labels: months.map((month) => month.label),
    reported: months.map((month) => series.reported[month.key]),
    resolved: months.map((month) => series.resolved[month.key]),
    rangeLabel:
      monthCount === 12
        ? `${months[0].year} - ${months[months.length - 1].year}`
        : `${months[0].label} ${months[0].year} - ${months[months.length - 1].label} ${months[months.length - 1].year}`
  };
}

function getHeatColor(score) {
  if (score >= 80) return { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200', hex: '#ef4444' };
  if (score >= 60) return { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200', hex: '#f97316' };
  if (score >= 40) return { bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-200', hex: '#eab308' };
  return { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200', hex: '#22c55e' };
}

function getCategoryInfo(id) {
  return CATEGORIES.find((category) => category.id === id) || CATEGORIES[CATEGORIES.length - 1] || { id: 'other', label: 'Other', icon: '📌', color: 'gray' };
}

function timeAgo(dateStr) {
  const diff = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return 'Today';
  if (diff === 1) return '1 day ago';
  return `${diff} days ago`;
}

function getStars(n) {
  return Array.from(
    { length: 5 },
    (_, i) => `<svg class="w-3.5 h-3.5 ${i < n ? 'text-yellow-400' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`
  ).join('');
}

function findSimilarIssues(location, category) {
  const locLower = String(location || '').toLowerCase().trim();
  const locTokens = locLower
    .split(/[\s,.-]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);
  return ISSUES.filter((issue) => {
    const issueLocation = String(issue.location || '').toLowerCase();
    const issueArea = String(issue.area || '').toLowerCase();
    const issueTitle = String(issue.title || '').toLowerCase();
    const locMatch =
      locTokens.some((token) => issueLocation.includes(token) || issueArea.includes(token) || issueTitle.includes(token)) ||
      issueLocation.includes(locLower.split(',')[0].trim()) ||
      (issueArea && locLower.includes(issueArea));
    return locMatch && issue.category === category && issue.status !== 'resolved';
  });
}

function getVoteTally(issueId) {
  const issue = ISSUES.find((item) => item.id === issueId);
  return issue?.voteSummary || { satisfied: 0, notSatisfied: 0, total: 0, satisfactionPercent: 0, thresholdPercent: 60 };
}

function hasUserVoted(issueId) {
  const issue = ISSUES.find((item) => item.id === issueId);
  return Boolean(issue?.viewer?.hasVoted);
}

document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.toggle('dark', darkMode);
});
