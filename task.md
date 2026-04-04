# CivicFix V2 — Task Plan

## New Features
1. **Profile Page** - reported issues, stats, upvoted issues, settings
2. **Location on Login** - detect & save user location, show nearby issues
3. **Duplicate Detection** - while reporting, search same location+category → suggest upvote
4. **Reported issue appears in All Issues + Nearby** - after submitting
5. **User Analytics Page** - graphs + pie charts for users (not just admin)
6. **Admin: Progress Button** - form to post progress updates on issues
7. **Admin: Completion Review** - when marked resolved, ask reviewers for feedback
8. **Notification Section** - bell icon, notification list page

## Files to create/modify
- index.html — add new issue from localStorage, nearby issues
- report.html — duplicate detection logic
- auth.html — location detection on login
- admin.html — progress form, review collection
- profile.html — NEW
- notifications.html — NEW
- js/data.js — add reviews, progress updates, notifications data
- js/components.js — update navbar with notification bell
- css/style.css — new styles

## Status
- [ ] data.js enhanced
- [ ] components.js enhanced (navbar + bell)
- [ ] index.html enhanced
- [ ] report.html enhanced (duplicate detect)
- [ ] auth.html enhanced (location)
- [ ] admin.html enhanced (progress + reviews)
- [ ] profile.html NEW
- [ ] notifications.html NEW
