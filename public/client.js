const socket = io();

let userName;
let textarea = document.querySelector("#textarea");
let messageArea = document.querySelector(".message__area");
let sendButton = document.querySelector(".send-button");
let brandSection = document.querySelector(".brand");

// Asking for Name
do {
  userName = prompt("Please enter your name: ");
} while (!userName);

// On Connection
socket.emit("connected", { userName });
socket.on("joiningMessage", ({ userName }) => {
  showLogs(userName, "joined");
});

// Adding message to DOM
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

// Storing the message in Localstorage

// Sending Message to Server
function sendMessage(message) {
  if (message.length == 0) {
    return;
  } else {
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
}

// If user is Typing or hits 'enter' key
textarea.addEventListener("keyup", (e) => {
  socket.emit("typingEvent", { userName });

  if (e.key === "Enter") {
    sendMessage(e.target.value);
  }
});

function showLogs(name, type) {
  let text = `${name} ${type} the Chat`;
  let para = document.createElement("p");
  para.classList.add("joining-message");
  para.innerHTML = text;
  messageArea.appendChild(para);
}

// Showing typing string
socket.on("typing", ({ userName }) => {
  let para = document.createElement("p");
  let text = `${userName} is Typing...`;
  para.classList.add("typing");

  para.innerHTML = text;
  let allTypingTexts = document.querySelectorAll(".typing");
  if (allTypingTexts.length > 0) {
    brandSection.lastElementChild.remove();
  }
  brandSection.appendChild(para);
  setTimeout(() => {
    para.remove();
  }, 1000);
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

// On Disconnection
socket.on("leaved", ({ name }) => {
  showLogs(name, "leaved");
});
