// =============================================
// CIVICFIX V2 — DATA STORE
// =============================================

const CATEGORIES = [
  { id: 'pothole',      label: 'Pothole',        icon: '🕳️', color: 'orange' },
  { id: 'garbage',      label: 'Garbage',         icon: '🗑️', color: 'red'    },
  { id: 'water',        label: 'Water Supply',    icon: '💧', color: 'blue'   },
  { id: 'streetlight',  label: 'Street Light',    icon: '💡', color: 'yellow' },
  { id: 'sewage',       label: 'Sewage',          icon: '🚰', color: 'green'  },
  { id: 'encroachment', label: 'Encroachment',    icon: '🏗️', color: 'purple' },
  { id: 'noise',        label: 'Noise Pollution', icon: '🔊', color: 'pink'   },
  { id: 'road',         label: 'Road Damage',     icon: '🛣️', color: 'brown'  },
  { id: 'drainage',     label: 'Drainage',        icon: '🌊', color: 'teal'   },
  { id: 'other',        label: 'Other',           icon: '📌', color: 'gray'   },
];

const STATUSES = {
  open:      { label: 'Open',      color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500'   },
  escalated: { label: 'Escalated', color: 'bg-orange-100 text-orange-700',dot: 'bg-orange-500' },
  resolved:  { label: 'Resolved',  color: 'bg-green-100 text-green-700',  dot: 'bg-green-500'  },
  pending:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-700',dot: 'bg-yellow-500' },
  progress:  { label: 'In Progress',color:'bg-purple-100 text-purple-700',dot: 'bg-purple-500' },
};

const ISSUES = [
  {
    id: 1,
    title: 'Deep pothole near MG Road junction',
    description: 'A massive pothole has developed at the MG Road junction causing serious accidents. Multiple two-wheelers have fallen. The pit is nearly 2 feet deep and 3 feet wide.',
    category: 'pothole',
    location: 'MG Road, Bengaluru',
    area: 'MG Road',
    lat: 12.9716, lng: 77.5946,
    upvotes: 342, heatScore: 94,
    status: 'escalated', daysOpen: 8,
    reportedBy: 'Rahul Sharma', reportedByUid: 'u1',
    reportedAt: '2026-03-27',
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&q=80',
    timeline: [
      { event: 'Reported',     date: '27 Mar 2026', done: true  },
      { event: 'Under Review', date: '28 Mar 2026', done: true  },
      { event: 'Escalated',    date: '30 Mar 2026', done: true  },
      { event: 'Resolved',     date: null,          done: false },
    ],
    progressUpdates: [
      { date: '29 Mar 2026', text: 'BBMP team has been notified. Inspection scheduled.', admin: 'Admin Priya' },
      { date: '31 Mar 2026', text: 'Material procurement in progress. Work to start within 48hrs.', admin: 'Admin Priya' },
    ],
    reviews: [],
    comments: 12,
  },
  {
    id: 2,
    title: 'Overflowing garbage dump — Health hazard',
    description: 'The garbage collection point near Koramangala 5th Block has not been cleared in 10 days. Garbage is overflowing onto the road. Foul smell, stray dogs, and rats are a major health concern.',
    category: 'garbage',
    location: 'Koramangala 5th Block, Bengaluru',
    area: 'Koramangala',
    lat: 12.9352, lng: 77.6245,
    upvotes: 218, heatScore: 87,
    status: 'escalated', daysOpen: 10,
    reportedBy: 'Priya Nair', reportedByUid: 'u2',
    reportedAt: '2026-03-25',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80',
    timeline: [
      { event: 'Reported',     date: '25 Mar 2026', done: true  },
      { event: 'Under Review', date: '26 Mar 2026', done: true  },
      { event: 'Escalated',    date: '29 Mar 2026', done: true  },
      { event: 'Resolved',     date: null,          done: false },
    ],
    progressUpdates: [
      { date: '27 Mar 2026', text: 'Sanitation department alerted. Extra vehicle dispatched.', admin: 'Admin Kumar' },
    ],
    reviews: [],
    comments: 7,
  },
  {
    id: 3,
    title: 'No water supply for 5 days — Indiranagar',
    description: 'Residents of Indiranagar 12th Main have been without water supply for 5 consecutive days. BBMP and BWSSB have not responded despite multiple complaints.',
    category: 'water',
    location: 'Indiranagar 12th Main, Bengaluru',
    area: 'Indiranagar',
    lat: 12.9784, lng: 77.6408,
    upvotes: 195, heatScore: 82,
    status: 'progress', daysOpen: 5,
    reportedBy: 'Vikram Patel', reportedByUid: 'u3',
    reportedAt: '2026-03-30',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    timeline: [
      { event: 'Reported',     date: '30 Mar 2026', done: true  },
      { event: 'Under Review', date: '31 Mar 2026', done: true  },
      { event: 'In Progress',  date: '02 Apr 2026', done: true  },
      { event: 'Resolved',     date: null,          done: false },
    ],
    progressUpdates: [
      { date: '01 Apr 2026', text: 'Pipe burst identified at 12th Main junction. Repair crew deployed.', admin: 'Admin Priya' },
      { date: '02 Apr 2026', text: 'Partial supply restored to 60% households. Full fix by tomorrow.', admin: 'Admin Priya' },
    ],
    reviews: [],
    comments: 23,
  },
  {
    id: 4,
    title: 'Street lights not working — Whitefield',
    description: '12 consecutive street lights on Whitefield Main Road have been non-functional for 3 weeks. This has led to increased theft and accidents in the area.',
    category: 'streetlight',
    location: 'Whitefield Main Rd, Bengaluru',
    area: 'Whitefield',
    lat: 12.9698, lng: 77.7499,
    upvotes: 143, heatScore: 71,
    status: 'open', daysOpen: 21,
    reportedBy: 'Anjali Desai', reportedByUid: 'u4',
    reportedAt: '2026-03-14',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80',
    timeline: [
      { event: 'Reported',     date: '14 Mar 2026', done: true  },
      { event: 'Under Review', date: '16 Mar 2026', done: true  },
      { event: 'In Progress',  date: null,          done: false },
      { event: 'Resolved',     date: null,          done: false },
    ],
    progressUpdates: [],
    reviews: [],
    comments: 5,
  },
  {
    id: 5,
    title: 'Sewage overflow — HSR Layout Sector 2',
    description: 'Sewage is overflowing from a broken manhole at HSR Layout Sector 2. The stench is unbearable and children are getting sick.',
    category: 'sewage',
    location: 'HSR Layout Sector 2, Bengaluru',
    area: 'HSR Layout',
    lat: 12.9116, lng: 77.6389,
    upvotes: 127, heatScore: 68,
    status: 'pending', daysOpen: 14,
    reportedBy: 'Suresh Kumar', reportedByUid: 'u5',
    reportedAt: '2026-03-21',
    image: 'https://images.unsplash.com/photo-1611280078779-5ca59f0a3de0?w=600&q=80',
    timeline: [
      { event: 'Reported',     date: '21 Mar 2026', done: true  },
      { event: 'Under Review', date: '23 Mar 2026', done: true  },
      { event: 'In Progress',  date: null,          done: false },
      { event: 'Resolved',     date: null,          done: false },
    ],
    progressUpdates: [],
    reviews: [],
    comments: 9,
  },
  {
    id: 6,
    title: 'Illegal encroachment on footpath',
    description: 'A commercial establishment has illegally encroached on the public footpath in JP Nagar. Pedestrians are forced to walk on the road.',
    category: 'encroachment',
    location: 'JP Nagar 3rd Phase, Bengaluru',
    area: 'JP Nagar',
    lat: 12.9099, lng: 77.5827,
    upvotes: 89, heatScore: 54,
    status: 'open', daysOpen: 30,
    reportedBy: 'Meera Iyer', reportedByUid: 'u6',
    reportedAt: '2026-03-05',
    image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&q=80',
    timeline: [
      { event: 'Reported',     date: '05 Mar 2026', done: true  },
      { event: 'Under Review', date: null,          done: false },
      { event: 'In Progress',  date: null,          done: false },
      { event: 'Resolved',     date: null,          done: false },
    ],
    progressUpdates: [],
    reviews: [],
    comments: 3,
  },
  {
    id: 7,
    title: 'Road completely broken — Electronic City',
    description: 'The service road near Electronic City flyover is completely broken with deep craters. Heavy vehicles passing constantly make it worse.',
    category: 'road',
    location: 'Electronic City, Bengaluru',
    area: 'Electronic City',
    lat: 12.8458, lng: 77.6692,
    upvotes: 276, heatScore: 91,
    status: 'escalated', daysOpen: 15,
    reportedBy: 'Arun Krishnamurthy', reportedByUid: 'u7',
    reportedAt: '2026-03-20',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80',
    timeline: [
      { event: 'Reported',     date: '20 Mar 2026', done: true  },
      { event: 'Under Review', date: '21 Mar 2026', done: true  },
      { event: 'Escalated',    date: '25 Mar 2026', done: true  },
      { event: 'Resolved',     date: null,          done: false },
    ],
    progressUpdates: [
      { date: '26 Mar 2026', text: 'BBMP Executive Engineer inspected site. Work order issued.', admin: 'Admin Kumar' },
    ],
    reviews: [],
    comments: 18,
  },
  {
    id: 8,
    title: 'Pothole on Sarjapur Road — Fixed!',
    description: 'The major pothole that was reported on Sarjapur Road has finally been fixed. BBMP workers came within 3 days and properly patched the road.',
    category: 'pothole',
    location: 'Sarjapur Road, Bengaluru',
    area: 'Sarjapur',
    lat: 12.9010, lng: 77.6779,
    upvotes: 67, heatScore: 28,
    status: 'resolved', daysOpen: 3,
    reportedBy: 'Kavya Reddy', reportedByUid: 'u8',
    reportedAt: '2026-03-31',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80',
    timeline: [
      { event: 'Reported',     date: '31 Mar 2026', done: true },
      { event: 'Under Review', date: '01 Apr 2026', done: true },
      { event: 'In Progress',  date: '02 Apr 2026', done: true },
      { event: 'Resolved',     date: '03 Apr 2026', done: true },
    ],
    progressUpdates: [
      { date: '01 Apr 2026', text: 'Crew assigned. Repair scheduled for tomorrow morning.', admin: 'Admin Priya' },
      { date: '02 Apr 2026', text: 'Road patched successfully. Quality check passed.', admin: 'Admin Priya' },
    ],
    reviews: [
      { user: 'Kavya R.', rating: 5, text: 'Amazing response time! Fixed perfectly.', date: '04 Apr 2026' },
      { user: 'Ravi M.',  rating: 4, text: 'Good job, took 3 days but well done.', date: '04 Apr 2026' },
    ],
    comments: 4,
  },
  {
    id: 9,
    title: 'Waterlogging near Koramangala BDA complex',
    description: 'Heavy waterlogging near BDA complex after every rain. Drainage is completely clogged. Cars have broken down and people cannot walk.',
    category: 'drainage',
    location: 'Koramangala BDA Complex, Bengaluru',
    area: 'Koramangala',
    lat: 12.9330, lng: 77.6220,
    upvotes: 156, heatScore: 79,
    status: 'open', daysOpen: 6,
    reportedBy: 'Sneha Rao', reportedByUid: 'u9',
    reportedAt: '2026-03-29',
    image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&q=80',
    timeline: [
      { event: 'Reported',     date: '29 Mar 2026', done: true  },
      { event: 'Under Review', date: '30 Mar 2026', done: true  },
      { event: 'In Progress',  date: null,          done: false },
      { event: 'Resolved',     date: null,          done: false },
    ],
    progressUpdates: [],
    reviews: [],
    comments: 11,
  },
  {
    id: 10,
    title: 'Noise pollution from construction — Night hours',
    description: 'Construction work is going on continuously after 10 PM near Indiranagar. Violating noise pollution norms. Children and elderly severely affected.',
    category: 'noise',
    location: 'Indiranagar 100 Feet Road, Bengaluru',
    area: 'Indiranagar',
    lat: 12.9760, lng: 77.6387,
    upvotes: 98, heatScore: 62,
    status: 'open', daysOpen: 4,
    reportedBy: 'Deepak Sharma', reportedByUid: 'u10',
    reportedAt: '2026-04-01',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80',
    timeline: [
      { event: 'Reported',     date: '01 Apr 2026', done: true  },
      { event: 'Under Review', date: null,          done: false },
      { event: 'In Progress',  date: null,          done: false },
      { event: 'Resolved',     date: null,          done: false },
    ],
    progressUpdates: [],
    reviews: [],
    comments: 6,
  },
];

// Weekly trend data for charts
const WEEKLY_DATA = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  reported: [8, 12, 7, 15, 10, 18, 14],
  resolved: [3, 5, 4, 8, 6, 9, 7],
};

