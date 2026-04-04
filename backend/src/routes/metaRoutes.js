import { Router } from 'express';
import { CATEGORY_MAP, STATUS_MAP } from '../constants.js';

export const metaRouter = Router();

metaRouter.get('/categories', (_req, res) => {
  res.json({ success: true, data: CATEGORY_MAP });
});

metaRouter.get('/statuses', (_req, res) => {
  res.json({ success: true, data: STATUS_MAP });
});
