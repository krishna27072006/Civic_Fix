import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { query } from '../config/db.js';
import { getIssueList } from '../services/issueService.js';

const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  area: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  notifyUpvote: z.boolean().optional(),
  notifyProgress: z.boolean().optional(),
  notifyResolved: z.boolean().optional(),
  notifyNearby: z.boolean().optional(),
  anonymousReports: z.boolean().optional()
});

export const profileRouter = Router();

function hasField(payload, key) {
  return Object.prototype.hasOwnProperty.call(payload, key);
}

function serializeUser(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    name: `${row.first_name} ${row.last_name}`.trim(),
    email: row.email,
    phone: row.phone,
    role: row.role,
    avatarText: row.avatar_text,
    area: row.area,
    city: row.city,
    lat: row.lat == null ? null : Number(row.lat),
    lng: row.lng == null ? null : Number(row.lng),
    notifyUpvote: row.notify_upvote,
    notifyProgress: row.notify_progress,
    notifyResolved: row.notify_resolved,
    notifyNearby: row.notify_nearby,
    anonymousReports: row.anonymous_reports,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

profileRouter.get(
  '/me/summary',
  asyncHandler(async (req, res) => {
    const [statsResult, categoriesResult] = await Promise.all([
      query(
        `
          SELECT
            COUNT(*)::int AS reported_count,
            COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved_count,
            COALESCE(SUM(u.upvote_count), 0)::int AS total_upvotes
          FROM issues i
          LEFT JOIN (
            SELECT issue_id, COUNT(*)::int AS upvote_count
            FROM issue_upvotes
            GROUP BY issue_id
          ) u ON u.issue_id = i.id
          WHERE reporter_id = $1
        `,
        [req.user.id]
      ),
      query(
        `
          SELECT category, COUNT(*)::int AS count
          FROM issues
          WHERE reporter_id = $1
          GROUP BY category
          ORDER BY count DESC
        `,
        [req.user.id]
      )
    ]);

    const stats = statsResult.rows[0];
    const impactScore = Number(stats.reported_count) * 12 + Number(stats.total_upvotes) * 2 + Number(stats.resolved_count) * 25;

    res.json({
      success: true,
      data: {
        user: serializeUser(req.user),
        stats: {
          reportedCount: Number(stats.reported_count || 0),
          resolvedCount: Number(stats.resolved_count || 0),
          totalUpvotes: Number(stats.total_upvotes || 0),
          impactScore
        },
        categoryBreakdown: categoriesResult.rows.map((row) => ({
          category: row.category,
          count: Number(row.count)
        }))
      }
    });
  })
);

profileRouter.get(
  '/me/issues',
  asyncHandler(async (req, res) => {
    const type = req.query.type || 'reported';
    let filters = '';
    let params = [];

    if (type === 'upvoted') {
      filters = `WHERE i.id IN (SELECT issue_id FROM issue_upvotes WHERE user_id = $1)`;
      params = [req.user.id];
    } else if (type === 'resolved') {
      filters = `WHERE (i.reporter_id = $1 OR i.id IN (SELECT issue_id FROM issue_upvotes WHERE user_id = $1)) AND i.status = 'resolved'`;
      params = [req.user.id];
    } else {
      filters = `WHERE i.reporter_id = $1`;
      params = [req.user.id];
    }

    const items = await getIssueList({
      filters,
      params,
      orderBy: 'i.reported_at DESC',
      limit: 50,
      offset: 0,
      viewerUserId: req.user.id
    });

    res.json({ success: true, data: items });
  })
);

profileRouter.put(
  '/me',
  asyncHandler(async (req, res) => {
    const payload = updateProfileSchema.parse(req.body);
    const next = {
      firstName: hasField(payload, 'firstName') ? payload.firstName : req.user.first_name,
      lastName: hasField(payload, 'lastName') ? payload.lastName : req.user.last_name,
      phone: hasField(payload, 'phone') ? payload.phone : req.user.phone,
      area: hasField(payload, 'area') ? payload.area : req.user.area,
      city: hasField(payload, 'city') ? payload.city : req.user.city,
      lat: hasField(payload, 'lat') ? payload.lat : req.user.lat,
      lng: hasField(payload, 'lng') ? payload.lng : req.user.lng,
      notifyUpvote: hasField(payload, 'notifyUpvote') ? payload.notifyUpvote : req.user.notify_upvote,
      notifyProgress: hasField(payload, 'notifyProgress') ? payload.notifyProgress : req.user.notify_progress,
      notifyResolved: hasField(payload, 'notifyResolved') ? payload.notifyResolved : req.user.notify_resolved,
      notifyNearby: hasField(payload, 'notifyNearby') ? payload.notifyNearby : req.user.notify_nearby,
      anonymousReports: hasField(payload, 'anonymousReports') ? payload.anonymousReports : req.user.anonymous_reports
    };

    const result = await query(
      `
        UPDATE users
        SET first_name = $2,
            last_name = $3,
            phone = $4,
            area = $5,
            city = $6,
            lat = $7,
            lng = $8,
            notify_upvote = $9,
            notify_progress = $10,
            notify_resolved = $11,
            notify_nearby = $12,
            anonymous_reports = $13,
            updated_at = NOW()
        WHERE id = $1
        RETURNING id, first_name, last_name, email, phone, role, avatar_text, area, city, lat, lng,
                  notify_upvote, notify_progress, notify_resolved, notify_nearby, anonymous_reports,
                  created_at, updated_at
      `,
      [
        req.user.id,
        next.firstName,
        next.lastName,
        next.phone,
        next.area,
        next.city,
        next.lat,
        next.lng,
        next.notifyUpvote,
        next.notifyProgress,
        next.notifyResolved,
        next.notifyNearby,
        next.anonymousReports
      ]
    );

    res.json({ success: true, data: serializeUser(result.rows[0]) });
  })
);
