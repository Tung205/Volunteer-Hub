import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { globalLimiter } from './middlewares/rateLimit.middleware.js';


import authRoutes from './routes/auth.routes.js';
import eventRoutes from './routes/event.routes.js';
import registrationRoutes from './routes/registration.routes.js';
import channelRoutes from './routes/channel.routes.js';
import postRoutes from './routes/post.routes.js';
import userRoutes from './routes/user.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import notificationRoutes from './routes/notification.routes.js';


const app = express();
app.use(globalLimiter);
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

app.use('/api/subscriptions', subscriptionRoutes);

app.use('/api/notifications', notificationRoutes);



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

