import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { query } from '../config/db.js';
import { getIssueById, getIssueList, notifyUsers, recomputeHeatScore } from '../services/issueService.js';
import { httpError } from '../utils/httpError.js';

const updateSchema = z.object({
  updateType: z.enum(['progress', 'escalated']),
  message: z.string().min(5).max(300),
  etaDate: z.string().optional().nullable()
});

const resolveSchema = z.object({
  summary: z.string().min(5).max(300),
  proofImageUrl: z.string().url()
});

export const adminRouter = Router();

adminRouter.get(
  '/analytics',
  asyncHandler(async (_req, res) => {
    const [summaryResult, areasResult, categoriesResult, statusesResult] = await Promise.all([
      query(
        `
          SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved,
            COUNT(*) FILTER (WHERE status = 'escalated')::int AS escalated,
            COUNT(*) FILTER (WHERE status IN ('pending', 'open', 'progress', 'awaiting_review', 'unsolved'))::int AS pending,
            AVG(CASE WHEN resolved_at IS NOT NULL THEN EXTRACT(EPOCH FROM (resolved_at - reported_at)) / 86400 END)::numeric(10,2) AS avg_resolution_days
          FROM issues
        `
      ),
      query(
        `SELECT area, COUNT(*)::int AS count
         FROM issues
         GROUP BY area
         ORDER BY count DESC
         LIMIT 6`
      ),
      query(
        `SELECT category, COUNT(*)::int AS count
         FROM issues
         GROUP BY category
         ORDER BY count DESC`
      ),
      query(
        `SELECT status, COUNT(*)::int AS count
         FROM issues
         GROUP BY status
         ORDER BY count DESC`
      )
    ]);

    res.json({
      success: true,
      data: {
        summary: summaryResult.rows[0],
        topAreas: areasResult.rows,
        categoryBreakdown: categoriesResult.rows,
        resolutionStatus: statusesResult.rows
      }
    });
  })
);

adminRouter.get(
  '/issues',
  asyncHandler(async (req, res) => {
    const items = await getIssueList({
      filters: '',
      params: [],
      orderBy: 'i.heat_score DESC, i.reported_at DESC',
      limit: Number(req.query.limit || 100),
      offset: 0,
      viewerUserId: req.user.id
    });

    res.json({ success: true, data: items });
  })
);

adminRouter.post(
  '/issues/:id/updates',
  asyncHandler(async (req, res) => {
    const payload = updateSchema.parse(req.body);
    const issueId = Number(req.params.id);
    const issue = await getIssueById(issueId, req.user.id);
    if (!issue) {
      throw httpError(404, 'Issue not found');
    }

    await query(
      `
        INSERT INTO issue_updates (issue_id, admin_id, admin_name, update_type, message, eta_date)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [issueId, req.user.id, `${req.user.first_name} ${req.user.last_name}`.trim(), payload.updateType, payload.message, payload.etaDate || null]
    );

    await query(`UPDATE issues SET status = $2, updated_at = NOW() WHERE id = $1`, [issueId, payload.updateType]);
    await recomputeHeatScore(issueId);

    const progressRecipients = await query(
      `
        SELECT id
        FROM users
        WHERE notify_progress = TRUE
          AND id IN (
            SELECT reporter_id FROM issues WHERE id = $1 AND reporter_id IS NOT NULL
            UNION
            SELECT user_id FROM issue_upvotes WHERE issue_id = $1
          )
      `,
      [issueId]
    );

    if (progressRecipients.rows.length) {
      await notifyUsers({
        userIds: progressRecipients.rows.map((row) => row.id),
        issueId,
        type: payload.updateType === 'escalated' ? 'escalated' : 'progress',
        title: payload.updateType === 'escalated' ? 'Issue escalated' : 'Progress update on your issue',
        body: payload.message,
        metadata: { etaDate: payload.etaDate || null }
      });
    }

    res.status(201).json({ success: true, data: await getIssueById(issueId, req.user.id) });
  })
);

adminRouter.post(
  '/issues/:id/resolve-request',
  asyncHandler(async (req, res) => {
    const payload = resolveSchema.parse(req.body);
    const issueId = Number(req.params.id);
    const issue = await getIssueById(issueId, req.user.id);

    if (!issue) {
      throw httpError(404, 'Issue not found');
    }
    if (issue.status === 'resolved') {
      throw httpError(400, 'Issue is already resolved');
    }

    await query(
      `
        INSERT INTO issue_resolution_requests (issue_id, admin_id, admin_name, summary, proof_image_url)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (issue_id)
        DO UPDATE SET
          admin_id = EXCLUDED.admin_id,
          admin_name = EXCLUDED.admin_name,
          summary = EXCLUDED.summary,
          proof_image_url = EXCLUDED.proof_image_url,
          requested_at = NOW(),
          decided_at = NULL,
          outcome_status = NULL
      `,
      [issueId, req.user.id, `${req.user.first_name} ${req.user.last_name}`.trim(), payload.summary, payload.proofImageUrl]
    );

    await query(
      `
        INSERT INTO issue_updates (issue_id, admin_id, admin_name, update_type, message)
        VALUES ($1, $2, $3, 'system', $4)
      `,
      [issueId, req.user.id, `${req.user.first_name} ${req.user.last_name}`.trim(), `Proof submitted: ${payload.summary}. Awaiting community vote.`]
    );

    await query(`UPDATE issues SET status = 'awaiting_review', updated_at = NOW() WHERE id = $1`, [issueId]);
    await recomputeHeatScore(issueId);

    const notificationRecipients = await query(
      `
        SELECT id
        FROM users
        WHERE notify_progress = TRUE
          AND id IN (
            SELECT reporter_id FROM issues WHERE id = $1 AND reporter_id IS NOT NULL
            UNION
            SELECT user_id FROM issue_upvotes WHERE issue_id = $1
          )
      `,
      [issueId]
    );

    await notifyUsers({
      userIds: notificationRecipients.rows.map((row) => row.id),
      issueId,
      type: 'vote_request',
      title: 'Did the admin fix this? Cast your vote',
      body: `"${issue.title}" is awaiting community verification.`,
      metadata: { summary: payload.summary }
    });

    res.status(201).json({ success: true, data: await getIssueById(issueId, req.user.id) });
  })
);
