// =============================================
// CIVICFIX V2 — COMPONENTS
// =============================================

// ── Toast ────────────────────────────────────────────────────────────
const Toast = {
  container: null,
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(this.container);
    }
  },
  show(message, type = 'success', duration = 3000) {
    this.init();
    const icons = {
      success: `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
      error:   `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
      info:    `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
      warning: `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>`,
    };
    const colors = { success:'bg-green-500', error:'bg-red-500', info:'bg-blue-500', warning:'bg-amber-500' };
    const t = document.createElement('div');
    t.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl text-white shadow-2xl ${colors[type]} transform translate-x-full transition-all duration-300 ease-out min-w-[260px] max-w-sm`;
    t.innerHTML = `${icons[type]}<span class="text-sm font-medium">${message}</span>`;
    this.container.appendChild(t);
    requestAnimationFrame(() => requestAnimationFrame(() => t.classList.remove('translate-x-full')));
    setTimeout(() => { t.classList.add('translate-x-full','opacity-0'); setTimeout(() => t.remove(), 300); }, duration);
  }
};

// ── Issue Card ───────────────────────────────────────────────────────
function IssueCard(issue, featured = false) {
  const heat   = getHeatColor(issue.heatScore);
  const status = STATUSES[issue.status];
  const cat    = getCategoryInfo(issue.category);
  const upvoted= upvotedIssues.has(issue.id);
  const isNew  = issue.isUserReported;

  return `
    <div class="issue-card group cursor-pointer ${featured ? 'sm:col-span-2' : ''}" 
         onclick="window.location.href='issue.html?id=${issue.id}'" data-id="${issue.id}">
      <div class="relative overflow-hidden rounded-xl mb-4 ${featured ? 'h-52' : 'h-44'}">
        <img src="${issue.image}" alt="${issue.title}" 
             class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
             onerror="this.src='https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=60'"/>
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <!-- Heat Badge -->
        <div class="absolute top-3 right-3">
          <div class="flex items-center gap-1 ${heat.bg} text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg ${issue.heatScore>=80?'heat-pulse':''}">
            🔥 ${issue.heatScore}
          </div>
        </div>
        <!-- Status -->
        <div class="absolute top-3 left-3 flex gap-1 flex-wrap">
          <span class="flex items-center gap-1 bg-white/90 backdrop-blur text-xs font-semibold px-2 py-1 rounded-full ${status.color}">
            <span class="w-1.5 h-1.5 rounded-full ${status.dot} inline-block"></span>${status.label}
          </span>
          ${isNew ? '<span class="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">NEW</span>' : ''}
        </div>
        <div class="absolute bottom-3 left-3 text-white text-xs font-medium opacity-90">
          ${cat.icon} ${cat.label} · ${timeAgo(issue.reportedAt)}
        </div>
      </div>
      <div class="px-1">
        <h3 class="font-semibold text-gray-900 dark:text-white text-sm leading-snug mb-1 line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-indigo-400 transition-colors">${issue.title}</h3>
        <div class="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs mb-3">
          <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
          <span class="truncate">${issue.location}</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button onclick="event.stopPropagation();toggleUpvote(${issue.id},this)"
                    class="flex items-center gap-1.5 text-xs font-medium transition-all duration-200 ${upvoted?'text-violet-600 dark:text-violet-400':'text-gray-500 dark:text-gray-400 hover:text-violet-600'}">
              <svg class="w-4 h-4 ${upvoted?'scale-110':''}" fill="${upvoted?'currentColor':'none'}" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
              </svg>
              <span data-upvote-count="${issue.id}">${issue.upvotes}</span>
            </button>
            <div class="flex items-center gap-1 text-xs ${heat.text} font-semibold ${heat.light} px-2 py-0.5 rounded-full">🔥 ${issue.heatScore}</div>
          </div>
          <div class="flex items-center gap-2">
            ${issue.progressUpdates?.length > 0 ? `<span class="text-[10px] text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-950/30 px-1.5 py-0.5 rounded">📢 Update</span>` : ''}
            <span class="text-xs text-gray-400 dark:text-gray-500">${issue.daysOpen}d</span>
          </div>
        </div>
      </div>
    </div>`;
}

