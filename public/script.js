const socket = io("/");

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "443",
});

const myVideo = document.createElement("video");
myVideo.muted = true;

let myStream;

navigator.mediaDevices
    .getUserMedia({
        audio: true,
        video: false,
    })
    .then((stream) => {
        myStream = stream;
        addVideoStream(myVideo, stream);

        socket.on("user-connected", (userId) => {
            connectToNewUser(userId, stream);
        });

        peer.on("call", (call) => {
            call.answer(stream);
            const video = document.createElement("video");
            call.on("stream", (userVideoStream) => {
                addVideoStream(video, userVideoStream);
            });
        });
    })

function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    });
};

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
        let html = `
            <div class="user-container">
                ${video.outerHTML}
            </div>
        `
        $("#users").append(html)
    });
};

$(function () {
    $("#mute_button").click(function () {
        const enabled = myStream.getAudioTracks()[0].enabled;
        if (enabled) {
            myStream.getAudioTracks()[0].enabled = false;
            html = `<i class="fas fa-microphone-slash"></i>`;
            $("#mute_button").toggleClass("background_red");
            $("#mute_button").html(html)
        } else {
            myStream.getAudioTracks()[0].enabled = true;
            html = `<i class="fas fa-microphone"></i>`;
            $("#mute_button").toggleClass("background_red");
            $("#mute_button").html(html)
        }
    })
})

peer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id);
});