const MONTHLY_DATA = {
  labels:   ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  reported: [38,  52,  61,  73,  68,  84,  79,  91,  87,  95,  88,  102],
  resolved: [22,  35,  44,  58,  49,  67,  60,  72,  70,  81,  74,  89],
};

const ANALYTICS = {
  total: 128, resolved: 45, escalated: 31, pending: 52,
  thisWeek: 23, avgResolutionDays: 6.2,
  topAreas: [
    { area: 'Koramangala',    count: 28 },
    { area: 'Indiranagar',    count: 22 },
    { area: 'Electronic City',count: 19 },
    { area: 'Whitefield',     count: 17 },
    { area: 'HSR Layout',     count: 14 },
    { area: 'JP Nagar',       count: 10 },
  ],
  categoryBreakdown: [
    { category: 'Pothole',     count: 45, color: '#f43f5e' },
    { category: 'Garbage',     count: 30, color: '#f97316' },
    { category: 'Water',       count: 20, color: '#0ea5e9' },
    { category: 'Street Light',count: 15, color: '#eab308' },
    { category: 'Sewage',      count: 10, color: '#14b8a6' },
    { category: 'Other',       count: 8,  color: '#8b5cf6' },
  ],
  resolutionStatus: [
    { label: 'Resolved',    value: 45, color: '#14b8a6' },
    { label: 'In Progress', value: 31, color: '#8b5cf6' },
    { label: 'Escalated',   value: 31, color: '#f43f5e' },
    { label: 'Open',        value: 21, color: '#0ea5e9' },
  ],
};

