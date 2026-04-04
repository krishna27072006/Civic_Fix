import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { query } from '../config/db.js';
import { httpError } from '../utils/httpError.js';
import { buildPagination, mapSort } from '../utils/sql.js';
import { getIssueById, getIssueList, notifyUsers, recomputeHeatScore, getVoteDecision } from '../services/issueService.js';
import { requireAuth } from '../middleware/auth.js';

function getSimilarityTokens(...values) {
  return [...new Set(
    values
      .filter(Boolean)
      .flatMap((value) => String(value).toLowerCase().split(/[\s,.-]+/))
      .map((token) => token.trim())
      .filter((token) => token.length >= 4)
  )];
}

const createIssueSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(500),
  category: z.enum(['pothole', 'garbage', 'water', 'streetlight', 'sewage', 'encroachment', 'noise', 'road', 'drainage', 'other']),
  location: z.string().min(3),
  area: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  lat: z.number(),
  lng: z.number(),
  imageUrl: z.string().url().optional().nullable(),
  urgency: z.enum(['low', 'medium', 'high']).default('medium'),
  anonymous: z.boolean().default(false)
});

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  reviewText: z.string().min(3).max(300)
});

const voteSchema = z.object({
  satisfied: z.boolean()
});

export const issueRouter = Router();

issueRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, offset } = buildPagination(req.query.page, req.query.limit);
    const where = [];
    const params = [];

    if (req.query.category && req.query.category !== 'all') {
      params.push(req.query.category);
      where.push(`i.category = $${params.length}`);
    }

    if (req.query.status && req.query.status !== 'all') {
      params.push(req.query.status);
      where.push(`i.status = $${params.length}`);
    }

    if (req.query.search) {
      params.push(`%${String(req.query.search).trim()}%`);
      where.push(`(i.title ILIKE $${params.length} OR i.description ILIKE $${params.length} OR i.location_text ILIKE $${params.length} OR i.area ILIKE $${params.length})`);
    }

    if (req.query.area) {
      params.push(`%${String(req.query.area).trim()}%`);
      where.push(`i.area ILIKE $${params.length}`);
    }

    if (req.query.tab === 'trending') {
      where.push('i.heat_score >= 70');
    }

    if (req.query.tab === 'active') {
      where.push(`i.status <> 'resolved'`);
    }

    if (req.query.lat && req.query.lng && req.query.radiusKm) {
      params.push(Number(req.query.lat), Number(req.query.lng), Number(req.query.radiusKm));
      where.push(`
        (
          6371 * acos(
            cos(radians($${params.length - 2})) * cos(radians(i.lat::numeric)) *
            cos(radians(i.lng::numeric) - radians($${params.length - 1})) +
            sin(radians($${params.length - 2})) * sin(radians(i.lat::numeric))
          )
        ) <= $${params.length}
      `);
    }

    const filters = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const items = await getIssueList({
      filters,
      params,
      orderBy: mapSort(req.query.sort),
      limit,
      offset,
      viewerUserId: req.user?.id || null
    });

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          count: items.length
        }
      }
    });
  })
);

issueRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const issue = await getIssueById(req.params.id, req.user?.id || null);
    if (!issue) {
      throw httpError(404, 'Issue not found');
    }

    res.json({ success: true, data: issue });
  })
);

issueRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = createIssueSchema.parse(req.body);
    const duplicateTokenCandidates = getSimilarityTokens(payload.title, payload.location, payload.description).slice(0, 8);
    const duplicateParams = [payload.category, payload.lat, payload.lng];
    const duplicateMatchClauses = [];

    if (payload.area) {
      duplicateParams.push(`%${payload.area}%`);
      duplicateMatchClauses.push(`LOWER(i.area) LIKE LOWER($${duplicateParams.length})`);
    }
    if (payload.location) {
      duplicateParams.push(`%${payload.location.split(',')[0].trim()}%`);
      duplicateMatchClauses.push(`LOWER(i.location_text) LIKE LOWER($${duplicateParams.length})`);
    }
    for (const token of duplicateTokenCandidates) {
      duplicateParams.push(`%${token}%`);
      duplicateMatchClauses.push(`LOWER(i.title) LIKE LOWER($${duplicateParams.length})`);
      duplicateParams.push(`%${token}%`);
      duplicateMatchClauses.push(`LOWER(i.description) LIKE LOWER($${duplicateParams.length})`);
    }

    const duplicateIssues = await getIssueList({
      filters: `
        WHERE i.category = $1
          AND i.status <> 'resolved'
          AND (
            6371 * acos(
              cos(radians($2)) * cos(radians(i.lat::numeric)) *
              cos(radians(i.lng::numeric) - radians($3)) +
              sin(radians($2)) * sin(radians(i.lat::numeric))
            )
          ) <= 0.35
          ${duplicateMatchClauses.length ? `AND (${duplicateMatchClauses.join(' OR ')})` : ''}
      `,
      params: duplicateParams,
      orderBy: 'i.heat_score DESC, i.reported_at DESC',
      limit: 3,
      offset: 0,
      viewerUserId: req.user?.id || null
    });

    if (duplicateIssues.length) {
      res.status(409).json({
        success: false,
        message: 'A similar issue already exists nearby. Upvote it instead of posting a duplicate.',
        data: { duplicates: duplicateIssues }
      });
      return;
    }

    const reporterId = req.user?.id || null;
    const reporterName = payload.anonymous
      ? 'Anonymous'
      : req.user
        ? `${req.user.first_name} ${req.user.last_name}`.trim()
        : 'Anonymous';

    const result = await query(
      `
        INSERT INTO issues (
          title, description, category, location_text, area, city, lat, lng, image_url,
          urgency, status, reporter_id, reporter_name, reporter_is_anonymous
        )
        VALUES ($1, $2, $3, $4, COALESCE($5, SPLIT_PART($4, ',', 1)), COALESCE($6, 'Bengaluru'), $7, $8, $9, $10, 'open', $11, $12, $13)
        RETURNING id
      `,
      [
        payload.title,
        payload.description,
        payload.category,
        payload.location,
        payload.area,
        payload.city,
        payload.lat,
        payload.lng,
        payload.imageUrl || null,
        payload.urgency,
        reporterId,
        reporterName,
        payload.anonymous
      ]
    );

    const issueId = result.rows[0].id;
    if (reporterId) {
      await notifyUsers({
        userIds: [reporterId],
        issueId,
        type: 'submitted',
        title: 'Issue submitted successfully',
        body: `"${payload.title}" is now live and tracking.`,
        metadata: { source: 'issue_created' }
      });
    }

    await recomputeHeatScore(issueId);
    const issue = await getIssueById(issueId, req.user?.id || null);
    res.status(201).json({ success: true, data: issue });
  })
);