// ── Skeleton ─────────────────────────────────────────────────────────
function SkeletonCard() {
  return `<div class="issue-card animate-pulse"><div class="bg-gray-200 dark:bg-gray-700 h-44 rounded-xl mb-4"></div><div class="space-y-2"><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div><div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div><div class="flex gap-2 mt-3"><div class="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div><div class="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div></div></div></div>`;
}

function EmptyState(msg = 'No issues found', sub = 'Try adjusting your filters or report a new issue!') {
  return `<div class="col-span-full flex flex-col items-center justify-center py-24 text-center">
    <div class="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
      <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    </div>
    <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">${msg}</h3>
    <p class="text-sm text-gray-500 max-w-xs">${sub}</p>
    <a href="report.html" class="mt-4 btn-primary">Report an Issue</a>
  </div>`;
}

// ── Monthly Bar Chart (animated, gradient, tooltips) ─────────────────
function renderMiniBarChart(containerId, labels, data1, data2, label1='Reported', label2='Resolved') {
  const el = document.getElementById(containerId);
  if (!el) return;

  const max    = Math.max(...data1, ...data2, 1);
  const W      = 340, H = 120;
  const n      = labels.length;
  const GROUP  = Math.floor(W / n);
  const BAR_W  = Math.max(8, Math.floor(GROUP * 0.3));
  const GAP    = Math.max(4, Math.floor(GROUP * 0.06));
  const BOTTOM = H;

  // Build SVG defs (gradients)
  const defs = `<defs>
    <linearGradient id="grad-rep" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#818cf8"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
    <linearGradient id="grad-res" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#2dd4bf"/>
      <stop offset="100%" stop-color="#14b8a6"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.12)"/>
    </filter>
  </defs>`;

  const bars = labels.map((lbl, i) => {
    const offset = i * GROUP + (GROUP - BAR_W*2 - GAP) / 2;
    const x1 = offset;
    const x2 = offset + BAR_W + GAP;
    const h1 = Math.max(4, (data1[i] / max) * (BOTTOM - 14));
    const h2 = Math.max(4, (data2[i] / max) * (BOTTOM - 14));
    const y1 = BOTTOM - h1;
    const y2 = BOTTOM - h2;
    const delay1 = i * 0.08;
    const delay2 = i * 0.08 + 0.04;

    return `
      <g class="bar-group" data-rep="${data1[i]}" data-res="${data2[i]}" data-label="${lbl}">
        <rect x="${x1}" y="${y1}" width="${BAR_W}" height="${h1}" rx="4" fill="url(#grad-rep)"
          filter="url(#shadow)" opacity="0.9"
          style="transform-origin:${x1 + BAR_W/2}px ${BOTTOM}px;transform:scaleY(0);animation:barGrowUp 0.6s cubic-bezier(0.34,1.2,0.64,1) ${delay1}s forwards"/>
        <rect x="${x2}" y="${y2}" width="${BAR_W}" height="${h2}" rx="4" fill="url(#grad-res)"
          filter="url(#shadow)" opacity="0.9"
          style="transform-origin:${x2 + BAR_W/2}px ${BOTTOM}px;transform:scaleY(0);animation:barGrowUp 0.6s cubic-bezier(0.34,1.2,0.64,1) ${delay2}s forwards"/>
        <!-- Value labels on hover -->
        <text x="${x1 + BAR_W/2}" y="${y1 - 4}" text-anchor="middle" font-size="9" font-weight="700"
              fill="#6366f1" class="bar-val-1" opacity="0.8">${data1[i]}</text>
        <text x="${x2 + BAR_W/2}" y="${y2 - 4}" text-anchor="middle" font-size="9" font-weight="700"
              fill="#14b8a6" class="bar-val-2" opacity="0.8">${data2[i]}</text>
        <text x="${offset + BAR_W + GAP/2}" y="${BOTTOM + 14}" text-anchor="middle"
              font-size="9" font-weight="600" fill="#9ca3af">${lbl}</text>
      </g>`;
  }).join('');

  // Y-axis grid lines
  const gridLines = [0.25, 0.5, 0.75, 1].map(t => {
    const y = BOTTOM - t * (BOTTOM - 14);
    const val = Math.round(t * max);
    return `
      <line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,4" class="dark-grid"/>
      <text x="-4" y="${y+3}" text-anchor="end" font-size="8" fill="#d1d5db">${val}</text>`;
  }).join('');

  el.innerHTML = `
    <style>
      @keyframes barGrowUp {
        from { transform: scaleY(0); opacity:0.4; }
        to   { transform: scaleY(1); opacity:0.9; }
      }
    </style>
    <div class="flex items-center gap-4 mb-3 text-xs text-gray-500 dark:text-gray-400">
      <span class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-sm inline-block" style="background:linear-gradient(135deg,#818cf8,#6366f1)"></span>
        <span class="font-medium">${label1}</span>
      </span>
      <span class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-sm inline-block" style="background:linear-gradient(135deg,#2dd4bf,#14b8a6)"></span>
        <span class="font-medium">${label2}</span>
      </span>
    </div>
    <div style="overflow:hidden;border-radius:8px;">
      <svg viewBox="-24 0 ${W+28} ${BOTTOM+22}" class="w-full" style="overflow:visible">
        ${defs}
        ${gridLines}
        ${bars}
      </svg>
    </div>`;
}

