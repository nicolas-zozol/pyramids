import express, { Router } from 'express';
import {
  initPrometheusAdapter,
  recordMetric,
} from '../adapters/metrics/promotheus-adapter.js';

export const metricsRouter: Router = express.Router();

initPrometheusAdapter();

/**
 * Accepts frontend metric events like:
 * POST /metrics
 * {
 *   "name": "user_scrolled_down",
 *   "labels": {
 *     "component": "LandingPage",
 *     "userTier": "pro"
 *   }
 * }
 */
metricsRouter.post('/', (req, res) => {
  console.log(`Received metrics request: ${req.method} {logRouter}${req.path}`);

  const { name, labels } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid metric name' });
  }

  recordMetric(name, labels || {});
  res.sendStatus(204);
});
