import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { initSocket } from './src/sockets/ws.js';

const port = process.env.PORT || 8080;

(async () => {
  await connectDB(process.env.MONGO_URI);
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: process.env.CORS_ORIGIN?.split(',') || true }
  });
  initSocket(io);
  httpServer.listen(port, () => console.log(`🚀 Backend running on :${port}`));
})();

