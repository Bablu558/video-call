const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const socket = io();

let localStream;
let peerConnection;
let currentCamera = 'user'; // Default camera is the front camera
const config = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

// Function to get user media
const getUserMedia = () => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: currentCamera }, audio: true })
        .then(stream => {
            localVideo.srcObject = stream;
            localStream = stream;

            // Log the available tracks to check if audio is being captured
            console.log('Local stream tracks:', localStream.getTracks());

            socket.emit('join', 'room1');

            socket.on('offer', (id, description) => {
                console.log('Received offer from:', id);

                peerConnection = new RTCPeerConnection(config);

                // Add local tracks to the peer connection
                localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

                peerConnection.setRemoteDescription(description)
                    .then(() => peerConnection.createAnswer())
                    .then(sdp => peerConnection.setLocalDescription(sdp))
                    .then(() => {
                        socket.emit('answer', id, peerConnection.localDescription);
                    });

                peerConnection.ontrack = event => {
                    console.log('Received remote track:', event.streams[0]);

                    // Check if the remote stream contains audio tracks
                    const remoteStream = event.streams[0];
                    console.log('Remote stream tracks:', remoteStream.getTracks());

                    remoteVideo.srcObject = remoteStream;
                };

                peerConnection.onicecandidate = event => {
                    if (event.candidate) {
                        socket.emit('candidate', id, event.candidate);
                    }
                };
            });

            socket.on('answer', (description) => {
                console.log('Received answer from peer');
                peerConnection.setRemoteDescription(description);
            });

            socket.on('candidate', (id, candidate) => {
                console.log('Received ICE candidate from peer');
                peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            });

            socket.on('ready', (id) => {
                console.log('Ready to start connection with:', id);

                peerConnection = new RTCPeerConnection(config);

                // Add local tracks to the peer connection
                localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

                peerConnection.onicecandidate = event => {
                    if (event.candidate) {
                        socket.emit('candidate', id, event.candidate);
                    }
                };

                peerConnection.ontrack = event => {
                    console.log('Received remote track:', event.streams[0]);
                    const remoteStream = event.streams[0];
                    console.log('Remote stream tracks:', remoteStream.getTracks());
                    remoteVideo.srcObject = remoteStream;
                };

                peerConnection.createOffer()
                    .then(sdp => peerConnection.setLocalDescription(sdp))
                    .then(() => {
                        socket.emit('offer', id, peerConnection.localDescription);
                    });
            });
        })
        .catch(error => {
            console.error('Error accessing media devices:', error);
        });
};

// Function to end the call
const endCall = () => {
    // Close peer connection
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }

    // Stop all local tracks
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }

    // Reset video elements
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;

    console.log('Call ended.');
    alert("Your call has ended. Please close your browser.")
    //  for mobile
    const isMobile=/Mobi|Android/i.test(navigator.userAgent);
    if (!isMobile){
         window.close();
    }
   
};

// Function to switch the camera
const switchCamera = () => {
    // Toggle between front and back camera
    currentCamera = (currentCamera === 'user') ? 'environment' : 'user';
    //endCall();  End the current call before switching the camera
    getUserMedia(); // Restart user media with the new camera
};

// Event listeners for buttons
document.getElementById('endCallButton').addEventListener('click', endCall);
document.getElementById('switchCameraButton').addEventListener('click', switchCamera);

// Start user media on page load
getUserMedia();

//  new 

 // Particle Effect Script
 const particleContainer = document.getElementById("particleContainer");

 function createParticle() {
     const particle = document.createElement("div");
     particle.classList.add("particle");

     const size = Math.random() * 20 + 15; // Random size
     particle.style.width = `${size}px`;
     particle.style.height = `${size}px`;

     particle.style.left = `${Math.random() * 100}vw`; // Random horizontal position
     particle.style.top = `${Math.random() * 100}vh`; // Start anywhere vertically

     particle.style.animationDuration = `${Math.random() * 5 + 5}s`; // Random speed

     particleContainer.appendChild(particle);

     // Remove particle after animation ends
     particle.addEventListener("animationend", () => {
         particle.remove();
     });
 }

 // Generate particles continuously
 setInterval(createParticle, 300);