// Sample notifications
const NOTIFICATIONS_STORE = [
  { id: 1, type: 'progress',  icon: '🔧', title: 'Progress update on your issue',   body: 'BBMP team has been notified for "Deep pothole near MG Road"',         time: '2 hrs ago',  read: false, issueId: 1 },
  { id: 2, type: 'upvote',    icon: '👍', title: 'Your issue got 10 new upvotes!',   body: '"No water supply" now has 195 upvotes',                              time: '5 hrs ago',  read: false, issueId: 3 },
  { id: 3, type: 'escalated', icon: '⚠️', title: 'Issue escalated',                  body: '"Overflowing garbage dump" has been escalated to authorities',       time: '1 day ago',  read: true,  issueId: 2 },
  { id: 4, type: 'resolved',  icon: '✅', title: 'Issue resolved near you!',         body: '"Pothole on Sarjapur Road" has been fixed',                          time: '2 days ago', read: true,  issueId: 8 },
  { id: 5, type: 'nearby',    icon: '📍', title: 'New issue reported near you',      body: '"Waterlogging near Koramangala BDA" — 0.3km away',                   time: '2 days ago', read: true,  issueId: 9 },
  { id: 6, type: 'review',    icon: '⭐', title: 'Share your experience',            body: 'The pothole near Sarjapur was fixed. How was it?',                   time: '3 days ago', read: true,  issueId: 8 },
  { id: 7, type: 'progress',  icon: '🔧', title: 'Work started on water issue',      body: 'Pipe burst identified. Repair crew deployed for Indiranagar issue', time: '3 days ago', read: true,  issueId: 3 },
];

