const API_BASE_URL =
  window.CIVICFIX_API_BASE_URL ||
  localStorage.getItem('civicApiBaseUrl') ||
  'http://localhost:4000/api';
const AUTH_TOKEN_KEY = 'civicToken';

function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('civicUser') || 'null');
  } catch (_error) {
    return null;
  }
}

function normalizeUser(user) {
  if (!user) return null;
  const name = user.name || [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email?.split('@')[0] || 'User';
  return {
    ...user,
    uid: user.id,
    avatar: user.avatarText || name.charAt(0).toUpperCase(),
    isAdmin: user.role === 'admin'
  };
}

function normalizeIssue(issue) {
  const progressUpdates = issue.progressUpdates || [];
  const reviews = issue.reviews || [];
  const storedUser = getStoredUser();
  const viewer = issue.viewer || {};
  const timeline = [
    { event: 'Reported', date: formatShortDate(issue.reportedAt), done: true },
    { event: 'Under Review', date: progressUpdates[0] ? formatShortDate(progressUpdates[0].createdAt) : null, done: progressUpdates.length > 0 || issue.status !== 'open' },
    { event: 'In Progress', date: issue.status === 'progress' || issue.status === 'escalated' || issue.status === 'awaiting_review' || issue.status === 'resolved' || issue.status === 'unsolved' ? formatShortDate(progressUpdates[progressUpdates.length - 1]?.createdAt || issue.updatedAt || issue.reportedAt) : null, done: ['progress', 'escalated', 'awaiting_review', 'resolved', 'unsolved'].includes(issue.status) },
    { event: 'Resolved', date: issue.resolvedAt ? formatShortDate(issue.resolvedAt) : null, done: issue.status === 'resolved' }
  ];

  return {
    ...issue,
    image: issue.imageUrl,
    proofPhoto: issue.resolutionRequest?.proofImageUrl || null,
    upvotes: issue.upvotes ?? 0,
    comments: issue.commentsCount ?? 0,
    daysOpen: issue.daysOpen ?? 0,
    reportedBy: issue.reportedBy?.name || 'Anonymous',
    reportedByUid: issue.reportedBy?.id || null,
    reportedAt: issue.reportedAt,
    progressUpdates: progressUpdates.map((update) => ({
      date: formatShortDate(update.createdAt),
      text: update.message,
      admin: update.adminName
    })),
    reviews: reviews.map((review) => ({
      user: review.userName,
      rating: review.rating,
      text: review.reviewText,
      date: formatShortDate(review.createdAt)
    })),
    timeline,
    isUserReported: issue.reportedBy?.id ? issue.reportedBy.id === storedUser?.id : false,
    viewer: {
      hasUpvoted: Boolean(viewer.hasUpvoted),
      hasVoted: Boolean(viewer.hasVoted)
    }
  };
}

function formatShortDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    const error = new Error(payload.message || 'Request failed');
    error.status = response.status;
    error.data = payload.data;
    throw error;
  }

  return payload.data;
}

async function login(credentials) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  persistSession(data);
  return data;
}

async function register(payload) {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  persistSession(data);
  return data;
}

function persistSession(data) {
  const user = normalizeUser(data.user);
  localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  localStorage.setItem('civicUser', JSON.stringify(user));
  if (typeof syncCurrentUser === 'function') {
    syncCurrentUser(user);
  }
}

function clearSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem('civicUser');
  if (typeof syncCurrentUser === 'function') {
    syncCurrentUser(null);
  }
}

async function fetchCurrentUser() {
  const user = await apiRequest('/auth/me');
  const normalized = normalizeUser(user);
  localStorage.setItem('civicUser', JSON.stringify(normalized));
  if (typeof syncCurrentUser === 'function') {
    syncCurrentUser(normalized);
  }
  return normalized;
}

async function fetchIssues(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value);
    }
  });
  const data = await apiRequest(`/issues${search.toString() ? `?${search.toString()}` : ''}`);
  return data.items.map(normalizeIssue);
}

async function fetchCategories() {
  return apiRequest('/meta/categories');
}

async function fetchIssue(issueId) {
  const data = await apiRequest(`/issues/${issueId}`);
  return normalizeIssue(data);
}

async function createIssue(payload) {
  const data = await apiRequest('/issues', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return normalizeIssue(data);
}

async function toggleIssueUpvote(issueId, shouldUpvote) {
  const data = await apiRequest(`/issues/${issueId}/upvote`, {
    method: shouldUpvote ? 'POST' : 'DELETE'
  });
  return normalizeIssue(data);
}

async function voteOnIssue(issueId, satisfied) {
  const data = await apiRequest(`/issues/${issueId}/votes`, {
    method: 'POST',
    body: JSON.stringify({ satisfied })
  });
  return {
    decision: data.decision,
    issue: normalizeIssue(data.issue)
  };
}

async function markIssueNotFixed(issueId) {
  const data = await apiRequest(`/issues/${issueId}/not-fixed`, {
    method: 'POST'
  });
  return normalizeIssue(data);
}

async function submitIssueReview(issueId, payload) {
  const data = await apiRequest(`/issues/${issueId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return normalizeIssue(data);
}

async function fetchNotifications() {
  return apiRequest('/notifications');
}

async function markNotificationRead(notificationId) {
  return apiRequest(`/notifications/${notificationId}/read`, { method: 'POST' });
}

async function markNotificationsReadAll() {
  return apiRequest('/notifications/read-all', { method: 'POST' });
}

async function fetchProfileSummary() {
  return apiRequest('/profile/me/summary');
}

async function fetchProfileIssues(type = 'reported') {
  return apiRequest(`/profile/me/issues?type=${encodeURIComponent(type)}`).then((items) => items.map(normalizeIssue));
}

async function updateProfile(payload) {
  const data = await apiRequest('/profile/me', {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
  const user = normalizeUser(data);
  localStorage.setItem('civicUser', JSON.stringify(user));
  return user;
}

async function fetchAdminAnalytics() {
  return apiRequest('/admin/analytics');
}

async function fetchAdminIssues(limit = 100) {
  return apiRequest(`/admin/issues?limit=${limit}`).then((items) => items.map(normalizeIssue));
}

async function postAdminUpdate(issueId, payload) {
  const data = await apiRequest(`/admin/issues/${issueId}/updates`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return normalizeIssue(data);
}

async function submitResolveRequest(issueId, payload) {
  const data = await apiRequest(`/admin/issues/${issueId}/resolve-request`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return normalizeIssue(data);
}

window.CivicAPI = {
  API_BASE_URL,
  getToken,
  login,
  register,
  fetchIssues,
  fetchCategories,
  fetchIssue,
  createIssue,
  toggleIssueUpvote,
  voteOnIssue,
  markIssueNotFixed,
  submitIssueReview,
  fetchNotifications,
  markNotificationRead,
  markNotificationsReadAll,
  fetchProfileSummary,
  fetchProfileIssues,
  updateProfile,
  fetchAdminAnalytics,
  fetchAdminIssues,
  postAdminUpdate,
  submitResolveRequest,
  fetchCurrentUser,
  clearSession,
  normalizeUser
};
