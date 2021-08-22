const express = require("express");
const app = express();
const http = require("http").createServer(app);

const PORT = process.env.PORT || 3000;

app.use(express.json())
app.use(express.urlencoded({extended: true}))

http.listen(PORT, () => {
  console.log(`Listening on Port: ${PORT}`);
});

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Socket

const io = require("socket.io")(http);



io.on("connection", (socket) => {
  console.log("connected.........");

  var id; 
  var name
  socket.on("connected", ( {userName} ) =>{
    id = userName + "_" + Math.floor(Math.random() * 1e9);
    socket.emit("getId", { id });
    socket.broadcast.emit("joiningMessage", { userName });
    name = userName
    
  });
  
  socket.on("message", (msg) => {
    socket.broadcast.emit("message", msg);
  });

  socket.on("typingEvent", ({ userName }) => {
    socket.broadcast.emit("typing", { userName });
  });

  socket.on("sendGif", (gifData)=>{
    socket.broadcast.emit("getGif", gifData)
  })

  socket.on("disconnect", () => {
    socket.broadcast.emit("leaved", {name});
  });
});