// ─── Persistent state ───────────────────────────────────────────────
let upvotedIssues  = new Set(JSON.parse(localStorage.getItem('upvoted') || '[]'));
let currentUser    = JSON.parse(localStorage.getItem('civicUser') || 'null');
let darkMode       = localStorage.getItem('darkMode') === 'true';
let userLocation   = JSON.parse(localStorage.getItem('userLocation') || 'null');
let userNotifs     = JSON.parse(localStorage.getItem('userNotifs') || JSON.stringify(NOTIFICATIONS_STORE));
let userReportedIds= JSON.parse(localStorage.getItem('userReported') || '[]');

function saveUpvoted()   { localStorage.setItem('upvoted',      JSON.stringify([...upvotedIssues])); }
function saveNotifs()    { localStorage.setItem('userNotifs',   JSON.stringify(userNotifs)); }
function saveReported()  { localStorage.setItem('userReported', JSON.stringify(userReportedIds)); }
function saveLocation(l) { userLocation = l; localStorage.setItem('userLocation', JSON.stringify(l)); }

function unreadCount()   { return userNotifs.filter(n => !n.read).length; }

// ─── Helpers ────────────────────────────────────────────────────────
function getHeatColor(score) {
  if (score >= 80) return { bg:'bg-red-500',    text:'text-red-600',    light:'bg-red-50 dark:bg-red-950/30',    border:'border-red-200',    hex:'#ef4444' };
  if (score >= 60) return { bg:'bg-orange-500', text:'text-orange-600', light:'bg-orange-50 dark:bg-orange-950/30',border:'border-orange-200',hex:'#f97316' };
  if (score >= 40) return { bg:'bg-yellow-500', text:'text-yellow-600', light:'bg-yellow-50 dark:bg-yellow-950/30',border:'border-yellow-200',hex:'#eab308' };
  return               { bg:'bg-green-500',  text:'text-green-600',  light:'bg-green-50 dark:bg-green-950/30',  border:'border-green-200',  hex:'#22c55e' };
}
function getCategoryInfo(id) { return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1]; }
function timeAgo(dateStr) {
  const diff = Math.floor((new Date() - new Date(dateStr)) / (1000*60*60*24));
  if (diff === 0) return 'Today';
  if (diff === 1) return '1 day ago';
  return `${diff} days ago`;
}
function getStars(n) {
  return Array.from({length:5}, (_,i) => `<svg class="w-3.5 h-3.5 ${i<n?'text-yellow-400':'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`).join('');
}

