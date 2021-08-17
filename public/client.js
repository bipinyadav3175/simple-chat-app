const socket = io();
const ls = window.localStorage;

let userName;
let textarea = document.querySelector("#textarea");
let messageArea = document.querySelector(".message__area");
let sendButton = document.querySelector(".send-button");
let brandSection = document.querySelector(".brand");

let userDetails = {
  name: "",
  id: null,
};

// Asking for Name
if (!JSON.parse(ls.getItem("user"))) {
  do {
    userName = prompt("Please enter your name: ");
  } while (!userName);

  userDetails = {
    name: userName,
    id: null,
  };
  ls.setItem("user", JSON.stringify(userDetails));
} else {
  userName = JSON.parse(ls.getItem("user")).name;
}

// On Connection
socket.emit("connected", { userName });
socket.on("joiningMessage", ({ userName }) => {
  showLogs(userName, "joined");
});

// Getting Id
if (!JSON.parse(ls.getItem("user")).id) {
  // Get Id from server
  socket.on("getId", ({ id }) => {
    userDetails = {
      name: userName,
      id: id,
    };
    ls.setItem("user", JSON.stringify(userDetails));
  });
}

// Adding message to DOM
function appendMessage(msg, type) {
  let mainDiv = document.createElement("div");
  let className = type;
  mainDiv.classList.add(className, "message");

  let markup = `
    <h4>${msg.user.name}</h4>
    <p>${msg.message}</p>
    `;
  mainDiv.innerHTML = markup;
  messageArea.appendChild(mainDiv);
}

// Storing the message in Localstorage
// Format of Chats
// Chat: [
//   {
//     type: 'text',
//     user: {
//       name: 'fdsff',
//       id: 'dffdff'
//     },
//     message: 'fdfdfdsfdsfdsfdfdf'
//   },
//   {
//     type: 'image',
//     user: {
//       name: 'fdsff',
//       id: 'dffdff'
//     },
//     image: 'dfdfdsfdsfdsfd'
//   }
// ]

let chats;
if (!ls.getItem("chats")) {
  chats = [];
  ls.setItem("chats", JSON.stringify(chats));
} else {
  chats = JSON.parse(ls.getItem("chats"));
  chats.map((chat) => {
    if (chat.type === "text") {
      let user = chat.user;
      let type =
        chat.user.id == JSON.parse(ls.getItem("user")).id
          ? "outgoing"
          : "incoming";
      const msg = {
        user: { name: user.name, id: user.id },
        message: chat.message,
      };
      appendMessage(msg, type);
    }
  });
}

// Sending Message to Server
function sendMessage(message) {
  textarea.focus();
  if (message.length == 0) {
    return;
  } else {
    let allChats = JSON.parse(ls.getItem("chats"));
    allChats.push({
      type: "text",
      user: {
        name: userName,
        id: JSON.parse(ls.getItem("user")).id,
      },
      message: message.trim(),
    });

    ls.setItem("chats", JSON.stringify(allChats));

    let msg = {
      user: {
        name: userName,
        id: JSON.parse(ls.getItem("user")).id,
      },
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
  let allChats = JSON.parse(ls.getItem("chats"));
  allChats.push({
    type: "text",
    user: {
      name: msg.user.name,
      id: msg.user.id,
    },
    message: msg.message,
  });

  ls.setItem("chats", JSON.stringify(allChats));
  console.log(msg);
  let newMsg = {
    user: { name: msg.user.name, id: msg.user.id },
    message: msg.message,
  };
  appendMessage(newMsg, "incoming");
  scrollToBottom();
});

function scrollToBottom() {
  messageArea.scrollTop = messageArea.scrollHeight;
}

// On Disconnection
socket.on("leaved", ({ name }) => {
  console.log(name);
  showLogs(name, "leaved");
});
