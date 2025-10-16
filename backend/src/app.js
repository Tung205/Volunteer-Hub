import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/auth.routes.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRoutes);   // ⬅️ thêm dòng này

// error cuối
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'INTERNAL' });
});

export default app;

