import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { query } from '../config/db.js';

export const notificationRouter = Router();

notificationRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const rows = await query(
      `
        SELECT id, issue_id, type, title, body, read, metadata, created_at
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
      `,
      [req.user.id]
    );

    res.json({
      success: true,
      data: rows.rows.map((row) => ({
        id: Number(row.id),
        issueId: row.issue_id ? Number(row.issue_id) : null,
        type: row.type,
        title: row.title,
        body: row.body,
        read: row.read,
        metadata: row.metadata,
        createdAt: row.created_at
      }))
    });
  })
);

notificationRouter.post(
  '/read-all',
  asyncHandler(async (req, res) => {
    await query('UPDATE notifications SET read = TRUE WHERE user_id = $1', [req.user.id]);
    res.json({ success: true, message: 'All notifications marked as read' });
  })
);

notificationRouter.post(
  '/:id/read',
  asyncHandler(async (req, res) => {
    await query('UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Notification marked as read' });
  })
);
