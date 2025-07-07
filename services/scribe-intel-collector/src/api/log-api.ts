/**
 * API to collects log, and send them back to Loki or equivalent
 */

import express, { Router, Request, Response } from 'express';
import { IntelLog, intelLogSchema } from '@robusta/scribe-intel';
import { LokiAdapter } from '../adapters/logger/loki.adapter.js';
import { z } from 'zod';

export const logRouter: Router = express.Router();

// Initialize Loki adapter
const lokiAdapter = new LokiAdapter({
  url: process.env.LOKI_URL || 'http://localhost:3100',
  auth: process.env.LOKI_AUTH
    ? {
        username: process.env.LOKI_USERNAME || '',
        password: process.env.LOKI_PASSWORD || '',
      }
    : undefined,
});

type LogRequest = Request<{}, any, IntelLog>;

// POST /api/logs - Receive and forward logs to Loki
logRouter.post('/', async (req: LogRequest, res: Response): Promise<void> => {
  console.log(`Received log request: ${req.method} {logRouter}${req.path}`);
  try {
    const log = intelLogSchema.parse(req.body);

    console.info(`Received log from component ${log.component}`, {
      component: log.component,
      level: log.level,
    });

    await lokiAdapter.sendLog(log);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Failed to process log', error);

    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Invalid log format',
        details: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process log',
    });
  }
});
