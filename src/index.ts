import express from 'express';
import morgan from 'morgan';
import { Server as SocketServer } from 'socket.io';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import router from './routes/routes';

const app = express();
const PORT = 4000;

const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: '*',
  },
});

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(router);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});
