import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/auth.routes.js';
import eventRoutes from './routes/event.routes.js';
import registrationRoutes from './routes/registration.routes.js';
import channelRoutes from './routes/channel.routes.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/channels', channelRoutes);



// add example event :
// curl -X POST http://localhost:8080/api/seed

/*
# 5. Xem events
docker compose exec mongo mongosh -u root -p root123 --authenticationDatabase admin volunteerhub --eval "db.events.find().pretty()"
# 8. Xem users
docker compose exec mongo mongosh -u root -p root123 --authenticationDatabase admin volunteerhub --eval "db.users.find().pretty()"
*/

// error cuối
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'INTERNAL' });
});

export default app;

