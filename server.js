const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));

const rooms = {};

io.on('connection', socket => {
    console.log('New client connected');

    socket.on('join', room => {
        if (!rooms[room]) {
            rooms[room] = [];
        }

        if (rooms[room].length === 2) {
            socket.emit('full', room);
            return;
        }

        socket.join(room);
        rooms[room].push(socket.id);

        if (rooms[room].length === 2) {
            io.in(room).emit('ready', socket.id);
        }
    });

    socket.on('offer', (id, description) => {
        socket.to(id).emit('offer', socket.id, description);
    });

    socket.on('answer', (id, description) => {
        socket.to(id).emit('answer', description);
    });

    socket.on('candidate', (id, candidate) => {
        socket.to(id).emit('candidate', socket.id, candidate);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        for (const room in rooms) {
            rooms[room] = rooms[room].filter(sid => sid !== socket.id);
            if (rooms[room].length === 0) {
                delete rooms[room];
            }
        }
    });
});
