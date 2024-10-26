const socket = io();

document.getElementById('joinRoomForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const roomId = document.getElementById('roomId').value;
    window.location.href = `http://localhost:3000?room=${roomId}`;
});
