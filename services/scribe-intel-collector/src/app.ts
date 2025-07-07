import express from 'express';
import cors from 'cors';
import { logRouter } from './api/log-api.js';
import { metricsRouter } from './api/metrics-api.js';

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
app.use('/api/logs', logRouter);
app.use('/api/metrics', metricsRouter);

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
  app._router.stack.forEach(print.bind(null, [] as any));
}

function print(path: string, layer: any) {
  if (layer.route) {
    layer.route.stack.forEach(
      print.bind(null, path.concat(split(layer.route.path))),
    );
  } else if (layer.name === 'router' && layer.handle.stack) {
    layer.handle.stack.forEach(
      print.bind(null, path.concat(split(layer.regexp))),
    );
  } else if (layer.method) {
    console.log(
      '%s /%s',
      layer.method.toUpperCase(),
      (path.concat(split(layer.regexp)) as any).filter(Boolean).join('/'),
    );
  }
}

function split(thing: any) {
  if (typeof thing === 'string') {
    return thing.split('/');
  } else if (thing.fast_slash) {
    return '';
  } else {
    var match = thing
      .toString()
      .replace('\\/?', '')
      .replace('(?=\\/|$)', '$')
      .match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//);
    return match
      ? match[1].replace(/\\(.)/g, '$1').split('/')
      : '<complex:' + thing.toString() + '>';
  }
}

export default app;
