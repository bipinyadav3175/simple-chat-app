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

const appendGif = (gifDetails, type)=>{
  let gif = document.createElement("div");
  let className = type + '-gif';
  gif.classList.add(className, "message");
  
  let markup = `
    <h4>${gifDetails.user.name}</h4>
    <img src=${gifDetails.url} />
    `;




  
  
  gif.innerHTML = markup;
  messageArea.appendChild(gif);


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
      scrollToBottom()
    }
    if(chat.type === "gif"){
      let user = chat.user;
      let type =
        chat.user.id == JSON.parse(ls.getItem("user")).id
          ? "outgoing"
          : "incoming";
      
      appendGif(chat, type);
      scrollToBottom()
    }
    if(chat.type === 'log'){
      let text = chat.message
      let para = document.createElement("p");
      para.classList.add("joining-message");
      para.innerHTML = text;
      messageArea.appendChild(para);
      scrollToBottom()
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
  scrollToBottom()

  let allChats = JSON.parse(ls.getItem('chats'))
  let logDetails = {
    type: 'log',
    message: text
  }
  allChats.push(logDetails)
  ls.setItem('chats', JSON.stringify(allChats))
  console.log(allChats)
  
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



// GIF

const gifButton = document.querySelector('.gif')
const gifCont = document.querySelector('.gif-cont')
const closeButton = document.querySelector('.close')
const allGifs = document.querySelector('.allGifs')

const gifInput = document.querySelector('#gif-input')


const apiKey = '2T5ICKFL287Y'
let lmt = 10


// url Async requesting function
function httpGetAsync(theUrl, callback)
{
    // create the request object
    var xmlHttp = new XMLHttpRequest();

    // set the state change callback to capture when the response comes in
    xmlHttp.onreadystatechange = function()
    {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        {
            callback(xmlHttp.responseText);
        }
    }

    // open as a GET call, pass in the url and set async = True
    xmlHttp.open("GET", theUrl, true);

    // call send with no params as they were passed in on the url string
    xmlHttp.send(null);

    return;
}


function tenorCallback_trending(responsetext)
{
    // parse the json response
    var response_objects = JSON.parse(responsetext);

    top_10_gifs = response_objects["results"];

    // load the GIFs -- for our example we will load the first GIFs preview size (nanogif) and share size (tinygif)

    // document.getElementById("preview_gif").src = top_10_gifs[0]["media"][0]["nanogif"]["url"];

    // document.getElementById("share_gif").src = top_10_gifs[0]["media"][0]["tinygif"]["url"];
    top_10_gifs.forEach(gif => {
      let realGif = document.createElement('img')
      realGif.src = gif.media[0].gif.url
      realGif.classList.add('realGif')

      allGifs.appendChild(realGif)
      realGif.addEventListener('click', ()=>{
        let thisGifUrl = gif.media[0].gif.url
        let gifDetails = {
          user:{
            name: JSON.parse(ls.getItem('user')).name,
            id: JSON.parse(ls.getItem('user')).id
          },
          url: thisGifUrl,
          type: 'gif'
        }
        appendGif(gifDetails, 'outgoing')
        socket.emit('sendGif', gifDetails)
        gifCont.style.display = 'none'
        scrollToBottom()
        let allChats = JSON.parse(ls.getItem("chats"));
        allChats.push(gifDetails);

        ls.setItem("chats", JSON.stringify(allChats));
      })

      
    });
    console.log(top_10_gifs)

    return;

}


// function to call the trending and category endpoints
function grab_data(url)
{
    // set the apikey and limit
    

    // get the top 10 trending GIFs (updated through out the day) - using the default locale of en_US
    var trending_url = url;
    httpGetAsync(trending_url,tenorCallback_trending);


    // data will be loaded by each call's callback
    return;
}

// var apikey = "LIVDSRZULELA";
// var lmt = 10;




gifButton.onclick = function(){
  gifCont.style.display = 'flex'
  grab_data("https://g.tenor.com/v1/trending?key=" + apiKey)
}

gifInput.addEventListener('change', (e)=>{
    if(this.value == 0){
      grab_data("https://g.tenor.com/v1/trending?key=" + apiKey)
      return;
    }
    allGifs.innerHTML = ''
  
    let search_term = gifInput.value
    console.log(e)
  
    grab_data("https://g.tenor.com/v1/search?q=" + search_term + "&key=" + apiKey)
})

closeButton.onclick = ()=>{
  gifCont.style.display = 'none'
}



// Tenor api key: 2T5ICKFL287Y

// Incoming gif 
socket.on("getGif", (gifData)=>{
  appendGif(gifData, 'incoming')
  scrollToBottom()

  let allChats = JSON.parse(ls.getItem("chats"));
  allChats.push(gifData);

  ls.setItem("chats", JSON.stringify(allChats));
})