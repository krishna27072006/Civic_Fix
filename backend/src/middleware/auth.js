import { query } from '../config/db.js';
import { verifyToken } from '../utils/auth.js';
import { httpError } from '../utils/httpError.js';

async function loadUser(id) {
  const result = await query(
    `SELECT id, first_name, last_name, email, phone, role, avatar_text, area, city, lat, lng,
            notify_upvote, notify_progress, notify_resolved, notify_nearby, anonymous_reports,
            created_at, updated_at
     FROM users
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

export async function attachUser(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.slice('Bearer '.length);
    const payload = verifyToken(token);
    req.user = await loadUser(payload.sub);
    return next();
  } catch (error) {
    req.authError = error;
    return next();
  }
}

export function requireAuth(req, _res, next) {
  if (req.authError) {
    return next(httpError(401, 'Invalid or expired authentication token'));
  }
  if (!req.user) {
    return next(httpError(401, 'Authentication required'));
  }
  return next();
}

export function requireAdmin(req, _res, next) {
  if (req.authError) {
    return next(httpError(401, 'Invalid or expired authentication token'));
  }
  if (!req.user) {
    return next(httpError(401, 'Authentication required'));
  }
  if (req.user.role !== 'admin') {
    return next(httpError(403, 'Admin access required'));
  }
  return next();
}
