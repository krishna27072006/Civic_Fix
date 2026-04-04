import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { comparePassword, hashPassword, signToken } from '../utils/auth.js';
import { query } from '../config/db.js';
import { httpError } from '../utils/httpError.js';
import { requireAuth } from '../middleware/auth.js';

const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  password: z.string().min(8),
  accountType: z.enum(['citizen', 'admin']).default('citizen'),
  area: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

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

export const authRouter = Router();

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const payload = registerSchema.parse(req.body);
    const existingUserResult = await query(
      `
        SELECT id, first_name, last_name, email, phone, role, avatar_text, area, city, lat, lng,
               notify_upvote, notify_progress, notify_resolved, notify_nearby, anonymous_reports,
               created_at, updated_at, password_hash
        FROM users
        WHERE LOWER(email) = LOWER($1)
      `,
      [payload.email]
    );
    const existingUser = existingUserResult.rows[0];

    if (payload.accountType === 'admin') {
      if (!existingUser || existingUser.role !== 'admin') {
        throw httpError(403, 'This email is not registered as an admin account');
      }

      const isValidAdminPassword = await comparePassword(payload.password, existingUser.password_hash);
      if (!isValidAdminPassword) {
        throw httpError(401, 'Invalid admin email or password');
      }

      const serializedAdmin = serializeUser(existingUser);
      res.status(200).json({
        success: true,
        data: {
          token: signToken(serializedAdmin),
          user: serializedAdmin
        }
      });
      return;
    }

    if (existingUser) {
      throw httpError(409, 'Email already in use');
    }

    const passwordHash = await hashPassword(payload.password);
    const result = await query(
      `
        INSERT INTO users (
          first_name, last_name, email, phone, password_hash, role, avatar_text, area, city, lat, lng
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, 'Bengaluru'), $10, $11)
        RETURNING id, first_name, last_name, email, phone, role, avatar_text, area, city, lat, lng,
                  notify_upvote, notify_progress, notify_resolved, notify_nearby, anonymous_reports,
                  created_at, updated_at
      `,
      [
        payload.firstName,
        payload.lastName,
        payload.email,
        payload.phone || null,
        passwordHash,
        'citizen',
        payload.firstName[0]?.toUpperCase() || 'U',
        payload.area || null,
        payload.city || 'Bengaluru',
        payload.lat ?? null,
        payload.lng ?? null
      ]
    );

    const user = serializeUser(result.rows[0]);
    res.status(201).json({
      success: true,
      data: {
        token: signToken(user),
        user
      }
    });
  })
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const payload = loginSchema.parse(req.body);
    const result = await query(
      `
        SELECT id, first_name, last_name, email, phone, role, avatar_text, area, city, lat, lng,
               notify_upvote, notify_progress, notify_resolved, notify_nearby, anonymous_reports,
               created_at, updated_at, password_hash
        FROM users
        WHERE LOWER(email) = LOWER($1)
      `,
      [payload.email]
    );

    const user = result.rows[0];
    if (!user) {
      throw httpError(401, 'Invalid email or password');
    }

    const isValid = await comparePassword(payload.password, user.password_hash);
    if (!isValid) {
      throw httpError(401, 'Invalid email or password');
    }

    const serializedUser = serializeUser(user);
    res.json({
      success: true,
      data: {
        token: signToken(serializedUser),
        user: serializedUser
      }
    });
  })
);

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: serializeUser(req.user) });
  })
);