// ── Animated Donut Chart ──────────────────────────────────────────────
function renderDonutChart(svgId, legendId, data) {
  const total = data.reduce((s,d) => s + d.value, 0);
  const r = 50, cx = 70, cy = 70, circ = 2 * Math.PI * r;
  let off = 0;

  const segs = data.map((d, i) => {
    const dash  = (d.value / total) * circ;
    const delay = i * 0.12;
    const seg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${d.color}" stroke-width="22"
      stroke-dasharray="${dash} ${circ}"
      stroke-dashoffset="${-(off)}"
      stroke-linecap="round"
      style="transform:rotate(-90deg);transform-origin:${cx}px ${cy}px;
             stroke-dashoffset:${circ - off};
             transition:stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1) ${delay}s,
                        stroke-width 0.2s ease;
             animation:donutFill 1.2s cubic-bezier(0.4,0,0.2,1) ${delay}s both"/>`;
    off += dash;
    return seg;
  }).join('');

  const svgEl = document.getElementById(svgId);
  if (svgEl) {
    svgEl.innerHTML = `
      <defs>
        <style>
          @keyframes donutFill {
            from { opacity: 0; stroke-width: 8; }
            to   { opacity: 1; stroke-width: 22; }
          }
        </style>
      </defs>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#f1f5f9" stroke-width="22"/>
      ${segs}
      <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="20" font-weight="800" fill="#111827">${total}</text>
      <text x="${cx}" y="${cy + 10}" text-anchor="middle" font-size="9" font-weight="600" fill="#9ca3af" letter-spacing="1">TOTAL</text>`;
  }

  const legEl = document.getElementById(legendId);
  if (legEl) {
    legEl.innerHTML = data.map((d, i) => `
      <div class="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-default"
           style="animation:fadeInUp 0.4s ease ${i*0.08}s both">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm" style="background:${d.color};box-shadow:0 0 6px ${d.color}60"></span>
          <span class="text-xs text-gray-600 dark:text-gray-400 font-medium">${d.label}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="h-1.5 rounded-full" style="width:${Math.round(d.value/total*48)}px;background:${d.color};opacity:0.4"></div>
          <span class="text-xs font-bold text-gray-700 dark:text-gray-300">${d.value}</span>
          <span class="text-[10px] text-gray-400">${Math.round(d.value/total*100)}%</span>
        </div>
      </div>`).join('');
  }
}

