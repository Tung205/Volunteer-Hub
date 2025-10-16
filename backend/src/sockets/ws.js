export function initSocket(io) {
  io.on('connection', (socket) => {
    console.log('[ws] client connected', socket.id);
    socket.on('disconnect', () => console.log('[ws] client disconnected', socket.id));
  });
}