// Duplicate detection
function findSimilarIssues(location, category) {
  const locLower = location.toLowerCase();
  return ISSUES.filter(issue => {
    const locMatch = issue.location.toLowerCase().includes(locLower.split(',')[0].trim()) ||
                     locLower.includes(issue.area?.toLowerCase() || '');
    const catMatch = issue.category === category;
    return locMatch && catMatch && issue.status !== 'resolved';
  });
}

// Add a new reported issue to the live array
function addNewIssue(issueData) {
  const newId = Math.max(...ISSUES.map(i=>i.id)) + 1;
  const newIssue = {
    id: newId,
    title: issueData.title,
    description: issueData.description,
    category: issueData.category,
    location: issueData.location,
    area: issueData.location.split(',')[0].trim(),
    lat: issueData.lat || 12.9716,
    lng: issueData.lng || 77.5946,
    upvotes: 1,
    heatScore: 25,
    status: 'open',
    daysOpen: 0,
    reportedBy: currentUser?.name || 'Anonymous',
    reportedByUid: currentUser?.uid || 'guest',
    reportedAt: new Date().toISOString().split('T')[0],
    image: issueData.imageUrl || 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80',
    timeline: [
      { event: 'Reported',     date: new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}), done: true  },
      { event: 'Under Review', date: null, done: false },
      { event: 'In Progress',  date: null, done: false },
      { event: 'Resolved',     date: null, done: false },
    ],
    progressUpdates: [],
    reviews: [],
    comments: 0,
    isUserReported: true,
  };
  ISSUES.unshift(newIssue);
  upvotedIssues.add(newId);
  saveUpvoted();
  // Track in user reported list
  userReportedIds.unshift(newId);
  saveReported();
  // Add notification
  userNotifs.unshift({
    id: Date.now(), type: 'submitted', icon: '📢',
    title: 'Issue submitted successfully!',
    body: `"${newIssue.title}" is now live and tracking.`,
    time: 'Just now', read: false, issueId: newId
  });
  saveNotifs();
  // Save to localStorage so it persists
  localStorage.setItem('civicIssues', JSON.stringify(ISSUES));
  return newIssue;
}

// Load persisted user issues on boot
(function loadPersistedIssues() {
  const saved = localStorage.getItem('civicIssues');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      parsed.filter(p => p.isUserReported).forEach(issue => {
        if (!ISSUES.find(i => i.id === issue.id)) ISSUES.unshift(issue);
      });
    } catch(e) {}
  }
})();

// Init dark mode
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.toggle('dark', darkMode);
});
