let token = null;
let userId = null;
let stompClient = null;
let currentRoom = null;

function log(t) {
    document.getElementById("log").innerText += t + "\n";
}

document.getElementById("register").onclick = async () => {
    const u = username.value;
    const p = password.value;

    const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username: u, password: p})
    });

    const j = await res.json();
    token = j.token;
    userId = j.userId;
    log("Registrado. token=" + token);
};

document.getElementById("login").onclick = async () => {
    const u = username.value;
    const p = password.value;

    const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username: u, password: p})
    });

    const j = await res.json();
    token = j.token;
    userId = j.userId;
    log("Login OK. token=" + token);
};

document.getElementById("join").onclick = async () => {
    currentRoom = roomId.value;

    await fetch(`http://localhost:8080/api/rooms/${currentRoom}/join`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token }
    });

    connectWS();
};

function connectWS() {
    const socket = new SockJS("http://localhost:8080/ws");
    stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
        log("STOMP conectado");

        stompClient.subscribe(`/topic/rooms/${currentRoom}`, (msg) => {
            log("[RECV] " + msg.body);
        });
    });
}

document.getElementById("send").onclick = () => {
    if (!stompClient || !currentRoom) return;

    const payload = {
        roomId: Number(currentRoom),
        content: msg.value,
        senderId: userId,
        senderName: username.value,
        type: "MESSAGE"
    };

    stompClient.send(`/app/rooms/${currentRoom}/send`, {}, JSON.stringify(payload));
    log("[SENT]" + JSON.stringify(payload));
};
