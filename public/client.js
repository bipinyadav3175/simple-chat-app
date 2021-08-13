const socket = io();

let userName;
let textarea = document.querySelector("#textarea");
let messageArea = document.querySelector(".message__area");
let sendButton = document.querySelector(".send-button");

do {
  userName = prompt("Please enter your name: ");
} while (!userName);

function appendMessage(msg, type) {
  let mainDiv = document.createElement("div");
  let className = type;
  mainDiv.classList.add(className, "message");

  let markup = `
    <h4>${msg.user}</h4>
    <p>${msg.message}</p>
    `;
  mainDiv.innerHTML = markup;
  messageArea.appendChild(mainDiv);
}

function sendMessage(message) {
  let msg = {
    user: userName,
    message: message.trim(),
  };
  // Apend
  appendMessage(msg, "outgoing");
  textarea.value = "";
  scrollToBottom();

  // Send to Server
  socket.emit("message", msg);
}

textarea.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    sendMessage(e.target.value);
  }
});

sendButton.addEventListener("click", (e) => {
  sendMessage(textarea.value);
});

// Receive messages

socket.on("message", (msg) => {
  appendMessage(msg, "incoming");
  scrollToBottom();
});

function scrollToBottom() {
  messageArea.scrollTop = messageArea.scrollHeight;
}
