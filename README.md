<div align="center">
  <img src="https://storage.googleapis.com/runable-templates/cli-uploads%2F9MrLBVTEUeq60SqngeSTfyS3pydkVotl%2FuT25Dghw0isu40RKV5K6c%2Fcivicfix_banner.png" alt="CivicFix Banner" width="100%" />
</div>

<br/>

<div align="center">

[![Status](https://img.shields.io/badge/Status-Active-14b8a6?style=for-the-badge&labelColor=0f172a)](/)
[![License](https://img.shields.io/badge/License-MIT-8b5cf6?style=for-the-badge&labelColor=0f172a)](/)
[![Node](https://img.shields.io/badge/Node.js-18+-14b8a6?style=for-the-badge&logo=nodedotjs&logoColor=white&labelColor=0f172a)](/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-8b5cf6?style=for-the-badge&logo=postgresql&logoColor=white&labelColor=0f172a)](/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-CDN-14b8a6?style=for-the-badge&logo=tailwindcss&logoColor=white&labelColor=0f172a)](/)

</div>

<br/>

<div align="center">
  <h3>🏙️ &nbsp; Report · Upvote · Track · Verify · Resolve &nbsp; 🏙️</h3>
  <p>A civic issue management platform that gives citizens a voice<br/>and gives administrators the accountability tools to actually fix things.</p>
</div>

---

<br/>

## 🔴 &nbsp; The Problem

<table>
<tr>
<td width="60%">

India's cities lose billions every year to unresolved civic failures. Potholes damage vehicles. Overflowing garbage breeds disease. Water outages disrupt families for days. Broken streetlights make roads dangerous at night.

**The issues are everywhere. The accountability isn't.**

Citizens have no way to formally report problems, track what happens, or confirm a fix was actually done. Reports get lost in WhatsApp groups or government portals that nobody reads.

</td>
<td width="40%" align="center">

```
🕳️  Potholes        → Accidents
🗑️  Garbage piles   → Disease  
💧  Water outages   → Disruption
💡  Broken lights   → Unsafe roads
🚧  No accountability → Nothing changes
```

</td>
</tr>
</table>

<br/>

## ⚡ &nbsp; The Solution

CivicFix is a **full-stack civic issue reporting and resolution platform**. Citizens report problems with photos and GPS. The community upvotes what matters most. Admins own the resolution with timestamped updates. And when a fix is submitted, **the community votes to confirm it actually happened** — or sends it back.

> Every issue has a lifecycle. Every fix has proof. Nothing disappears into a void.

<br/>

---

## 👥 &nbsp; Two Sides, One Platform

<div align="center">

|  | 👤 &nbsp; Citizen | 🛡️ &nbsp; Administrator |
|---|---|---|
| **Report** | Submit issues with photo, GPS, category & urgency | Receive and triage all incoming reports |
| **Amplify** | Upvote to push critical issues to the top | See community heat scores to prioritize |
| **Track** | Real-time status updates on every report | Post progress updates with ETAs |
| **Verify** | Vote on whether a fix actually worked | Submit photo proof of resolution |
| **Privacy** | Report anonymously if preferred | Export full issue data |
| **Alerts** | Get notified on progress, escalations, resolutions | Monitor live dashboard stats |

</div>

<br/>

---

## 🚀 &nbsp; Core Features

<br/>

### 🔥 &nbsp; Heat Score System
Every issue gets a dynamic heat score `0–100` based on upvotes and community engagement. The feed sorts by heat — not just recency. High heat triggers escalation. The loudest problems get heard first.

<br/>

### 📍 &nbsp; GPS-Powered Issue Reporting
Reports are geotagged with latitude, longitude, area, and city. Citizens can grant browser location for automatic tagging. Every issue is pinned to a real place.

<br/>

### 📋 &nbsp; Full Lifecycle Tracking

```
  open  ──►  escalated        ──►  awaiting_review  ──►  resolved
             in progress  ──►  awaiting_review  ──►  unsolved (reopened)
```

Every status change is logged with a timestamp. Citizens always know exactly where their report stands.

<br/>

### ✅ &nbsp; Community Verification
When admins upload proof of a fix, the issue enters `awaiting_review`. Everyone who upvoted that issue gets notified and votes — **satisfied** or **unsatisfied**. Rejected fixes resurface automatically. No rubber-stamping.

<br/>

### 🔔 &nbsp; Granular Notifications
8 notification types: `progress` · `upvote` · `escalated` · `resolved` · `nearby` · `review` · `submitted` · `vote_request`

Each user controls exactly which ones they receive. No spam, no missing critical updates.

<br/>

### 🛡️ &nbsp; Role-Based Access Control
`citizen` and `admin` roles enforced at every layer. Admin dashboard is fully gated — JWT + role verified server-side on all protected routes. Regular users get a clean access-denied screen.

<br/>

### 🌙 &nbsp; Dark Mode
Full dark/light theme support across every page. Respects system preference.

<br/>

---

## 🛠️ &nbsp; Tech Stack

<br/>

<div align="center">

### Backend

| | Technology | Role |
|---|---|---|
| ![Node](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white) | **Node.js + Express.js** | REST API server & routing |
| ![PG](https://img.shields.io/badge/-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white) | **PostgreSQL + pg** | Primary database & client |
| ![JWT](https://img.shields.io/badge/-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white) | **jsonwebtoken** | Auth token generation & verification |
| 🔒 | **bcryptjs** | Password hashing |
| 🛡️ | **helmet** | HTTP security headers |
| 🌐 | **cors** | Cross-origin request handling |
| ✅ | **zod** | Runtime schema validation |
| 📝 | **morgan** | HTTP request logging |
| ⚙️ | **dotenv** | Environment configuration |

<br/>

### Frontend

| | Technology | Role |
|---|---|---|
| ![HTML](https://img.shields.io/badge/-HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) | **HTML5 + Vanilla JS** | Structure & interactivity |
| ![Tailwind](https://img.shields.io/badge/-Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) | **Tailwind CSS** | Utility-first styling + dark mode |
| 📍 | **Browser Geolocation API** | GPS-based issue location |

</div>

<br/>

---

## 🗄️ &nbsp; Database Schema

8 tables. Full civic issue lifecycle covered.

```sql
users                        →  Citizens & admins — roles, location, notification prefs
issues                       →  Core reports — category, urgency, status, heat score, GPS
issue_updates                →  Admin progress logs with ETAs per issue
issue_resolution_requests    →  Proof submissions for community review
issue_upvotes                →  One upvote per user per issue (composite PK)
issue_reviews                →  Star ratings + text reviews on resolved issues
issue_votes                  →  Satisfied / unsatisfied votes on fix attempts
notifications                →  Per-user in-app notification feed with JSONB metadata
```

<br/>

**Categories &nbsp;→&nbsp;**
`pothole` &nbsp;·&nbsp; `garbage` &nbsp;·&nbsp; `water` &nbsp;·&nbsp; `streetlight` &nbsp;·&nbsp; `sewage` &nbsp;·&nbsp; `encroachment` &nbsp;·&nbsp; `noise` &nbsp;·&nbsp; `road` &nbsp;·&nbsp; `drainage` &nbsp;·&nbsp; `other`

**Urgency &nbsp;→&nbsp;** `low` &nbsp;·&nbsp; `medium` &nbsp;·&nbsp; `high`

**Statuses &nbsp;→&nbsp;** `open` &nbsp;·&nbsp; `escalated` &nbsp;·&nbsp; `progress` &nbsp;·&nbsp; `awaiting_review` &nbsp;·&nbsp; `resolved` &nbsp;·&nbsp; `unsolved`

<br/>

---

## 📁 &nbsp; Project Structure

```
civicfix/
│
├── 📄  admin.html              # Admin dashboard — live stats, issue management
├── 📄  auth.html               # Sign in / Register with GPS location opt-in
├── 📁  assets/                 # CSS, JS, images
│
└── 📁  backend/
    ├── ⚙️  .env.example        # Environment variable template
    └── 📁  db/
        ├── 🗄️  schema.sql      # Full PostgreSQL schema (8 tables)
        └── 🌱  seed.sql        # Dev seed — sample users, issues, votes
```

<br/>

---

## 🔮 &nbsp; What's Next

```
◻  Map view with clustered issue pins
◻  Mobile PWA with offline support
◻  Multi-city rollout beyond Bengaluru
◻  Web Push notifications
◻  Public REST API for third-party integrations
◻  Resolution time analytics dashboard
◻  SMS alerts for non-smartphone users
```




