const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/formatMessage");
const {
  joinUser,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/user");
const dotenv = require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;
const server = http.createServer(app);
const io = socketio(server);
const admin = "CHATBOT ADMIN";

//set static folder
app.use(express.static(path.join(__dirname, "public")));

//run when client connects
io.on("connection", (socket) => {
  //broacast when client connects
  socket.on("joinRoom", ({ username, room }) => {
    const user = joinUser(socket.id, username, room);
    socket.join(user.room);
    socket.emit("message", formatMessage(admin, "Welcome to ChatCord"));

    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(admin, `${user.username} has joined the chat`)
      );

    //send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(room),
    });
  });

  //get chatMessage from server sent by client
  socket.on("chatMessage", (msg) => {
    //get current user
    const user = getCurrentUser(socket.id);
    //emit message to server
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  //runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(admin, `${user.username} has left the chat`)
      );
    }
  });
});

//app listening port
server.listen(port, () => {
  console.log("listening on port: ", port);
});
