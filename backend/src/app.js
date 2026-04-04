import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { attachUser, requireAdmin, requireAuth } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { metaRouter } from './routes/metaRoutes.js';
import { authRouter } from './routes/authRoutes.js';
import { issueRouter } from './routes/issueRoutes.js';
import { notificationRouter } from './routes/notificationRoutes.js';
import { profileRouter } from './routes/profileRoutes.js';
import { adminRouter } from './routes/adminRoutes.js';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin === '*' ? true : env.corsOrigin, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(attachUser);

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'CivicFix backend is running'
  });
});

app.use('/api/meta', metaRouter);
app.use('/api/auth', authRouter);
app.use('/api/issues', issueRouter);
app.use('/api/notifications', requireAuth, notificationRouter);
app.use('/api/profile', requireAuth, profileRouter);
app.use('/api/admin', requireAdmin, adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);