// ── Navbar ────────────────────────────────────────────────────────────
async function refreshNotificationState(activePage = '') {
  if (!currentUser || !window.CivicAPI?.fetchNotifications || window.__civicfixNotifRefreshInFlight) {
    return;
  }

  window.__civicfixNotifRefreshInFlight = true;
  try {
    const notifications = await window.CivicAPI.fetchNotifications();
    const changed =
      notifications.length !== userNotifs.length ||
      notifications.some((notification, index) => {
        const existing = userNotifs[index];
        return !existing || existing.id !== notification.id || existing.read !== notification.read;
      });

    if (changed) {
      syncNotifications(notifications);
      renderNavbar(activePage, true);
      renderBottomNav(activePage);
    }
  } catch (_error) {
  } finally {
    window.__civicfixNotifRefreshInFlight = false;
  }
}

function renderNavbar(activePage = '', skipNotificationRefresh = false) {
  const pages = [
    { href:'index.html',    label:'Feed',    icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { href:'map.html',      label:'Map',     icon:'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
    { href:'report.html',   label:'Report',  icon:'M12 4v16m8-8H4', special:true },
    ...(currentUser?.isAdmin ? [{ href:'admin.html', label:'Admin', icon:'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }] : []),
  ];
  const notifCount = unreadCount();

  document.getElementById('navbar').innerHTML = `
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <a href="index.html" class="flex items-center gap-2.5 group">
            <div class="w-8 h-8 bg-gradient-to-br from-violet-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-violet-200 transition-shadow">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <span class="font-bold text-gray-900 dark:text-white text-lg tracking-tight">Civic<span class="text-teal-500">Fix</span></span>
          </a>
          <!-- Desktop nav -->
          <div class="hidden md:flex items-center gap-1">
            ${pages.map(p => p.special ? `
              <a href="${p.href}" class="mx-2 flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-teal-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-violet-200/50 transition-all hover:-translate-y-0.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="${p.icon}"/></svg>${p.label}
              </a>` : `
              <a href="${p.href}" class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${activePage===p.href?'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400':'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${p.icon}"/></svg>${p.label}
              </a>`).join('')}
          </div>
          <!-- Right -->
          <div class="flex items-center gap-2">
            <!-- Dark mode -->
            <button onclick="toggleDarkMode()" class="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <svg id="sun-icon" class="w-5 h-5 ${darkMode?'hidden':''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
              <svg id="moon-icon" class="w-5 h-5 ${darkMode?'':'hidden'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
            </button>
            <!-- Notifications -->
            <a href="notifications.html" class="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${activePage==='notifications.html'?'bg-violet-50 dark:bg-violet-900/30 text-violet-600':''}">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              ${notifCount > 0 ? `<span class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">${notifCount}</span>` : ''}
            </a>
            <!-- User -->
            ${currentUser ? `
              <a href="profile.html" class="flex items-center gap-2 hover:opacity-80 transition-opacity ${activePage==='profile.html'?'ring-2 ring-violet-500 rounded-xl':''}">
                <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow">
                  ${currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span class="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-300">${currentUser.name}</span>
              </a>
            ` : `<a href="auth.html" class="text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-teal-600 transition-colors px-3 py-2 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/30">Sign in</a>`}
          </div>
          <!-- Mobile menu btn -->
          <button class="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" onclick="toggleMobileMenu()">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
      </div>
      <!-- Mobile menu -->
      <div id="mobile-menu" class="hidden md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2">
        ${pages.map(p => `<a href="${p.href}" class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium ${activePage===p.href?'text-violet-600 bg-violet-50 dark:bg-violet-900/30':'text-gray-600 dark:text-gray-400'} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${p.icon}"/></svg>${p.label}</a>`).join('')}
        <a href="notifications.html" class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
          Notifications ${notifCount>0?`<span class="ml-auto w-5 h-5 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center">${notifCount}</span>`:''}
        </a>
        ${currentUser ? `<a href="profile.html" class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400"><div class="w-4 h-4 rounded bg-violet-500 flex items-center justify-center text-white text-[8px] font-bold">${currentUser.name.charAt(0)}</div>Profile</a>` : ''}
      </div>
    </nav>`;

  if (!skipNotificationRefresh) {
    refreshNotificationState(activePage);
  }
}

function toggleMobileMenu() {
  document.getElementById('mobile-menu').classList.toggle('hidden');
}

function toggleDarkMode() {
  darkMode = !darkMode;
  localStorage.setItem('darkMode', darkMode);
  document.documentElement.classList.toggle('dark', darkMode);
  document.getElementById('sun-icon').classList.toggle('hidden', darkMode);
  document.getElementById('moon-icon').classList.toggle('hidden', !darkMode);
}

function logout() {
  try {
    currentUser = null;
    if (window.CivicAPI) {
      window.CivicAPI.clearSession();
    }
    localStorage.removeItem('userNotifs');
    localStorage.removeItem('upvoted');
    localStorage.removeItem('userReported');
    localStorage.removeItem('satisfactionVotes');
    sessionStorage.removeItem('anonVoterUid');
    userNotifs = [];
    upvotedIssues = new Set();
    userReportedIds = [];
    Toast.show('Signed out', 'info');
    setTimeout(() => window.location.href = 'auth.html', 400);
  } catch (error) {
    console.error('Logout failed', error);
    Toast.show('Could not sign out cleanly. Redirecting…', 'warning');
    setTimeout(() => window.location.href = 'auth.html', 400);
  }
}

async function toggleUpvote(id, btn) {
  if (!currentUser) {
    Toast.show('Sign in to upvote issues', 'info');
    setTimeout(() => {
      window.location.href = 'auth.html';
    }, 500);
    return;
  }

  const issue = ISSUES.find(i => i.id === id);
  if (!issue) return;

  const countEl = document.querySelector(`[data-upvote-count="${id}"]`);
  const icon = btn.querySelector('svg');
  const shouldUpvote = !upvotedIssues.has(id);

  try {
    if (window.CivicAPI) {
      const updatedIssue = await window.CivicAPI.toggleIssueUpvote(id, shouldUpvote);
      Object.assign(issue, updatedIssue);
    } else {
      issue.upvotes += shouldUpvote ? 1 : -1;
    }

    if (shouldUpvote) {
      upvotedIssues.add(id);
      btn.classList.add('text-violet-600','dark:text-violet-400');
      btn.classList.remove('text-gray-500','dark:text-gray-400');
      icon.setAttribute('fill','currentColor');
      icon.classList.add('scale-125'); setTimeout(()=>icon.classList.remove('scale-125'),200);
      Toast.show('Issue upvoted!','success',1500);
    } else {
      upvotedIssues.delete(id);
      btn.classList.remove('text-violet-600','dark:text-violet-400');
      btn.classList.add('text-gray-500','dark:text-gray-400');
      icon.setAttribute('fill','none');
      Toast.show('Upvote removed','info',1500);
    }

    if (countEl) countEl.textContent = issue.upvotes;
    saveUpvoted();
  } catch (error) {
    Toast.show(error.message || 'Could not update upvote', 'error');
  }
}

// ── Bottom Mobile Nav ─────────────────────────────────────────────────
function renderBottomNav(active='') {
  const notifCount = unreadCount();
  const el = document.getElementById('bottom-nav');
  if (!el) return;
  const items = [
    { href:'index.html',        icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label:'Feed' },
    { href:'map.html',          icon:'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7', label:'Map' },
    { href:'report.html', special:true, label:'Report' },
    { href:'notifications.html',icon:'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', label:'Alerts', badge: notifCount },
    { href:'profile.html',      icon:'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label:'Profile' },
  ];
  el.innerHTML = items.map(item => item.special ? `
    <a href="${item.href}" class="flex flex-col items-center gap-0.5">
      <div class="w-12 h-12 bg-gradient-to-br from-violet-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-violet-900 -mt-5">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
      </div>
      <span class="text-[10px] font-semibold text-gray-400">${item.label}</span>
    </a>` : `
    <a href="${item.href}" class="flex flex-col items-center gap-0.5 relative ${active===item.href?'text-violet-600 dark:text-violet-400':'text-gray-400'}">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${item.icon}"/></svg>
      ${item.badge > 0 ? `<span class="absolute -top-0.5 right-0 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">${item.badge}</span>` : ''}
      <span class="text-[10px] font-semibold">${item.label}</span>
    </a>`).join('');
}
