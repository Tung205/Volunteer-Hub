import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { initSocket } from './src/sockets/ws.js';
import { User } from './src/models/user.model.js';
import { seedDatabase } from './src/seed.js';
const port = process.env.PORT || 8080;

(async () => {
  await connectDB(process.env.MONGO_URI);
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: process.env.CORS_ORIGIN?.split(',') || true }
  });
  initSocket(io);
  httpServer.listen(port, () => console.log(`Backend running on :${port}`));

  // DEV ONLY: Seed database if empty
  console.log('NODE_ENV:', process.env.NODE_ENV);
  if (process.env.NODE_ENV === 'development') {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database empty → run seedDatabase()');
      await seedDatabase();
    } else {
      console.log(`✔ Database already has ${userCount} users → skip seed`);
    }
  }
})();

