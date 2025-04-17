import express from 'express';
import cors from 'cors';
import { Telemetry } from '@robusta/scribe-intel';
import logRouter from './api/log-api.js';

const app = express();
const port = process.env.PORT || 6000;
const component = 'ScribeIntelCollector';

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.info(`${req.method} ${req.path}`, {
    component,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Routes
app.use('/api', logRouter);

// Root health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error('Unhandled error', {
      component,
      error: err.message,
      stack: err.stack,
      path: req.path,
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  },
);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.info(`Server started on port ${port}`, { component });
  });
}

export default app;