issueRouter.post(
  '/:id/upvote',
  requireAuth,
  asyncHandler(async (req, res) => {
    const issueId = Number(req.params.id);
    const issue = await getIssueById(issueId, req.user?.id || null);
    if (!issue) {
      throw httpError(404, 'Issue not found');
    }

    await query(
      `INSERT INTO issue_upvotes (issue_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [issueId, req.user.id]
    );

    await recomputeHeatScore(issueId);

    if (issue.reportedBy.id && issue.reportedBy.id !== req.user.id) {
      await notifyUsers({
        userIds: [issue.reportedBy.id],
        issueId,
        type: 'upvote',
        title: 'Your issue received a new upvote',
        body: `"${issue.title}" got more community support.`,
        metadata: { actorUserId: req.user.id }
      });
    }

    res.json({ success: true, data: await getIssueById(issueId, req.user?.id || null) });
  })
);

issueRouter.delete(
  '/:id/upvote',
  requireAuth,
  asyncHandler(async (req, res) => {
    const issueId = Number(req.params.id);
    await query('DELETE FROM issue_upvotes WHERE issue_id = $1 AND user_id = $2', [issueId, req.user.id]);
    await recomputeHeatScore(issueId);
    res.json({ success: true, data: await getIssueById(issueId, req.user?.id || null) });
  })
);

issueRouter.post(
  '/:id/reviews',
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = reviewSchema.parse(req.body);
    const issueId = Number(req.params.id);
    const issue = await getIssueById(issueId, req.user?.id || null);

    if (!issue) {
      throw httpError(404, 'Issue not found');
    }
    if (issue.status !== 'resolved') {
      throw httpError(400, 'Reviews can only be added after resolution');
    }

    await query(
      `
        INSERT INTO issue_reviews (issue_id, user_id, user_name, rating, review_text)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (issue_id, user_id)
        DO UPDATE SET rating = EXCLUDED.rating, review_text = EXCLUDED.review_text, created_at = NOW()
      `,
      [issueId, req.user.id, `${req.user.first_name} ${req.user.last_name}`.trim(), payload.rating, payload.reviewText]
    );

    res.status(201).json({ success: true, data: await getIssueById(issueId, req.user?.id || null) });
  })
);

issueRouter.post(
  '/:id/votes',
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = voteSchema.parse(req.body);
    const issueId = Number(req.params.id);
    const issue = await getIssueById(issueId, req.user?.id || null);

    if (!issue) {
      throw httpError(404, 'Issue not found');
    }
    if (issue.status !== 'awaiting_review') {
      throw httpError(400, 'This issue is not accepting satisfaction votes');
    }

    const existingVote = await query('SELECT issue_id FROM issue_votes WHERE issue_id = $1 AND user_id = $2', [issueId, req.user.id]);
    if (existingVote.rows[0]) {
      throw httpError(409, 'You have already voted on this issue');
    }

    await query(
      'INSERT INTO issue_votes (issue_id, user_id, satisfied) VALUES ($1, $2, $3)',
      [issueId, req.user.id, payload.satisfied]
    );

    const decision = await getVoteDecision(issueId);
    if (decision.decided) {
      await query(
        `
          UPDATE issues
          SET status = $2,
              resolved_at = CASE WHEN $2 = 'resolved' THEN NOW() ELSE NULL END,
              updated_at = NOW()
          WHERE id = $1
        `,
        [issueId, decision.outcomeStatus]
      );

      await query(
        `
          UPDATE issue_resolution_requests
          SET decided_at = NOW(), outcome_status = $2
          WHERE issue_id = $1
        `,
        [issueId, decision.outcomeStatus]
      );

      const reporterResult = await query('SELECT reporter_id FROM issues WHERE id = $1', [issueId]);
      const reporterId = reporterResult.rows[0]?.reporter_id;
      if (reporterId) {
        await notifyUsers({
          userIds: [reporterId],
          issueId,
          type: decision.outcomeStatus === 'resolved' ? 'resolved' : 'progress',
          title: decision.outcomeStatus === 'resolved' ? 'Issue resolved by community vote' : 'Issue marked unsolved by community vote',
          body: `"${decision.title}" ended with ${decision.satisfactionPercent}% satisfied votes.`,
          metadata: { satisfactionPercent: decision.satisfactionPercent }
        });
      }

      await recomputeHeatScore(issueId);
    }

    res.status(201).json({
      success: true,
      data: {
        decision,
        issue: await getIssueById(issueId, req.user?.id || null)
      }
    });
  })
);

issueRouter.post(
  '/:id/not-fixed',
  requireAuth,
  asyncHandler(async (req, res) => {
    const issueId = Number(req.params.id);
    const issue = await getIssueById(issueId, req.user?.id || null);

    if (!issue) {
      throw httpError(404, 'Issue not found');
    }

    await query(
      `UPDATE issues
       SET heat_score = LEAST(100, heat_score + 8), updated_at = NOW()
       WHERE id = $1`,
      [issueId]
    );

    res.json({ success: true, data: await getIssueById(issueId, req.user?.id || null) });
  })
);
